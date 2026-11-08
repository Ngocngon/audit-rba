"""v11: tên app Audit RBA, tự soát ngầm khi thêm ảnh, chế độ soát Nhanh / Chuẩn / Kỹ (mặc định Nhanh).

Chạy: python3 patch_v11.py app/v10.html app/soat-anh-ehs-rba.html
"""
import sys

src, dst = sys.argv[1], sys.argv[2]
s = open(src, encoding="utf-8").read()


def rep(a, b, n=1):
    global s
    c = s.count(a)
    assert c == n, (c, a[:90])
    s = s.replace(a, b)


# 1. Tên app
rep("<title>Soát Ảnh EHS RBA</title>", "<title>Audit RBA</title>")
rep('<div class="brand"><b>Soát Ảnh EHS</b>', '<div class="brand"><b>Audit RBA</b>')

# 2. Tùy chọn: chế độ soát và tự soát khi thêm ảnh
rep('<label><input type="checkbox" id="optDeep"> Soát kỹ hơn (chậm, tốn lượt hơn)</label>',
    '<label style="white-space:nowrap">Chế độ soát <select id="optMode" aria-label="Chế độ soát"><option value="quick">Nhanh</option><option value="default">Chuẩn</option><option value="complex">Kỹ (chậm, tốn hơn)</option></select></label>\n'
    '          <label><input type="checkbox" id="optBg" checked> Tự soát ngay khi thêm ảnh</label>')
rep(".opt label{display:inline-flex;gap:6px;align-items:center;font-size:12px}",
    ".opt label{display:inline-flex;gap:6px;align-items:center;font-size:12px}\n"
    ".opt select{font-size:13px;padding:4px 6px;border:1px solid var(--line);border-radius:6px;background:var(--panel)}\n"
    ".tick.run{animation:tickp 1.2s ease-in-out infinite}\n"
    "@keyframes tickp{50%{opacity:.45}}\n"
    "@media (prefers-reduced-motion:reduce){.tick.run{animation:none}}")
rep("const tier=()=>$('optDeep').checked?'complex':'default';",
    "const tier=()=>$('optMode').value||'quick';\n"
    "try{$('optMode').value=localStorage.getItem('soat-ehs-mode')||'quick';$('optBg').checked=localStorage.getItem('soat-ehs-bg')!=='0'}catch{}\n"
    "$('optMode').addEventListener('change',e=>{try{localStorage.setItem('soat-ehs-mode',e.target.value)}catch{}toast(`Chế độ soát: ${e.target.selectedOptions[0].textContent}.`)});\n"
    "$('optBg').addEventListener('change',e=>{try{localStorage.setItem('soat-ehs-bg',e.target.checked?'1':'0')}catch{}if(!e.target.checked)bgStop();else bgAdd(pendingPhotos())});")

# 3. Kết quả AI ghi vào ảnh không phải ảnh đang mở thì không vẽ lại danh sách (không làm mất chữ đang gõ)
rep("function applyWhole(p,data){", "function applyWhole(p,data,quiet){")
rep("    Store.touch(p);if(cur()===p)S.sel=null;renderAll();\n  return{keep,drop,lost}",
    "    Store.touch(p);if(cur()===p)S.sel=null;if(quiet&&cur()!==p){renderThumbs();uiState()}else renderAll();\n  return{keep,drop,lost}")
# vùng người đánh giá tự khoanh luôn được giữ khi AI soát lại cả ảnh
rep("p.findings=p.findings.filter(f=>f.src==='manual'||f.ok);", "p.findings=p.findings.filter(f=>f.src==='manual'||f.ok||f.user);")
rep("  hist(p);const f=newFinding(s);p.findings.push(f);", "  hist(p);const f=newFinding(s);f.user=true;p.findings.push(f);")

# 4. Soát ngầm
rep("async function analyzePhoto(p,label){\n  if(!AI.ok){toast(AI.why);return false}\n",
    "async function analyzePhoto(p,label){\n  if(!AI.ok){toast(AI.why);return false}\n"
    "  if(p.bgRun){toast('Ảnh này đang được AI soát ngầm. Chờ vài giây là có kết quả.');return false}\n")
rep("$('btnAll').onclick=()=>runAll(S.photos.filter(p=>!p.sample&&!p.analysis));",
    "$('btnAll').onclick=()=>runAll(S.photos.filter(p=>!p.sample&&!p.analysis&&!p.bgRun));")
rep("const pendingPhotos=()=>S.photos.filter(p=>!p.sample&&!p.analysis&&!p.findings.length);",
    "const pendingPhotos=()=>S.photos.filter(p=>!p.sample&&!p.analysis&&!p.findings.length&&!p.bgRun);")
