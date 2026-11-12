/* ======================================================================
   Audit RBA v1.6.2 — Nhóm lỗi, gợi ý vấn đề, kiến thức lưu trữ hóa chất
   1. Lỗi lặp lại ở nhiều ảnh = 1 lỗi duy nhất trong MỌI file xuất (Findings, PDF, ảnh báo cáo,
      file nén, đối chiếu Guider). Ảnh xuất: ghép ảnh các vị trí hoặc ảnh đại diện (theo nhóm, mặc định trong Cài đặt).
   2. Sửa nhóm: nội dung, mã, mức độ, khắc phục chung; thêm vấn đề AI chưa nhận ra
      (tích gợi ý, tự nhập, AI soát lại nhóm) thành lỗi riêng hoặc ghi gộp vào lỗi nhóm.
   3. Mở từng ảnh: danh sách "Vấn đề có thể có" dạng ô tích (AI nghi ngờ, AI đã loại, thường gặp theo loại ảnh).
   4. Hóa chất: loại cần khay chống tràn, không cần, cần thông gió hút mùi (lỗi mới H10).
   Chèn sau ai-data.js, trước "Khởi động".
   ====================================================================== */

/* ---------- 4. Kiến thức lưu trữ hóa chất ---------- */
const GX_CHEM=[
  ['Cần khay chống tràn (H1)','Vật chứa CHẤT LỎNG nguy hại (can, thùng phuy, IBC, chai lớn): axit (H₂SO₄, HCl, HNO₃), bazơ lỏng (NaOH, KOH), dung môi (IPA, cồn, acetone, thinner, toluene, xylene), sơn, keo lỏng, dầu nhớt, dầu thủy lực, nhiên liệu, chất tẩy rửa đậm đặc, chất thải lỏng nguy hại. Khay chứa được ít nhất 110% thể tích vật chứa lớn nhất (thực hành phổ biến), không thủng, không đọng đầy chất lỏng; nhóm kỵ nhau (axit với bazơ, chất oxy hóa với chất dễ cháy) dùng khay riêng.'],
  ['Không bắt buộc khay riêng','Hóa chất rắn, bột, hạt trong bao, túi kín (kê pallet, chống ẩm); bình khí nén, chai gas (cần xích cố định, nắp chụp van: H7); bình xịt (để tủ chống cháy); chai nhỏ đã đặt trong tủ hóa chất có khay đáy, hoặc kho có gờ, rãnh thu gom tràn đổ; vật chứa rỗng đã rửa sạch.'],
  ['Cần tủ, kho có thông gió, hút mùi (H10)','Chất dễ bay hơi, có mùi, hơi độc hoặc dễ cháy: dung môi (IPA, acetone, thinner, toluene, xylene, MEK, xăng), cồn (ethanol, methanol), axit bốc khói (HCl đặc, HNO₃, acid acetic đặc), amoniac, formaldehyde, formalin, sơn và keo gốc dung môi. Chất dễ cháy còn cần tủ chống cháy hoặc kho riêng có thiết bị điện phòng nổ (F15).'],
  ['Không cần hút mùi','Hóa chất rắn không bay hơi, dung dịch nước loãng (muối, chất tẩy đã pha loãng), dầu nhớt đóng kín nắp.'],
  ['Phân biệt mã','Lưu trữ trong tủ, phòng kín không có quạt hút, ống hút, cửa gió: H10. Thao tác pha chế, chiết rót phát sinh hơi mà không có chụp hút: H5. Quạt, cửa gió có nhưng hỏng, bị che: V5. Để lẫn nhóm kỵ nhau: H3. Để ngoài khu vực lưu trữ: H8.']
];
const DX_CHEM=`HÓA CHẤT: KHAY CHỐNG TRÀN, THÔNG GIÓ, HÚT MÙI (chỉ áp dụng khi ảnh có hóa chất; đọc tên hóa chất trên nhãn rồi xác định yêu cầu)
${GX_CHEM.map(([a,b])=>`- ${a}: ${b}`).join('\n')}
- Không báo H1 cho hóa chất rắn đóng bao kín, bình khí, chai nhỏ trong tủ có khay đáy. Không báo H10 cho hóa chất không bay hơi.
- Trong "title" và "evidence" ghi rõ tên hoặc loại hóa chất đọc được và lý do cần khay hoặc hút mùi (ví dụ "Can 20 L IPA (dung môi dễ cháy, dễ bay hơi) đặt trực tiếp xuống sàn, không có khay chống tràn").
- Không đọc được tên hóa chất và không xác định được dạng lỏng hay rắn, bay hơi hay không: không kết luận, ghi vào "verify" (ví dụ "Xác định hóa chất trong 3 can xanh để quyết định có cần khay chống tràn, tủ hút mùi không").

`;
DX_RULES.push(dxR('H10','Hóa chất','Hóa chất dễ bay hơi lưu trữ trong tủ, kho không có thông gió hoặc hút mùi','dung môi, cồn, axit bốc khói, amoniac, formaldehyde, sơn, keo gốc dung môi để trong tủ gỗ, tủ sắt kín, phòng kín không có quạt hút, ống hút, cửa gió; mùi hóa chất nặng','BH401','BH401-02',[["BH401","03","Luật 84/2015/QH13 — Điều 18; NĐ 44/2016/NĐ-CP — Chương V; TT 19/2016/TT-BYT."]],'Major',
  'Mở thông gió tạm, đậy kín nắp các vật chứa; chuyển hóa chất dễ bay hơi sang tủ hoặc kho có thông gió.',
  'Trang bị tủ hóa chất có quạt hút (hoặc tủ chống cháy nối ống thông gió ra ngoài) cho dung môi, axit bốc khói; kho hóa chất có thông gió cơ khí và thiết bị điện phòng nổ; tra mục 7 (bảo quản) của SDS để lập danh sách hóa chất cần hút mùi; kiểm tra quạt hút trong phiếu kiểm tra kho hằng tháng.','Facility','hazard',
  [["BH401","02","QCVN 05A:2020/BCT (an toàn trong sản xuất, kinh doanh, sử dụng, bảo quản và vận chuyển hóa chất nguy hiểm) — yêu cầu đối với kho chứa; Luật 69/2025/QH15 — Điều 25."]]));
