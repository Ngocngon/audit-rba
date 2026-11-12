/* ======================================================================
   Audit RBA v1.5 — Kiểm soát chất lượng kết quả AI
   1. Bảng quy tắc cố định: nội dung lỗi → id danh mục → mã RBA, ID yêu cầu, mức độ
   2. AI liệt kê vật thể trước, lỗi phải gắn vật thể nhìn thấy; khung lỗi bám vật thể
   3. Loại ảnh trùng khi tải lên (giống hệt: tự bỏ; gần giống: hỏi)
   4. Gom lỗi lặp lại ở nhiều vị trí thành nhóm; xuất Findings một dòng cho mỗi nhóm
   Chèn sau ai-boost.js, trước "Khởi động".
   ====================================================================== */
const QX={cfg:(()=>{const d={rules:true,ground:true,dupImg:true,group:true,groupExport:true};try{return{...d,...JSON.parse(localStorage.getItem('soat-ehs-qx')||'{}')}}catch{return d}})(),
  save(){try{localStorage.setItem('soat-ehs-qx',JSON.stringify(this.cfg))}catch{}},exp:false};
window.__QX=QX;
const qn=t=>String(t||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/\s+/g,' ');

/* ---------- 1. Bảng quy tắc cố định ----------
   Mỗi id: các nhóm từ khóa (không dấu), nhóm đầu là VẬT THỂ; phải khớp đủ mọi nhóm. Nhóm bắt đầu bằng "!" là loại trừ. */
