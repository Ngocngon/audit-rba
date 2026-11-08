"""Thêm phần online vào bản cài web: đăng nhập, lưu trữ online theo phân vùng, phân quyền, trang Quản trị.

Chạy SAU patch_pwa.py:
    python3 patch_cloud.py <index.html> <API_URL>
Ví dụ:
    python3 3-cong-cu-dung/patch_cloud.py out/index.html https://audit-rba-api.ten.workers.dev

Mã phía máy chủ nằm ở thư mục server/ (Cloudflare Worker + D1 + R2).
"""
import os
import sys

dst, api = sys.argv[1], sys.argv[2].rstrip('/')
here = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cloud')
s = open(dst, encoding='utf-8').read()
js = open(os.path.join(here, 'cloud.js'), encoding='utf-8').read().replace('__AUDIT_API__', api)
css = open(os.path.join(here, 'cloud.css'), encoding='utf-8').read()


def rep(a, b, n=1):
    global s
    c = s.count(a)
    assert c == n, (c, a[:90])
    s = s.replace(a, b)


assert 'id="clGate"' not in s, 'Đã chạy patch_cloud.py trên file này rồi'

# 1. CSS
i = s.index('</style>')
s = s[:i] + css + s[i:]

# 2. Đầu trang: nút tài khoản; thanh báo chế độ chỉ xem
rep('<button class="icon hbtn" id="btnUI"',
    '<button class="clu clonly" id="clUser" hidden aria-label="Tài khoản"><span id="clIni">?</span><i id="clDot" data-st="off"></i></button>\n    <button class="icon hbtn" id="btnUI"')
rep('<nav class="dnav" id="dnav"',
    '<div class="clro" id="clRo" hidden><span id="clRoMsg"></span><button class="btn sm" id="clRoGo">Kho audit</button></div>\n<nav class="dnav" id="dnav"')

# 3. Menu máy tính: Kho audit online, Quản trị
ICON_DB = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg>'
ICON_SH = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>'
rep('<button data-dv="set" title="Cài đặt hệ thống">',
    f'<button data-dv="cloud" class="clonly" title="Kho audit online">{ICON_DB}<span>Kho audit online</span><i class="cnt" id="dn_cloud"></i></button>\n'
    f'    <button data-dv="admin" class="cl-admin" hidden title="Quản trị">{ICON_SH}<span>Quản trị</span><i class="cnt" id="dn_admin"></i></button>\n'
    '    <button data-dv="set" title="Cài đặt hệ thống">')

# 4. Trang Kho audit và trang Quản trị
rep('<nav class="tabbar" aria-label="Màn hình">',
    '<section class="cpage" id="cloudPage" aria-label="Kho audit online"><div class="dwrap">\n'
    '    <div class="dhead"><h2>Kho audit online</h2><small>Đối tác → Lần audit → Khu vực → Ảnh và lỗi</small></div>\n'
    '    <div id="cloudB"></div>\n'
    '  </div></section>\n'
    '  <section class="cpage" id="adminPage" aria-label="Quản trị"><div class="dwrap">\n'
    '    <div class="dhead"><h2>Quản trị hệ thống</h2><small>Người dùng, phân quyền, cài đặt hệ thống, nhật ký</small></div>\n'
    '    <div id="adminB"></div>\n'
    '  </div></section>\n'
    '  <nav class="tabbar" aria-label="Màn hình">')

# 5. Thanh tab điện thoại: Kho
rep('Báo cáo</button>\n  </nav>',
    f'Báo cáo</button>\n    <button data-v="cloud" class="clonly" aria-current="false">{ICON_DB}Kho</button>\n  </nav>')

# 6. Cài đặt: thẻ Tài khoản
rep('<div class="stabs" id="setTabs" role="tablist" aria-label="Mục cài đặt">',
    '<div class="stabs" id="setTabs" role="tablist" aria-label="Mục cài đặt"><button data-st="acct" role="tab" class="clonly">Tài khoản</button>')
rep('<div class="sgrid">\n      <div class="dcard" data-st="ui"><h3>Giao diện</h3>',
    '<div class="sgrid">\n      <div class="dcard clonly" data-st="acct" id="setAcct"></div>\n'
    '      <div class="dcard clonly" data-st="acct"><h3>Phân quyền</h3><p class="hint"><b>Quản trị viên:</b> toàn quyền, quản lý người dùng, phân quyền, cài đặt hệ thống.</p><p class="hint"><b>Auditor:</b> tạo audit; chỉ sửa audit mình tạo hoặc được giao.</p><p class="hint"><b>Người xem:</b> chỉ xem và tải báo cáo.</p><p class="hint">Máy chủ kiểm tra quyền ở mọi thao tác, nên người khác không sửa được dữ liệu của bạn.</p></div>\n'
    '      <div class="dcard" data-st="ui"><h3>Giao diện</h3>')
