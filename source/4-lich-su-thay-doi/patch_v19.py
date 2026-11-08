"""v19: Rà lại toàn bộ luồng thao tác.

- Quy trình thống nhất trên PC và điện thoại: Ảnh → Kiểm tra vi phạm → Xác nhận lỗi → Báo cáo.
- Màn Xác nhận lỗi (điện thoại): sửa lỗi bị ép mất dòng; mỗi lỗi một thẻ rõ ràng: số, nội dung, mức độ, mã, loại,
  Mandatory, trạng thái, nút Sửa và Xác nhận to, dễ bấm. Bỏ công tắc "Tất cả ảnh / Ảnh đang mở": bấm Sửa thì mở chi tiết ảnh,
  có nút "← Tất cả lỗi" để quay lại. Trên PC, khung bên phải màn Kiểm tra vi phạm chỉ hiện lỗi của ảnh đang mở.
- Chỉ còn một chỗ xuất file: màn Báo cáo. Nút xuất chỉ bấm được khi đã kiểm tra hết: có tên đối tác, AI soát xong,
  mọi lỗi đã xác nhận (hoặc đã xóa), có ít nhất một lỗi. Danh sách điều kiện hiện ngay trên nút.
- Tổng quan bỏ thẻ Kiến thức AI.

Chạy: python3 patch_v19.py app/v18.html app/soat-anh-ehs-rba.html
"""
import sys

src, dst = sys.argv[1], sys.argv[2]
s = open(src, encoding="utf-8").read()


def rep(a, b, n=1):
    global s
    c = s.count(a)
    assert c == n, (c, a[:90])
    s = s.replace(a, b)


# ---------- Tên thống nhất ----------
rep('</svg>Lỗi<i class="cnt" id="tcList"></i>', '</svg><span class="tl">Xác nhận lỗi</span><i class="cnt" id="tcList"></i>')
rep('title="Kiểm tra ảnh"', 'title="Kiểm tra vi phạm"')
rep('<span>Kiểm tra ảnh</span>', '<span>Kiểm tra vi phạm</span>')
rep('title="Danh sách lỗi"', 'title="Xác nhận lỗi"')
rep('<span>Danh sách lỗi</span>', '<span>Xác nhận lỗi</span>')
rep('<h2>Danh sách lỗi</h2>', '<h2>Xác nhận lỗi</h2>')

# ---------- Màn Xác nhận lỗi ----------
rep('<div class="sum"><div class="lmode"', '<div class="sum"><button class="lback" id="lBack" hidden>← Tất cả lỗi</button><div class="lmode"')
CSS = r"""
.list>*{flex-shrink:0}
.lmode{display:none!important}
.exports{display:none!important}
#tExport{display:none}
.lback{border:0;background:none;color:var(--accent);font-weight:600;font-size:14px;padding:4px 0 8px;cursor:pointer;display:block}
.sum .prog.wide{height:8px;margin:6px 0 4px}
.sevmini{display:flex;gap:6px;flex-wrap:wrap}
.confall{width:100%;min-height:44px}
.agrp2{border:1px solid var(--line);border-radius:12px;background:var(--panel);overflow:visible}
.agh2{display:grid;grid-template-columns:56px 1fr auto;gap:10px;align-items:center;padding:10px 12px;background:var(--soft);border:0;width:100%;text-align:left;color:var(--ink);border-radius:12px 12px 0 0;cursor:pointer}
.agh2 img{width:56px;height:42px;object-fit:cover;border-radius:6px;display:block;background:var(--line)}
.agh2 b{display:block;font-size:14px;line-height:1.3}.agh2 small{display:block;color:var(--muted);font-size:12.5px}
.agh2 .go{color:var(--accent);font-size:13px;font-weight:600;white-space:nowrap}
.arow2{border-top:1px solid var(--line);padding:10px 12px;display:grid;gap:8px}
.arow2.ok{background:color-mix(in srgb,var(--ok-soft) 40%,transparent)}
.arow2.picked{background:var(--accent-soft)}
.ar-top{display:grid;grid-template-columns:auto 1fr;gap:10px;align-items:start;cursor:pointer}
.ar-top.sel{grid-template-columns:auto auto 1fr}
.ar-t b{display:block;font-size:14px;line-height:1.4;font-weight:600}
.ar-m{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:4px;font-size:12.5px;color:var(--muted)}
.ar-m .tag{border:1px solid var(--line);border-radius:4px;padding:1px 6px}
.ar-m .tag.mand{border-color:var(--pri);color:var(--pri);font-weight:600}
.ar-a{display:flex;gap:8px;align-items:center}
.ar-a .st{font-size:13px;font-weight:600;margin-right:auto}
.ar-a .st.ok{color:var(--ok)}.ar-a .st.pend{color:var(--maj)}
.ar-a .btn{min-height:40px;min-width:84px;justify-content:center}
.agfoot{border-top:1px solid var(--line);padding:8px 12px}
.anone2{padding:10px 12px;border-top:1px solid var(--line);font-size:13px;color:var(--muted)}
.lstat{border:1px dashed var(--line);border-radius:10px;padding:12px;font-size:13.5px;display:grid;gap:8px}
.xcheck{list-style:none;margin:0;padding:0;display:grid;gap:6px;font-size:13.5px}
.xcheck li{display:grid;grid-template-columns:22px 1fr auto;gap:8px;align-items:center}
.xcheck li i{width:20px;height:20px;border-radius:50%;display:grid;place-items:center;font:700 12px/1 var(--fb);font-style:normal;color:#fff;background:var(--line)}
.xcheck li.ok i{background:var(--ok)}.xcheck li.no i{background:var(--pri)}.xcheck li.warn i{background:var(--maj)}
.xcheck li .btn{min-height:30px}
.xready{font-weight:600;font-size:13.5px}
.xready.ok{color:var(--ok)}.xready.no{color:var(--pri)}
"""
rep(".dnav,.dpage{display:none}", ".dnav,.dpage{display:none}" + CSS)

