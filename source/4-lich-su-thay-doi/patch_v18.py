"""v18: Tiêu chí đánh giá chặt, màn kiểm tra chỉ nêu vi phạm, nút đổi giao diện PC/điện thoại, Cài đặt hệ thống.

- Mức độ lấy đúng mức gợi ý của danh mục (AI không tự tăng giảm); chỉ lỗi ngoài danh mục (KHAC) mới để AI xác định.
- Mandatory chỉ đánh dấu khi mức độ là Priority (logic cũ của app); đổi mức độ thì Mandatory đổi theo.
- Màn kiểm tra và danh sách chỉ nêu vi phạm và điều nhìn thấy; phương án khắc phục chuyển vào mục thu gọn "Thông tin cho báo cáo".
- Nút đổi giao diện Máy tính / Điện thoại ở đầu trang; Cài đặt: Tự động theo thiết bị / Máy tính / Điện thoại; giao diện Sáng / Tối.
- Cài đặt hệ thống: Giao diện, AI soát ảnh, Tiêu chí đánh giá, Kiến thức AI (chuyển từ màn chính vào đây), Dữ liệu trên máy, Giới thiệu.

Chạy: python3 patch_v18.py app/v17.html app/soat-anh-ehs-rba.html
"""
import sys

src, dst = sys.argv[1], sys.argv[2]
s = open(src, encoding="utf-8").read()


def rep(a, b, n=1):
    global s
    c = s.count(a)
    assert c == n, (c, a[:90])
    s = s.replace(a, b)


GEAR = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg>'
MON = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>'

# ---------- 1. Tiêu chí đánh giá ----------
CFG = r"""/* Cài đặt tiêu chí đánh giá (lưu trên máy) */
const CFG=(()=>{const d={sevLock:true,mandRule:'priority',fixes:true,minConf:60,due:{Priority:1,Major:7,Minor:30}};try{const v=JSON.parse(localStorage.getItem('soat-ehs-cfg')||'{}');return{...d,...v,due:{...d.due,...(v.due||{})}}}catch{return d}})();
function cfgSave(){try{localStorage.setItem('soat-ehs-cfg',JSON.stringify(CFG))}catch{}}
"""
rep("const KINDS={violation:'Vi phạm',hazard:'Mối nguy tiềm ẩn'},kindOf=f=>KINDS[f.kind]?f.kind:'violation',MIN_CONF=60",
    "const KINDS={violation:'Vi phạm',hazard:'Mối nguy tiềm ẩn'},kindOf=f=>KINDS[f.kind]?f.kind:'violation'")
rep("keep=tidied.filter(f=>f.conf==null||f.conf>=MIN_CONF)", "keep=tidied.filter(f=>f.conf==null||f.conf>=CFG.minConf)")
rep("const DUE={Priority:1,Major:7,Minor:30};", CFG + "const DUE=CFG.due;")
rep("  f.sev=SEV.includes(a.severity)?a.severity:(r?r.v:'Minor');",
    "  f.sev=r&&CFG.sevLock?r.v:SEV.includes(a.severity)?a.severity:(r?r.v:'Minor');")
rep("f.mand=typeof a.mandatory==='boolean'?a.mandatory:f.sev==='Priority';",
    "f.mand=CFG.mandRule==='ai'&&typeof a.mandatory==='boolean'?a.mandatory:f.sev==='Priority';")
rep("const sevSel=h('select',{'aria-label':'Mức độ',onchange:e=>{const p=cur();hist(p);f.sev=e.target.value;Store.touch(p);renderAll()}}",
    "const sevSel=h('select',{'aria-label':'Mức độ',onchange:e=>{const p=cur();hist(p);f.sev=e.target.value;if(CFG.mandRule!=='ai')f.mand=f.sev==='Priority';Store.touch(p);renderAll()}}")
# lời nhắc
rep("- \"mandatory\": true khi vi phạm yêu cầu bắt buộc về an toàn, PCCC, hóa chất, môi trường và có thể gây tai nạn nặng, cháy nổ hoặc sự cố lớn. Còn lại là false.",
    "- \"mandatory\": true chỉ khi mức độ là Priority. Còn lại là false.")