(function gxAddRules(){
  for(const r of DX_RULES){
    if(RULES[r.id])continue;
    const base=r.l.map(x=>[...x]);if(r.lx)r.l=[...base,...r.lx];
    let at=-1;RBA.rules.forEach((x,i)=>{if(x.g===r.g)at=i});at=at<0?RBA.rules.length:at+1;
    RBA.rules.splice(at,0,r);BASELAW.splice(at,0,base);RULES[r.id]=r;
  }
  const h1=RULES.H1;if(h1){h1.t='Thùng chứa hóa chất lỏng không đặt trong khay chống tràn hoặc khay không đủ dung tích';
    h1.k='can, thùng phuy, IBC chứa chất lỏng nguy hại (axit, bazơ, dung môi, sơn, dầu, chất thải lỏng) đặt trực tiếp trên sàn hoặc kệ không có khay; khay nhỏ hơn 110% vật chứa lớn nhất, thủng hoặc đọng đầy; không áp dụng cho hóa chất rắn đóng bao kín, bình khí';
    h1.x='Trang bị khay chống tràn chứa được ít nhất 110% thể tích vật chứa lớn nhất cho mọi vật chứa chất lỏng nguy hại, khay riêng cho nhóm kỵ nhau; đặt tại khu chứa có sàn chống thấm và bộ ứng phó tràn đổ.'}
})();
Object.assign(QX_KW,{
  H10:['dung moi|hoa chat bay hoi|hoa chat de bay hoi|axit|acid|amoniac|formaldehyde|formalin|ipa|isopropanol|aceton|acetone|thinner|xang|con|ethanol|methanol|toluen|toluene|xylen|xylene|son|keo|hoa chat|tu hoa chat|kho hoa chat','thong gio|hut mui|hut khi|quat hut|tu hut|hut hoi|ong hut|cua gio','thieu|khong co|chua|kin|khong','!hu|hong|bi che|ngung|cong doan|thao tac|pha che|chiet rot|diem thao tac'],
  H1:['hoa chat|thung dau|can dau|phuy|dung moi|ibc|axit|acid|bazo|ipa|ethanol|thinner|aceton|acetone|son|dau nhot|chat thai long','khay chong tran|khay hung|chong tran|be chong tran'],
  H5:['hut cuc bo|hut khi|thong gio cuc bo|chup hut','khong co|thieu|chua','!luu tru|bao quan|tu hoa chat|kho hoa chat|tu chua|kho chua']
});
for(const id of['H10','H1','H5'])QX_RX[id]=QX_KW[id].map(g=>{const neg=g[0]==='!';return{neg,rx:new RegExp('(?:^|[^a-z0-9])(?:'+(neg?g.slice(1):g)+')(?=$|[^a-z0-9])')}});
{const e=AREA_CK.find(a=>/^Kho hóa chất/.test(a.n));if(e){
  e.i=e.i.map(x=>/^Khay hoặc bờ chống tràn/.test(x)?'Khay chống tràn cho vật chứa CHẤT LỎNG nguy hại (≥ 110% vật chứa lớn nhất); hóa chất rắn đóng bao, bình khí, chai nhỏ trong tủ có khay đáy không cần khay riêng (H1)':x);
  e.i.push('Hóa chất dễ bay hơi (dung môi, cồn, axit bốc khói, amoniac, formaldehyde) trong tủ, kho kín không có thông gió, hút mùi (H10); thao tác phát sinh hơi không có chụp hút (H5)')}}
{const _al=areaLists;areaLists=function(text){return _al(text)+DX_CHEM}}
const GX_CHEM_IDS=new Set(['H1','H3','H5','H8','H10','V5','H2','H9']);
function gxChemHelp(open){
  return h('details',{class:'gxch',open:!!open,onclick:e=>e.stopPropagation()},h('summary',null,'Tra cứu: hóa chất nào cần khay chống tràn, thông gió, hút mùi'),
    h('dl',null,...GX_CHEM.flatMap(([a,b])=>[h('dt',null,a),h('dd',null,b)])));
}
{const _cf=cardForm;cardForm=function(f){const el=_cf(f);try{if(f&&GX_CHEM_IDS.has(f.rule))el.append(gxChemHelp())}catch(e){console.warn(e)}return el}}

/* ---------- 3. Gợi ý vấn đề có thể có (ô tích khi mở ảnh) ---------- */
const SX_PROMPT=`VẤN ĐỀ NGHI NGỜ (chưa đủ rõ để kết luận)
Ngoài "findings", ghi vào "suspect" tối đa 6 vấn đề CÓ THỂ có tại khu vực trong ảnh nhưng ảnh chưa đủ rõ hoặc không nhìn thấy được (bị che, ngoài khung ảnh, ở xa, cần mở tủ, cần đọc tem nhãn, cần biết hóa chất gì). Mỗi mục: "rule" là id trong danh mục, "title" viết như một dòng phát hiện nếu được xác nhận, "why" là dấu hiệu khiến nghi ngờ và việc cần kiểm tra tại chỗ, "box" là vùng liên quan [x1,y1,x2,y2] thang 0 đến 1000 (không xác định được thì [0,0,0,0]). Không lặp lại lỗi đã có trong "findings". Người đánh giá sẽ tích chọn để thêm thành lỗi sau khi kiểm tra.
`;
{const _qp=qxPrompt;qxPrompt=function(prompt){let s=_qp(prompt);
  if(!/\nNHIỆM VỤ\nSoát ảnh hiện trường/.test(s))return s;const k=s.lastIndexOf('\n\nChỉ trả về một JSON:');if(k<0)return s;
  s=s.slice(0,k)+'\n'+SX_PROMPT+s.slice(k);const j=s.lastIndexOf(',"verify":[');
  if(j>k)s=s.slice(0,j)+',"suspect":[{"rule":"id","title":"vấn đề có thể có","why":"dấu hiệu nghi ngờ, cần kiểm tra gì tại chỗ","box":[0,0,0,0]}]'+s.slice(j);
  return s}}