a = s.index("function renderAllList(){")
b = s.index("\nfunction renderList(){", a)
NEW_ALL = r"""function renderAllList(){
  const L=$('list'),R=$('sumR');L.replaceChildren();R.replaceChildren();$('side').hidden=true;$('lBack').hidden=true;
  const real=S.photos.filter(p=>!p.sample),src=real.length?real:S.photos,all=src.flatMap(p=>p.findings);
  const tot=all.length,okN=all.filter(f=>f.ok).length,pend=tot-okN;
  $('sumT').textContent=tot?`Xác nhận lỗi: ${okN}/${tot} lỗi đã xác nhận`:'Xác nhận lỗi';
  if(tot)R.append(h('div',{class:'prog wide',style:'width:100%',title:`${okN}/${tot} lỗi đã xác nhận`},h('span',{style:`width:${okN/tot*100}%`})),
    h('div',{class:'sevmini'},SEV.map(s=>h('span',{class:'pill '+s,text:`${s} ${all.filter(f=>f.sev===s).length}`}))));
  if(S.lf==='pend'&&!pend)S.lf='all';
  if(tot)L.append(h('div',{class:'atool'},
    h('button',{class:'chip2','aria-pressed':String(S.lf==='all'),onclick:()=>{S.lf='all';renderList()}},`Tất cả (${tot})`),
    h('button',{class:'chip2','aria-pressed':String(S.lf==='pend'),disabled:!pend,onclick:()=>{S.lf='pend';renderList()}},`Chờ xác nhận (${pend})`),
    h('span',{class:'sp'}),
    h('button',{class:'btn sm',onclick:()=>{S.fsel=S.fsel?null:new Set();renderList()}},S.fsel?'Thôi chọn':'Chọn nhiều')));
  if(pend&&!S.fsel)L.append(h('button',{class:'btn good confall',onclick:e=>{const b=e.currentTarget;if(Date.now()-cfmAt>4000){cfmAt=Date.now();b.textContent=`Bấm lần nữa để xác nhận ${pend} lỗi`;setTimeout(()=>{if(b.isConnected)b.textContent=`Xác nhận tất cả ${pend} lỗi đang chờ`},4000);return}cfmAt=0;const n=confirmPending();toast(`Đã xác nhận ${n} lỗi.`)}},`Xác nhận tất cả ${pend} lỗi đang chờ`));
  if(S.fsel){const vis=src.flatMap(p=>p.findings.filter(f=>S.lf!=='pend'||!f.ok)),n=S.fsel.size,allSel=vis.length>0&&vis.every(f=>S.fsel.has(f.id));
    L.append(h('div',{class:'fselbar'},h('b',null,`Đã chọn ${n} lỗi`),h('span',{class:'sp'}),
      h('button',{class:'btn sm',onclick:()=>{if(allSel)for(const f of vis)S.fsel.delete(f.id);else for(const f of vis)S.fsel.add(f.id);renderList()}},allSel?'Bỏ chọn tất cả':'Chọn tất cả'),
      h('button',{class:'btn sm good',disabled:!n,onclick:()=>fBulk('ok')},'Xác nhận'),
      h('button',{class:'btn sm',disabled:!n,onclick:()=>fBulk('unok')},'Bỏ xác nhận'),
      h('button',{class:'btn sm danger',disabled:!n,onclick:()=>fBulk('del')},'Xóa'),
      h('button',{class:'btn sm primary',onclick:()=>{S.fsel=null;renderList()}},'Xong')))}
  src.forEach((p,pi)=>{
    const its=p.findings.map((f,i)=>({f,n:i+1})).filter(x=>S.lf!=='pend'||!x.f.ok);
    if(S.lf==='pend'&&!its.length)return;
    const cols=colorsOf(p.findings.map(f=>({f}))),okP=p.findings.filter(f=>f.ok).length,pdP=p.findings.length-okP;
    const st=p.bgRun?'AI đang soát…':!p.analysis&&!p.findings.length?'Chưa soát':p.findings.length?`${p.findings.length} lỗi · ${pdP?`${pdP} chờ xác nhận`:'đã xác nhận hết'}`:'Không có lỗi';
    L.append(h('section',{class:'agrp2'},
      h('button',{class:'agh2',onclick:()=>{S.listAll=false;S.cur=p.id;S.sel=null;renderAll();fit();if(isMobile())setView('review');else setDView('review')}},
        p.thumb?h('img',{src:p.thumb,alt:''}):h('span'),h('span',null,h('b',null,`Ảnh ${pi+1}: ${p.area||p.name}`),h('small',null,st)),h('span',{class:'go'},'Xem ảnh ›')),
      its.length?its.map(({f,n})=>{const on=!!S.fsel&&S.fsel.has(f.id),tog=()=>{on?S.fsel.delete(f.id):S.fsel.add(f.id);renderList()};
        return h('div',{class:'arow2'+(f.ok?' ok':'')+(on?' picked':'')},
          h('div',{class:'ar-top'+(S.fsel?' sel':''),onclick:()=>S.fsel?tog():editFinding(p,f)},
            S.fsel?h('button',{class:'fchk','aria-pressed':String(on),'aria-label':(on?'Bỏ chọn lỗi ':'Chọn lỗi ')+n,text:on?'✓':''}):null,
            h('span',{class:'bdg '+(f.sev||'none'),style:`background:${cols[f.id][0]};color:${cols[f.id][1]}`,text:String(n)}),
            h('div',{class:'ar-t'},h('b',null,f.pending?'AI đang xác định lỗi…':(f.title||'Chưa có nội dung lỗi')),
              h('div',{class:'ar-m'},f.sev?h('span',{class:'pill '+f.sev},f.sev):h('span',{class:'tag'},'Chưa có mức độ'),h('span',{class:'tag'},f.req||f.code||'Chưa có mã'),h('span',{class:'tag'},KINDS[kindOf(f)]),f.mand?h('span',{class:'tag mand'},'Mandatory'):null))),
          S.fsel?null:h('div',{class:'ar-a'},h('span',{class:'st '+(f.ok?'ok':'pend')},f.ok?'✓ Đã xác nhận':'Chờ xác nhận'),
            h('button',{class:'btn sm',onclick:()=>editFinding(p,f)},'Sửa'),
            h('button',{class:'btn sm good'+(f.ok?' on':''),onclick:()=>toggleOk(p,f)},f.ok?'Bỏ xác nhận':'Xác nhận')))}):
        h('p',{class:'anone2'},p.bgRun?'AI đang soát ảnh này…':p.analysis?'AI không thấy lỗi trong ảnh này.':'Ảnh chưa được soát.'),
      p.sample||p.bgRun||S.fsel?null:h('div',{class:'agfoot'},hintAdd(p))));
  });
  if(!tot)L.append(h('p',{class:'empty',text:real.length?'Chưa có lỗi nào. Mở ảnh để AI soát, khoanh vùng hoặc thêm lỗi AI bỏ sót.':'Chưa có ảnh. Vào tab Ảnh để chụp hoặc thêm ảnh.'}));
  else L.append(h('div',{class:'lstat'},pend?h('span',null,`Còn ${pend} lỗi chờ xác nhận. Xác nhận hoặc xóa hết lỗi rồi mới xuất được báo cáo.`):
    h('button',{class:'btn primary wide',onclick:()=>openHub()},'Đã kiểm tra xong · Sang Báo cáo để xuất file')));
}"""
s = s[:a] + NEW_ALL + s[b:]

