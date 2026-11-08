"""v12: soát ngầm chắc chắn hơn.

- Bị giới hạn lượt (429): chờ đúng thời gian máy chủ báo rồi soát tiếp, không đánh dấu hỏng.
- Mỗi lượt soát có giới hạn thời gian; quay lại app sau khi chụp ảnh, lượt nào đứng yên thì tự soát lại.
- Mở lại app: ảnh chưa soát tự vào hàng soát ngầm.
- Thanh trạng thái phía trên: đang soát mấy ảnh, mấy ảnh chờ, nút Dừng; ảnh lỗi có nút Thử lại.
- Số ảnh soát cùng lúc lấy theo AI.par (bản cài Gemini đặt 2).

Chạy: python3 patch_v12.py app/v11.html app/soat-anh-ehs-rba.html
"""
import sys

src, dst = sys.argv[1], sys.argv[2]
s = open(src, encoding="utf-8").read()


def rep(a, b, n=1):
    global s
    c = s.count(a)
    assert c == n, (c, a[:90])
    s = s.replace(a, b)


# 1. Khối soát ngầm mới
a = s.index("/* Soát ngầm: ảnh vừa thêm được AI soát ngay")
b = s.index("const PAR=3,HARD=")
s = s[:a] + r"""/* Soát ngầm: ảnh vừa thêm được AI soát ngay, chạy song song có giới hạn, tự chờ khi bị giới hạn lượt,
   tự soát lại lượt bị treo khi app quay lại từ nền (chụp ảnh, chuyển app) */
const BG={q:[],jobs:new Set(),ctl:null,done:0,found:0,failed:[],why:'',hiddenAt:0,pauseUntil:0,pt:0};
function aiPar(){return AI.par||3}
function bgReady(){return $('optBg').checked&&AI.ok&&!NET.off}
function bgAdd(ps){
  if(!bgReady())return;ps=ps.filter(p=>!p.sample&&!p.bgRun&&!p.analysis&&S.photos.includes(p));if(!ps.length)return;
  BG.failed=BG.failed.filter(p=>!ps.includes(p));
  for(const p of ps){p.bgRun=true;p.bgTry=0;BG.q.push(p)}renderThumbs();uiState();bgPump();
}
function bgPump(){
  if(!BG.ctl||BG.ctl.signal.aborted)BG.ctl=new AbortController();
  clearTimeout(BG.pt);const wait=BG.pauseUntil-Date.now();
  if(wait>0&&BG.q.length){BG.pt=setTimeout(bgPump,Math.min(wait,5000)+50)}
  else while(BG.jobs.size<aiPar()&&BG.q.length&&!document.hidden)bgRunOne(BG.q.shift());
  bgBar();
}
function bgRunOne(p){
  const parent=BG.ctl,job={p,ctl:new AbortController(),stale:false,timeout:false,last:Date.now()};BG.jobs.add(job);
  parent.signal.addEventListener('abort',()=>job.ctl.abort(),{once:true});
  const tm=setTimeout(()=>{job.timeout=true;job.ctl.abort()},tier()==='complex'?420000:240000);
  bgOne(p,job,parent).then(r=>{
    clearTimeout(tm);BG.jobs.delete(job);
    if(r==='requeue'&&!parent.signal.aborted&&S.photos.includes(p)&&++p.bgTry<=6)BG.q.push(p);
    else{p.bgRun=false;if(r==='fail'||r==='requeue')BG.failed.push(p)}
    renderThumbs();uiState();
    if(!BG.jobs.size&&!BG.q.length)bgFinish();else bgPump();
  });
}
async function bgOne(p,job,parent){
  if(parent.signal.aborted||!S.photos.includes(p))return 'skip';
  try{
    const data=await AI.sample.json(promptWhole(p),{images:[await aiBlob(p)],modelTier:tier(),cache:false,signal:job.ctl.signal,onText:()=>{job.last=Date.now()}});
    if(!S.photos.includes(p)||p.analysis)return 'skip';
    const r=applyWhole(p,data,true);BG.found+=r.keep.length;BG.done++;return 'ok';
  }catch(e){
    const c=e&&e.code;
    if(parent.signal.aborted)return 'skip';
    if(job.stale||job.timeout)return 'requeue';
    if(NET.off)return 'skip';
    if(c==='rate_limited'||c==='overloaded'){BG.pauseUntil=Math.max(BG.pauseUntil,Date.now()+(e&&e.wait||(c==='rate_limited'?20000:5000)));return 'requeue'}
    if(HARD.includes(c)){BG.why=AIERR[c]||'';setTimeout(()=>{bgStop(true);aiFail(e)});return 'fail'}
    if(['upstream_error','invalid_json','empty_completion','cancelled'].includes(c)&&p.bgTry<1)return 'requeue';
    BG.why=AIERR[c]||AIERR.upstream_error;return 'fail';
  }
}
function bgFinish(){
  const f=BG.failed.filter(p=>S.photos.includes(p)&&!p.analysis);
  if(BG.done)toast(`AI đã soát xong ${BG.done} ảnh, đề xuất ${BG.found} lỗi.${f.length?` ${f.length} ảnh chưa soát được, xem thanh phía trên.`:' Mở từng ảnh để kiểm tra và xác nhận.'}`);
  else if(f.length)toast(`${f.length} ảnh chưa soát được, xem thanh phía trên.`);
  BG.done=BG.found=0;bgBar();
}
function bgStop(keepFailed){
  if(BG.ctl)BG.ctl.abort();BG.ctl=null;clearTimeout(BG.pt);
  if(keepFailed)BG.failed.push(...BG.q,...[...BG.jobs].map(j=>j.p));
  for(const p of BG.q)p.bgRun=false;BG.q=[];BG.done=BG.found=0;if(!keepFailed)BG.failed=[];
  renderThumbs();uiState();bgBar();
}
function bgBar(){
  const b=$('queueBar'),g=$('queueGo'),run=BG.jobs.size,wait=BG.q.length,f=BG.failed.filter(p=>S.photos.includes(p)&&!p.analysis&&!p.bgRun);
  if(run||wait){b.hidden=false;b.dataset.bg='1';
    $('queueMsg').textContent=`AI đang soát ngầm ${run} ảnh${wait?`, ${wait} ảnh đang chờ`:''}${BG.pauseUntil>Date.now()?'. Đang chờ hết giới hạn lượt của AI rồi soát tiếp':''}.`;
    g.hidden=false;g.textContent='Dừng';g.dataset.act='stop';return}
  if(f.length){b.hidden=false;b.dataset.bg='1';$('queueMsg').textContent=`${f.length} ảnh chưa soát được.${BG.why?' '+BG.why:''}`;g.hidden=false;g.textContent='Thử lại';g.dataset.act='retry';return}
  if(b.dataset.bg){b.hidden=true;delete b.dataset.bg}
}
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){BG.hiddenAt=Date.now();return}
  const h=BG.hiddenAt;BG.hiddenAt=0;
  if(h&&Date.now()-h>15000)setTimeout(()=>{for(const j of BG.jobs)if(j.last<h+1000){j.stale=true;j.ctl.abort()}},8000);
  bgPump();
});
""" + s[b:]

