"""v16: Audit mới, chọn nhiều ảnh, chọn nhiều lỗi.

- Nút "Audit mới" (tab Ảnh và màn Báo cáo): xóa ảnh và lỗi của lần audit đang làm, đặt lại tên đối tác và ngày;
  giữ thư viện lỗi, sổ kinh nghiệm, key AI, cài đặt, tên Auditor. Hỏi trước, có nút xuất gói lưu lại.
- Tab Ảnh: "Chọn nhiều ảnh" → chọn / bỏ chọn tất cả → AI soát lại hoặc Xóa các ảnh đã chọn.
- Tab Lỗi (Tất cả ảnh): "Chọn nhiều lỗi" → chọn / bỏ chọn tất cả → Xác nhận, Bỏ xác nhận hoặc Xóa các lỗi đã chọn.

Chạy: python3 patch_v16.py app/v15.html app/soat-anh-ehs-rba.html
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
rep('      <div class="thumbs" id="thumbs"></div>', '      <div class="ptool" id="ptool"></div>\n      <div class="thumbs" id="thumbs"></div>')
rep('          <label>Auditor<input id="mWho" placeholder="Họ tên, cách nhau bởi dấu phẩy"></label>\n        </details>',
    '          <label>Auditor<input id="mWho" placeholder="Họ tên, cách nhau bởi dấu phẩy"></label>\n'
    '          <button class="btn wide" id="btnNewAudit">Bắt đầu audit mới</button>\n        </details>')
rep('<dialog id="dlgExp">', '''<dialog id="dlgAsk">
  <div class="dh"><h2 id="askH"></h2></div>
  <div class="db stack"><p class="stat" id="askT"></p><div class="askb" id="askB"></div></div>
</dialog>
<dialog id="dlgExp">''')
rep("#dlgDel,#dlgExp{width:min(440px,calc(100vw - 32px))}",
    "#dlgDel,#dlgExp,#dlgAsk{width:min(440px,calc(100vw - 32px))}\n"
    ".askb{display:grid;gap:8px}\n"
    ".ptool,.fselbar{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:8px 0}\n"
    ".ptool .sp,.fselbar .sp{flex:1}\n"
    ".ptool b,.fselbar b{font-size:13px}\n"
    ".fselbar{position:sticky;top:0;z-index:3;background:var(--paper);padding:8px;margin:0 0 4px;border:1px solid var(--accent);border-radius:10px}\n"
    ".thumb .pchk{position:absolute;left:6px;top:6px;width:28px;height:28px;border-radius:6px;border:2px solid #fff;background:rgba(20,25,28,.55);color:#fff;display:grid;place-items:center;font-weight:700;pointer-events:none}\n"
    ".thumb.ps{outline:3px solid var(--accent);outline-offset:-3px}\n"
    ".thumb.ps .pchk{background:var(--accent);border-color:var(--accent)}\n"
    ".arow.sel3{grid-template-columns:28px 28px 1fr}\n"
    ".fchk{width:26px;height:26px;border-radius:6px;border:2px solid var(--muted);background:var(--panel);color:#fff;display:grid;place-items:center;font-weight:700;padding:0;margin-top:1px}\n"
    ".fchk[aria-pressed=\"true\"]{background:var(--accent);border-color:var(--accent)}\n"
    ".arow.picked{background:var(--accent-soft)}")

# 2. Hộp hỏi dùng chung, Audit mới, xóa nhiều ảnh
HELP = r"""/* ---------- Hộp hỏi, audit mới, chọn nhiều ---------- */
function ask(title,text,btns){return new Promise(res=>{const d=$('dlgAsk');let done1=false;const fin1=v=>{if(done1)return;done1=true;res(v)};
  $('askH').textContent=title;$('askT').textContent=text;
  $('askB').replaceChildren(...btns.map(b=>h('button',{class:'btn '+(b.cls||''),onclick:()=>{fin1(b.v);d.close()}},b.label)));
  d.onclose=()=>fin1(null);d.showModal()})}