rep("function renderList(){\n  $('lmAll').setAttribute('aria-selected',String(S.listAll));$('lmOne').setAttribute('aria-selected',String(!S.listAll));\n  if(S.listAll){renderAllList();renderSel();return}\n  const p=cur(),L=$('list');L.replaceChildren();if(!p)return;",
    "function renderList(){\n  if(S.listAll&&isMobile()){renderAllList();renderSel();return}\n  const p=cur(),L=$('list');L.replaceChildren();if(!p)return;\n"
    "  $('lBack').hidden=false;$('lBack').textContent=isMobile()?'← Tất cả lỗi':'Xem lỗi của mọi ảnh ở màn Xác nhận lỗi →';")
rep("function renderSum(){\n  const p=cur(),R=$('sumR');R.replaceChildren();if(!p)return;",
    "function renderSum(){\n  const p=cur(),R=$('sumR');R.replaceChildren();if(!p)return;const pi=S.photos.filter(x=>!x.sample).indexOf(p);")
rep("$('sumT').textContent=`Lỗi trên ảnh này: ${p.findings.length}`;",
    "$('sumT').textContent=`${pi>=0?`Ảnh ${pi+1}: `:''}${p.area||p.name} · ${p.findings.length} lỗi`;")
rep("$('lmAll').onclick=()=>{S.listAll=true;S.sel=null;renderAll()};",
    "$('lmAll').onclick=()=>{S.listAll=true;S.sel=null;renderAll()};$('lBack').onclick=()=>{if(isMobile()){S.listAll=true;S.sel=null;renderAll()}else{S.tf.st='';setDView('table')}};")