rep("  if(mode==='back'&&n&&AI.ok){",
    "  if(mode==='back'&&n&&AI.ok&&$('optBg').checked){b.hidden=true;bgAdd(pendingPhotos());return}\n  if(mode==='back'&&n&&AI.ok){")
rep("const PAR=3,HARD=", r"""/* Soát ngầm: ảnh vừa thêm được AI soát ngay, tối đa 3 ảnh cùng lúc, không khóa màn hình */
const BG={q:[],run:0,ctl:null,done:0,found:0,fail:0};
function bgReady(){return $('optBg').checked&&AI.ok&&!NET.off}
function bgAdd(ps){
  if(!bgReady())return;ps=ps.filter(p=>!p.sample&&!p.bgRun&&!p.analysis&&S.photos.includes(p));if(!ps.length)return;
  for(const p of ps){p.bgRun=true;BG.q.push(p)}renderThumbs();uiState();bgPump();
}
function bgPump(){
  if(!BG.ctl||BG.ctl.signal.aborted)BG.ctl=new AbortController();
  while(BG.run<PAR&&BG.q.length){const p=BG.q.shift();BG.run++;
    bgOne(p,BG.ctl).finally(()=>{BG.run--;p.bgRun=false;renderThumbs();uiState();
      if(!BG.run&&!BG.q.length&&(BG.done||BG.fail)){toast(`AI đã soát xong ${BG.done} ảnh, đề xuất ${BG.found} lỗi.${BG.fail?` ${BG.fail} ảnh chưa soát được, bấm Soát tất cả để thử lại.`:''} Mở từng ảnh để kiểm tra và xác nhận.`);BG.done=BG.found=BG.fail=0}
      else bgPump()})}
}
async function bgOne(p,ctl){
  for(let t=0;t<2;t++){
    if(ctl.signal.aborted||!S.photos.includes(p))return;
    try{const data=await AI.sample.json(promptWhole(p),{images:[await aiBlob(p)],modelTier:tier(),cache:false,signal:ctl.signal});
      if(!S.photos.includes(p)||p.analysis)return;const r=applyWhole(p,data,true);BG.found+=r.keep.length;BG.done++;return}
    catch(e){const c=e&&e.code;if(c==='cancelled'||ctl.signal.aborted)return;
      if(t===0&&navigator.onLine&&['rate_limited','overloaded','upstream_error','invalid_json','empty_completion'].includes(c)){await new Promise(r=>setTimeout(r,c==='rate_limited'?20000:3000));continue}
      if(HARD.includes(c)){bgStop();aiFail(e);return}
      BG.fail++;return}
  }
}
function bgStop(){if(BG.ctl)BG.ctl.abort();BG.ctl=null;for(const p of BG.q)p.bgRun=false;BG.q=[];BG.done=BG.found=BG.fail=0;renderThumbs();uiState()}
const PAR=3,HARD=""")

# thêm ảnh xong thì đưa vào hàng soát ngầm
rep("  let added=null,bad=0;\n", "  let added=null,bad=0;const news=[];\n")
rep("S.photos.push(p);Store.touch(p);added=added||p}", "S.photos.push(p);Store.touch(p);news.push(p);added=added||p}")
rep("  if(added){S.photos=S.photos.filter(p=>!p.sample);open(added.id);if(isMobile())setView('review');if(NET.off)queueBar('off')}",
    "  if(added){S.photos=S.photos.filter(p=>!p.sample);open(added.id);if(isMobile())setView('review');if(NET.off)queueBar('off');else if(bgReady()){bgAdd(news);toast(`Đã thêm ${news.length} ảnh. AI đang soát ngầm, anh có thể chụp tiếp.`)}}")

# 5. Hiển thị trạng thái soát ngầm
rep("!p.sample&&!p.analysis&&!p.findings.length?h('i',{class:'tick q',style:'font-style:normal',text:'Chưa soát'}):null",
    "p.bgRun?h('i',{class:'tick q run',style:'font-style:normal',text:'AI đang soát…'}):!p.sample&&!p.analysis&&!p.findings.length?h('i',{class:'tick q',style:'font-style:normal',text:'Chưa soát'}):null")
rep("  const m=$('aiMsg');m.hidden=AI.state!=='off';",
    "  if(p&&p.bgRun){$('btnAI').disabled=true;$('btnAI').querySelector('span').textContent='AI đang soát ngầm ảnh này…'}\n  const m=$('aiMsg');m.hidden=AI.state!=='off';")

# không tin cờ navigator.onLine (có máy báo sai); dùng trạng thái mạng của app
rep("if(t===0&&navigator.onLine&&[", "if(t===0&&!NET.off&&[", 2)

open(dst, "w", encoding="utf-8").write(s)
print("ok", len(s))