const QX_KW={
 D1:['tu dien|tu phan phoi','vach|vung an toan|ke vach|danh dau'],
 D2:['tu dien','tham cach dien','thieu|khong co|chua (co|trang bi)','!qua han|het han|thu nghiem'],
 D3:['tu dien|thanh cai|busbar','cover|tam che|nap che|tam bao ve|tam chan ben trong|mat che','thieu|khong co|chua|bi thao|ho'],
 D4:['tu dien','loto|khoa cach ly|the khoa|o khoa'],
 D5:['tu dien','chan|vat tu|de hang|vat can|xep|che khuat|de do'],
 D6:['day dien|day dan|o cam|o dien|phich cam|dau noi|day nguon','ho|noi tam|qua tai|bong|tray|keo dai|cam chong|khong co vo|vo hong|dut'],
 D7:['tu dien','bu long|oc vit|vat la|dung cu|bo quen|rac','!bi long|long leo|tuot|siet|gi set|ri set|han ri'],
 D8:['tu dien|hop dien','lo|khe','cap|bit|ho|khong kin'],
 D9:['aptomat|ap to mat|atomat|cau dao|mcb|mccb|mach dien|cb','nhan|ten|danh dau|ky hieu|danh vi tri|danh so|ten mach','thieu|khong co|chua'],
 D10:['chay sem|nhua chay|doi mau|qua nhiet|vet chay|nong chay|vet den'],
 D11:['day|cap','tu do|khong co mang|khong co kep|lon xon|lung tung|khong co dinh','tu dien|trong tu'],
 D12:['gi set|han ri|ri set|bang keo|bang dinh','dau noi|thanh|day|cos|dau cos|cau dau|bu long|oc|oc siet','!noi tam|day dien ho'],
 D13:['thiet bi dien|o cam|cong tac|aptomat|hop dien','lap nghieng|long|khong co dinh|treo lo lung'],
 H1:['hoa chat|thung dau|can dau|phuy|dung moi','khay chong tran|khay hung|chong tran|be chong tran'],
 H2:['hoa chat|dung moi|chai|binh xit|can nhua|lo','nhan|ghs','khong co|thieu|mo|bong|khong doc|rach','!chat thai|rac|qua han|het han'],
 H3:['hoa chat|dung moi|axit|bazo','de lan|khong tuong thich|sai cach|luu tru sai|xep chung|de chung'],
 H4:['ro ri|tran do|tran ra|dau loang|vet dau|chay ra|do ra','hoa chat|dau|chat long|dung moi','!cong thoat|cong mua|ranh|tron'],
 H5:['hut cuc bo|hut khi|thong gio cuc bo|chup hut','khong co|thieu|chua'],
 H6:['rua mat|voi sen khan cap|eyewash|tram rua'],
 H7:['binh khi|chai khi|binh gas|binh oxy|binh co2|binh argon|binh acetylen|binh nito','co dinh|xich|nap bao ve|chup van|nghieng|do|dung tu do'],
 V5:['quat hut|o thong gio|cua thong gio','hu|hong|bi che|bit|ngung'],
 F1:['loi thoat|loi di thoat|duong thoat|loi thoat hiem|loi thoat nan','chan|che|can tro|vat can|xep|de hang|hep|khong du|bit'],
 F2:['cua thoat|cua exit|cua thoat hiem|cua thoat nan|cua su co','khoa|chan|che|xich|xep|bit|can tro'],
 F3:['cua thoat','huong mo|mo vao trong|mo nguoc|mo vao ben trong'],
 F4:['loi thoat','robot|agv'],
 F5:['den exit|den thoat|den su co|den khan cap|den chi dan|bien exit|den chieu sang su co|den thoat hiem','hong|thieu|che|khong sang|tat|khong hoat dong|khong co|vo','!qua han|het han|bao duong|tem'],
 F6:['chuong bao chay|nut bao chay|nut an bao chay|coi bao chay|tu bao chay','che|hong|chan|vo|khong hoat dong'],
 F7:['so do thoat hiem|so do thoat nan|so do thoat','thieu|khong co|thieu thong tin|sai|mo'],
 F8:['binh chua chay|binh cuu hoa|binh pccc|binh bot|binh co2 chua chay','che|chan|sai vi tri|dat duoi dat|de duoi san|khong co gia|nga|khuat|khong dat|vat can|thieu','!qua han|het han|tem|the theo doi|bao duong|ap suat|kim|mop|hu hong'],
 F9:['tu chua chay|hong chua chay|hop chua chay|voi chua chay|lang phun|tu cuu hoa|tru cuu hoa','che|chan|thieu|hong|khong co|vat can'],
 F10:['dau phun|sprinkler|dau bao chay|dau bao khoi|dau bao nhiet','che|son|sat|qua gan|bao boc|boc'],
 F11:['de chay|giay|carton|thung giay|vai vun|gie|xop|go vun|nilon','gan|canh|sat|tich tu|chat dong','nguon nhiet|nguon dien|tu dien|lo|may han|o cam|bep'],
 F12:['diem tap ket|diem tap trung'],
 F13:['phieu tu kiem tra|phieu kiem tra|the kiem tra|so theo doi','pccc|binh chua chay|tu chua chay|chua chay','khong cap nhat|bo trong|chua cap nhat|khong ghi|thieu chu ky'],
 P1:['ppe|bao ho|kinh bao ho|kinh|gang tay|khau trang|mu bao hiem|nut tai|chup tai|giay bao ho|mat na|yem','khong deo|khong mang|khong su dung|deo sai|khong dung|thieu','!nha an|bep|nau|qua han|het han|bien'],
 P2:['bien bao|bien','ppe|bao ho|deo|trang bi','thieu|khong co'],
 M1:['che chan|tam che|guard|nap che|luoi che|hop che','may|day dai|bo phan chuyen dong|truc|banh rang|xich|puly|bang tai|dong co|quat','thieu|khong co|ho|thao|mat','!tu dien'],
 M2:['cam bien|rem an toan|khoa lien dong|interlock|thiet bi an toan|cong tac hanh trinh','thao|vo hieu|bypass|noi tat|bi bo|che|dan bang keo'],
 M3:['dung khan cap|e-stop|estop|emergency|nut dung'],
 M4:['quy trinh|huong dan van hanh|bien canh bao|sop','may','thieu|khong co|chua'],
 M5:['thiet bi nghiem ngat|noi hoi|may nen khi','kiem dinh|tem'],
 M6:['thang may (cho|tai) hang|thang tai hang','nguoi'],
 L1:['xe nang|forklift|xe day dien','phan luong|nguoi di bo|toc do|cho nguoi|nang nguoi|lan duong|vach|khong an toan|guong|den canh bao|coi','!tem|kiem dinh|het han|qua han'],
 L2:['cau truc|palang|mong vat|day cap|cap thep|moc cau|cong truc|day cau|xich cau','khong an toan|duoi tai|dung duoi|mon|dut|chot an toan|hu|tua|xoan'],
 L3:['xep cao|chong cao|ke hang|ke|pallet|hang hoa|thung hang','khong on dinh|nghieng|do|cong venh|hu hong|mop|lech|vuot|qua tai|cao qua'],
 W1:['tren cao|thang|gian giao|mai|san cao|xe nang nguoi','day an toan|day dai an toan|lan can|chong roi|khong deo|khong co|that dai'],
 W2:['han|cat|mai|tia lua','phong chay|binh chua chay|tam chan|giay phep|che chan tia lua|vat de chay'],
 W3:['khong gian kin|ham|bon chua|be chua|cong ngam|silo','vao|lam viec|ben trong','kiem soat|do khi|giay phep|khong co|nguoi giam sat'],
 W4:['bao tri|sua chua|bao duong|ve sinh may','loto|khoa|co lap|ngat dien|cat nguon','chua|khong|thieu'],
 W5:['san|loi di|nen|cau thang','tron|dong nuoc|vung nuoc|vat can|lo ho|ho ga|vap|truot|nap ho|nut|bong troc|o ga'],
 A1:['so cuu|hop y te|tu y te|tui so cuu|tu thuoc','thieu|khoa|che|chan|khong co|trong|khong du','!qua han|het han'],
 G1:['tu the|mang vac|cui|nang tay|cong thai hoc|vuon|nang vat nang|dung lau'],
 T1:['chat thai nguy hai|ctnh|gie dinh dau|bong den thai|pin thai|bao bi dinh hoa chat','lan|khong phan loai|de chung|bo chung|vut'],
 T2:['chat thai nguy hai|ctnh|thung rac nguy hai|thung chat thai|thung chua chat thai','nhan|canh bao|ma chat thai|bien','thieu|khong co|mo|bong'],
 T3:['khu (luu giu|chua|luu tru) chat thai|kho chat thai|nha chat thai','khong dat|khong co mai|khong co khay|tran|khong khoa|ho|ngap|khong co ranh'],
 T4:['rac|chat thai thong thuong|rac thai|phe lieu','bua bai|vuong vai|khong phan loai|tran|de ngoai|lung tung','!nguy hai|ctnh'],
 T5:['xe (cho|van chuyen|thu gom) (rac|chat thai)','che|khong che|ho|roi vai'],
 V1:['he thong xu ly|thiet bi xu ly|tram xu ly','bien|thong tin|canh bao|nguoi quan ly|nguoi phu trach'],
 V2:['xu ly khi thai|ong khoi|loc bui|scrubber|thap hap thu|ong hut','hu|ro|thung|hong|ri|bam bui'],
 V3:['cong thoat nuoc mua|cong mua|ranh thoat nuoc|mieng cong|ho ga|cong thoat','chay|tran|xa|dau|hoa chat|nuoc thai|chat long'],
 V4:['tieng on|on cao|do on','bien|nut tai|chup tai'],
 K1:['bep|nha an|khu nau|bon rua|khu so che|ban an','ban|ve sinh kem|mat ve sinh|ruoi|gian|chuot|nam moc|dong nuoc|thuc an thua|rac'],
 K2:['nhan vien (nha an|bep|nau an)|nguoi nau|cap duong|dau bep','trang phuc|tap de|mu|khau trang|gang tay|bao ho'],
 K3:['nguyen lieu|thuc pham|thit|rau|ca|tu lanh|tu dong|tu mat','bao quan|duoi dat|duoi san|song chin|phan loai|de chung|khong che dau|khong dong goi','!qua han|het han|hsd|han dung'],
 K4:['ky tuc xa|nha ve sinh|wc|toilet|phong ve sinh|phong tam','ban|khong sach|hoi|ve sinh kem|ri nuoc|hong'],
 K5:['ky tuc xa|phong o|phong nghi','pccc|thoat nan|binh chua chay|nau an|sac dien|bep dien|day dien'],
 TN1:['xe nang|cau truc|palang|thang may|binh chiu ap|binh khi nen|binh tich ap|cong truc|thiet bi nang|may nen khi','tem|kiem dinh|the kiem dinh','het han|qua han|khong co|thieu|khong thay'],
 TN2:['binh chua chay|binh cuu hoa|binh pccc|binh bot|binh co2','qua han|het han|tem|the|bao duong|phieu kiem tra|nap sac|ngay kiem tra','qua han|het han|khong co|thieu|chua'],
 TN3:['binh chua chay|binh cuu hoa|binh pccc|binh bot','ap suat|dong ho|kim|vung do|hu hong|mop|gi set|vo|chot'],
 TN4:['den su co|den exit|den chi dan|bao chay|den thoat|tu bao chay','qua han|het han|bao duong|tem'],
 TN5:['gang tay cach dien|ung cach dien|tham cach dien|sao cach dien','qua han|het han|thu nghiem|tem'],
 TN6:['dong ho ap|ap ke|can dien tu|can|thiet bi do|dong ho do|nhiet ke','tem|kiem dinh|hieu chuan','het han|qua han|khong co|thieu'],
 TN7:['chong set|noi dat|tiep dia','qua han|do kiem|kiem tra dinh ky|het han|chua do'],
 TN8:['hoa chat|dung moi|son|keo','qua han|het han|hsd|han su dung|exp'],
 TN9:['thuc pham|nguyen lieu|gia vi|sua|do hop|nuoc mam|dau an','qua han|het han|hsd|han dung|han su dung|khong co nhan|exp'],
 TN10:['so cuu|thuoc|bang gac|hop y te|tu thuoc','qua han|het han|hsd|exp'],
 TN11:['ppe|day dai|day an toan|mat na|phin loc|kinh|mu bao hiem|gang tay','qua han|het han|hu hong|rach|nut|mon|dut'],
};
const QX_RX=Object.fromEntries(Object.entries(QX_KW).map(([id,gs])=>[id,gs.map(g=>{const neg=g[0]==='!';return{neg,rx:new RegExp('(?:^|[^a-z0-9])(?:'+(neg?g.slice(1):g)+')(?=$|[^a-z0-9])')}})]));
function qxScore(id,t){const gs=QX_RX[id];if(!gs)return{all:false,obj:false,s:0};let s=0,all=true,obj=false;
  gs.forEach((g,i)=>{const m=t.match(g.rx);if(g.neg){if(m)all=false;return}if(m){s+=m[0].length;if(i===0)obj=true}else all=false});return{all,obj,s}}
