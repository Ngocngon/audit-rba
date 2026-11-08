-- Audit RBA: cơ sở dữ liệu online (Cloudflare D1)
-- Phân vùng: Đối tác (vendor) → Lần audit (audits) → Khu vực (photos.area) → Ảnh / Lỗi (photos.data)

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'auditor' CHECK (role IN ('admin','auditor','viewer')),
  pw TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  must_change INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  last_login INTEGER
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  ua TEXT
);
CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS login_fail (
  email TEXT PRIMARY KEY,
  n INTEGER NOT NULL DEFAULT 0,
  until INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS audits (
  id TEXT PRIMARY KEY,
  vendor TEXT NOT NULL DEFAULT '',
  sub TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL DEFAULT '',
  auditors TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','locked')),
  owner_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS audits_vendor ON audits(vendor, date);
CREATE INDEX IF NOT EXISTS audits_owner ON audits(owner_id);

CREATE TABLE IF NOT EXISTS audit_members (
  audit_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  PRIMARY KEY (audit_id, user_id)
);

CREATE TABLE IF NOT EXISTS photos (
  id TEXT NOT NULL,
  audit_id TEXT NOT NULL,
  area TEXT NOT NULL DEFAULT '',
  data TEXT NOT NULL DEFAULT '{}',
  n_f INTEGER NOT NULL DEFAULT 0,
  n_ok INTEGER NOT NULL DEFAULT 0,
  upd INTEGER NOT NULL DEFAULT 0,
  srv INTEGER NOT NULL DEFAULT 0,
  updated_by TEXT,
  img_size INTEGER NOT NULL DEFAULT 0,
  deleted INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (audit_id, id)
);
CREATE INDEX IF NOT EXISTS photos_srv ON photos(audit_id, srv);

CREATE TABLE IF NOT EXISTS kv (
  k TEXT PRIMARY KEY,
  v TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  updated_by TEXT
);

CREATE TABLE IF NOT EXISTS log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  at INTEGER NOT NULL,
  user_id TEXT,
  action TEXT NOT NULL,
  target TEXT,
  detail TEXT
);
CREATE INDEX IF NOT EXISTS log_at ON log(at);

-- Ảnh gốc khi không dùng R2 (mỗi ảnh tối đa ~1,9 MB, app tự nén trước khi gửi)
CREATE TABLE IF NOT EXISTS imgs (
  audit_id TEXT NOT NULL,
  id TEXT NOT NULL,
  ct TEXT,
  data BLOB,
  PRIMARY KEY (audit_id, id)
);

-- Quyết định của người đánh giá với đề xuất của AI (để đo độ chính xác theo mã lỗi)
CREATE TABLE IF NOT EXISTS ai_events (
  id TEXT PRIMARY KEY,
  at INTEGER NOT NULL,
  user_id TEXT,
  audit_id TEXT,
  t TEXT NOT NULL,          -- keep | fix | reject | unclear | miss
  code TEXT, sev TEXT,      -- mã và mức độ cuối cùng
  from_code TEXT, from_sev TEXT, -- mã và mức độ AI đề xuất (khi sửa)
  area TEXT, title TEXT, model TEXT
);
CREATE INDEX IF NOT EXISTS ai_events_at ON ai_events(at);
