// Audit RBA API – Cloudflare Worker (D1 + R2)
// Đăng nhập, phân quyền (admin / auditor / viewer), lưu audit theo Đối tác → Lần audit → Khu vực → Ảnh/Lỗi.

const ROLES = ['admin', 'auditor', 'viewer'];
const PBKDF2_ITER = 100000;
const SESSION_DAYS_DEFAULT = 30;
const MAX_IMG = 8 * 1024 * 1024;
const MAX_DATA = 900 * 1024;
const KV_KEYS = { lessons: 'auditor', guider: 'admin', guiderfile: 'admin', sys: 'admin' };

/* ---------- tiện ích ---------- */
const enc = new TextEncoder();
const now = () => Date.now();
const rid = (n = 12) => {
  const a = crypto.getRandomValues(new Uint8Array(n));
  return [...a].map(b => 'abcdefghijklmnopqrstuvwxyz0123456789'[b % 36]).join('');
};
const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
const unhex = s => new Uint8Array(s.match(/../g).map(h => parseInt(h, 16)));
const sha256 = async s => hex(await crypto.subtle.digest('SHA-256', enc.encode(s)));
const str = (v, max = 500) => (typeof v === 'string' ? v : v == null ? '' : String(v)).slice(0, max).trim();
const okId = s => typeof s === 'string' && /^[a-z0-9]{1,40}$/i.test(s);
const okEmail = s => typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 200;

class HttpError extends Error {
  constructor(status, msg) { super(msg); this.status = status; }
}
const fail = (status, msg) => { throw new HttpError(status, msg); };

async function hashPw(pw, saltHex) {
  const salt = saltHex ? unhex(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: PBKDF2_ITER }, key, 256);
  return `pbkdf2$${PBKDF2_ITER}$${hex(salt)}$${hex(bits)}`;
}
async function checkPw(pw, stored) {
  const [, , salt, h] = String(stored).split('$');
  if (!salt || !h) return false;
  const again = (await hashPw(pw, salt)).split('$')[3];
  if (again.length !== h.length) return false;
  let d = 0;
  for (let i = 0; i < h.length; i++) d |= again.charCodeAt(i) ^ h.charCodeAt(i);
  return d === 0;
}
function pwPolicy(pw) {
  if (typeof pw !== 'string' || pw.length < 8) fail(400, 'Mật khẩu cần ít nhất 8 ký tự.');
  if (pw.length > 200) fail(400, 'Mật khẩu quá dài.');
}