function qxGuess(text){const t=' '+qn(text)+' ';let best=null;
  for(const id of Object.keys(QX_RX)){if(!RULES[id])continue;const r=qxScore(id,t);if(r.all&&(!best||r.s>best.s))best={id,s:r.s}}
  return best}
/* Quyết định có sửa id AI chọn hay không: chỉ sửa khi AI để KHAC/không có id, hoặc vật thể của id AI chọn không có trong nội dung lỗi */
function qxRuleFix(f){
  if(!QX.cfg.rules||!f||f.src!=='ai')return false;
  const text=`${f.title||''}. ${f.ev||''}`,b=qxGuess(text);if(!b||b.id===f.rule)return false;
  if(f.rule){const cur=qxScore(f.rule,' '+qn(text)+' ');if(cur.obj||!QX_RX[f.rule])return false}
  const r=RULES[b.id],from={rule:f.rule,code:f.code,req:f.req,sev:f.sev};
  f.rule=r.id;f.code=r.c;f.req=r.q;f.law=lawStr(r.l);f.kind=r.kd==='hazard'?'hazard':'violation';
  if(CFG.sevLock||!SEV.includes(f.sev))f.sev=r.v;
  if(!str(f.fixNow))f.fixNow=r.n;if(!str(f.fixRoot))f.fixRoot=r.x;if(!f.cause)f.cause=r.z;
  if(CFG.mandRule!=='ai')f.mand=f.sev==='Priority';
  f.qxFix={...from,to:r.id,at:Date.now()};return true;
}
{const _fill=fillAI;fillAI=function(f,a,keep0){_fill(f,a,keep0);try{if(qxRuleFix(f)&&(!keep0||!f.ai0||f.ai0.rule===f.qxFix.rule))f.ai0={rule:f.rule,code:f.code,req:f.req,sev:f.sev,kind:f.kind}}catch(e){console.warn(e)}}}

