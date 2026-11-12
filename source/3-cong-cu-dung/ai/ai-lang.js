/* ---------- v1.6.3: Song ngữ thống nhất cho mọi file xuất, Findings bỏ thời hạn khắc phục ----------
   Mọi file xuất (Findings, ảnh báo cáo, ảnh ghép nhóm lỗi, PDF, file đối chiếu Guider) dùng chung
   cặp ngôn ngữ chọn trong Cài đặt (CFG.cap): Việt – Hàn, Việt – Trung, Việt – Anh hoặc chỉ tiếng Việt. */
const LX_SITE={ko:'현장',zh:'现场',en:'Site'};
function lxL(){const L=capLang();return L&&L!=='vi'&&TRX[L]?L:''}
function lxT(L,vi){vi=String(vi||'').trim();return L&&vi?capOf(L,vi):''}
/* Dịch các câu chưa có bản dịch sang ngôn ngữ L; trả về số câu còn thiếu */
async function lxEnsure(L,texts,say,quiet){
  if(!L)return 0;
  const need=[...new Set(texts.map(t=>String(t||'').trim()).filter(t=>t&&!TRX[L].has(t)))];
  return trBatch(L,need,say,quiet);
}
/* Tên khu vực cho ảnh ghép nhóm lỗi: dịch trước khi vẽ */
{const _q=qxPrep;qxPrep=async function(...a){
  const L=lxL();if(L&&QX.cfg.group&&QX.cfg.groupExport){try{await lxEnsure(L,S.photos.filter(p=>p.findings.some(done)).map(p=>p.area),null,true)}catch(e){console.warn(e)}}
  return _q.apply(this,a);
}}
/* Findings: dịch sang ngôn ngữ đã chọn thay vì luôn tiếng Anh */
ensureEnglish=async function(groups){
  const L=lxL();if(!L)return 0;
  const texts=groups.flatMap(g=>[g.p.area,...g.items.flatMap(({f})=>[f.title,CFG.fixes?planVi(f):''])]);
  busy(cur(),`Đang dịch nội dung sang ${CAPN[L]}…`);
  try{return await lxEnsure(L,texts,t=>busy(cur(),t))}catch(e){console.warn(e);return 0}finally{busy(null)}
};
/* Findings: một ảnh một dòng, nội dung song ngữ (ngôn ngữ chọn ở trên, tiếng Việt ở dưới), cột thời hạn để trống */
photoRow=function(r,no,g){
  const L=lxL(),tr=t=>L?lxT(L,t):'';
  const fs=g.items.map(x=>x.f),rank=f=>{const k=SEV.indexOf(f.sev);return k<0?9:k};
  const main=(fs.filter(f=>f.code).sort((x,y)=>rank(x)-rank(y))[0]||{}).code||'',multi=fs.some(f=>f.code&&f.code!==main);
  const[B,C,E]=RBA.tpl.map[main]||['','',''],D=main;
  const list=get=>g.items.map(({f,n})=>{const t=(get(f)||'').trim();return t?`${n}. ${multi&&f.code?`(${f.code}) `:''}${t}`:''}).filter(Boolean).join('\n');
  const pair=(x,vi)=>x?`${x}\n\n${vi}`:vi;
  const a=String(g.p.area||'').trim(),aX=tr(a),area=a?(aX?`${aX}\n${a}`:a):(L?`${LX_SITE[L]}\nHiện trường`:'Hiện trường');
  const G=pair(L?list(f=>tr(f.title)):'',list(f=>f.title)),M=CFG.fixes?pair(L?list(f=>tr(planVi(f))):'',list(planVi)):'';
  const cause=fs.some(f=>(f.cause||'Administrative')==='Facility')?'Facility':'Administrative',mand=fs.some(f=>f.mand);
  const cs=C.includes('\n')?31:C==='Environment'?4:9;
  const pt=Math.min(409,Math.max(CELL_HPT,6+16*Math.max(lineCount(G,70),lineCount(M,35),lineCount(area,15),lineCount(E,32),lineCount(B,35),lineCount(D,8))));
  const xml=`<row r="${r}" spans="1:19" ht="${pt.toFixed(1)}" customHeight="1"><c r="A${r}" s="4"><v>${no}</v></c>${xText('B'+r,31,B)}${xText('C'+r,cs,C)}${xText('D'+r,31,D)}${xText('E'+r,7,E)}${xText('F'+r,31,area)}${xText('G'+r,32,G)}${xText('H'+r,78,cause)}${xText('I'+r,48,mand?'mandatory':'')}<c r="J${r}" s="4"/><c r="K${r}" s="4"/><c r="L${r}" s="1"/>${xText('M'+r,2,M)}<c r="N${r}" s="4"/><c r="O${r}" s="1"/><c r="P${r}" s="1"/><c r="Q${r}" s="1"/><c r="R${r}" s="1"/><c r="S${r}" s="1"/></row>`;
  return{pt,xml};
};
/* File đối chiếu Guider: phát hiện và hành động khắc phục ghi song ngữ "tiếng Việt / bản dịch" */
{const _r=exportReview;exportReview=async function(...a){
  const L=lxL();if(!L||!exportReady().ready)return _r.apply(this,a);
  try{await qxPrep()}catch(e){console.warn(e)}
  const gs=gather();
  if(gs.length){busy(cur(),`Đang dịch nội dung sang ${CAPN[L]}…`);
    try{const miss=await lxEnsure(L,gs.flatMap(g=>g.items.flatMap(({f})=>[f.title,planVi(f)])),t=>busy(cur(),t));if(miss>0)toast(`${miss} câu chưa dịch được, tạm ghi tiếng Việt.`)}catch(e){console.warn(e)}finally{busy(null)}}
  const bi=t=>{const v=String(t||'').trim(),x=lxT(L,v);return x?`${v.replace(/[.。]$/,'')} / ${x}`:v};
  const _g=gather;
  gather=function(){return _g().map(G=>({p:G.p,items:G.items.map(x=>({...x,f:{...x.f,title:bi(x.f.title),fixRoot:bi(planVi(x.f)),fixNow:''}}))}))};
  try{return await _r.apply(this,a)}finally{gather=_g}
}}
window.__LX={lang:lxL};
