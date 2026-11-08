"""v14: Danh sách lỗi của tất cả ảnh để kiểm tra và xác nhận; báo cáo cuối chỉ gồm lỗi đã xác nhận.

- Tab Lỗi có hai chế độ: "Tất cả ảnh" (mặc định) và "Ảnh đang mở".
- Tất cả ảnh: lỗi nhóm theo ảnh, mỗi lỗi có nút Xác nhận và Sửa; lọc Chờ xác nhận; Xác nhận tất cả; nút Xuất file Findings.
- Xuất Findings, ảnh báo cáo, file nén, file đối chiếu: chỉ lấy lỗi đã xác nhận; còn lỗi chờ thì hỏi trước.

Chạy: python3 patch_v14.py app/v13.html app/soat-anh-ehs-rba.html
"""
import sys

src, dst = sys.argv[1], sys.argv[2]
s = open(src, encoding="utf-8").read()


def rep(a, b, n=1):
    global s
    c = s.count(a)
    assert c == n, (c, a[:90])
    s = s.replace(a, b)


# 1. Giao diện
rep('<div class="sum"><h2 id="sumT">Lỗi trên ảnh này</h2><div class="row" id="sumR"></div></div>',
    '<div class="sum"><div class="lmode" role="tablist" aria-label="Phạm vi danh sách lỗi"><button id="lmAll" role="tab">Tất cả ảnh</button><button id="lmOne" role="tab">Ảnh đang mở</button></div>'
    '<h2 id="sumT">Lỗi trên ảnh này</h2><div class="row" id="sumR"></div></div>')
rep('<dialog id="dlgDel">', '''<dialog id="dlgExp">
  <div class="dh"><h2>Còn lỗi chưa xác nhận</h2></div>
  <div class="db stack">
    <p class="stat" id="expT"></p>
    <button class="btn primary" data-x="review">Xem và xác nhận từng lỗi</button>
    <button class="btn" data-x="all">Xác nhận tất cả rồi xuất</button>
    <button class="btn" data-x="ok">Chỉ xuất lỗi đã xác nhận</button>
    <button class="btn" data-x="cancel">Hủy</button>
  </div>
</dialog>
<dialog id="dlgDel">''')
rep("#dlgDel{width:min(440px,calc(100vw - 32px))}",
    "#dlgDel,#dlgExp{width:min(440px,calc(100vw - 32px))}\n"
    ".lmode{display:grid;grid-template-columns:1fr 1fr;gap:4px;padding:3px;border:1px solid var(--line);border-radius:9px;background:var(--soft);margin-bottom:8px}\n"
    ".lmode button{border:0;background:none;border-radius:6px;padding:7px 6px;font-weight:600;font-size:13px;color:var(--muted);min-height:36px}\n"
    ".lmode button[aria-selected=\"true\"]{background:var(--panel);color:var(--ink);box-shadow:var(--sh)}\n"
    ".pill.okc{background:var(--ok-soft);color:var(--ok)}\n"
    ".atool{display:flex;gap:6px;flex-wrap:wrap;align-items:center}\n"
    ".atool .chip2{border:1px solid var(--line);background:var(--panel);border-radius:999px;padding:6px 12px;font-size:13px;font-weight:600;min-height:34px}\n"
    ".atool .chip2[aria-pressed=\"true\"]{background:var(--accent-soft);border-color:var(--accent);color:var(--accent)}\n"
    ".atool .sp{flex:1}\n"
    ".agrp{border:1px solid var(--line);border-radius:10px;background:var(--panel);overflow:hidden}\n"
    ".agh{display:grid;grid-template-columns:52px 1fr auto;gap:10px;align-items:center;padding:8px 10px;background:var(--soft)}\n"
    ".agh img{width:52px;height:40px;object-fit:cover;border-radius:5px;display:block}\n"
    ".agh b{display:block;font-size:13.5px;line-height:1.3}.agh small{display:block;color:var(--muted);font-size:12px}\n"
    ".arow{display:grid;grid-template-columns:28px 1fr auto;gap:10px;align-items:start;padding:10px;border-top:1px solid var(--line)}\n"
    ".arow .at{cursor:pointer;min-width:0}.arow .at b{display:block;font-size:13.5px;line-height:1.35;font-weight:600}\n"
    ".arow .at small{display:block;color:var(--muted);font-size:12px;line-height:1.4}\n"
    ".arow .aa{display:flex;flex-direction:column;gap:6px}\n"
    ".arow .aa .btn{min-width:96px;justify-content:center}\n"
    ".arow.ok{background:color-mix(in srgb,var(--ok-soft) 45%,transparent)}\n"
    ".btn.good.on{background:var(--ok);color:#fff;border-color:var(--ok)}\n"
    ".anone{padding:10px;border-top:1px solid var(--line);font-size:13px;color:var(--muted)}\n"
    ".afoot{display:grid;gap:8px;padding-top:4px}")