/* ---------- 2. Liệt kê vật thể trước, lỗi phải gắn vật thể ---------- */
const QX_OBJ=`
CÁCH LÀM ĐỂ TRÁNH NHẬN NHẦM VÀ KHOANH SÁT
Bước 1. Trong "objects", liệt kê các vật thể liên quan an toàn, PCCC, điện, hóa chất, môi trường nhìn thấy RÕ trong ảnh (tối đa 15). Mỗi vật thể: "name" cụ thể (loại vật, màu, vị trí, chữ hoặc ngày đọc được, ví dụ "bình chữa cháy bột đỏ cạnh cột trái, thẻ ghi 03/2026"), "box_2d" là [ymin, xmin, ymax, xmax] thang 0 đến 1000 bao SÁT đúng vật đó.
Bước 2. Chỉ kết luận lỗi từ vật thể đã liệt kê. Mỗi lỗi ghi "obj" là danh sách id vật thể làm bằng chứng. Lỗi không chỉ ra được vật thể nhìn thấy (chỉ suy đoán, hoặc lỗi về hồ sơ, quy trình, đào tạo) thì KHÔNG đưa vào findings, ghi vào "verify".
Bước 3. "box" của lỗi bao đúng các vật thể trong "obj"; lỗi thiếu một thứ thì bao vật thể chính và vùng đáng lẽ phải có thứ đó. Không bao cả khu vực rộng.
Không nhầm: phản chiếu, bóng đổ, hình in trên biển hoặc poster, vật ở xa nhìn không rõ, vật giống nhau (ống nước với dây điện, thùng nước với thùng hóa chất khi không thấy nhãn, vạch sơn cũ với vạch đúng chuẩn). Cùng một loại lỗi lặp ở nhiều vật trong ảnh: một lỗi, "obj" liệt kê đủ các vật.
`;
function qxPrompt(prompt){
  if(!QX.cfg.ground||!/\nNHIỆM VỤ\nSoát ảnh hiện trường/.test(prompt))return prompt;
  let s=prompt;const k=s.lastIndexOf('\n\nChỉ trả về một JSON:');if(k<0)return prompt;
  s=s.slice(0,k)+'\n'+QX_OBJ+s.slice(k);
  s=s.replace('{"scene":','{"objects":[{"id":1,"name":"tên vật thể cụ thể","box_2d":[0,0,0,0]}],"scene":').replace(/,"box":\[0,0,0,0\]\}\],"compliant"/,',"obj":[1],"box":[0,0,0,0]}],"compliant"');
  return s;
}
const qxB=b=>{const[x1,y1,x2,y2]=b.slice(0,4).map(Number);return[Math.min(x1,x2),Math.min(y1,y2),Math.max(x1,x2),Math.max(y1,y2)]};
const qxA=b=>Math.max(0,b[2]-b[0])*Math.max(0,b[3]-b[1]);
const qxI=(a,b)=>qxA([Math.max(a[0],b[0]),Math.max(a[1],b[1]),Math.min(a[2],b[2]),Math.min(a[3],b[3])]);
function qxGround(d){
  if(!QX.cfg.ground||!d||!Array.isArray(d.findings)||!Array.isArray(d.objects)||!d.objects.length)return d;
  const om=new Map();for(const o of d.objects){if(!o)continue;box2(o);if(boxOk(o.box)){const b=qxB(o.box);if(qxA(b)>4)om.set(Number(o.id),{b,name:str(o.name)})}}
  if(!om.size)return d;
  const out=[],gone=[];
  for(const a of d.findings){if(!a||typeof a!=='object')continue;
    const ids=(Array.isArray(a.obj)?a.obj:a.obj!=null?[a.obj]:[]).map(Number).filter(n=>om.has(n));
    if(!ids.length){gone.push(`Không đưa vào báo cáo (không chỉ ra được vật thể nhìn thấy): ${str(a.title)}`);continue}
    const bs=ids.map(n=>om.get(n).b),U=[Math.min(...bs.map(b=>b[0])),Math.min(...bs.map(b=>b[1])),Math.max(...bs.map(b=>b[2])),Math.max(...bs.map(b=>b[3]))];
    const pad=12,P=[Math.max(0,U[0]-pad),Math.max(0,U[1]-pad),Math.min(1000,U[2]+pad),Math.min(1000,U[3]+pad)];
    if(!boxOk(a.box)||!a.box.some(n=>Number(n)>0))a.box=P;
    else{const B=qxB(a.box),aB=qxA(B),aU=qxA(P);if(!qxI(B,P)||aB>2.2*aU||aB>450000&&aU<aB*.6)a.box=P}
    a._obj=ids.map(n=>om.get(n).name).filter(Boolean).slice(0,4);out.push(a)}
  d.findings=out;d.verify=[...gone.slice(0,3),...(Array.isArray(d.verify)?d.verify:[])];delete d.objects;return d;
}