const sxGuessId=t=>{const g=qxGuess(t);return g?g.id:''};
{const _aw=applyWhole;applyWhole=function(p,data,quiet){const r=_aw(p,data,quiet);
  try{const su=Array.isArray(data&&data.suspect)?data.suspect:[];
    if(p.analysis){p.analysis.suspect=su.filter(a=>a&&typeof a==='object'&&str(a.title)).slice(0,6).map(a=>({rule:RULES[a.rule]?a.rule:sxGuessId(`${a.title}. ${a.why||''}`),title:str(a.title),why:str(a.why),
      box:boxOk(a.box)&&a.box.some(n=>Number(n)>0)?a.box.slice(0,4).map(Number):null}));Store.touch(p);if(cur()===p)renderList()}}catch(e){console.warn(e)}
  return r}}
/* Gợi ý thường gặp theo loại ảnh (xác định từ khu vực, ghi chú, mô tả cảnh, nội dung lỗi) */
const SX_SC=[
  {n:'tủ điện',re:/tu dien|hop dien|aptomat|ap to mat|cau dao|phong dien|mcb|mccb|thanh cai|cau dau/,ids:['D14','D20','D21','D3','D15','D16','D12','D9','D19','D18','D1','D2','D5']},
  {n:'trần, mái',re:/tran nha|o tran|tam tran|tran thach cao|mai nha|mai ton|la phong|tren tran/,ids:['TR1','TR2','F14','F10','F15']},
  {n:'cửa, lối thoát nạn',re:/cua thoat|loi thoat|exit|hanh lang|cau thang|loi ra vao|cua ra vao|cua kho|cua chinh/,ids:['F5','F3','F1','F2','F7']},
  {n:'bình, tủ chữa cháy',re:/binh chua chay|binh cuu hoa|binh pccc|binh bot|tu chua chay|hong chua chay|voi chua chay/,ids:['TN2','F13','TN3','F8','F16']},
  {n:'hóa chất',re:/hoa chat|dung moi|axit|phuy|ibc|ghs|msds|sds|kho con|thinner|ipa|ethanol|son|keo|binh xit/,ids:['H2','H1','H10','H9','H8','H3','H4','F15','H6']},
  {n:'bảng tin',re:/bang tin|bang thong bao|niem yet/,ids:['BT1','BT2','BT3','BT6','BT4','BT5']},
  {n:'kho, kệ hàng',re:/kho|ke hang|pallet|xe nang|hang hoa/,ids:['NT1','L3','F1','F8','F14','TR1']},
  {n:'máy, thiết bị',re:/may |may$|day chuyen|bang tai|dong co|tu dieu khien|thiet bi/,ids:['M1','M3','NT1','M4','D6']},
  {n:'khu chất thải',re:/chat thai|rac|phe lieu|ctnh/,ids:['T1','T2','T3','T4']}
];
function sxScene(text,n){const t=' '+qn(text).replace(/[^a-z0-9]+/g,' ')+' ';return SX_SC.filter(s=>s.re.test(t)).slice(0,n||2)}
let SX_OPEN=true;
function sxItems(p){
  if(!p||p.sample)return[];const A=p.analysis||{},out=[],seen=new Set(),used=new Set();
  const have=new Set(p.findings.filter(f=>!f.sug).map(f=>f.rule).filter(Boolean));
  const add=it=>{if(!it.title||seen.has(it.key))return;seen.add(it.key);if(it.rule)used.add(it.rule);out.push(it)};
  for(const s of(A.suspect||[]).slice(0,6)){if(s.rule&&have.has(s.rule))continue;add({key:'a:'+(s.rule||'')+':'+s.title,rule:s.rule,title:s.title,why:s.why,box:s.box,src:'AI nghi ngờ'})}
  let nv=0,nq=0;
  for(const v of(A.verify||[])){const m=String(v).match(/^(Không đưa vào báo cáo[^:]*|AI kiểm tra lại đã loại):\s*(.+)$/);
    if(m&&nv<4){let t=m[2].trim(),why=m[1].replace(/^Không đưa vào báo cáo\s*/,'').replace(/^\(|\)$/g,'');
      if(/^AI/.test(m[1])){const r=t.match(/\s*\(([^()]*)\)\s*$/);why=r?'AI kiểm tra lại đã loại: '+r[1]:'AI kiểm tra lại đã loại';if(r)t=t.slice(0,r.index).trim()}
      const id=sxGuessId(t);if(id&&have.has(id))continue;add({key:'v:'+t,rule:id,title:t,why,src:'AI đã loại'});nv++;continue}
    if(!m&&nq<3){const id=sxGuessId(v);if(id&&!have.has(id)&&!used.has(id)&&RULES[id]){add({key:'q:'+id,rule:id,title:RULES[id].t,why:String(v),src:'Cần kiểm tra'});nq++}}}
  const text=[p.area,p.note,A.scene,...p.findings.map(f=>f.title),...(A.suspect||[]).map(s=>s.title)].filter(Boolean).join(' ');
  let ns=0;for(const sc of sxScene(text,2))for(const id of sc.ids){if(ns>=8)break;if(!RULES[id]||have.has(id)||used.has(id))continue;add({key:'r:'+id,rule:id,title:RULES[id].t,why:`Thường gặp ở ảnh ${sc.n}`,src:'Thường gặp'});ns++}
  return out;
}
const gxShape=s=>JSON.parse(JSON.stringify(s||{t:'rect',x:.03,y:.03,w:.94,h:.94}));
function gxFill(f,r){Object.assign(f,{rule:r.id,code:r.c,req:r.q,law:lawStr(r.l),sev:r.v,fixNow:r.n,fixRoot:r.x,cause:r.z,kind:r.kd==='hazard'?'hazard':'violation',mand:r.v==='Priority'})}
function sxToggle(p,it,on){
  if(on){if(p.findings.some(f=>f.sug===it.key))return;hist(p);const r=it.rule&&RULES[it.rule];
    const f=newFinding((it.box&&boxShape(it.box))||gxShape(),{src:'manual',user:true,sug:it.key});if(r)gxFill(f,r);
    f.title=it.title||(r?r.t:'');f.ev=it.src!=='Thường gặp'&&it.why?it.why:'';p.findings.push(f);Store.touch(p);S.sel=f.id;
    toast(`Đã thêm lỗi "${f.title.slice(0,60)}". Kiểm tra tại chỗ, chỉnh khung rồi bấm Xác nhận.`)}
  else{const f=p.findings.find(x=>x.sug===it.key);if(!f)return;hist(p);p.findings=p.findings.filter(x=>x!==f);if(S.sel===f.id)S.sel=null;Store.touch(p);toast('Đã bỏ lỗi vừa thêm.')}
  renderAll();
}
function sxPanel(p){
  const its=sxItems(p);if(!its.length)return null;const on=new Map(p.findings.filter(f=>f.sug).map(f=>[f.sug,f]));
  const n=its.filter(it=>on.has(it.key)).length;
  return h('details',{class:'sxp',open:SX_OPEN,onclick:e=>e.stopPropagation(),ontoggle:e=>{SX_OPEN=e.currentTarget.open}},
    h('summary',null,h('b',null,'Vấn đề có thể có — tích để thêm lỗi'),h('small',null,` ${its.length} gợi ý${n?` · đã thêm ${n}`:''}`)),
    h('div',{class:'sxl'},...its.map(it=>{const r=it.rule&&RULES[it.rule],f=on.get(it.key);
      return h('label',{class:'sxi'+(f?' on':'')},h('input',{type:'checkbox',checked:!!f,onchange:e=>sxToggle(p,it,e.target.checked)}),
        h('span',null,h('b',null,it.title),h('small',null,h('i',{class:'sxs '+(it.src==='AI nghi ngờ'?'ai':it.src==='AI đã loại'?'drop':it.src==='Cần kiểm tra'?'chk':'')},it.src),
          r?` ${r.q} · ${r.v}`:'',it.why?` · ${it.why}`:'',f&&f.ok?' · ✓ đã xác nhận':'')))})),
    h('p',{class:'sxh'},'Tích chọn sẽ thêm lỗi chờ xác nhận (khung bao vùng nghi ngờ hoặc gần cả ảnh). Kiểm tra tại chỗ, chỉnh khung rồi bấm Xác nhận. Bỏ tích để xóa lỗi vừa thêm.'));
}
{const _rl=renderList;renderList=function(){_rl();try{if(S.listAll&&isMobile())return;const p=cur();if(!p||p.sample||p.bgRun)return;
  const pn=sxPanel(p);if(!pn)return;const L=$('list'),hd=L.querySelector(':scope>.hintd');hd?hd.after(pn):L.prepend(pn)}catch(e){console.warn(e)}}}