# 2. Báo cáo cuối = lỗi đã xác nhận
rep("const done=f=>!!f.title.trim();",
    "const done=f=>!!f.title.trim(),fin=f=>done(f)&&!!f.ok;")
rep("function gather(){const out=[];for(const p of S.photos){const items=p.findings.map((f,i)=>({f,n:i+1})).filter(x=>done(x.f));",
    "function gather(){const out=[];for(const p of S.photos){const items=p.findings.map((f,i)=>({f,n:i+1})).filter(x=>fin(x.f));")
rep("async function exportFindings(){\n  if(exporting)return;",
    "async function exportFindings(skip){\n  if(exporting)return;\n  if(!skip&&pendingItems().length)return askExport(exportFindings);")
rep("const groups=gather();if(!groups.length)return toast('Chưa có lỗi nào để xuất.');",
    "const groups=gather();if(!groups.length)return toast('Chưa có lỗi nào được xác nhận. Vào tab Lỗi, chọn Tất cả ảnh để xác nhận.');")
rep("async function exportReview(){", "async function exportReview(skip){\n  if(!skip&&pendingItems().length)return askExport(exportReview);")
rep("async function exportZip(){", "async function exportZip(skip){\n  if(!skip&&pendingItems().length)return askExport(s=>exportZip(s).catch(()=>toast('Không tạo được file nén. Hãy thử lại.')));")
rep("async function previewImage(){\n  const p=cur();if(!p)return;",
    "async function previewImage(){\n  const p=cur();if(!p)return;if(!numbered(p).length)return toast('Ảnh này chưa có lỗi đã xác nhận. Xác nhận lỗi trước khi tạo ảnh báo cáo.');")
rep("$('btnFind').onclick=exportFindings;", "$('btnFind').onclick=()=>exportFindings();")
rep("$('btnFind2').onclick=exportFindings;", "$('btnFind2').onclick=()=>exportFindings();")