/* ---------- 3. Loại ảnh trùng khi tải lên ---------- */
const QFP=new Map();
async function qxFileHash(file){try{if(!crypto.subtle)return'';const b=await crypto.subtle.digest('SHA-256',await file.arrayBuffer());return[...new Uint8Array(b)].slice(0,16).map(x=>x.toString(16).padStart(2,'0')).join('')}catch{return''}}
function qxLoad(src){return new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=rej;im.src=src})}
async function qxFp(key,thumb){
  if(key&&QFP.has(key))return QFP.get(key);if(!thumb)return null;
  try{const im=await qxLoad(thumb),c=mk(9,8),g=c.getContext('2d',{willReadFrequently:true});g.drawImage(im,0,0,9,8);const px=g.getImageData(0,0,9,8).data,gr=[];
    for(let i=0;i<72;i++)gr.push(px[i*4]*.299+px[i*4+1]*.587+px[i*4+2]*.114);
    let bits='';for(let y=0;y<8;y++)for(let x=0;x<8;x++)bits+=gr[y*9+x]>gr[y*9+x+1]?'1':'0';
    const c2=mk(8,8),g2=c2.getContext('2d',{willReadFrequently:true});g2.drawImage(im,0,0,8,8);const col=[...g2.getImageData(0,0,8,8).data].filter((_,i)=>i%4!==3);
    const fp={bits,col,ar:im.width/im.height};if(key)QFP.set(key,fp);return fp}catch{return null}}
const qxHam=(a,b)=>{let n=0;for(let i=0;i<64;i++)if(a[i]!==b[i])n++;return n};
const qxCol=(a,b)=>{let s=0;for(let i=0;i<a.length;i++)s+=Math.abs(a[i]-b[i]);return s/a.length};
function qxCmp(A,B){if(!A||!B)return null;if(Math.abs(A.ar-B.ar)>.08)return null;const hm=qxHam(A.bits,B.bits),cd=qxCol(A.col,B.col);
  if(hm<=1&&cd<=3)return'same';if(hm<=10&&cd<=22)return'near';return null}
async function qxFindDup(fh,fp,w,h,pool){
  let near=null;
  for(const q of pool){if(q.sample)continue;
    if(fh&&q.fh&&q.fh===fh)return{t:'same',p:q};
    const F=await qxFp(q.id,q.thumb),c=qxCmp(fp,F);
    if(c==='same'&&q.w===w&&q.h===h&&(!fh||!q.fh))return{t:'same',p:q};
    if(c&&!near)near={t:'near',p:q}}
  return near}
function qxAskNear(newThumb,name,q){
  const no=S.photos.filter(x=>!x.sample).indexOf(q)+1;
  const pr=ask('Ảnh gần giống ảnh đã có',`Ảnh "${name}" gần giống ${no>0?`ảnh số ${no}`:'một ảnh'} "${q.name||''}"${q.area?` (${q.area})`:''} đã có trong audit. Có thể anh đã tải nhầm hoặc chụp lại cùng một chỗ. Giữ ảnh mới hay bỏ?`,
    [{label:'Bỏ ảnh mới',cls:'primary',v:'skip'},{label:'Giữ cả hai',v:'keep'},{label:'Bỏ mọi ảnh gần giống còn lại',v:'skipall'},{label:'Giữ mọi ảnh còn lại',v:'keepall'}]);
  try{$('askT').append(h('div',{class:'qxdup'},h('figure',null,h('img',{src:q.thumb,alt:'Ảnh đã có'}),h('figcaption',null,'Đã có')),h('figure',null,h('img',{src:newThumb,alt:'Ảnh mới'}),h('figcaption',null,'Ảnh mới'))))}catch{}
  return pr}