function cors(req, env) {
  const origin = req.headers.get('Origin') || '';
  const allow = String(env.ALLOWED_ORIGINS || '*').split(',').map(s => s.trim()).filter(Boolean);
  const ok = allow.includes('*') || allow.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  return {
    'Access-Control-Allow-Origin': ok ? origin || '*' : allow[0] || '',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization,Content-Type,X-Upd',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
async function body(req) {
  try { return await req.json(); } catch { fail(400, 'Dữ liệu gửi lên không hợp lệ.'); }
}

/* ---------- dữ liệu ---------- */
const one = (env, sql, ...a) => env.DB.prepare(sql).bind(...a).first();
const all = async (env, sql, ...a) => (await env.DB.prepare(sql).bind(...a).all()).results || [];
const run = (env, sql, ...a) => env.DB.prepare(sql).bind(...a).run();
const logAct = (env, uid, action, target, detail) =>
  run(env, 'INSERT INTO log(at,user_id,action,target,detail) VALUES(?,?,?,?,?)', now(), uid || null, action, target || null, detail ? String(detail).slice(0, 500) : null).catch(() => {});

async function sysSettings(env) {
  const r = await one(env, "SELECT v FROM kv WHERE k='sys'");
  try { return r ? JSON.parse(r.v) : {}; } catch { return {}; }
}
const pubUser = u => u && { id: u.id, email: u.email, name: u.name, role: u.role, active: !!u.active, must_change: !!u.must_change, created_at: u.created_at, last_login: u.last_login };

async function ensureAdmin(env) {
  const c = await one(env, 'SELECT COUNT(*) AS n FROM users');
  if (c && c.n > 0) return;
  const email = str(env.ADMIN_EMAIL, 200).toLowerCase();
  const pw = env.ADMIN_PASSWORD;
  if (!okEmail(email) || !pw) return;
  await run(env, 'INSERT INTO users(id,email,name,role,pw,active,must_change,created_at) VALUES(?,?,?,?,?,1,1,?)',
    rid(), email, 'Quản trị viên', 'admin', await hashPw(pw), now());
  await logAct(env, null, 'bootstrap', email, 'Tạo tài khoản admin đầu tiên');
}

async function auth(req, env) {
  const h = req.headers.get('Authorization') || '';
  const t = h.startsWith('Bearer ') ? h.slice(7).trim() : '';
  if (!t) fail(401, 'Chưa đăng nhập.');
  const s = await one(env, 'SELECT s.expires_at, u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=?', await sha256(t));
  if (!s || s.expires_at < now()) fail(401, 'Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại.');
  if (!s.active) fail(401, 'Tài khoản đã bị khóa. Liên hệ quản trị viên.');
  return s;
}
const need = (u, ...roles) => { if (!roles.includes(u.role)) fail(403, 'Bạn không có quyền thực hiện thao tác này.'); };

async function auditOf(env, id) {
  if (!okId(id)) fail(400, 'Mã audit không hợp lệ.');
  const a = await one(env, 'SELECT * FROM audits WHERE id=? AND deleted=0', id);
  if (!a) fail(404, 'Không tìm thấy audit.');
  return a;
}
async function canEdit(env, u, a) {
  if (u.role === 'admin') return true;
  if (u.role !== 'auditor') return false;
  if (a.status === 'locked') return false;
  if (a.owner_id === u.id) return true;
  return !!(await one(env, 'SELECT 1 AS x FROM audit_members WHERE audit_id=? AND user_id=?', a.id, u.id));
}
async function mustEdit(env, u, a) {
  if (!(await canEdit(env, u, a))) fail(403, a.status === 'locked' ? 'Audit đã khóa, chỉ quản trị viên được sửa.' : 'Bạn chỉ được xem audit này. Chỉ người tạo, người được giao hoặc quản trị viên được sửa.');
}

const AUDIT_SELECT = `SELECT a.*, u.name AS owner_name, u.email AS owner_email,
  (SELECT COUNT(*) FROM photos p WHERE p.audit_id=a.id AND p.deleted=0) AS n_photos,
  (SELECT COALESCE(SUM(n_f),0) FROM photos p WHERE p.audit_id=a.id AND p.deleted=0) AS n_f,
  (SELECT COALESCE(SUM(n_ok),0) FROM photos p WHERE p.audit_id=a.id AND p.deleted=0) AS n_ok,
  (SELECT GROUP_CONCAT(DISTINCT CASE WHEN p.area='' THEN NULL ELSE p.area END) FROM photos p WHERE p.audit_id=a.id AND p.deleted=0) AS areas,
  (SELECT GROUP_CONCAT(m.user_id) FROM audit_members m WHERE m.audit_id=a.id) AS members
  FROM audits a LEFT JOIN users u ON u.id=a.owner_id`;

function auditOut(a, u) {
  const members = a.members ? String(a.members).split(',') : [];
  const edit = u.role === 'admin' || (u.role === 'auditor' && a.status !== 'locked' && (a.owner_id === u.id || members.includes(u.id)));
  return {
    id: a.id, vendor: a.vendor, sub: a.sub, date: a.date, auditors: a.auditors, status: a.status,
    owner_id: a.owner_id, owner_name: a.owner_name || a.owner_email || '', members,
    created_at: a.created_at, updated_at: a.updated_at,
    n_photos: a.n_photos || 0, n_f: a.n_f || 0, n_ok: a.n_ok || 0,
    areas: a.areas ? String(a.areas).split(',') : [], can_edit: edit,
  };
}

/* ---------- định tuyến ---------- */
const routes = [];
const on = (method, pattern, fn, authed = false) => routes.push({ method, authed, re: new RegExp('^' + pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$'), fn });

on('GET', '/api/health', async (req, env) => json({ ok: true, at: now() }));

on('POST', '/api/login', async (req, env) => {
  await ensureAdmin(env);
  const b = await body(req);
  const email = str(b.email, 200).toLowerCase(), pw = typeof b.password === 'string' ? b.password : '';
  if (!email || !pw) fail(400, 'Nhập email và mật khẩu.');
  const lf = await one(env, 'SELECT * FROM login_fail WHERE email=?', email);
  if (lf && lf.until > now()) fail(429, `Đăng nhập sai nhiều lần. Thử lại sau ${Math.ceil((lf.until - now()) / 60000)} phút.`);
  const u = await one(env, 'SELECT * FROM users WHERE email=?', email);
  if (!u || !(await checkPw(pw, u.pw))) {
    const n = (lf ? lf.n : 0) + 1;
    await run(env, 'INSERT INTO login_fail(email,n,until) VALUES(?,?,?) ON CONFLICT(email) DO UPDATE SET n=excluded.n, until=excluded.until',
      email, n >= 8 ? 0 : n, n >= 8 ? now() + 10 * 60000 : 0);
    fail(401, 'Email hoặc mật khẩu không đúng.');
  }
  if (!u.active) fail(403, 'Tài khoản đã bị khóa. Liên hệ quản trị viên.');
  await run(env, 'DELETE FROM login_fail WHERE email=?', email);
  const sys = await sysSettings(env);
  const days = Math.max(1, Math.min(365, Number(sys.sessionDays) || SESSION_DAYS_DEFAULT));
  const token = rid(40);
  await run(env, 'INSERT INTO sessions(token_hash,user_id,created_at,expires_at,ua) VALUES(?,?,?,?,?)',
    await sha256(token), u.id, now(), now() + days * 86400000, str(req.headers.get('User-Agent'), 200));
  await run(env, 'UPDATE users SET last_login=? WHERE id=?', now(), u.id);
  await run(env, 'DELETE FROM sessions WHERE expires_at<?', now());
  await logAct(env, u.id, 'login', u.email);
  return json({ token, user: pubUser(u), expires_at: now() + days * 86400000 });
});

on('POST', '/api/logout', async (req, env) => {
  const h = req.headers.get('Authorization') || '';
  if (h.startsWith('Bearer ')) await run(env, 'DELETE FROM sessions WHERE token_hash=?', await sha256(h.slice(7).trim()));
  return json({ ok: true });
});

on('GET', '/api/me', async (req, env, u) => json({ user: pubUser(u), sys: await sysSettings(env) }), true);

on('POST', '/api/me/password', async (req, env, u) => {
  const b = await body(req);
  if (!(await checkPw(String(b.old || ''), u.pw))) fail(400, 'Mật khẩu hiện tại không đúng.');
  pwPolicy(b.new);
  await run(env, 'UPDATE users SET pw=?, must_change=0 WHERE id=?', await hashPw(b.new), u.id);
  await logAct(env, u.id, 'password', u.email, 'Đổi mật khẩu');
  return json({ ok: true });
}, true);

on('PATCH', '/api/me', async (req, env, u) => {
  const b = await body(req);
  const name = str(b.name, 100);
  if (!name) fail(400, 'Nhập họ tên.');
  await run(env, 'UPDATE users SET name=? WHERE id=?', name, u.id);
  return json({ user: pubUser({ ...u, name }) });
}, true);

/* người dùng (admin) */
on('GET', '/api/users', async (req, env, u) => {
  // mọi người đăng nhập đều xem được danh sách tên để hiện người tạo / người được giao; chỉ admin thấy email & chi tiết
  const rows = await all(env, 'SELECT * FROM users ORDER BY role, name');
  return json({ users: rows.map(r => (u.role === 'admin' ? pubUser(r) : { id: r.id, name: r.name || r.email, role: r.role, active: !!r.active })) });
}, true);

on('POST', '/api/users', async (req, env, u) => {
  need(u, 'admin');
  const b = await body(req);
  const email = str(b.email, 200).toLowerCase(), name = str(b.name, 100), role = ROLES.includes(b.role) ? b.role : 'auditor';
  if (!okEmail(email)) fail(400, 'Email không hợp lệ.');
  if (!name) fail(400, 'Nhập họ tên.');
  pwPolicy(b.password);
  if (await one(env, 'SELECT 1 AS x FROM users WHERE email=?', email)) fail(409, 'Email này đã có tài khoản.');
  const id = rid();
  await run(env, 'INSERT INTO users(id,email,name,role,pw,active,must_change,created_at) VALUES(?,?,?,?,?,1,?,?)',
    id, email, name, role, await hashPw(b.password), b.must_change === false ? 0 : 1, now());
  await logAct(env, u.id, 'user.create', email, role);
  return json({ user: pubUser(await one(env, 'SELECT * FROM users WHERE id=?', id)) });
}, true);

async function adminCount(env, exceptId) {
  const r = await one(env, "SELECT COUNT(*) AS n FROM users WHERE role='admin' AND active=1 AND id<>?", exceptId || '');
  return r ? r.n : 0;
}

on('PATCH', '/api/users/:id', async (req, env, u, p) => {
  need(u, 'admin');
  const t = await one(env, 'SELECT * FROM users WHERE id=?', p.id);
  if (!t) fail(404, 'Không tìm thấy người dùng.');
  const b = await body(req);
  const next = { name: t.name, role: t.role, active: t.active, email: t.email };
  if (b.name !== undefined) { next.name = str(b.name, 100); if (!next.name) fail(400, 'Nhập họ tên.'); }
  if (b.email !== undefined) {
    const e = str(b.email, 200).toLowerCase();
    if (!okEmail(e)) fail(400, 'Email không hợp lệ.');
    if (e !== t.email && (await one(env, 'SELECT 1 AS x FROM users WHERE email=?', e))) fail(409, 'Email này đã có tài khoản.');
    next.email = e;
  }
  if (b.role !== undefined) { if (!ROLES.includes(b.role)) fail(400, 'Vai trò không hợp lệ.'); next.role = b.role; }
  if (b.active !== undefined) next.active = b.active ? 1 : 0;
  if (t.role === 'admin' && (next.role !== 'admin' || !next.active) && (await adminCount(env, t.id)) < 1)
    fail(400, 'Phải còn ít nhất một quản trị viên đang hoạt động.');
  await run(env, 'UPDATE users SET name=?, email=?, role=?, active=? WHERE id=?', next.name, next.email, next.role, next.active, t.id);
  if (b.password !== undefined) {
    pwPolicy(b.password);
    await run(env, 'UPDATE users SET pw=?, must_change=1 WHERE id=?', await hashPw(b.password), t.id);
    await run(env, 'DELETE FROM sessions WHERE user_id=?', t.id);
  }
  if (!next.active) await run(env, 'DELETE FROM sessions WHERE user_id=?', t.id);
  const ch = [];
  if (next.role !== t.role) ch.push(`vai trò ${t.role}→${next.role}`);
  if (next.active !== t.active) ch.push(next.active ? 'mở khóa' : 'khóa');
  if (b.password !== undefined) ch.push('đặt lại mật khẩu');
  if (next.name !== t.name || next.email !== t.email) ch.push('sửa thông tin');
  await logAct(env, u.id, 'user.update', next.email, ch.join(', '));
  return json({ user: pubUser(await one(env, 'SELECT * FROM users WHERE id=?', t.id)) });
}, true);

on('DELETE', '/api/users/:id', async (req, env, u, p) => {
  need(u, 'admin');
  const t = await one(env, 'SELECT * FROM users WHERE id=?', p.id);
  if (!t) fail(404, 'Không tìm thấy người dùng.');
  if (t.id === u.id) fail(400, 'Không tự xóa tài khoản của mình.');
  if (t.role === 'admin' && (await adminCount(env, t.id)) < 1) fail(400, 'Phải còn ít nhất một quản trị viên.');
  // audit của người bị xóa chuyển cho admin đang thao tác để không mất chủ
  await run(env, 'UPDATE audits SET owner_id=? WHERE owner_id=?', u.id, t.id);
  await run(env, 'DELETE FROM audit_members WHERE user_id=?', t.id);
  await run(env, 'DELETE FROM sessions WHERE user_id=?', t.id);
  await run(env, 'DELETE FROM users WHERE id=?', t.id);
  await logAct(env, u.id, 'user.delete', t.email, 'Audit của người này chuyển cho ' + u.email);
  return json({ ok: true });
}, true);

/* cài đặt dùng chung */
on('GET', '/api/kv/:k', async (req, env, u, p) => {
  if (!(p.k in KV_KEYS)) fail(404, 'Không có mục này.');
  const r = await one(env, 'SELECT v, updated_at FROM kv WHERE k=?', p.k);
  return json({ value: r ? JSON.parse(r.v) : null, updated_at: r ? r.updated_at : 0 });
}, true);

on('PUT', '/api/kv/:k', async (req, env, u, p) => {
  const lvl = KV_KEYS[p.k];
  if (!lvl) fail(404, 'Không có mục này.');
  need(u, ...(lvl === 'admin' ? ['admin'] : ['admin', 'auditor']));
  const text = await req.text();
  if (text.length > 1900000) fail(413, 'Dữ liệu quá lớn.');
  let v;
  try { v = JSON.parse(text); } catch { fail(400, 'Dữ liệu không hợp lệ.'); }
  if (p.k === 'lessons') {
    // gộp sổ kinh nghiệm của cả đội, giữ 300 mục mới nhất
    const old = await one(env, "SELECT v FROM kv WHERE k='lessons'");
    let items = [];
    try { items = old ? JSON.parse(old.v).items || [] : []; } catch {}
    const map = new Map(items.map(x => [x.id, x]));
    for (const x of Array.isArray(v && v.items) ? v.items : []) if (x && typeof x.id === 'string') map.set(x.id, x);
    if (Array.isArray(v && v.removed)) for (const id of v.removed) map.delete(id);
    v = { items: [...map.values()].sort((a, b) => (b.at || 0) - (a.at || 0)).slice(0, 300), upd: now() };
  }
  await run(env, 'INSERT INTO kv(k,v,updated_at,updated_by) VALUES(?,?,?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v, updated_at=excluded.updated_at, updated_by=excluded.updated_by',
    p.k, JSON.stringify(v), now(), u.id);
  if (p.k === 'sys') await logAct(env, u.id, 'settings', 'sys', 'Cập nhật cài đặt hệ thống');
  return json({ ok: true, value: p.k === 'lessons' ? v : undefined });
}, true);

/* audit */
on('GET', '/api/audits', async (req, env, u) => {
  const url = new URL(req.url);
  const q = str(url.searchParams.get('q'), 100), vendor = url.searchParams.get('vendor');
  const from = str(url.searchParams.get('from'), 10), to = str(url.searchParams.get('to'), 10), mine = url.searchParams.get('mine') === '1';
  const w = ['a.deleted=0'], a = [];
  if (vendor !== null) { w.push('a.vendor=?'); a.push(str(vendor, 200)); }
  if (q) { w.push('(a.vendor LIKE ? OR a.auditors LIKE ? OR a.sub LIKE ?)'); a.push(`%${q}%`, `%${q}%`, `%${q}%`); }
  if (from) { w.push('a.date>=?'); a.push(from); }
  if (to) { w.push('a.date<=?'); a.push(to); }
  if (mine) { w.push('(a.owner_id=? OR EXISTS(SELECT 1 FROM audit_members m WHERE m.audit_id=a.id AND m.user_id=?))'); a.push(u.id, u.id); }
  const rows = await all(env, `${AUDIT_SELECT} WHERE ${w.join(' AND ')} ORDER BY a.vendor COLLATE NOCASE, a.date DESC LIMIT 1000`, ...a);
  return json({ audits: rows.map(r => auditOut(r, u)) });
}, true);

on('POST', '/api/audits', async (req, env, u) => {
  need(u, 'admin', 'auditor');
  const b = await body(req);
  const id = okId(b.id) ? b.id : rid();
  const ex = await one(env, 'SELECT * FROM audits WHERE id=?', id);
  if (ex && !ex.deleted) {
    const full = await one(env, `${AUDIT_SELECT} WHERE a.id=?`, id);
    return json({ audit: auditOut(full, u) });
  }
  if (ex && ex.deleted) fail(410, 'Audit này đã bị xóa trên hệ thống.');
  const t = now();
  await run(env, 'INSERT INTO audits(id,vendor,sub,date,auditors,status,owner_id,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)',
    id, str(b.vendor, 200), str(b.sub, 100), str(b.date, 10), str(b.auditors, 300), 'open', u.id, t, t);
  await logAct(env, u.id, 'audit.create', id, str(b.vendor, 200));
  return json({ audit: auditOut(await one(env, `${AUDIT_SELECT} WHERE a.id=?`, id), u) });
}, true);

on('GET', '/api/audits/:id', async (req, env, u, p) => {
  await auditOf(env, p.id);
  return json({ audit: auditOut(await one(env, `${AUDIT_SELECT} WHERE a.id=?`, p.id), u) });
}, true);

on('PATCH', '/api/audits/:id', async (req, env, u, p) => {
  const a = await auditOf(env, p.id);
  const b = await body(req);
  if (b.status !== undefined || b.owner_id !== undefined) need(u, 'admin');
  else await mustEdit(env, u, a);
  const n = { vendor: a.vendor, sub: a.sub, date: a.date, auditors: a.auditors, status: a.status, owner_id: a.owner_id };
  for (const k of ['vendor', 'sub', 'date', 'auditors']) if (b[k] !== undefined) n[k] = str(b[k], k === 'date' ? 10 : 300);
  if (b.status !== undefined) { if (!['open', 'locked'].includes(b.status)) fail(400, 'Trạng thái không hợp lệ.'); n.status = b.status; }
  if (b.owner_id !== undefined) { if (!(await one(env, 'SELECT 1 AS x FROM users WHERE id=?', b.owner_id))) fail(400, 'Không có người dùng này.'); n.owner_id = b.owner_id; }
  await run(env, 'UPDATE audits SET vendor=?, sub=?, date=?, auditors=?, status=?, owner_id=?, updated_at=? WHERE id=?',
    n.vendor, n.sub, n.date, n.auditors, n.status, n.owner_id, now(), a.id);
  if (b.status !== undefined && b.status !== a.status) await logAct(env, u.id, b.status === 'locked' ? 'audit.lock' : 'audit.unlock', a.id, n.vendor);
  if (b.owner_id !== undefined && b.owner_id !== a.owner_id) await logAct(env, u.id, 'audit.owner', a.id, n.vendor);
  return json({ audit: auditOut(await one(env, `${AUDIT_SELECT} WHERE a.id=?`, a.id), u) });
}, true);

on('PUT', '/api/audits/:id/members', async (req, env, u, p) => {
  need(u, 'admin');
  const a = await auditOf(env, p.id);
  const b = await body(req);
  const ids = [...new Set((Array.isArray(b.members) ? b.members : []).filter(okId))].slice(0, 50);
  const stmts = [env.DB.prepare('DELETE FROM audit_members WHERE audit_id=?').bind(a.id)];
  for (const id of ids) stmts.push(env.DB.prepare('INSERT OR IGNORE INTO audit_members(audit_id,user_id) SELECT ?, id FROM users WHERE id=?').bind(a.id, id));
  await env.DB.batch(stmts);
  await logAct(env, u.id, 'audit.members', a.id, `${a.vendor}: ${ids.length} người được giao`);
  return json({ audit: auditOut(await one(env, `${AUDIT_SELECT} WHERE a.id=?`, a.id), u) });
}, true);

on('DELETE', '/api/audits/:id', async (req, env, u, p) => {
  const a = await auditOf(env, p.id);
  const sys = await sysSettings(env);
  if (!(u.role === 'admin' || (sys.auditorDelete && u.role === 'auditor' && a.owner_id === u.id && a.status !== 'locked')))
    fail(403, 'Chỉ quản trị viên được xóa audit.');
  await run(env, 'UPDATE audits SET deleted=1, updated_at=? WHERE id=?', now(), a.id);
  await logAct(env, u.id, 'audit.delete', a.id, a.vendor);
  return json({ ok: true });
}, true);

/* ảnh và lỗi */
on('GET', '/api/audits/:id/photos', async (req, env, u, p) => {
  await auditOf(env, p.id);
  const since = Number(new URL(req.url).searchParams.get('since')) || 0;
  const rows = await all(env, 'SELECT id, area, data, upd, srv, updated_by, img_size, deleted FROM photos WHERE audit_id=? AND srv>? ORDER BY srv', p.id, since);
  return json({
    now: now(),
    photos: rows.map(r => ({ id: r.id, area: r.area, upd: r.upd, srv: r.srv, by: r.updated_by, has_img: r.img_size > 0, deleted: !!r.deleted, data: r.deleted ? null : JSON.parse(r.data || '{}') })),
  });
}, true);

on('PUT', '/api/audits/:id/photos/:pid', async (req, env, u, p) => {
  const a = await auditOf(env, p.id);
  await mustEdit(env, u, a);
  if (!okId(p.pid)) fail(400, 'Mã ảnh không hợp lệ.');
  const text = await req.text();
  if (text.length > MAX_DATA) fail(413, 'Dữ liệu ảnh quá lớn.');
  let d;
  try { d = JSON.parse(text); } catch { fail(400, 'Dữ liệu không hợp lệ.'); }
  const upd = Number(d.upd) || now();
  const ex = await one(env, 'SELECT upd, deleted FROM photos WHERE audit_id=? AND id=?', a.id, p.pid);
  if (ex && ex.upd > upd && !ex.deleted) return json({ ok: false, stale: true, upd: ex.upd }, 409);
  const f = Array.isArray(d.findings) ? d.findings : [];
  const t = now();
  await run(env, `INSERT INTO photos(id,audit_id,area,data,n_f,n_ok,upd,srv,updated_by,deleted) VALUES(?,?,?,?,?,?,?,?,?,0)
    ON CONFLICT(audit_id,id) DO UPDATE SET area=excluded.area, data=excluded.data, n_f=excluded.n_f, n_ok=excluded.n_ok, upd=excluded.upd, srv=excluded.srv, updated_by=excluded.updated_by, deleted=0`,
    p.pid, a.id, str(d.area, 200), text, f.length, f.filter(x => x && x.ok).length, upd, t, u.id);
  await run(env, 'UPDATE audits SET updated_at=? WHERE id=?', t, a.id);
  return json({ ok: true, srv: t });
}, true);

on('PUT', '/api/audits/:id/photos/:pid/img', async (req, env, u, p) => {
  const a = await auditOf(env, p.id);
  await mustEdit(env, u, a);
  if (!okId(p.pid)) fail(400, 'Mã ảnh không hợp lệ.');
  const buf = await req.arrayBuffer();
  if (!buf.byteLength) fail(400, 'Ảnh rỗng.');
  if (buf.byteLength > MAX_IMG) fail(413, 'Ảnh quá lớn.');
  await env.IMG.put(`${a.id}/${p.pid}.jpg`, buf, { httpMetadata: { contentType: req.headers.get('Content-Type') || 'image/jpeg' } });
  const t = now();
  await run(env, `INSERT INTO photos(id,audit_id,img_size,srv,updated_by) VALUES(?,?,?,?,?)
    ON CONFLICT(audit_id,id) DO UPDATE SET img_size=excluded.img_size, srv=excluded.srv`, p.pid, a.id, buf.byteLength, t, u.id);
  return json({ ok: true, size: buf.byteLength });
}, true);

on('GET', '/api/audits/:id/photos/:pid/img', async (req, env, u, p) => {
  await auditOf(env, p.id);
  if (!okId(p.pid)) fail(400, 'Mã ảnh không hợp lệ.');
  const o = await env.IMG.get(`${p.id}/${p.pid}.jpg`);
  if (!o) fail(404, 'Chưa có ảnh trên hệ thống.');
  return new Response(o.body, { headers: { 'Content-Type': o.httpMetadata?.contentType || 'image/jpeg', 'Cache-Control': 'private, max-age=86400' } });
}, true);

on('DELETE', '/api/audits/:id/photos/:pid', async (req, env, u, p) => {
  const a = await auditOf(env, p.id);
  await mustEdit(env, u, a);
  const t = now();
  await run(env, 'UPDATE photos SET deleted=1, srv=?, upd=?, updated_by=? WHERE audit_id=? AND id=?', t, t, u.id, a.id, p.pid);
  await env.IMG.delete(`${a.id}/${p.pid}.jpg`).catch(() => {});
  await run(env, 'UPDATE photos SET img_size=0 WHERE audit_id=? AND id=?', a.id, p.pid);
  return json({ ok: true });
}, true);

/* tra cứu lỗi trên mọi audit */
on('GET', '/api/search', async (req, env, u) => {
  const q = str(new URL(req.url).searchParams.get('q'), 100);
  if (q.length < 2) return json({ results: [] });
  const rows = await all(env, `SELECT p.audit_id, p.id, p.area, p.data, a.vendor, a.date FROM photos p JOIN audits a ON a.id=p.audit_id
    WHERE p.deleted=0 AND a.deleted=0 AND (p.data LIKE ? OR p.area LIKE ? OR a.vendor LIKE ?) ORDER BY a.date DESC LIMIT 200`, `%${q}%`, `%${q}%`, `%${q}%`);
  const ql = q.toLowerCase();
  const results = [];
  for (const r of rows) {
    let d = {};
    try { d = JSON.parse(r.data); } catch {}
    const fs = (Array.isArray(d.findings) ? d.findings : []).filter(f => f && [f.title, f.ev, f.code, f.req, f.fixNow, f.fixRoot].some(x => String(x || '').toLowerCase().includes(ql)));
    const areaHit = String(r.area || '').toLowerCase().includes(ql) || String(r.vendor || '').toLowerCase().includes(ql);
    if (!fs.length && !areaHit) continue;
    results.push({ audit_id: r.audit_id, photo_id: r.id, area: r.area, vendor: r.vendor, date: r.date, thumb: d.thumb || '',
      findings: (fs.length ? fs : (d.findings || []).slice(0, 3)).slice(0, 5).map(f => ({ title: f.title, sev: f.sev, code: f.code, ok: !!f.ok })) });
  }
  return json({ results: results.slice(0, 100) });
}, true);

/* quản trị */
on('GET', '/api/admin/log', async (req, env, u) => {
  need(u, 'admin');
  const rows = await all(env, 'SELECT l.*, u.name AS user_name, u.email AS user_email FROM log l LEFT JOIN users u ON u.id=l.user_id ORDER BY l.id DESC LIMIT 300');
  return json({ log: rows });
}, true);

on('GET', '/api/admin/stats', async (req, env, u) => {
  need(u, 'admin');
  const [us, au, ph, ve] = await Promise.all([
    one(env, 'SELECT COUNT(*) AS n, SUM(active) AS act FROM users'),
    one(env, 'SELECT COUNT(*) AS n FROM audits WHERE deleted=0'),
    one(env, 'SELECT COUNT(*) AS n, COALESCE(SUM(img_size),0) AS bytes, COALESCE(SUM(n_f),0) AS nf FROM photos WHERE deleted=0'),
    one(env, 'SELECT COUNT(DISTINCT vendor) AS n FROM audits WHERE deleted=0'),
  ]);
  return json({ users: us.n, active: us.act || 0, audits: au.n, vendors: ve.n, photos: ph.n, findings: ph.nf, bytes: ph.bytes });
}, true);

on('POST', '/api/admin/sessions/revoke', async (req, env, u) => {
  need(u, 'admin');
  const b = await body(req);
  if (!okId(b.user_id)) fail(400, 'Thiếu người dùng.');
  await run(env, 'DELETE FROM sessions WHERE user_id=?', b.user_id);
  await logAct(env, u.id, 'sessions.revoke', b.user_id);
  return json({ ok: true });
}, true);

/* ---------- vào ---------- */
export default {
  async fetch(req, env) {
    const h = cors(req, env);
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: h });
    const url = new URL(req.url);
    let res;
    try {
      const r = routes.find(r => r.method === req.method && r.re.test(url.pathname));
      if (!r) fail(404, 'Không có đường dẫn này.');
      const params = url.pathname.match(r.re).groups || {};
      for (const k in params) params[k] = decodeURIComponent(params[k]);
      const u = r.authed ? await auth(req, env) : null;
      res = await r.fn(req, env, u, params);
    } catch (e) {
      if (e instanceof HttpError) res = json({ error: e.message }, e.status);
      else { console.error(e); res = json({ error: 'Lỗi máy chủ. Hãy thử lại.' }, 500); }
    }
    const out = new Response(res.body, res);
    for (const [k, v] of Object.entries(h)) out.headers.set(k, v);
    return out;
  },
};