rep("Mức gợi ý trong danh mục có thể tăng hoặc giảm theo tình huống thực tế trong ảnh.",
    "${CFG.sevLock?'Mức độ lấy đúng mức gợi ý của danh mục cho id đã chọn, không tự tăng hay giảm. Chỉ khi \"rule\" là KHAC mới tự xác định mức độ theo các tiêu chí trên. Không nâng mức vì lỗi lặp lại hay vì khu vực quan trọng.':'Mức gợi ý trong danh mục có thể tăng hoặc giảm theo tình huống thực tế trong ảnh.'}")
rep("- \"title\" viết như một dòng phát hiện trong báo cáo audit, ví dụ \"Chưa lắp đặt đèn chỉ dẫn thoát nạn\".",
    "- \"title\" viết như một dòng phát hiện trong báo cáo audit, ví dụ \"Chưa lắp đặt đèn chỉ dẫn thoát nạn\". \"title\" và \"evidence\" chỉ nêu hiện trạng vi phạm nhìn thấy, không nêu cách khắc phục, không dùng \"cần\", \"phải\", \"nên\".")
# file Findings: có thể bỏ phương án khắc phục
rep("M=pair(list(f=>TR.get(planVi(f))),list(planVi));", "M=CFG.fixes?pair(list(f=>TR.get(planVi(f))),list(planVi)):'';")
rep("...g.items.flatMap(({f})=>[f.title.trim(),planVi(f)])", "...g.items.flatMap(({f})=>[f.title.trim(),CFG.fixes?planVi(f):''])")

# ---------- 2. Màn kiểm tra chỉ nêu vi phạm ----------
rep("      !on&&(f.fixNow||f.fixRoot)?h('p',{class:'brief'},h('b',{text:'Khắc phục: '}),(f.fixNow+' '+f.fixRoot).trim()):null,",
    "      !on&&f.ev?h('p',{class:'brief'},h('b',{text:'Nhìn thấy: '}),f.ev):null,")
rep("          f.fixNow||f.fixRoot?h('small',null,'Khắc phục: '+(f.fixNow||f.fixRoot)):null),",
    "          f.ev?h('small',null,'Nhìn thấy: '+f.ev):null),")
rep("(f.fixNow||f.fixRoot)?h('div',{class:'tf'},'Khắc phục: '+(f.fixRoot||f.fixNow)):null",
    "f.ev?h('div',{class:'tf'},'Nhìn thấy: '+f.ev):null")
rep("    field('Khắc phục: xử lý ngay',area(f,'fixNow',2)),\n    field('Khắc phục: triệt để',area(f,'fixRoot',2)),\n", "")
rep("      field('Improvement Date (hạn khắc phục)',",
    "      field('Khắc phục: xử lý ngay (cho file Findings)',area(f,'fixNow',2)),\n      field('Khắc phục: triệt để, ghi vào Improvement Plan',area(f,'fixRoot',2)),\n      field('Improvement Date (hạn khắc phục)',")
rep("h('summary',null,h('b',null,'Mã RBA, pháp lý, hạn khắc phục'),", "h('summary',null,h('b',null,'Thông tin cho báo cáo: mã RBA, pháp lý, khắc phục, hạn'),")

# ---------- 3. Nút đầu trang, menu, trang Cài đặt ----------
rep('    </div>\n  </header>',
    '    </div>\n'
    f'    <button class="icon hbtn" id="btnUI" title="Đổi giao diện máy tính / điện thoại" aria-label="Đổi giao diện máy tính / điện thoại">{MON}</button>\n'
    f'    <button class="icon hbtn" id="btnSet" title="Cài đặt hệ thống" aria-label="Cài đặt hệ thống">{GEAR}</button>\n'
    '  </header>')
i = s.index('<button data-dv="know"')
j = s.index('</button>', i) + len('</button>')
s = s[:i] + f'<button data-dv="set" title="Cài đặt hệ thống">{GEAR}<span>Cài đặt hệ thống</span><i class="cnt" id="dn_set"></i></button>' + s[j:]
rep("const DVS=['dash','review','table','report','know']", "const DVS=['dash','review','table','report','set']")
rep("setDView('know')", "setDView('set')", 4)
rep("if(v==='report'||v==='know'){const h2=document.querySelector('.hubh h2');h2.textContent=v==='report'?'Báo cáo & xuất file':'Kiến thức AI';",
    "if(v==='set')renderSettings();\n  if(v==='report'){const h2=document.querySelector('.hubh h2');h2.textContent='Báo cáo & xuất file';")