# ---------- Một chỗ xuất file, chỉ khi đã kiểm tra hết ----------
rep('          <button class="btn primary wide" id="btnFind2">Xuất file Findings (.xlsm)</button>',
    '          <p class="xready" id="xReady"></p>\n          <ul class="xcheck" id="xCheck"></ul>\n          <button class="btn primary wide" id="btnFind2">Xuất file Findings (.xlsm)</button>')
GATE = r"""/* ---------- Điều kiện xuất báo cáo: chỉ xuất khi đã kiểm tra hết ---------- */
function exportReady(){
  const real=S.photos.filter(p=>!p.sample),its=real.flatMap(p=>p.findings),pend=its.filter(f=>!f.ok).length,ok=its.length-pend;
  const run=real.filter(p=>p.bgRun||p.findings.some(f=>f.pending)).length,uns=real.filter(p=>!p.analysis&&!p.findings.length&&!p.bgRun);
  const vendor=$('mUnit').value.trim(),who=$('mWho').value.trim();
  const checks=[
    {ok:!!vendor,t:vendor?`Đối tác: ${vendor}`:'Chưa nhập tên đối tác (Vendor Name)',btn:vendor?null:['Nhập',()=>{openHub();const d=$('mUnit').closest('details');if(d)d.open=true;setTimeout(()=>$('mUnit').focus(),60)}]},
    {ok:!!who,warn:!who,t:who?`Người đánh giá: ${who}`:'Chưa nhập người đánh giá (Auditor), nên nhập',btn:who?null:['Nhập',()=>{openHub();const d=$('mWho').closest('details');if(d)d.open=true;setTimeout(()=>$('mWho').focus(),60)}]},
    {ok:!run,t:run?`AI đang soát ${run} ảnh, chờ xong`:'AI đã soát xong'},
    {ok:!uns.length,warn:!!uns.length,t:uns.length?`${uns.length} ảnh chưa được AI soát`:'Mọi ảnh đã được soát',btn:uns.length&&AI.ok?['Soát ngay',()=>runAll(uns)]:null},
    {ok:its.length>0&&!pend,t:!its.length?'Chưa có lỗi nào':pend?`Còn ${pend}/${its.length} lỗi chưa xác nhận`:`Đã xác nhận hết ${its.length} lỗi`,btn:pend?['Xác nhận',()=>showReview('pend')]:null}];
  const ready=checks.every(c=>c.ok||c.warn);
  return{ready,checks,pend,ok,its,why:checks.find(c=>!c.ok&&!c.warn)?.t||''};
}
function gateExport(){const r=exportReady();if(r.ready)return true;toast(`Chưa xuất được: ${r.why}.`);if(r.pend)showReview('pend');else openHub();return false}
function renderExportCheck(){
  const C=$('xCheck');if(!C)return;const r=exportReady();
  $('xReady').className='xready '+(r.ready?'ok':'no');$('xReady').textContent=r.ready?'Đã đủ điều kiện xuất báo cáo.':'Chỉ xuất được khi đã kiểm tra hết:';
  C.replaceChildren(...r.checks.map(c=>h('li',{class:c.ok?'ok':c.warn?'warn':'no'},h('i',null,c.ok?'✓':c.warn?'!':'×'),h('span',null,c.t),c.btn?h('button',{class:'btn sm',onclick:c.btn[1]},c.btn[0]):h('span'))));
  for(const id of['btnFind2','btnRev','btnZip','btnImg'])if($(id))$(id).disabled=!r.ready;
}
"""
rep("function exportReady(){", "function exportReady(){", 0)
rep("async function previewImage(){", GATE + "async function previewImage(){")
rep("  const p=cur();if(!p)return;if(!numbered(p).length)return toast('Ảnh này chưa có lỗi đã xác nhận. Xác nhận lỗi trước khi tạo ảnh báo cáo.');",
    "  if(!gateExport())return;const p=cur();if(!p)return;if(!numbered(p).length)return toast('Ảnh này không có lỗi. Chọn ảnh có lỗi ở màn Kiểm tra vi phạm.');")