importFiles=async function(list){
  const all=[...list].filter(f=>!/(^|\/)\./.test(f.webkitRelativePath||f.name)),dir=all.some(f=>f.webkitRelativePath);
  const imgs=all.filter(f=>!isZipF(f)&&isImgF(f));if(dir)imgs.sort((a,b)=>(a.webkitRelativePath||a.name).localeCompare(b.webkitRelativePath||b.name,'vi',{numeric:true}));
  const src=imgs.map(f=>({name:f.name,get:async()=>f}));
  for(const f of all.filter(isZipF)){const r=await importPack(f);if(Array.isArray(r))src.push(...r)}
  if(!src.length){if(dir||all.length&&!all.some(isZipF))toast('Không có ảnh JPG, PNG trong mục đã chọn.');return}
  let added=null,bad=0,same=0,nearSkip=0,mode='';const news=[];
  for(const[i,s0]of src.entries()){
    toast(src.length>1?`Đang đọc ảnh ${i+1}/${src.length}…`:'Đang đọc ảnh…');
    try{const file=await s0.get(),c=await decodeImg(file),thumb=thumbOf(c);
      let fh='';
      if(QX.cfg.dupImg){fh=await qxFileHash(file);const fp=await qxFp('',thumb),d=await qxFindDup(fh,fp,c.width,c.height,S.photos);
        if(d&&d.t==='same'){same++;continue}
        if(d&&d.t==='near'&&mode!=='keepall'){if(mode==='skipall'){nearSkip++;continue}
          const v=await qxAskNear(thumb,s0.name||'Ảnh chụp',d.p);if(v==='skip'||v==='skipall'||v==null){nearSkip++;if(v==='skipall')mode='skipall';continue}if(v==='keepall')mode='keepall'}}
      const p=makePhoto({name:s0.name||'Ảnh chụp',img:c,w:c.width,h:c.height,blob:await toBlob(c,'image/jpeg',.9),thumb,by:who1(),at:Date.now()});if(fh)p.fh=fh;
      S.photos.push(p);Store.touch(p);touchImg(p);news.push(p);added=added||p}
    catch(e){console.error(e);bad++}
  }
  const skip=[same?`bỏ qua ${same} ảnh trùng (giống hệt ảnh đã có)`:'',nearSkip?`bỏ ${nearSkip} ảnh gần giống`:''].filter(Boolean).join(', ');
  toast(bad?`${bad}/${src.length} ảnh không đọc được. Hãy chụp lại hoặc chọn ảnh JPG, PNG.${skip?' Đã '+skip+'.':''}`:news.length?`Đã thêm ${news.length} ảnh${skip?', '+skip:''}.`:`Không thêm ảnh nào: ${skip||'không có ảnh mới'}.`);
  if(added){S.photos=S.photos.filter(p=>!p.sample);open(added.id);if(isMobile())setView('review');if(NET.off)queueBar('off');else if(bgReady()){bgAdd(news);toast(`Đã thêm ${news.length} ảnh${skip?` (${skip})`:''}. AI đang soát ngầm, anh có thể chụp tiếp.`)}}
};