SETTINGS_HTML = '''  <section class="spage" id="settings" aria-label="Cài đặt hệ thống"><div class="dwrap">
    <div class="dhead"><h2>Cài đặt hệ thống</h2><small id="setVer"></small></div>
    <div class="sgrid">
      <div class="dcard"><h3>Giao diện</h3>
        <div class="sopts" role="radiogroup" aria-label="Kiểu giao diện">
          <label><input type="radio" name="uim" value="auto"><span><b>Tự động theo thiết bị</b><small>Màn hình rộng hơn 920px dùng giao diện máy tính, hẹp hơn dùng giao diện điện thoại.</small></span></label>
          <label><input type="radio" name="uim" value="d"><span><b>Luôn dùng giao diện máy tính</b><small>Menu trái, tổng quan, bảng lỗi. Hợp với màn hình rộng.</small></span></label>
          <label><input type="radio" name="uim" value="m"><span><b>Luôn dùng giao diện điện thoại</b><small>Thanh tab dưới, mỗi màn một việc.</small></span></label>
        </div>
        <div class="sopts" role="radiogroup" aria-label="Màu giao diện">
          <label><input type="radio" name="thm" value="auto"><span><b>Màu theo hệ thống</b></span></label>
          <label><input type="radio" name="thm" value="light"><span><b>Sáng</b></span></label>
          <label><input type="radio" name="thm" value="dark"><span><b>Tối</b></span></label>
        </div>
      </div>
      <div class="dcard"><h3>AI soát ảnh</h3>
        <div class="sai" id="setAI"></div>
        <p class="hint">Key, mô hình Gemini và nhật ký AI nằm trong mục Kiến thức AI bên dưới.</p>
      </div>
      <div class="dcard"><h3>Tiêu chí đánh giá</h3>
        <label class="chk"><input type="checkbox" id="cfSev"> Mức độ lấy đúng theo danh mục lỗi (khuyến nghị). Bỏ chọn để AI được tăng hoặc giảm mức theo ảnh.</label>
        <label class="chk"><input type="checkbox" id="cfMand"> Chỉ đánh dấu Mandatory khi mức độ là Priority (khuyến nghị). Bỏ chọn để AI tự đề xuất.</label>
        <label class="chk"><input type="checkbox" id="cfFix"> AI viết phương án khắc phục cho cột Improvement Plan của file Findings. Màn kiểm tra chỉ nêu vi phạm.</label>
        <label class="srow">Độ chắc chắn tối thiểu để đưa lỗi vào danh sách<select id="cfConf"><option value="50">50%</option><option value="60">60%</option><option value="70">70%</option><option value="80">80%</option></select></label>
        <div class="srow">Hạn khắc phục (số ngày): <label>Priority <input type="number" min="0" max="365" id="cfDueP"></label><label>Major <input type="number" min="0" max="365" id="cfDueMa"></label><label>Minor <input type="number" min="0" max="365" id="cfDueMi"></label></div>
        <details class="crit"><summary>Xem tiêu chí đang áp dụng</summary>
          <ul>
            <li><b>Priority:</b> nguy hiểm tức thời đến tính mạng hoặc sự cố lớn, phải xử lý ngay trong ca. Được đánh dấu Mandatory.</li>
            <li><b>Major:</b> vi phạm rõ yêu cầu hoặc pháp luật, có thể gây chấn thương hoặc sự cố nếu không sửa.</li>
            <li><b>Minor:</b> rủi ro thấp hoặc mối nguy tiềm ẩn chưa có điều kiện gây sự cố ngay, sửa nhanh được.</li>
            <li>Lỗi khớp danh mục dùng đúng mức gợi ý của danh mục. Lỗi ngoài danh mục (KHAC) do AI xác định theo 3 tiêu chí trên; người đánh giá luôn sửa được.</li>
          </ul>
        </details>
        <button class="btn" id="cfApply">Áp lại tiêu chí cho các lỗi hiện có</button>
      </div>
      <div class="dcard"><h3>Dữ liệu trên máy</h3>
        <p class="stat" id="setStore">Đang tính dung lượng…</p>
        <p class="hint">Ảnh, lỗi, thư viện, tài liệu và sổ kinh nghiệm lưu trong trình duyệt của máy này. Dùng Xuất gói ở màn Báo cáo để chuyển sang máy khác.</p>
        <div class="g2"><button class="btn" id="setNew">Bắt đầu audit mới</button><button class="btn danger" id="setWipe">Xóa toàn bộ dữ liệu</button></div>
      </div>
      <div class="dcard"><h3>Giới thiệu</h3>
        <p class="stat" id="setAbout"></p>
        <button class="btn" id="setUpd">Kiểm tra bản mới</button>
      </div>
    </div>
    <div class="dhead"><h2>Kiến thức AI</h2><small>Danh mục, tài liệu, thư viện lỗi, sổ kinh nghiệm dùng khi AI soát ảnh</small></div>
    <div class="sgrid sknow" id="setKnow"></div>
  </div></section>
'''
rep('  <nav class="tabbar"', SETTINGS_HTML + '  <nav class="tabbar"')