/* ---------- 1. Một nhóm = một lỗi duy nhất trong mọi file xuất ---------- */
const GX_FULL={t:'rect',x:.004,y:.004,w:.992,h:.992};
const GX_COL={Priority:'#D32F2F',Major:'#EF6C00',Minor:'#F9A825'};
const QXC=new Map();
function gxMode(g){const x=g.items.find(x=>x.f.qxMode);return x?x.f.qxMode:(QX.cfg.groupImg||'collage')}
function gxSetMode(g,m){for(const x of g.items){x.f.qxMode=m;Store.touch(x.p)}toast(m==='collage'?'Nhóm này xuất bằng ảnh ghép các vị trí.':'Nhóm này xuất bằng ảnh đại diện.');qxRefresh()}
const gxOrder=g=>[g.rep,...g.items.filter(x=>x!==g.rep)];
function gxSig(g){const LL=capLang();return g.k+'|'+g.sev+'|'+LL+'|'+(LL!=='vi'?[...new Set(g.items.map(x=>capOf(LL,x.p.area)))].join('~')+'|':'')+gxOrder(g).map(x=>{const b=bbox(x.f.s);return[x.p.id,x.f.id,x.p.w,x.p.h,x.pi,(x.p.area||'').trim(),b.x.toFixed(3),b.y.toFixed(3),b.w.toFixed(3),b.h.toFixed(3)].join(':')}).join(',')}
async function gxCollage(g){
  await fonts();
  const its=gxOrder(g),show=its.slice(0,4),more=its.length-show.length,n=show.length;
  const W=1600,H=Math.round(W*CELL_HPT/CELL_WPT),gap=10,hw=(W-gap)/2,hh=(H-gap)/2,c=mk(W,H),G=c.getContext('2d');
  G.fillStyle='#FFFFFF';G.fillRect(0,0,W,H);
  const R=n<=2?[[0,0,hw,H],[hw+gap,0,hw,H]]:n===3?[[0,0,hw,H],[hw+gap,0,hw,hh],[hw+gap,hh+gap,hw,hh]]:[[0,0,hw,hh],[hw+gap,0,hw,hh],[0,hh+gap,hw,hh],[hw+gap,hh+gap,hw,hh]];
  const col=GX_COL[g.sev]||'#D32F2F';
  for(let i=0;i<n;i++){const x=show[i],p=x.p,[tx,ty,tw,th]=R[i];G.save();G.beginPath();G.rect(tx,ty,tw,th);G.clip();
    G.fillStyle='#1A2125';G.fillRect(tx,ty,tw,th);
    const im=await ensureImg(p);
    if(im&&p.w&&p.h){const A=tw/th,b=bbox(x.f.s),ux0=b.x*p.w,uy0=b.y*p.h,ux1=(b.x+b.w)*p.w,uy1=(b.y+b.h)*p.h;
      const maxW=p.w/p.h>A?p.h*A:p.w,cw=Math.min(maxW,Math.max((ux1-ux0)*1.9,(uy1-uy0)*1.9*A,maxW*.5)),ch=cw/A;
      const cx=clamp((ux0+ux1)/2-cw/2,0,p.w-cw),cy=clamp((uy0+uy1)/2-ch/2,0,p.h-ch),k=tw/cw;
      G.drawImage(im,cx,cy,cw,ch,tx,ty,tw,th);
      const X=tx+(ux0-cx)*k,Y=ty+(uy0-cy)*k,BW=(ux1-ux0)*k,BH=(uy1-uy0)*k;
      G.lineJoin='round';G.strokeStyle='#FFFFFF';G.lineWidth=11;G.strokeRect(X,Y,BW,BH);G.strokeStyle=col;G.lineWidth=6;G.strokeRect(X,Y,BW,BH)}
    const LL=capLang(),ar=(p.area||'').trim(),arX=LL!=='vi'&&ar?capOf(LL,ar):'',cap=`Ảnh ${x.pi+1}${LL!=='vi'&&CAPL[LL]?' / '+CAPL[LL].photo+' '+(x.pi+1):''}${ar?' · '+ar:''}${arX?' / '+arX:''}`;G.font=`600 30px ${fontL(LL)}`;
    let t=cap;while(t.length>4&&G.measureText(t).width>tw-40)t=t.slice(0,-2);if(t!==cap)t=t.replace(/\s*\S?$/,'')+'…';
    G.fillStyle='rgba(10,14,16,.68)';G.fillRect(tx,ty+th-54,tw,54);G.fillStyle='#FFFFFF';G.textBaseline='middle';G.textAlign='left';G.fillText(t,tx+20,ty+th-27);
    if(more>0&&i===n-1){G.fillStyle='rgba(10,14,16,.5)';G.fillRect(tx,ty,tw,th-54);G.fillStyle='#FFFFFF';G.textAlign='center';G.font=`700 96px ${fontD}`;G.fillText(`+${more}`,tx+tw/2,ty+(th-54)/2-24);const LL=capLang(),MX={ko:'기타 위치',zh:'其他位置',en:'other locations'};G.font=`600 34px ${fontL(LL)}`;G.fillText('vị trí khác',tx+tw/2,ty+(th-54)/2+50);if(MX[LL]){G.font=`500 30px ${fontL(LL)}`;G.fillText(MX[LL],tx+tw/2,ty+(th-54)/2+92)}}
    G.restore()}
  return c;
}
function gxVp(g,c){return{id:'qxg_'+g.id,name:'Nhóm lỗi lặp lại',area:qxAreas(g.items).join('; '),w:c.width,h:c.height,img:c,blob:null,thumb:thumbOf(c),findings:[],analysis:null,undo:[],redo:[],note:'',sample:false,qxg:g.k}}
async function qxPrep(){
  if(!QX.cfg.group||!QX.cfg.groupExport)return;const gs=qxGroups(true),live=new Set();
  for(const g of gs){if(gxMode(g)!=='collage')continue;const s=gxSig(g);live.add(s);
    if(!QXC.has(s)){try{QXC.set(s,{vp:gxVp(g,await gxCollage(g))})}catch(e){console.warn('Ghép ảnh nhóm',e)}}}
  for(const k of[...QXC.keys()])if(!live.has(k))QXC.delete(k);gxGc();
}
/* ảnh ghép không thuộc S.photos: bỏ khỏi bộ đệm ảnh khi không còn dùng */
function gxGc(keep){const live=new Set([...QXC.values()].map(e=>e.vp));if(keep)live.add(keep);for(let i=IMGC.length-1;i>=0;i--)if(IMGC[i]&&IMGC[i].qxg&&!live.has(IMGC[i]))IMGC.splice(i,1)}
const gxTitle=g=>`${str(g.rep.f.title).replace(/[.。;\s]+$/,'')} (lặp lại tại ${g.items.length} vị trí: ${qxAreas(g.items).join('; ')})`;
{const _ga=gather;gather=function(){
  const base=_ga();if(!QX.cfg.groupExport||!QX.cfg.group)return base;
  const gs=qxGroups(true);if(!gs.length)return base;
  const drop=new Set(),repl=new Map(),before=new Map();
  for(const g of gs){const R=g.rep.f,fx={...R,sev:g.sev,mand:g.items.some(x=>x.f.mand)||!!R.mand,title:gxTitle(g),qxN:g.items.length};
    const e=gxMode(g)==='collage'?QXC.get(gxSig(g)):null;
    if(e){for(const x of g.items)drop.add(x.f);const f2={...fx,s:{...GX_FULL}};e.vp.findings=[f2];
      (before.get(g.rep.p)||before.set(g.rep.p,[]).get(g.rep.p)).push({p:e.vp,items:[{f:f2,n:1}]})}
    else{for(const x of g.items)if(x!==g.rep)drop.add(x.f);repl.set(R,fx)}}
  const out=[];
  for(const G of base){for(const V of before.get(G.p)||[])out.push(V);
    const items=G.items.filter(x=>!drop.has(x.f)).map(x=>repl.has(x.f)?{f:repl.get(x.f),n:x.n}:x);if(items.length)out.push({p:G.p,items})}
  return out;
}}
const gxPre=async()=>{try{await qxPrep()}catch(e){console.warn(e)}};
{const _f=exportFindings;exportFindings=async function(...a){await gxPre();return _f.apply(this,a)}}
{const _f=previewImage;previewImage=async function(...a){await gxPre();return _f.apply(this,a)}}
{const _f=exportPdf;exportPdf=async function(...a){await gxPre();return _f.apply(this,a)}}
{const _f=exportReview;exportReview=async function(...a){await gxPre();return _f.apply(this,a)}}
/* File nén ảnh báo cáo: cùng danh sách với ảnh báo cáo và PDF */
exportZip=async function(skip){
  if(!gateExport())return;
  if(!window.JSZip)return toast('Thư viện nén chưa tải xong. Hãy thử lại sau vài giây.');
  await gxPre();toast('Đang tạo file nén…');const z=new JSZip(),ps=gather().map(g=>g.p);
  const miss=await ensureCap(capLang(),ps,t=>toast(t));if(miss>0)toast(`${miss} câu chưa dịch được, phụ đề tạm hiện tiếng Việt.`);
  for(const[i,p]of ps.entries()){const c=await reportCanvas(p);z.file(`${String(i+1).padStart(2,'0')}_${safeName(p.area||p.name)}.jpg`,await toBlob(c,'image/jpeg',.9))}
  await saveFile(`Bao-cao-EHS_${$('mDate').value||today()}.zip`,await z.generateAsync({type:'blob'}));
};
QX.preview=async()=>{await qxPrep();return gather().map(G=>({photo:G.p.name,area:G.p.area,vp:!!G.p.qxg,items:G.items.map(x=>({n:x.n,title:x.f.title,req:x.f.req,sev:x.f.sev}))}))};
QX.prep=qxPrep;
async function gxShow(g){
  try{let blob;
    if(gxMode(g)==='collage'){const c=await gxCollage(g),vp=gxVp(g,c);blob=await photoCell(vp,[{f:{...g.rep.f,sev:g.sev,s:{...GX_FULL}},n:1}])}
    else blob=await photoCell(g.rep.p,[{f:{...g.rep.f,sev:g.sev},n:1}]);
    gxGc();const url=URL.createObjectURL(blob);
    const pr=ask('Ảnh xuất của nhóm',`${gxMode(g)==='collage'?'Ảnh ghép các vị trí':'Ảnh đại diện'} — dùng cho dòng Findings, trang PDF và ảnh báo cáo của nhóm "${str(g.r?g.r.t:g.rep.f.title).slice(0,80)}" (${g.items.length} vị trí).`,
      [{label:'Đóng',cls:'primary',v:1},{label:gxMode(g)==='collage'?'Đổi sang ảnh đại diện':'Đổi sang ảnh ghép',v:'sw'}]);
    try{$('askT').append(h('img',{src:url,class:'gxprev',alt:'Ảnh xuất của nhóm'}))}catch{}
    const v=await pr;setTimeout(()=>URL.revokeObjectURL(url),2000);if(v==='sw')gxSetMode(g,gxMode(g)==='collage'?'rep':'collage');
  }catch(e){console.error(e);toast('Không tạo được ảnh xuất của nhóm.')}
}