# 3. Danh sách tất cả ảnh
rep("function renderList(){\n  const p=cur(),L=$('list');L.replaceChildren();if(!p)return;",
    r"""S.listAll=true;S.lf='all';
function pendingItems(){return S.photos.filter(p=>!p.sample).flatMap(p=>p.findings.filter(f=>done(f)&&!f.ok).map(f=>({p,f})))}
function confirmPending(){let n=0;for(const{p,f}of pendingItems()){f.ok=true;learn(f,p);Store.touch(p);n++}renderAll();return n}
let EXP=null,cfmAt=0;
function askExport(run){
  const n=pendingItems().length,m=S.photos.reduce((a,p)=>a+p.findings.filter(fin).length,0);
  $('expT').textContent=`Còn ${n} lỗi chưa xác nhận. Báo cáo chỉ gồm lỗi đã xác nhận${m?` (hiện có ${m} lỗi)`:', hiện chưa có lỗi nào'}.`;
  $('dlgExp').querySelector('[data-x="ok"]').disabled=!m;EXP=run;$('dlgExp').showModal();
}
function showReview(filter){S.listAll=true;S.lf=filter||'all';closeHub();if(isMobile())setView('list');renderAll()}
function editFinding(p,f){S.listAll=false;S.cur=p.id;S.sel=f.id;renderAll();fit();if(isMobile())setView('list');const c=document.querySelector(`.card[data-id="${f.id}"]`);if(c)c.scrollIntoView({block:'start'})}
function toggleOk(p,f){if(!done(f)){toast('Lỗi chưa có nội dung. Bấm Sửa để nhập trước khi xác nhận.');return}f.ok=!f.ok;if(f.ok)learn(f,p);Store.touch(p);renderAll()}
function renderAllList(){
  const L=$('list'),R=$('sumR');L.replaceChildren();R.replaceChildren();$('side').hidden=true;
  const real=S.photos.filter(p=>!p.sample),src=real.length?real:S.photos,all=src.flatMap(p=>p.findings);
  const pend=all.filter(f=>done(f)&&!f.ok).length,okN=all.filter(f=>f.ok).length;
  $('sumT').textContent=`Tất cả lỗi: ${all.length} lỗi trên ${src.length} ảnh`;
  SEV.forEach(s=>R.append(h('span',{class:'pill '+s,text:`${s} ${all.filter(f=>f.sev===s).length}`})));
  R.append(h('span',{class:'pill okc',text:`Đã xác nhận ${okN}`}));if(pend)R.append(h('span',{class:'pill wait',text:`Chờ xác nhận ${pend}`}));
  if(S.lf==='pend'&&!pend)S.lf='all';
  L.append(h('div',{class:'atool'},
    h('button',{class:'chip2','aria-pressed':String(S.lf==='all'),onclick:()=>{S.lf='all';renderList()}},`Tất cả (${all.length})`),
    h('button',{class:'chip2','aria-pressed':String(S.lf==='pend'),disabled:!pend,onclick:()=>{S.lf='pend';renderList()}},`Chờ xác nhận (${pend})`),
    h('span',{class:'sp'}),
    pend?h('button',{class:'btn sm good',onclick:e=>{const b=e.currentTarget;if(Date.now()-cfmAt>4000){cfmAt=Date.now();b.textContent=`Bấm lần nữa để xác nhận ${pend} lỗi`;setTimeout(()=>{if(b.isConnected)b.textContent=`Xác nhận tất cả (${pend})`},4000);return}cfmAt=0;const n=confirmPending();toast(`Đã xác nhận ${n} lỗi.`)}},`Xác nhận tất cả (${pend})`):null));
  src.forEach((p,pi)=>{
    const its=p.findings.map((f,i)=>({f,n:i+1})).filter(x=>S.lf!=='pend'||(done(x.f)&&!x.f.ok));
    if(S.lf==='pend'&&!its.length)return;
    const cols=colorsOf(p.findings.map(f=>({f}))),okP=p.findings.filter(f=>f.ok).length;
    const st=p.bgRun?'AI đang soát…':!p.analysis&&!p.findings.length?'Chưa soát':`${p.findings.length} lỗi · ${okP} đã xác nhận`;
    L.append(h('section',{class:'agrp'},
      h('div',{class:'agh'},p.thumb?h('img',{src:p.thumb,alt:''}):h('span'),h('div',null,h('b',null,`Ảnh ${pi+1}: ${p.area||p.name}`),h('small',null,st)),
        h('button',{class:'btn sm',onclick:()=>{S.listAll=false;S.cur=p.id;S.sel=null;renderAll();fit();if(isMobile())setView('review')}},'Mở ảnh')),
      its.length?its.map(({f,n})=>h('div',{class:'arow'+(f.ok?' ok':'')},
        h('span',{class:'bdg '+(f.sev||'none'),style:`background:${cols[f.id][0]};color:${cols[f.id][1]}`,text:String(n)}),
        h('div',{class:'at',onclick:()=>editFinding(p,f)},h('b',null,f.pending?'AI đang xác định lỗi…':(f.title||'Chưa có nội dung lỗi')),
          h('small',null,[f.req||f.code||'Chưa có mã',f.sev||'Chưa có mức độ',KINDS[kindOf(f)],f.src==='ai'&&f.conf!=null&&!f.ok?`AI ${f.conf}%`:null].filter(Boolean).join(' · ')),
          f.fixNow||f.fixRoot?h('small',null,'Khắc phục: '+(f.fixNow||f.fixRoot)):null),
        h('div',{class:'aa'},h('button',{class:'btn sm good'+(f.ok?' on':''),'aria-pressed':String(!!f.ok),onclick:()=>toggleOk(p,f)},f.ok?'✓ Đã xác nhận':'Xác nhận'),
          h('button',{class:'btn sm',onclick:()=>editFinding(p,f)},'Sửa')))):
        h('p',{class:'anone'},p.bgRun?'AI đang soát ảnh này…':p.analysis?'AI không thấy lỗi trong ảnh này. Mở ảnh để khoanh vùng nếu cần.':'Ảnh chưa được soát.')));
  });
  if(all.length)L.append(h('div',{class:'afoot'},h('p',{class:'hint'},'File Findings, ảnh báo cáo và file đối chiếu chỉ gồm các lỗi đã xác nhận.'),
    h('button',{class:'btn primary wide',onclick:()=>exportFindings()},`Xuất file Findings (${okN} lỗi đã xác nhận)`)));
  else L.append(h('p',{class:'empty',text:'Chưa có lỗi nào. Thêm ảnh để AI soát hoặc khoanh vùng thủ công.'}));
}
function renderList(){
  $('lmAll').setAttribute('aria-selected',String(S.listAll));$('lmOne').setAttribute('aria-selected',String(!S.listAll));
  if(S.listAll){renderAllList();renderSel();return}
  const p=cur(),L=$('list');L.replaceChildren();if(!p)return;""")