CSS = r"""
.spage{display:none}
.hbtn{flex:none}
.sgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:16px;align-items:start}
.sgrid.sknow>*{margin:0}
.sopts{display:grid;gap:6px}
.sopts label{display:grid;grid-template-columns:22px 1fr;gap:8px;align-items:start;padding:8px 10px;border:1px solid var(--line);border-radius:8px;cursor:pointer}
.sopts label:has(input:checked){border-color:var(--accent);background:var(--accent-soft)}
.sopts b{display:block;font-size:14px}.sopts small{display:block;color:var(--muted);font-size:12.5px}
.sai{display:grid;gap:8px}.sai label{display:flex;gap:10px;align-items:center;justify-content:flex-start;font-size:14px;text-align:left}
.sai input[type=checkbox]{width:auto;flex:none;margin:0}
.dcard label.chk{display:flex;gap:10px;align-items:flex-start;font-size:13.5px}
.dcard label.chk input{width:auto;flex:none;margin-top:3px}
.sai select{font:inherit;padding:6px 8px;border:1px solid var(--line);border-radius:6px;background:var(--panel)}
.srow{display:flex;gap:10px;align-items:center;flex-wrap:wrap;font-size:13.5px}
.srow select,.srow input{font:inherit;padding:6px 8px;border:1px solid var(--line);border-radius:6px;background:var(--panel);width:auto}
.srow input{width:70px}
.srow label{display:inline-flex;gap:6px;align-items:center}
.crit summary{cursor:pointer;font-weight:600;font-size:13.5px}
.crit ul{margin:8px 0 0;padding-left:18px;display:grid;gap:6px;font-size:13px}
@media (min-width:921px){
  #app[data-dview="set"] .work{display:none}
  #app[data-dview="set"] #settings{display:block;overflow:auto;background:var(--paper);grid-column:2;grid-row:4;min-height:0}
  .dnav>button[data-dv="set"]{margin-top:8px;border-top:1px solid var(--line);border-radius:0 0 8px 8px;padding-top:14px}
}
@media (max-width:920px){
  #app[data-view="set"] .work{display:none}
  #app[data-view="set"] #settings{display:block;flex:1;overflow:auto;background:var(--paper)}
  .sgrid{grid-template-columns:1fr}
  .dwrap{padding:14px 12px 30px}
  .top .hbtn{width:38px;height:38px}
}
"""
rep(".dnav,.dpage{display:none}", ".dnav,.dpage{display:none}" + CSS)

JS = r"""/* ---------- Giao diện PC / điện thoại, màu, Cài đặt hệ thống ---------- */
let UI='auto';try{UI=localStorage.getItem('soat-ehs-ui')||'auto'}catch{}
const UIM=new WeakMap();
function applyUI(){
  for(const sh of document.styleSheets){let rs;try{rs=sh.cssRules}catch{continue}
    for(const r of rs){if(!(r instanceof CSSMediaRule))continue;if(!UIM.has(r))UIM.set(r,r.media.mediaText);const o=UIM.get(r);let n=o;
      if(/max-width:\s*920px/.test(o)&&!/min-width/.test(o))n=UI==='m'?'all':UI==='d'?'not all':o;
      else if(/min-width:\s*921px/.test(o))n=/max-width:\s*1365px/.test(o)?(UI==='m'?'not all':UI==='d'?'(max-width: 1365px)':o):(UI==='m'?'not all':UI==='d'?'all':o);
      if(r.media.mediaText!==n)r.media.mediaText=n}}
  document.documentElement.dataset.ui=UI;
}
applyUI();
function applyTheme(){let t='auto';try{t=localStorage.getItem('soat-ehs-theme')||'auto'}catch{}if(t==='auto')delete document.documentElement.dataset.theme;else document.documentElement.dataset.theme=t}
applyTheme();
"""
rep("const MQ=matchMedia('(max-width:920px)'),isMobile=()=>MQ.matches,",
    JS + "const MQ=matchMedia('(max-width:920px)'),isMobile=()=>UI==='m'||(UI!=='d'&&MQ.matches),")