# 2. Số ảnh cùng lúc và thử lại khi bị giới hạn lượt trong Soát tất cả
rep("const PAR=3,HARD=['bad_key','no_key','no_credit','no_access',...AIOFF];",
    "const HARD=['bad_key','no_key','no_credit','no_access','quota_day',...AIOFF];")
rep("Math.min(PAR,n)", "Math.min(aiPar(),n)", 2)
rep("      for(let t=0;t<2;t++){", "      for(let t=0;t<6;t++){")
rep("          if(t===0&&!NET.off&&['rate_limited','overloaded','upstream_error','invalid_json','empty_completion'].includes(c)){await new Promise(r=>setTimeout(r,c==='rate_limited'?20000:3000));continue}",
    "          if(!NET.off&&(c==='rate_limited'||c==='overloaded'?t<5:t===0&&['upstream_error','invalid_json','empty_completion'].includes(c))){if(S.busy&&c==='rate_limited')$('ovMsg').textContent='Đang chờ hết giới hạn lượt của AI rồi soát tiếp…';await new Promise(r=>setTimeout(r,e&&e.wait?Math.min(e.wait,65000):c==='rate_limited'?20000:3000));continue}")
rep("  if(!ps.length)return toast('Mọi ảnh đều đã được soát.');\n  if(!AI.ok)return toast(AI.why);",
    "  ps=ps.filter(p=>!p.bgRun);if(!ps.length)return toast(BG.jobs.size||BG.q.length?'Các ảnh còn lại đang được AI soát ngầm.':'Mọi ảnh đều đã được soát.');\n  if(!AI.ok)return toast(AI.why);")

# 3. Thanh trạng thái: nút Dừng / Thử lại / Soát ngay
rep("  const n=pendingPhotos().length,b=$('queueBar');",
    "  const n=pendingPhotos().length,b=$('queueBar');$('queueGo').textContent='Soát ngay';delete $('queueGo').dataset.act;delete b.dataset.bg;")
rep("$('queueGo').onclick=()=>{$('queueBar').hidden=true;runAll(pendingPhotos())};",
    "$('queueGo').onclick=()=>{const g=$('queueGo'),a=g.dataset.act;delete g.dataset.act;$('queueBar').hidden=true;delete $('queueBar').dataset.bg;"
    "if(a==='stop'){bgStop();toast('Đã dừng soát ngầm. Bấm Soát tất cả khi cần.');return}"
    "if(a==='retry'){BG.failed=[];BG.why='';if($('optBg').checked)return bgAdd(pendingPhotos())}runAll(pendingPhotos())};")

# 4. Mở lại app: ảnh chưa soát tự vào hàng soát ngầm
rep("  if(isMobile())setView(S.photos.some(p=>!p.sample)?'review':'photos');fit();",
    "  if(isMobile())setView(S.photos.some(p=>!p.sample)?'review':'photos');fit();\n  ready.then(()=>setTimeout(()=>{if(bgReady())bgAdd(pendingPhotos())},1200));")

open(dst, "w", encoding="utf-8").write(s)
print("ok", len(s))