/* ---------- 4. Gom lỗi lặp lại ở nhiều vị trí ---------- */
const qxRank=v=>{const i=SEV.indexOf(v);return i<0?9:i};
function qxKey(f){return f.rule?'r:'+f.rule:f.code?'c:'+f.code+'|'+(f.req||''):''}
let QXG=null;
function qxGroups(onlyFin){
  if(!onlyFin&&QXG)return QXG;
  const real=S.photos.filter(p=>!p.sample),bk=new Map();
  real.forEach((p,pi)=>p.findings.forEach((f,fi)=>{if(f.nogrp||f.pending||!done(f)||(onlyFin&&!fin(f)))return;const k=qxKey(f);if(!k)return;(bk.get(k)||bk.set(k,[]).get(k)).push({p,f,pi,n:fi+1})}));
  const out=[];
  for(const[k,its]of bk){
    const cl=[];
    if(k.startsWith('r:'))cl.push(its);
    else for(const x of its){const c=cl.find(c=>c.some(y=>tSim(x.f.title,y.f.title)>=.45));c?c.push(x):cl.push([x])}
    for(const items of cl){if(items.length<2||new Set(items.map(x=>x.p.id)).size<2)continue;
      const rep=items.slice().sort((a,b)=>(b.f.qxRep||0)-(a.f.qxRep||0)||(b.f.ok-a.f.ok)||((b.f.conf||0)-(a.f.conf||0))||(b.p.w*b.p.h-a.p.w*a.p.h))[0];
      const sev=items.map(x=>x.f.sev).filter(Boolean).sort((a,b)=>qxRank(a)-qxRank(b))[0]||rep.f.sev;
      out.push({id:rep.f.id,k,items,rep,sev,r:rep.f.rule?RULES[rep.f.rule]:null})}}
  out.sort((a,b)=>qxRank(a.sev)-qxRank(b.sev)||b.items.length-a.items.length);
  if(!onlyFin){QXG=out;setTimeout(()=>{QXG=null},0)}
  return out;
}
const qxGroupOf=f=>QX.cfg.group&&f?qxGroups().find(g=>g.items.some(x=>x.f===f)):null;
function qxAreas(items){const m=new Map();for(const x of items){const a=(x.p.area||'').trim()||`Ảnh ${x.pi+1}`;m.set(a,(m.get(a)||0)+1)}return[...m].map(([a,n])=>n>1?`${a} (${n})`:a)}
function qxRefresh(){QXG=null;renderAll();if(typeof renderDesk==='function')renderDesk()}
function qxUnify(g){const R=g.rep.f;for(const{p,f}of g.items){if(f===R)continue;let ch=false;
  for(const k of['rule','code','req','law','kind'])if(R[k]&&f[k]!==R[k]){f[k]=R[k];ch=true}
  if(f.sev!==g.sev){f.sev=g.sev;ch=true}if(CFG.mandRule!=='ai')f.mand=f.sev==='Priority';if(ch)Store.touch(p)}
  if(R.sev!==g.sev){R.sev=g.sev;Store.touch(g.rep.p)}}
function qxConfirm(g){qxUnify(g);let n=0;for(const{p,f}of g.items)if(!f.ok&&done(f)){f.ok=true;learn(f,p);Store.touch(p);n++}toast(n?`Đã xác nhận ${n} lỗi trong nhóm, thống nhất mã ${g.rep.f.req||g.rep.f.code||''} mức ${g.sev}.`:'Cả nhóm đã được xác nhận.');qxRefresh()}
function qxSplit(p,f){f.nogrp=true;Store.touch(p);toast('Đã tách lỗi khỏi nhóm.');qxRefresh()}
function qxSetRep(p,f){f.qxRep=Date.now();Store.touch(p);toast('Đã chọn ảnh này làm ảnh đại diện của nhóm.');qxRefresh()}
function qxGo(p,f){S.listAll=false;S.cur=p.id;S.sel=f.id;if(typeof setDView==='function'&&!isMobile())setDView('review');renderAll();fit()}
function qxPanel(){
  if(!QX.cfg.group)return null;const gs=qxGroups();if(!gs.length)return null;
  const nf=gs.reduce((a,g)=>a+g.items.length,0);
  return h('details',{class:'qxgrp',open:true},h('summary',null,h('b',null,`Lỗi lặp lại ở nhiều vị trí: ${gs.length} nhóm`),h('small',null,` · ${nf} lỗi. Mỗi nhóm được thống nhất mã, mức độ và xuất thành 1 dòng trong file Findings với ảnh đại diện.`)),
    ...gs.map(g=>{const okN=g.items.filter(x=>x.f.ok).length,R=g.rep.f;
      return h('div',{class:'qxg1'},
        h('div',{class:'qxgh'},h('span',{class:'pill '+g.sev},g.sev),h('span',{class:'tag'},R.req||R.code||'—'),h('b',null,g.r?g.r.t:R.title),h('span',{class:'spacer'}),h('small',null,`${g.items.length} vị trí · ${okN}/${g.items.length} đã xác nhận`)),
        h('div',{class:'qxga'},'Khu vực: '+qxAreas(g.items).join('; ')),
        h('div',{class:'qxgl'},...g.items.map(x=>h('div',{class:'qxgi'+(x===g.rep?' rep':'')+(x.f.ok?' ok':'')},
          h('img',{src:x.p.thumb,alt:`Ảnh ${x.pi+1}`,title:x.f.title,onclick:()=>qxGo(x.p,x.f)}),
          h('small',null,`${x.pi+1}.${x.n}${x===g.rep?' · đại diện':''}`),
          h('div',{class:'qxgb'},x===g.rep?null:h('button',{class:'btn sm',title:'Dùng ảnh này làm ảnh đại diện khi xuất file',onclick:()=>qxSetRep(x.p,x.f)},'Đại diện'),h('button',{class:'btn sm',title:'Không gom lỗi này vào nhóm',onclick:()=>qxSplit(x.p,x.f)},'Tách'))))),
        h('div',{class:'qxgf'},h('button',{class:'btn sm good',onclick:()=>qxConfirm(g)},okN===g.items.length?'✓ Đã xác nhận cả nhóm':'Xác nhận cả nhóm'),h('button',{class:'btn sm',onclick:()=>{qxUnify(g);toast(`Đã thống nhất mã ${R.req||R.code||''}, mức ${g.sev} cho cả nhóm.`);qxRefresh()}},'Thống nhất mã và mức độ')))}));
}
{const _rt=renderTable;renderTable=function(){_rt();try{if(iTyping())return;let box=$('qxGrp');if(!box){box=h('div',{id:'qxGrp'});$('tSel').before(box)}const pn=qxPanel();box.replaceChildren(...(pn?[pn]:[]))}catch(e){console.warn(e)}}}
{const _ral=renderAllList;renderAllList=function(){_ral();try{if(iTyping())return;const pn=qxPanel();if(!pn)return;const L=$('list'),t=L.querySelector('.atool');t?t.after(pn):L.prepend(pn)}catch(e){console.warn(e)}}}
{const _dt=dupTag;dupTag=function(p,f){const a=_dt(p,f),g=qxGroupOf(f);
  const fx=f&&f.qxFix?h('span',{class:'tag qxfx',title:`AI chọn ${[f.qxFix.rule||'KHAC',f.qxFix.req||f.qxFix.code,f.qxFix.sev].filter(Boolean).join(' / ')}; app sửa theo bảng quy tắc thành ${f.rule} (${f.req||f.code}, ${f.sev})`},'Đã chỉnh mã theo bảng quy tắc'):null;
  const gt=g?h('span',{class:'tag qxg',title:'Khu vực: '+qxAreas(g.items).join('; ')},`Lặp lại · ${g.items.length} vị trí`):null;
  if(!fx&&!gt)return a;return h('span',{class:'qxtags'},a,gt,fx)}}