JS2 = r"""
function setUI(v){
  UI=v;try{localStorage.setItem('soat-ehs-ui',v)}catch{}applyUI();
  if(isMobile()){$('app').classList.remove('hubon');setView(['photos','review','list','hub','set'].includes($('app').dataset.view)?$('app').dataset.view:'review')}
  else setDView($('app').dataset.dview||'dash');
  requestAnimationFrame(fit);renderAll();syncSettings();
}
function openSettings(){if(isMobile())setView('set');else setDView('set')}
function syncSettings(){
  for(const r of document.querySelectorAll('input[name=uim]'))r.checked=r.value===UI;
  let t='auto';try{t=localStorage.getItem('soat-ehs-theme')||'auto'}catch{}for(const r of document.querySelectorAll('input[name=thm]'))r.checked=r.value===t;
  $('cfSev').checked=CFG.sevLock;$('cfMand').checked=CFG.mandRule!=='ai';$('cfFix').checked=CFG.fixes;$('cfConf').value=String(CFG.minConf);
  $('cfDueP').value=CFG.due.Priority;$('cfDueMa').value=CFG.due.Major;$('cfDueMi').value=CFG.due.Minor;
  $('btnUI').title=isMobile()?'Đang dùng giao diện điện thoại. Bấm để chuyển sang máy tính':'Đang dùng giao diện máy tính. Bấm để chuyển sang điện thoại';
}
function renderSettings(){
  syncSettings();renderHub();libRender();docRender();if(typeof renderAiLog==='function')renderAiLog();
  const ver=(document.querySelector('.brand .ver')||{}).textContent||'';$('setVer').textContent=ver?`Audit RBA ${ver}`:'Audit RBA';
  $('setAbout').textContent=`Audit RBA ${ver} · RBA Guider ${GUIDER.ver}. Ảnh và dữ liệu chỉ lưu trên máy này; ảnh được gửi tới dịch vụ AI khi soát.`;
  if(navigator.storage&&navigator.storage.estimate)navigator.storage.estimate().then(({usage,quota})=>{$('setStore').textContent=`Đang dùng ${(usage/1048576).toFixed(1)} MB trên ${quota?(quota/1073741824).toFixed(1)+' GB':'?'} cho phép. ${S.photos.filter(p=>!p.sample).length} ảnh, ${Lib.items.length} lỗi trong thư viện, ${DOCS.items.length} tài liệu.`}).catch(()=>{});
  else $('setStore').textContent=`${S.photos.filter(p=>!p.sample).length} ảnh, ${Lib.items.length} lỗi trong thư viện, ${DOCS.items.length} tài liệu.`;
}
function reapplyCriteria(){
  let n=0;for(const p of S.photos.filter(x=>!x.sample)){let ch=false;for(const f of p.findings){const r=f.rule&&RULES[f.rule];
    if(CFG.sevLock&&r&&f.sev!==r.v){f.sev=r.v;ch=true;n++}
    if(CFG.mandRule!=='ai'){const m=f.sev==='Priority';if(f.mand!==m){f.mand=m;ch=true;n++}}}if(ch)Store.touch(p)}
  renderAll();return n;
}
"""
rep("function setDView(v){", JS2 + "function setDView(v){")

# trên điện thoại: màn 'set'
rep("  $('app').dataset.view=v;document.querySelectorAll('.tabbar button').forEach(b=>b.setAttribute('aria-current',b.dataset.v===v?'page':'false'));",
    "  $('app').dataset.view=v;document.querySelectorAll('.tabbar button').forEach(b=>b.setAttribute('aria-current',b.dataset.v===v?'page':'false'));if(v==='set')renderSettings();")