rep("  if(!skip&&pendingItems().length)return askExport(s=>exportZip(s).catch(()=>toast('Không tạo được file nén. Hãy thử lại.')));", "  if(!gateExport())return;")
rep("  if(!skip&&pendingItems().length)return askExport(exportFindings);", "  if(!gateExport())return;")
rep("  if(!skip&&pendingItems().length)return askExport(exportReview);", "  if(!gateExport())return;")
rep("function uiExtra(){deskSoon();", "function uiExtra(){deskSoon();queueMicrotask(renderExportCheck);")

# Tổng quan: bỏ nút xuất và thẻ kiến thức; việc tiếp theo dẫn sang Báo cáo
rep("h('button',{class:'btn primary',disabled:!st.ok,onclick:()=>exportFindings()},'Xuất file Findings')", "null")
rep("if(st.ok)return{t:'Xuất file Findings',d:`${st.ok} lỗi đã xác nhận`,b:'Xuất file',go:()=>exportFindings()};",
    "if(st.ok)return{t:'Xuất báo cáo',d:`Đã xác nhận hết ${st.ok} lỗi`,b:'Sang Báo cáo',go:()=>setDView('report')};")
rep("B.replaceChildren(head,kp,h('div',{class:'dgrid'},sevCard,codeCard,areaCard),photoCard,h('div',{class:'dgrid'},know,hist));",
    "B.replaceChildren(head,kp,h('div',{class:'dgrid'},sevCard,codeCard,areaCard),photoCard,hist);")
# số trên tab Xác nhận lỗi: số lỗi còn chờ
rep("{const t=S.photos.filter(x=>!x.sample).reduce((a,x)=>a+x.findings.length,0)||(p?p.findings.length:0);$('tcList').textContent=t?String(t):''}",
    "{const t=S.photos.filter(x=>!x.sample).reduce((a,x)=>a+x.findings.filter(f=>!f.ok).length,0);$('tcList').textContent=t?String(t):''}")
# bảng lỗi trên PC: dòng chân ghi điều kiện xuất
rep("$('tFoot').textContent=`Đang hiện ${rows.length}/${st.its.length} lỗi. File Findings chỉ gồm lỗi đã xác nhận (${st.ok}).`;",
    "$('tFoot').textContent=`Đang hiện ${rows.length}/${st.its.length} lỗi. ${st.its.length-st.ok?`Còn ${st.its.length-st.ok} lỗi chờ xác nhận; xác nhận hoặc xóa hết rồi sang Báo cáo để xuất file.`:st.ok?'Đã xác nhận hết, sang Báo cáo để xuất file.':''}`;")
# vào màn Báo cáo thì cập nhật điều kiện xuất; bấm tab Xác nhận lỗi thì về danh sách mọi ảnh
rep("if(v==='hub')renderHub();", "if(v==='hub'){renderHub();renderExportCheck()}")
rep("  if(v==='report'){const h2=", "  if(v==='report'){renderExportCheck();const h2=")
rep("document.querySelector('.tabbar').addEventListener('click',e=>{const b=e.target.closest('button[data-v]');if(b)setView(b.dataset.v)});",
    "document.querySelector('.tabbar').addEventListener('click',e=>{const b=e.target.closest('button[data-v]');if(!b)return;if(b.dataset.v==='list'&&$('app').dataset.view!=='list'){S.listAll=true;S.sel=null;renderList()}setView(b.dataset.v)});")
rep("  if(v==='review')requestAnimationFrame(fit);", "  if(v==='review'){renderList();requestAnimationFrame(fit)}")
rep("Vào tab Lỗi để kiểm tra và xác nhận.", "Vào Xác nhận lỗi để kiểm tra từng lỗi.", 2)
rep("MQ.addEventListener('change',()=>{if(UI!=='auto')return;", "MQ.addEventListener('change',()=>{if(UI!=='auto')return;renderList();")

open(dst, "w", encoding="utf-8").write(s)
print("ok", len(s))