/* Xuất Findings: mỗi nhóm một dòng, chỉ chèn ảnh đại diện */
{const _ga=gather;gather=function(){
  const base=_ga();if(!QX.exp||!QX.cfg.groupExport||!QX.cfg.group)return base;
  const gs=qxGroups(true);if(!gs.length)return base;
  const drop=new Set(),repl=new Map();
  for(const g of gs){for(const x of g.items)if(x!==g.rep)drop.add(x.f);
    const R=g.rep.f,areas=qxAreas(g.items);
    repl.set(R,{...R,sev:g.sev,mand:g.items.some(x=>x.f.mand)||R.mand,title:`${str(R.title).replace(/[.。\s]+$/,'')} (lặp lại tại ${g.items.length} vị trí: ${areas.join('; ')})`})}
  return base.map(G=>({p:G.p,items:G.items.filter(x=>!drop.has(x.f)).map(x=>repl.has(x.f)?{f:repl.get(x.f),n:x.n}:x)})).filter(G=>G.items.length);
}}
{const _ef=exportFindings;exportFindings=async function(...a){QX.exp=true;try{return await _ef.apply(this,a)}finally{QX.exp=false}}}
QX.preview=()=>{QX.exp=true;try{return gather().map(G=>({photo:G.p.name,area:G.p.area,items:G.items.map(x=>({n:x.n,title:x.f.title,req:x.f.req,sev:x.f.sev}))}))}finally{QX.exp=false}};

/* ---------- Cài đặt ---------- */
{const card=$('setAIcard')||$('setAI');if(card){
  const opt=(k,label,hint)=>h('label',{class:'aixo'},h('input',{type:'checkbox',checked:!!QX.cfg[k],onchange:e=>{QX.cfg[k]=e.target.checked;QX.save();QXG=null;toast(`${label}: ${e.target.checked?'bật':'tắt'}.`);if(k==='group'||k==='groupExport')qxRefresh()}}),h('span',null,h('b',null,label),h('small',null,hint)));
  card.append(h('div',{class:'aixbox'},h('h4',null,'Kiểm soát chất lượng kết quả'),
    opt('rules','Bảng quy tắc mã và mức độ','Nội dung lỗi khớp loại lỗi trong danh mục (ví dụ chắn lối thoát hiểm, bình chữa cháy quá hạn) mà AI chọn sai nhóm thì app tự sửa mã RBA, ID yêu cầu và mức độ theo danh mục.'),
    opt('ground','AI chỉ ra vật thể trước khi kết luận','AI liệt kê vật thể nhìn thấy, mỗi lỗi phải gắn vật thể làm bằng chứng; lỗi không gắn được bị loại. Khung lỗi bám sát vật thể.'),
    opt('dupImg','Loại ảnh trùng khi tải lên','Ảnh giống hệt ảnh đã có: tự bỏ qua. Ảnh gần giống (chụp lại cùng chỗ): hỏi giữ hay bỏ.'),
    opt('group','Gom lỗi lặp lại ở nhiều vị trí','Cùng loại lỗi ở nhiều ảnh được gom thành nhóm, thống nhất mã và mức độ, xác nhận một lần.'),
    opt('groupExport','Xuất mỗi nhóm thành 1 dòng','Trong file Findings, nhóm lỗi lặp lại ghi 1 dòng kèm số vị trí và khu vực, chỉ chèn ảnh đại diện.')))}}