rep('<div class="dcard" data-st="crit"><h3>Tiêu chí đánh giá</h3>',
    '<div class="dcard" data-st="crit"><h3>Tiêu chí đánh giá</h3>\n        <p class="hint" id="clCritNote" hidden>Quản trị viên đã khóa tiêu chí đánh giá cho cả hệ thống. Chỉ quản trị viên sửa được.</p>')

# 7. Báo cáo → Thông tin audit: nút mở kho
rep('<button class="btn wide" id="btnNewAudit">Bắt đầu audit mới</button>',
    '<button class="btn wide" id="btnNewAudit">Bắt đầu audit mới</button>\n          <button class="btn wide clonly" id="btnKho">Kho audit online: mở audit cũ, tra cứu</button>')

# 8. Màn đăng nhập và hộp thoại
rep('<div id="toast" role="status"></div>', '''<div class="clgate" id="clGate" hidden>
  <form id="clForm" autocomplete="on">
    <div class="cllogo"><img src="icon-192.png" alt=""><div><h1>Audit RBA</h1><small class="hint">Đăng nhập để dùng app</small></div></div>
    <label>Email<input id="clEmail" type="email" autocomplete="username" required></label>
    <label>Mật khẩu<input id="clPass" type="password" autocomplete="current-password" required></label>
    <p class="msg" id="clGateMsg"></p>
    <button class="btn primary" id="clGo" type="submit">Đăng nhập</button>
    <p class="hint">Tài khoản do quản trị viên cấp. Quên mật khẩu: liên hệ quản trị viên để đặt lại.</p>
  </form>
</div>
<dialog id="dlgClPw">
  <div class="dh"><h2>Đổi mật khẩu</h2></div>
  <form class="db" id="clPwForm">
    <p class="hint" id="clPwMsg"></p>
    <label>Mật khẩu hiện tại<input id="clPwOld" type="password" autocomplete="current-password" required></label>
    <label>Mật khẩu mới (ít nhất 8 ký tự)<input id="clPwNew" type="password" autocomplete="new-password" required minlength="8"></label>
    <label>Nhập lại mật khẩu mới<input id="clPwNew2" type="password" autocomplete="new-password" required minlength="8"></label>
    <div class="g2"><button class="btn primary" type="submit">Lưu mật khẩu</button><button class="btn" type="button" id="clPwCancel">Hủy</button></div>
  </form>
</dialog>
<dialog id="dlgClUser">
  <div class="dh"><h2 id="clUH">Người dùng</h2></div>
  <form class="db">
    <label>Họ tên<input id="clUName" required></label>
    <label>Email đăng nhập<input id="clUEmail" type="email" required></label>
    <label>Vai trò<select id="clURole"><option value="auditor">Auditor: tạo audit, sửa audit của mình hoặc được giao</option><option value="viewer">Người xem: chỉ xem, tải báo cáo</option><option value="admin">Quản trị viên: toàn quyền</option></select></label>
    <label id="clUPwRow">Mật khẩu tạm (người dùng đổi khi đăng nhập lần đầu)<span class="clpwr"><input id="clUPw" autocomplete="off"><button class="btn" type="button" id="clUGen">Tạo mới</button></span></label>
    <p class="clmsg" id="clUMsg"></p>
    <div class="g2"><button class="btn primary" id="clUSave" type="submit">Lưu</button><button class="btn" type="button" id="clUCancel">Hủy</button></div>
  </form>
</dialog>
<dialog id="dlgClMem">
  <div class="dh"><h2 id="clMemH">Giao audit</h2></div>
  <div class="db stack"><div id="clMemB"></div>
    <div class="g2"><button class="btn primary" id="clMemSave">Lưu phân quyền</button><button class="btn" id="clMemCancel">Hủy</button></div></div>
</dialog>
<div id="toast" role="status"></div>''')

# 9. Audit mới: lưu nốt dữ liệu online trước, không xóa dữ liệu trên hệ thống
rep("if(v!=='go')return;\n  bgStop();for(const p of S.photos)Store.del(p.id);S.photos=[];",
    "if(v!=='go')return;if(!(await clBeforeSwitch()))return;\n  bgStop();CL.mute++;for(const p of S.photos)Store.del(p.id);CL.mute--;clNewAudit();S.photos=[];")
rep("Muốn giữ lại dữ liệu, hãy xuất file Findings hoặc xuất gói trước.`",
    "${API&&CL.auth?'Ảnh và lỗi đã lưu online vẫn còn trong Kho audit.':'Muốn giữ lại dữ liệu, hãy xuất file Findings hoặc xuất gói trước.'}`")

# 10. Mã phần online, đặt trước phần Khởi động (cùng phạm vi với mã app)
rep('/* ---------- Khởi động ---------- */', js + '\n/* ---------- Khởi động ---------- */')

open(dst, 'w', encoding='utf-8').write(s)
print('OK', dst, api)