# chuyển các mục kiến thức và tùy chọn AI vào Cài đặt
rep("grpHub();{let v='dash'",
    "grpHub();{const K=$('setKnow');document.querySelectorAll('.hubb>[data-grp=\"know\"]').forEach(el=>{K.append(el);if(el.tagName==='DETAILS')el.open=true});\n"
    "  const A=$('setAI');for(const id of['optMode','optBg','optAuto']){const l=$(id).closest('label');if(l)A.append(l)}}\n"
    "$('btnSet').onclick=openSettings;$('btnUI').onclick=()=>{const v=isMobile()?'d':'m';setUI(v);toast(v==='d'?'Đã chuyển sang giao diện máy tính. Chọn Tự động trong Cài đặt để theo thiết bị.':'Đã chuyển sang giao diện điện thoại. Chọn Tự động trong Cài đặt để theo thiết bị.')};\n"
    "for(const r of document.querySelectorAll('input[name=uim]'))r.onchange=()=>{if(r.checked)setUI(r.value)};\n"
    "for(const r of document.querySelectorAll('input[name=thm]'))r.onchange=()=>{if(!r.checked)return;try{localStorage.setItem('soat-ehs-theme',r.value)}catch{}applyTheme()};\n"
    "$('cfSev').onchange=e=>{CFG.sevLock=e.target.checked;cfgSave()};$('cfMand').onchange=e=>{CFG.mandRule=e.target.checked?'priority':'ai';cfgSave()};\n"
    "$('cfFix').onchange=e=>{CFG.fixes=e.target.checked;cfgSave()};$('cfConf').onchange=e=>{CFG.minConf=+e.target.value;cfgSave()};\n"
    "for(const[id,k]of[['cfDueP','Priority'],['cfDueMa','Major'],['cfDueMi','Minor']])$(id).onchange=e=>{const v=Math.max(0,Math.min(365,Math.round(+e.target.value||0)));CFG.due[k]=v;e.target.value=v;cfgSave();renderAll()};\n"
    "$('cfApply').onclick=async()=>{const v=await ask('Áp lại tiêu chí?','Mức độ của các lỗi khớp danh mục sẽ lấy lại theo danh mục, Mandatory đặt lại theo mức Priority (theo cài đặt hiện tại). Lỗi bạn đã sửa tay cũng bị đặt lại.',[{label:'Áp lại tiêu chí',cls:'primary',v:'go'},{label:'Hủy',v:null}]);if(v!=='go')return;const n=reapplyCriteria();toast(n?`Đã chỉnh ${n} chỗ theo tiêu chí.`:'Các lỗi đã đúng tiêu chí.')};\n"
    "$('setNew').onclick=newAudit;\n"
    "$('setWipe').onclick=async()=>{const v=await ask('Xóa toàn bộ dữ liệu trên máy?','Xóa hết ảnh, lỗi, thư viện lỗi, tài liệu, sổ kinh nghiệm, lịch sử, key AI và cài đặt trên máy này. Không hoàn tác được.',[{label:'Xóa toàn bộ',cls:'danger',v:'go'},{label:'Hủy',v:null}]);if(v!=='go')return;\n"
    "  const v2=await ask('Chắc chắn xóa?','Bấm Xóa lần nữa để xác nhận.',[{label:'Xóa',cls:'danger',v:'go'},{label:'Hủy',v:null}]);if(v2!=='go')return;\n"
    "  try{bgStop()}catch{}try{Store.db&&Store.db.close()}catch{}try{for(const k of Object.keys(localStorage))if(k.startsWith('soat-ehs'))localStorage.removeItem(k)}catch{}\n"
    "  const q=indexedDB.deleteDatabase('soat-ehs');q.onsuccess=q.onerror=q.onblocked=()=>location.reload()};\n"
    "$('setUpd').onclick=async()=>{try{const r=navigator.serviceWorker&&await navigator.serviceWorker.getRegistration();if(r){await r.update();toast(r.installing||r.waiting?'Đã có bản mới. Đóng app rồi mở lại để dùng.':'Đang dùng bản mới nhất.')}else location.reload()}catch{location.reload()}};\n"
    "grpHub();{let v='dash'")
# gom nhóm: các mục ngoài báo cáo đều thuộc kiến thức (đã có), bỏ trang know cũ
rep("MQ.addEventListener('change',()=>{if(!isMobile())setDView($('app').dataset.dview||'dash')});",
    "MQ.addEventListener('change',()=>{if(UI!=='auto')return;if(!isMobile())setDView($('app').dataset.dview||'dash');else if(!['photos','review','list','hub','set'].includes($('app').dataset.view))setView('review')});")

open(dst, "w", encoding="utf-8").write(s)
print("ok", len(s))