async function newAudit(){
  const real=S.photos.filter(p=>!p.sample),n=real.length,nf=real.reduce((a,p)=>a+p.findings.length,0);
  const v=await ask('Bắt đầu audit mới?',n?`Sẽ xóa ${n} ảnh và ${nf} lỗi đang có trên máy này, đặt lại tên đối tác và ngày audit. Thư viện lỗi, sổ kinh nghiệm, key AI, cài đặt và tên Auditor được giữ nguyên. Muốn giữ lại dữ liệu, hãy xuất file Findings hoặc xuất gói trước.`:'Đặt lại tên đối tác và ngày audit để bắt đầu lần audit mới.',
    [...(n?[{label:'Xuất gói để lưu lại trước',v:'pack'}]:[]),{label:n?`Xóa ${n} ảnh và bắt đầu audit mới`:'Bắt đầu audit mới',cls:'danger',v:'go'},{label:'Hủy',v:null}]);
  if(v==='pack'){try{await exportPack()}catch{toast('Không tạo được gói. Hãy thử lại.')}return}
  if(v!=='go')return;
  bgStop();for(const p of S.photos)Store.del(p.id);S.photos=[];S.sel=null;S.cur=null;S.psel=null;S.fsel=null;S.listAll=true;S.lf='all';
  $('mUnit').value='';$('mDate').value=today();metaSave();addSample();closeHub();
  renderAll();fit();hubRefresh();if(isMobile())setView('photos');toast('Đã bắt đầu audit mới. Thêm ảnh để AI soát.');
}
function removePhotos(ids){
  const set=new Set(ids);for(const id of set)Store.del(id);S.photos=S.photos.filter(p=>!set.has(p.id));
  if(!S.photos.length)addSample();else if(set.has(S.cur))S.cur=S.photos[0].id;S.sel=null;renderAll();fit();
}
function renderPtool(){
  const T=$('ptool'),real=S.photos.filter(p=>!p.sample);T.replaceChildren();
  if(S.psel)for(const id of[...S.psel])if(!real.some(p=>p.id===id))S.psel.delete(id);
  if(!S.psel){T.append(real.length?h('button',{class:'btn sm',onclick:()=>{S.psel=new Set();renderThumbs()}},'Chọn nhiều ảnh'):null,h('span',{class:'sp'}),h('button',{class:'btn sm',onclick:newAudit},'Audit mới'));return}
  const n=S.psel.size,all=n===real.length&&n>0;
  T.append(h('b',null,`Đã chọn ${n}/${real.length} ảnh`),h('span',{class:'sp'}),
    h('button',{class:'btn sm',onclick:()=>{S.psel=all?new Set():new Set(real.map(p=>p.id));renderThumbs()}},all?'Bỏ chọn tất cả':'Chọn tất cả'),
    h('button',{class:'btn sm',disabled:!n||!AI.ok,onclick:()=>{const ps=real.filter(p=>S.psel.has(p.id));S.psel=null;renderThumbs();runAll(ps)}},'AI soát lại'),
    h('button',{class:'btn sm danger',disabled:!n,onclick:async()=>{const ids=[...S.psel],nf=real.filter(p=>S.psel.has(p.id)).reduce((a,p)=>a+p.findings.length,0);
      const v=await ask(`Xóa ${ids.length} ảnh?`,`Các ảnh đã chọn và ${nf} lỗi trên các ảnh đó sẽ bị xóa khỏi máy này, không hoàn tác được.`,[{label:`Xóa ${ids.length} ảnh`,cls:'danger',v:'go'},{label:'Hủy',v:null}]);
      if(v!=='go')return;S.psel=null;removePhotos(ids);toast(`Đã xóa ${ids.length} ảnh.`)}},'Xóa'),
    h('button',{class:'btn sm primary',onclick:()=>{S.psel=null;renderThumbs()}},'Xong'));
}
/* chọn nhiều lỗi trong danh sách Tất cả ảnh */
function fItems(){return S.photos.filter(p=>!p.sample).flatMap(p=>p.findings.map(f=>({p,f})))}
function fSelected(){return S.fsel?fItems().filter(x=>S.fsel.has(x.f.id)):[]}
async function fBulk(act){
  const its=fSelected();if(!its.length)return;
  if(act==='ok'){let n=0,skip=0;for(const{p,f}of its){if(!done(f)){skip++;continue}if(!f.ok){f.ok=true;learn(f,p);n++}Store.touch(p)}S.fsel=null;renderAll();toast(`Đã xác nhận ${n} lỗi.${skip?` ${skip} lỗi chưa có nội dung nên chưa xác nhận.`:''}`);return}
  if(act==='unok'){for(const{p,f}of its){f.ok=false;Store.touch(p)}S.fsel=null;renderAll();toast(`Đã bỏ xác nhận ${its.length} lỗi.`);return}
  if(act==='del'){
    const nAI=its.filter(({f})=>f.src==='ai'&&!f.ok).length;
    const v=await ask(`Xóa ${its.length} lỗi?`,nAI?`Trong đó có ${nAI} đề xuất của AI. Chọn "Không phải lỗi" để AI rút kinh nghiệm cho lần sau.`:'Các lỗi đã chọn sẽ bị xóa. Có thể bấm Hoàn tác trên từng ảnh nếu xóa nhầm.',
      [...(nAI?[{label:'Xóa, đây không phải lỗi (AI học)',cls:'danger',v:'reject'}]:[]),{label:`Xóa ${its.length} lỗi`,cls:nAI?'':'danger',v:'del'},{label:'Hủy',v:null}]);
    if(!v)return;
    const byP=new Map();for(const x of its){if(!byP.has(x.p))byP.set(x.p,[]);byP.get(x.p).push(x.f)}
    for(const[p,fs]of byP){hist(p);
      if(v==='reject')for(const f of fs)if(f.src==='ai'&&!f.ok&&f.title.trim())Learn.add({t:'reject',title:f.title.trim(),area:(p.area||'').trim(),to:{rule:f.rule,code:f.code,req:f.req,sev:f.sev,kind:kindOf(f)}});
      const ids=new Set(fs.map(f=>f.id));p.findings=p.findings.filter(f=>!ids.has(f.id));Store.touch(p)}
    S.fsel=null;S.sel=null;renderAll();toast(`Đã xóa ${its.length} lỗi.`);
  }
}
"""
rep("function removePhoto(id){", HELP + "function removePhoto(id){")

# 3. Ảnh thu nhỏ trong chế độ chọn nhiều
rep("    T.append(h('div',{class:'thumb'+(p.id===S.cur?' on':'')},\n      h('button',{style:'all:unset;display:block;width:100%;cursor:pointer','aria-label':'Mở ảnh '+p.name,onclick:()=>{open(p.id);if(isMobile())setView('review')}},",
    "    const ps=!!S.psel&&!p.sample,on2=ps&&S.psel.has(p.id);\n"
    "    T.append(h('div',{class:'thumb'+(p.id===S.cur&&!S.psel?' on':'')+(on2?' ps':'')},\n"
    "      h('button',{style:'all:unset;display:block;width:100%;cursor:pointer','aria-label':(ps?(on2?'Bỏ chọn ảnh ':'Chọn ảnh '):'Mở ảnh ')+p.name,'aria-pressed':ps?String(on2):null,onclick:()=>{if(S.psel){if(p.sample)return;on2?S.psel.delete(p.id):S.psel.add(p.id);renderThumbs();return}open(p.id);if(isMobile())setView('review')}},")
rep("      p.sample?null:h('button',{class:'x','aria-label':'Xóa ảnh '+p.name,title:'Xóa ảnh',onclick:()=>removePhoto(p.id),text:'×'})))});\n}",
    "      ps?h('span',{class:'pchk','aria-hidden':'true',text:on2?'✓':''}):null,\n"
    "      p.sample||S.psel?null:h('button',{class:'x','aria-label':'Xóa ảnh '+p.name,title:'Xóa ảnh',onclick:()=>removePhoto(p.id),text:'×'})))});\n"
    "  renderPtool();\n}")

# 4. Danh sách lỗi: chọn nhiều
rep("    pend?h('button',{class:'btn sm good',onclick:e=>{",
    "    all.length?h('button',{class:'btn sm',onclick:()=>{S.fsel=S.fsel?null:new Set();renderList()}},S.fsel?'Thôi chọn':'Chọn nhiều lỗi'):null,\n"
    "    pend&&!S.fsel?h('button',{class:'btn sm good',onclick:e=>{")
rep("  src.forEach((p,pi)=>{\n    const its=p.findings.map((f,i)=>({f,n:i+1})).filter(x=>S.lf!=='pend'||(done(x.f)&&!x.f.ok));",
    "  if(S.fsel){const vis=src.flatMap(p=>p.findings.filter(f=>S.lf!=='pend'||(done(f)&&!f.ok))),n=S.fsel.size,allSel=vis.length>0&&vis.every(f=>S.fsel.has(f.id));\n"
    "    L.append(h('div',{class:'fselbar'},h('b',null,`Đã chọn ${n} lỗi`),h('span',{class:'sp'}),\n"
    "      h('button',{class:'btn sm',onclick:()=>{if(allSel)for(const f of vis)S.fsel.delete(f.id);else for(const f of vis)S.fsel.add(f.id);renderList()}},allSel?'Bỏ chọn tất cả':'Chọn tất cả'),\n"
    "      h('button',{class:'btn sm good',disabled:!n,onclick:()=>fBulk('ok')},'Xác nhận'),\n"
    "      h('button',{class:'btn sm',disabled:!n,onclick:()=>fBulk('unok')},'Bỏ xác nhận'),\n"
    "      h('button',{class:'btn sm danger',disabled:!n,onclick:()=>fBulk('del')},'Xóa'),\n"
    "      h('button',{class:'btn sm primary',onclick:()=>{S.fsel=null;renderList()}},'Xong')))}\n"
    "  src.forEach((p,pi)=>{\n    const its=p.findings.map((f,i)=>({f,n:i+1})).filter(x=>S.lf!=='pend'||(done(x.f)&&!x.f.ok));")
rep("      its.length?its.map(({f,n})=>h('div',{class:'arow'+(f.ok?' ok':'')},",
    "      its.length?its.map(({f,n})=>S.fsel?h('div',{class:'arow sel3'+(S.fsel.has(f.id)?' picked':''),onclick:()=>{S.fsel.has(f.id)?S.fsel.delete(f.id):S.fsel.add(f.id);renderList()}},\n"
    "        h('button',{class:'fchk','aria-pressed':String(S.fsel.has(f.id)),'aria-label':(S.fsel.has(f.id)?'Bỏ chọn lỗi ':'Chọn lỗi ')+n,text:S.fsel.has(f.id)?'✓':''}),\n"
    "        h('span',{class:'bdg '+(f.sev||'none'),style:`background:${cols[f.id][0]};color:${cols[f.id][1]}`,text:String(n)}),\n"
    "        h('div',{class:'at'},h('b',null,f.title||'Chưa có nội dung lỗi'),h('small',null,[f.req||f.code||'Chưa có mã',f.sev||'Chưa có mức độ',f.ok?'Đã xác nhận':'Chờ xác nhận'].join(' · ')))):\n"
    "      h('div',{class:'arow'+(f.ok?' ok':'')},")
rep("      p.sample||p.bgRun?null:h('div',{class:'agadd'},hintAdd(p))));",
    "      p.sample||p.bgRun||S.fsel?null:h('div',{class:'agadd'},hintAdd(p))));")
rep("$('lmAll').onclick=()=>{S.listAll=true;S.sel=null;renderAll()};",
    "$('lmAll').onclick=()=>{S.listAll=true;S.sel=null;renderAll()};$('btnNewAudit').onclick=newAudit;")
rep("const S={photos:[],cur:null,sel:null,", "const S={photos:[],cur:null,sel:null,psel:null,fsel:null,")

open(dst, "w", encoding="utf-8").write(s)
print("ok", len(s))