/* ---------- 2. Sửa nhóm, thêm vấn đề AI chưa nhận ra ---------- */
function gxRelated(rule,its){
  const ids=[],push=id=>{if(id&&RULES[id]&&id!==rule&&!ids.includes(id))ids.push(id)};
  const text=its.flatMap(x=>[x.p.area,x.p.note,x.p.analysis&&x.p.analysis.scene,x.f.title]).filter(Boolean).join(' ');
  for(const x of its)for(const s of(x.p.analysis&&x.p.analysis.suspect)||[])push(s.rule);
  for(const sc of sxScene(text+' '+(RULES[rule]?RULES[rule].t:''),2))sc.ids.forEach(push);
  const r=RULES[rule];if(r)RBA.rules.filter(y=>y.g===r.g).slice(0,12).forEach(y=>push(y.id));
  return ids.slice(0,14);
}
function gxNewF(p,s,it,ok,fb){
  const r=it.rule&&RULES[it.rule],f=newFinding(gxShape(s),{src:'manual',user:true});
  if(r)gxFill(f,r);else if(fb)Object.assign(f,{code:fb.code||'',req:fb.req||'',law:fb.law||'',kind:fb.kind||'violation',cause:fb.cause||'Administrative',sev:'Minor',mand:false});
  f.title=it.title||(r?r.t:'');f.ev=it.ev||'';if(ok){f.ok=true;learn(f,p)}p.findings.push(f);return f;
}
async function gxAi(g,title){
  const sent=gxOrder(g).slice(0,Math.max(1,Math.min(AI.max||1,4))),imgs=[];
  for(const x of sent)imgs.push(await aiBlob(x.p,x.f));
  const list=RBA.rules.map(r=>`${r.id}: ${r.t}`).join('\n');
  const prompt=`Bạn là chuyên gia đánh giá EHS theo bộ tiêu chí RBA tại Việt Nam. ${sent.length>1?`${sent.length} ảnh đính kèm (ảnh 1 đến ${sent.length}) là các vị trí`:'Ảnh đính kèm là một vị trí'} của cùng một lỗi lặp lại: "${title}". Vùng viền màu hồng do ứng dụng vẽ để chỉ vật thể của lỗi đó, không phải vật thể hiện trường.
NHIỆM VỤ: tìm các vấn đề KHÁC (không phải lỗi trên) trên cùng vật thể hoặc ngay quanh vùng viền hồng mà người đánh giá có thể chưa ghi nhận. Soát kỹ theo loại vật thể: tủ điện (đầu cos, cover, gỉ sét, ốc lỏng, nhãn aptomat, sơ đồ, khóa, biển cảnh báo, bảng tên người phụ trách); bình chữa cháy (tem kiểm định, phiếu kiểm tra, vòi, gioăng cao su, chốt, kim áp suất, biển vị trí, bị che); hóa chất (nhãn GHS, hình đồ cảnh báo, khay chống tràn cho chất lỏng, thông gió hút mùi cho chất bay hơi, khu vực lưu trữ, để lẫn chất kỵ nhau); cửa, lối thoát (đèn exit, chiều mở, vật cản); trần (ẩm mốc, rò nước, đầu báo cháy, thiết bị phòng nổ).
Chỉ ghi vấn đề nhìn thấy được hoặc có dấu hiệu rõ; ghi số các ảnh có vấn đề. Không chắc thì confidence dưới 60.
Danh sách id lỗi (chọn id phù hợp nhất; không có thì "KHAC"):
${list}

Chỉ trả về một JSON:
{"extra":[{"rule":"id","title":"một dòng phát hiện cụ thể theo văn phong báo cáo","evidence":"nhìn thấy gì, ở đâu","photos":[1],"confidence":80}]}
Tối đa 6 mục, không lặp lại lỗi "${title}".`;
  const r=await AI.sample.json(prompt,{images:imgs,modelTier:tier(),cache:false});
  const ex=Array.isArray(r&&r.extra)?r.extra:[];
  return ex.filter(a=>a&&typeof a==='object'&&str(a.title)).slice(0,6).map((a,i)=>{const ph=(Array.isArray(a.photos)?a.photos:[]).map(Number).filter(n=>n>=1&&n<=sent.length).map(n=>sent[n-1]);
    return{key:'a:'+i+':'+str(a.title),rule:RULES[a.rule]?a.rule:sxGuessId(`${a.title}. ${a.evidence||''}`),title:str(a.title),ev:str(a.evidence),ph:ph.length?ph:null,src:`AI gợi ý${Number.isFinite(Number(a.confidence))?` ${Math.round(Number(a.confidence))}%`:''}`}});
}
function gxEdit(g){
  let d=$('gxDlg');if(!d){d=h('dialog',{id:'gxDlg',class:'gxdlg'});document.body.append(d)}
  const R=g.rep.f,its=g.items,aiX=[],sel=new Map();
  const ta=(v,rows,ph)=>h('textarea',{rows:rows||2,value:v||'',placeholder:ph||null});
  const fld=(label,el)=>h('label',{class:'gxf'},h('span',null,label),el);
  const tT=ta(R.title,2),tE=ta(R.ev,2),tN=ta(R.fixNow,2),tX=ta(R.fixRoot,3),tF=ta('',3,'Mỗi dòng một vấn đề. Ví dụ: Ốc siết thanh cái bị gỉ sét');
  const grp={};for(const r of RBA.rules)(grp[r.g]=grp[r.g]||[]).push(r);
  const sR=h('select',{'aria-label':'Loại lỗi theo danh mục'},h('option',{value:''},R.rule?'— Giữ nguyên —':'— Chưa chọn (giữ mã hiện tại) —'),...Object.entries(grp).map(([gn,l])=>h('optgroup',{label:gn},...l.map(r=>h('option',{value:r.id,selected:r.id===R.rule},`${r.id} · ${r.t} (${r.q} · ${r.v})`)))));
  const sV=h('select',{'aria-label':'Mức độ'},...SEV.map(s=>h('option',{value:s,selected:s===g.sev},s)));
  const sug=h('div',{class:'gxsug'}),chem=h('div');
  let last=R.rule;
  const curRule=()=>sR.value||R.rule;
  const have=()=>new Set(its.flatMap(x=>x.p.findings.map(f=>f.rule)).filter(Boolean));
  function renderSug(){const hv=have(),rel=gxRelated(curRule(),its).filter(id=>!hv.has(id));
    const list=[...aiX,...rel.map(id=>({key:'r:'+id,rule:id,title:RULES[id].t,src:'Thường gặp'}))];
    sug.replaceChildren(...(list.length?list.map(it=>{const r=it.rule&&RULES[it.rule];
      return h('label',{class:'gxs'},h('input',{type:'checkbox',checked:sel.has(it.key),onchange:e=>{e.target.checked?sel.set(it.key,it):sel.delete(it.key)}}),
        h('span',null,h('b',null,it.title),h('small',null,[it.src,r?`${r.q} · ${r.v}`:'',it.ph?`ảnh ${it.ph.map(x=>x.pi+1).join(', ')}`:'',it.ev].filter(Boolean).join(' · '))))}):
      [h('small',{class:'gxnone'},'Chưa có gợi ý. Bấm "AI soát lại nhóm" hoặc tự nhập ở dưới.')]));
    chem.replaceChildren(...(GX_CHEM_IDS.has(curRule())?[gxChemHelp(curRule()==='H1'||curRule()==='H10')]:[]))}
  sR.onchange=()=>{const r=RULES[sR.value];if(!r)return renderSug();const o=RULES[last];
    if(!tT.value.trim()||(o&&tT.value.trim()===o.t))tT.value=r.t;sV.value=r.v;
    if(!tN.value.trim()||(o&&tN.value.trim()===o.n))tN.value=r.n;if(!tX.value.trim()||(o&&tX.value.trim()===o.x))tX.value=r.x;last=r.id;renderSug()};
  const bAI=h('button',{class:'btn',type:'button',disabled:!AI.ok,title:AI.ok?'Gửi ảnh các vị trí cho AI tìm thêm vấn đề trên cùng vật thể':AI.why,onclick:async()=>{
    const t0=bAI.textContent;bAI.disabled=true;bAI.textContent='AI đang soát các ảnh…';
    try{const r=await gxAi(g,tT.value.trim()||R.title);aiX.splice(0,aiX.length,...r);renderSug();toast(r.length?`AI gợi ý thêm ${r.length} vấn đề. Tích chọn để thêm.`:'AI không thấy thêm vấn đề rõ ràng.')}
    catch(e){aiFail(e)}finally{bAI.disabled=!AI.ok;bAI.textContent=t0}}},'AI soát lại nhóm');
  const cb=h('input',{type:'checkbox',checked:true});
  const mSep=h('input',{type:'radio',name:'gxm',value:'sep',checked:true}),mMerge=h('input',{type:'radio',name:'gxm',value:'merge'});
  const save=()=>{
    const r=RULES[sR.value],title=tT.value.trim();if(!title){toast('Hãy nhập nội dung lỗi.');tT.focus();return}
    const extra=[...sel.values()],free=tF.value.split('\n').map(s=>s.trim()).filter(Boolean),merge=mMerge.checked,ok=cb.checked;
    let T=title;
    if(merge&&(extra.length||free.length)){const add=[...extra.map(x=>x.title),...free].map(s=>s.charAt(0).toLowerCase()+s.slice(1).replace(/[.;\s]+$/,''));T=`${T.replace(/[.;\s]+$/,'')}; kèm: ${add.join('; ')}`}
    const touched=new Set();
    for(const x of its){if(!touched.has(x.p)){hist(x.p);touched.add(x.p)}const f=x.f;
      if(r)Object.assign(f,{rule:r.id,code:r.c,req:r.q,law:lawStr(r.l),kind:r.kd==='hazard'?'hazard':'violation',cause:r.z});
      Object.assign(f,{title:T,ev:tE.value.trim(),sev:sV.value,fixNow:tN.value.trim(),fixRoot:tX.value.trim()});
      if(CFG.mandRule!=='ai')f.mand=f.sev==='Priority';if(ok&&!f.ok){f.ok=true;learn(f,x.p)}}
    let nNew=0;
    if(!merge){
      for(const it of extra)for(const x of(it.ph||its)){gxNewF(x.p,x.f.s,it,ok);nNew++}
      for(const t of free){const it={rule:sxGuessId(t),title:t,ev:''};for(const x of its){gxNewF(x.p,x.f.s,it,ok,R);nNew++}}}
    for(const p of touched)Store.touch(p);d.close();
    toast(`Đã cập nhật ${its.length} lỗi của nhóm${nNew?`, thêm ${nNew} lỗi mới (${extra.length+free.length} vấn đề × các vị trí; vấn đề lặp ở nhiều ảnh sẽ tự gom thành nhóm mới)`:merge&&(extra.length||free.length)?', đã ghi gộp vấn đề bổ sung vào nội dung lỗi':''}.`);
    qxRefresh()};
  d.replaceChildren(
    h('div',{class:'dh'},h('h2',null,`Sửa nhóm lỗi lặp lại · ${its.length} vị trí`),h('span',{class:'spacer'}),h('button',{class:'btn',type:'button',onclick:()=>d.close()},'Đóng')),
    h('div',{class:'db gxbody'},
      h('div',{class:'qxgl'},...its.map(x=>h('div',{class:'qxgi'+(x===g.rep?' rep':'')},h('img',{src:x.p.thumb,alt:''}),h('small',null,`Ảnh ${x.pi+1}${(x.p.area||'').trim()?' · '+x.p.area.trim():''}`)))),
      h('p',{class:'hint'},'Nội dung dưới đây áp dụng cho mọi lỗi trong nhóm (thống nhất mã, mức độ, khắc phục). Khi xuất file, nhóm là 1 lỗi duy nhất kèm số vị trí.'),
      fld('Loại lỗi theo danh mục (mã RBA, ID yêu cầu)',sR),
      fld('Nội dung lỗi chung',tT),
      h('div',{class:'g2'},fld('Mức độ',sV),h('label',{class:'chk gxok'},cb,' Xác nhận cả nhóm sau khi lưu')),
      fld('Nhìn thấy trong ảnh (mô tả chung)',tE),
      fld('Khắc phục: xử lý ngay',tN),
      fld('Khắc phục: triệt để',tX),
      chem,
      h('div',{class:'gxadd'},
        h('h3',null,'Vấn đề bổ sung AI chưa nhận ra'),
        h('div',{class:'gxaddh'},h('small',null,'Tích các vấn đề cũng có ở các vị trí này, hoặc tự nhập. '),bAI),
        sug,
        fld('Vấn đề khác (tự nhập)',tF),
        h('div',{class:'gxm'},h('label',null,mSep,' Tạo lỗi riêng trên các ảnh của nhóm (đúng mã từng vấn đề)'),h('label',null,mMerge,' Ghi gộp vào nội dung lỗi của nhóm ("…; kèm: …")'))),
      h('div',{class:'acts gxacts'},h('button',{class:'btn primary',type:'button',onclick:save},'Lưu cho cả nhóm'),h('button',{class:'btn',type:'button',onclick:()=>d.close()},'Hủy'))));
  renderSug();if(!d.open)d.showModal();
}