rep("function select(id){S.sel=id;", "function select(id){S.sel=id;if(id)S.listAll=false;")
rep("$('btnFind').onclick=()=>exportFindings();",
    "$('btnFind').onclick=()=>exportFindings();\n"
    "$('lmAll').onclick=()=>{S.listAll=true;S.sel=null;renderAll()};$('lmOne').onclick=()=>{S.listAll=false;renderAll()};\n"
    "$('dlgExp').addEventListener('click',e=>{const b=e.target.closest('button[data-x]');if(!b)return;const x=b.dataset.x,run=EXP;EXP=null;$('dlgExp').close();\n"
    "  if(x==='review')return showReview('pend');if(x==='all'){const n=confirmPending();toast(`Đã xác nhận ${n} lỗi.`);if(run)run(true);return}if(x==='ok'&&run)run(true)});")
# số trên tab Lỗi: tổng số lỗi của mọi ảnh
rep("$('tcList').textContent=p&&p.findings.length?String(p.findings.length):'';",
    "{const t=S.photos.filter(x=>!x.sample).reduce((a,x)=>a+x.findings.length,0)||(p?p.findings.length:0);$('tcList').textContent=t?String(t):''}")
# kết quả soát ngầm cập nhật danh sách tất cả ảnh
rep("if(quiet&&cur()!==p){renderThumbs();uiState()}else renderAll();",
    "if(quiet&&cur()!==p){renderThumbs();uiState();if(S.listAll)renderList()}else renderAll();")
rep("    renderThumbs();uiState();\n    if(!BG.jobs.size&&!BG.q.length)bgFinish();else bgPump();",
    "    renderThumbs();uiState();if(S.listAll)renderList();\n    if(!BG.jobs.size&&!BG.q.length)bgFinish();else bgPump();")

rep("' Mở từng ảnh để kiểm tra và xác nhận.'", "' Vào tab Lỗi để kiểm tra và xác nhận.'")
rep("Hãy kiểm tra từng ảnh rồi xác nhận.`", "Vào tab Lỗi để kiểm tra và xác nhận.`")

open(dst, "w", encoding="utf-8").write(s)
print("ok", len(s))