/* ---------- Cài đặt: ảnh xuất mặc định của nhóm ---------- */
{const box=[...document.querySelectorAll('.aixbox h4')].find(x=>x.textContent==='Kiểm soát chất lượng kết quả');
  if(box)box.parentNode.append(h('label',{class:'aixo gxset'},h('span',null,h('b',null,'Ảnh xuất mặc định của nhóm lỗi lặp lại'),h('small',null,'Ghép ảnh: 1 ảnh gồm tối đa 4 vị trí (khoanh vùng lỗi, ghi số ảnh và khu vực). Ảnh đại diện: dùng 1 ảnh rõ nhất (chọn bằng nút "Đại diện"). Có thể đổi riêng từng nhóm.')),
    h('select',{'aria-label':'Ảnh xuất mặc định',onchange:e=>{QX.cfg.groupImg=e.target.value;QX.save();toast('Đã lưu ảnh xuất mặc định của nhóm.');qxRefresh()}},
      h('option',{value:'collage',selected:QX.cfg.groupImg!=='rep'},'Ghép ảnh các vị trí'),h('option',{value:'rep',selected:QX.cfg.groupImg==='rep'},'Ảnh đại diện'))))}
window.__GX={chem:GX_CHEM,sx:sxItems,prep:qxPrep,cache:QXC};
