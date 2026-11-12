/* ================= Tăng độ chính xác AI (v1.4) =================
   Gắn vào app qua patch_ai.py, chạy trong cùng phạm vi với mã app và cloud.js.
   1. Danh sách kiểm tra theo khu vực, mốc mức độ, quy tắc chọn mã, mẫu khắc phục: bổ sung vào lời nhắc.
   2. Học chung cả đội: lấy lỗi đã xác nhận trên máy chủ (cùng khu vực, cùng đối tác) làm mẫu.
   3. AI tự kiểm tra lại: sau khi soát, gửi ảnh có khung đánh số + ảnh phóng to từng lỗi để AI xác nhận, sửa mã, mức độ, mô tả; loại lỗi không chắc; bổ sung lỗi rõ ràng bị sót.
   4. Cố định cách trả lời: giảm độ ngẫu nhiên (Gemini 2.x), đọc ảnh độ phân giải cao.
   5. Ghi nhận quyết định của người đánh giá (giữ, sửa, loại, bỏ sót) lên máy chủ để thống kê độ chính xác theo mã. */
const AIX={
  cfg:Object.assign({verify:true,team:true,owner:true,det:true,hires:true},(()=>{try{return JSON.parse(localStorage.getItem('soat-ehs-aix')||'{}')}catch{return{}}})()),
  mr:localStorage.getItem('soat-ehs-aix-mr')!=='0',detOk:localStorage.getItem('soat-ehs-aix-det')!=='0',
  save(){try{localStorage.setItem('soat-ehs-aix',JSON.stringify(this.cfg))}catch{}},
  gen(model,o){
    const g={};
    if(this.cfg.det&&this.detOk&&/gemini-(1|2)\./.test(model)){g.temperature=0.2;g.topP=0.8;g.seed=17}
    if(this.mr&&o&&o.images&&o.images.length)g.mediaResolution='MEDIA_RESOLUTION_HIGH';
    return g;
  },
  genFail(m){
    m=String(m||'');
    if(this.mr&&/media.?resolution/i.test(m)){this.mr=false;try{localStorage.setItem('soat-ehs-aix-mr','0')}catch{}return true}
    if(this.detOk&&/seed|temperature|top.?p/i.test(m)){this.detOk=false;try{localStorage.setItem('soat-ehs-aix-det','0')}catch{}return true}
    return false;
  }
};
window.__AIX=AIX;

/* ---------- 1. Danh sách kiểm tra theo khu vực ---------- */
const AREA_CK=[
  {n:'Kho hóa chất, khu pha chế, tủ hóa chất',k:/h[oó]a ch[aấ]t|chemical|dung m[oô]i|s[oơ]n|pha ch[eế]|msds|gas|x[aă]ng|d[aầ]u/i,i:[
    'Nhãn GHS trên từng can, thùng, bình chiết (tên, hình đồ cảnh báo, từ cảnh báo); bình chiết nhỏ không nhãn','Khay hoặc bờ chống tràn đủ dung tích; can đặt trực tiếp xuống sàn','Để chung hóa chất kỵ nhau (axit với bazơ, chất oxy hóa với chất dễ cháy)',
    'Nắp đậy kín, vết tràn đổ, vết ăn mòn trên kệ, sàn','Bộ ứng phó tràn đổ, vòi rửa mắt hoặc tắm khẩn cấp: có, còn nước, lối tới không bị chắn','MSDS hoặc SDS tiếng Việt tại chỗ (chỉ khi thấy rõ trong ảnh)',
    'Thiết bị điện, công tắc gần hơi dung môi; nguồn nhiệt, tia lửa','Biển cấm lửa, cảnh báo, PPE bắt buộc','Thông gió, quạt hút hoạt động (nhìn thấy bị chắn, hỏng)','Thùng chứa giẻ dính hóa chất có nắp']},
  {n:'Tủ điện, phòng điện, trạm biến áp',k:/t[uủ] đi[eệ]n|ph[oò]ng đi[eệ]n|đi[eệ]n|electric|panel|mcc|ats|tr[aạ]m bi[eế]n|ổ c[aắ]m|d[aâ]y đi[eệ]n/i,i:[
    'Cửa tủ mở, không khóa; thiếu tấm che thanh cái, đầu cốt hở','Nhãn cảnh báo điện giật, sơ đồ một sợi, nhãn tên mạch cho áp tô mát','Vật lạ trong tủ (bu lông, giẻ, giấy, bụi, côn trùng); vết cháy sém, đổi màu',
    'Dây đi tự do, không ống luồn, mối nối quấn băng keo, ổ cắm nối tiếp nhiều tầng','Tiếp địa vỏ tủ, dây tiếp địa đứt','Thảm cách điện trước tủ; khoảng trống trước tủ ≥ 1 m bị chắn',
    'Lỗ luồn cáp không bịt kín (chuột, nước)','Bình chữa cháy CO2 gần phòng điện','Đồ dễ cháy để trong phòng điện']},
  {n:'Máy nén khí, bình chịu áp lực, nồi hơi, bình khí',k:/kh[ií] n[eé]n|compressor|n[oồ]i h[oơ]i|boiler|b[iì]nh (kh[ií]|ch[iị]u [aá]p|gas|oxy|argon|co2)|chai kh[ií]|[aá]p l[uự]c/i,i:[
    'Tem kiểm định còn hạn (đọc ngày, so ngày audit), van an toàn, đồng hồ áp suất có vạch đỏ','Bình khí đứng không xích, không nắp chụp van; để chung bình đầy và rỗng, oxy cạnh khí cháy',
    'Rò rỉ dầu, nước ngưng dưới máy; ống mềm nứt, buộc dây thép','Che chắn dây đai, quạt; biển cảnh báo nhiệt, tiếng ồn','Đường ống không nhãn môi chất, chiều dòng chảy']},
  {n:'Xưởng sản xuất, máy móc, dây chuyền',k:/x[uư][oở]ng|m[aá]y|line|chuy[eề]n|d[aậ]p|press|cnc|ti[eệ]n|phay|m[aà]i|c[aắ]t|h[aà]n|production|s[aả]n xu[aấ]t|robot|băng t[aả]i/i,i:[
    'Che chắn bộ phận chuyển động (dây đai, bánh răng, trục, lưỡi cắt, điểm kẹp); che chắn bị tháo, buộc tạm','Nút dừng khẩn cấp: có, nhìn thấy, không bị che; rèm an toàn, khóa liên động bị vô hiệu',
    'Khóa và treo thẻ (LOTO) khi bảo trì','PPE theo biển báo: kính, nút tai, găng tay (không đeo găng gần máy quay), giày, tóc dài, quần áo rộng','Vạch kẻ lối đi, khu vực máy; vật liệu lấn lối đi',
    'Dầu tràn, phoi, nước trên sàn gây trơn trượt','Dây hơi, dây điện vắt ngang lối đi','Tư thế làm việc, nâng vác vật nặng, ghế làm việc','Hàn cắt: tấm chắn hồ quang, bình chữa cháy, vật dễ cháy trong bán kính 11 m']},
  {n:'Kho hàng, kệ, xe nâng, bốc xếp',k:/kho|k[eệ]|pallet|xe n[aâ]ng|forklift|warehouse|b[oố]c x[eế]p|dock|h[aà]ng h[oó]a/i,i:[
    'Kệ: tải trọng cho phép, thanh giằng, chân kệ móp, neo sàn; hàng xếp quá đầu kệ, nhô ra ngoài','Chiều cao xếp chồng, khoảng cách tới đầu phun sprinkler, đèn (≥ 0,5 m)',
    'Pallet gãy, hàng nghiêng dễ đổ','Xe nâng: tem kiểm định, còi, đèn, gương, dây an toàn, sạc ắc quy có thông gió','Lối đi bộ tách khỏi lối xe nâng, gương cầu ở góc khuất',
    'Bình chữa cháy, tủ chữa cháy, lối thoát nạn bị hàng che chắn']},
  {n:'Lối thoát nạn, hành lang, cầu thang, PCCC',k:/l[oố]i tho[aá]t|tho[aá]t n[aạ]n|exit|h[aà]nh lang|c[aầ]u thang|pccc|ch[uữ]a ch[aá]y|fire|b[aá]o ch[aá]y|sprinkler/i,i:[
    'Cửa thoát nạn bị khóa, chèn, chắn; cửa mở ngược chiều thoát','Đèn EXIT, đèn sự cố: có, sáng, đúng hướng','Sơ đồ thoát nạn đúng vị trí "bạn đang ở đây"',
    'Bình chữa cháy: tem kiểm tra tháng, kim đồng hồ ở vùng xanh, chốt niêm phong, độ cao treo, bị che chắn','Tủ chữa cháy: đủ lăng vòi, không chứa đồ khác, không bị chắn','Đầu báo khói, sprinkler bị che, sơn phủ, treo đồ',
    'Tay vịn cầu thang, bậc trơn, vật để trên bậc','Cửa ngăn cháy chèn mở']},
  {n:'Nhà ăn, bếp, kho thực phẩm',k:/nh[aà] [aă]n|b[eế]p|canteen|kitchen|th[uự]c ph[aẩ]m|food|c[aơ]m/i,i:[
    'Thực phẩm để trực tiếp sàn, không nhãn, quá hạn; sống chín để chung','Nhiệt độ tủ lạnh, tủ đông; thực phẩm để ngoài không che','Bình gas: van, dây dẫn nứt, để trong khu kín, gần nguồn nhiệt',
    'Chụp hút khói bám dầu mỡ (nguy cơ cháy), hệ thống chữa cháy bếp','Côn trùng, động vật gây hại, lưới chắn','Người chế biến không mũ, tạp dề, găng tay, khẩu trang',
    'Thớt, dao phân biệt sống chín; thùng rác có nắp','Sàn trơn, thoát nước tắc']},
  {n:'Nhà vệ sinh, ký túc xá, phòng thay đồ, tiện nghi',k:/v[eệ] sinh|toilet|wc|k[yý] t[uú]c|dorm|thay đ[oồ]|locker|nh[aà] t[aắ]m/i,i:[
    'Sạch sẽ, nước, xà phòng, giấy, thùng rác có nắp','Riêng nam nữ, khóa cửa từ bên trong','Ký túc xá: số người trên phòng, giường tầng có lan can, lối thoát nạn, bình chữa cháy, sạc điện, nấu ăn trong phòng',
    'Ổ cắm, dây điện gần nguồn nước','Thông gió, ánh sáng']},
  {n:'Khu chất thải, rác thải nguy hại',k:/r[aá]c|ch[aấ]t th[aả]i|waste|ph[eế] li[eệ]u|scrap|nguy h[aạ]i/i,i:[
    'Phân loại: thông thường, tái chế, nguy hại để riêng','Nhãn, mã chất thải nguy hại, biển cảnh báo trên thùng, khu chứa','Thùng có nắp, mái che, sàn chống thấm, gờ chống tràn',
    'Chất thải nguy hại (giẻ dầu, bóng đèn, ắc quy, can hóa chất) lẫn rác thường','Tràn đổ, nước rỉ rác chảy ra cống mưa','Bình chữa cháy khu chứa']},
  {n:'Xử lý nước thải, môi trường, khí thải',k:/n[uư][oớ]c th[aả]i|wwtp|x[uử] l[yý] n[uư][oớ]c|kh[ií] th[aả]i|ống kh[oó]i|m[oô]i tr[uư][oờ]ng|c[oố]ng/i,i:[
    'Bể hở không lan can, nắp hố ga hở','Hóa chất xử lý không nhãn, không khay','Nước thải màu lạ, tràn bể, đường xả tắt','Cống mưa nhận nước thải, dầu','Ống khói, quạt hút hỏng, bụi phát tán']},
  {n:'Văn phòng',k:/v[aă]n ph[oò]ng|office|ph[oò]ng h[oọ]p/i,i:[
    'Ổ cắm nối tiếp, dây điện dưới thảm, ổ quá tải','Lối thoát nạn bị bàn ghế, thùng giấy chắn','Đồ đặt trên nóc tủ cao dễ rơi','Bình chữa cháy, đèn sự cố','Ghế hỏng, màn hình tư thế']},
  {n:'Phòng y tế, sơ cứu',k:/y t[eế]|s[oơ] c[uứ]u|first aid|clinic/i,i:[
    'Tủ sơ cứu đủ vật tư theo danh mục, thuốc còn hạn (đọc hạn trên hộp)','Cáng, băng ca, vòi rửa mắt','Rác y tế để riêng, thùng vật sắc nhọn']},
  {n:'Làm việc trên cao, giàn giáo, mái, thang',k:/tr[eê]n cao|gi[aà]n gi[aá]o|scaffold|m[aá]i|thang|height|lan can/i,i:[
    'Dây đai an toàn toàn thân, móc vào điểm neo chắc, hai móc','Lan can, tấm chắn chân tại mép sàn, lỗ mở sàn không che','Giàn giáo: thẻ kiểm tra, mâm đủ, giằng chéo, chân đế',
    'Thang chữ A mở hết, không đứng bậc trên cùng, thang tự chế','Vật dụng để trên cao dễ rơi, khu vực dưới không rào chắn']}
];
function areaLists(text){
  const t=String(text||'');const hit=AREA_CK.filter(a=>a.k.test(t)).slice(0,2);
  if(!hit.length)return `DANH SÁCH KIỂM TRA THEO KHU VỰC\nChưa rõ loại khu vực. Trước tiên xác định khu vực trong ảnh (kho hóa chất, tủ điện, xưởng máy, kho kệ, lối thoát nạn, nhà ăn, nhà vệ sinh, khu chất thải, văn phòng...), rồi rà theo các mục điển hình của khu vực đó.\n\n`;
  return `DANH SÁCH KIỂM TRA THEO KHU VỰC (rà từng mục; mục nào nhìn thấy vi phạm thì báo, mục không nhìn thấy thì bỏ qua, không suy đoán)\n${hit.map(a=>`[${a.n}]\n${a.i.map(x=>`- ${x}`).join('\n')}`).join('\n')}\n\n`;
}
const AIX_RULES=()=>`QUY TẮC CHỌN MÃ
- Chọn id theo VẬT THỂ chính bị vi phạm, không theo tên khu vực. Ví dụ: bình chữa cháy hết hạn trong kho hóa chất thuộc nhóm PCCC; dây điện hở trong nhà ăn thuộc nhóm điện; can hóa chất không nhãn ở xưởng thuộc nhóm hóa chất.
- Lỗi về ngày trên tem, nhãn, thẻ kiểm tra dùng nhóm tem nhãn và thời hạn; lỗi thiếu biển cảnh báo dùng nhóm biển báo chỉ khi không có nhóm chuyên biệt phù hợp hơn.
- Hai id cùng khớp: chọn id có "dấu hiệu" trùng nhiều chi tiết nhìn thấy nhất. Không chắc giữa hai mã: chọn mã của mối nguy nặng hơn và nêu chi tiết trong evidence.
- Không dùng KHAC khi danh mục đã có id khớp.

MỐC MỨC ĐỘ (đối chiếu trước khi chọn)
- Priority: lối thoát nạn bị khóa hoặc chặn hoàn toàn; phần mang điện hở có thể chạm tới; làm việc trên cao không chống rơi; bộ phận chuyển động nguy hiểm không che chắn khi máy đang chạy; chất dễ cháy cạnh nguồn lửa, tia lửa; bình khí nén đổ, rò khí.
- Major: bình chữa cháy bị che chắn, hết hạn kiểm tra; tủ điện không khóa, thiếu nhãn cảnh báo; hóa chất không nhãn GHS hoặc không khay chống tràn; thiếu PPE bắt buộc; tem kiểm định quá hạn; chất thải nguy hại lẫn rác thường; lối thoát nạn bị thu hẹp.
- Minor: biển báo mờ, bong một phần; sắp xếp chưa gọn nhưng không chắn lối; vệ sinh chưa sạch; nhãn còn đọc được nhưng cũ; thiếu sót nhỏ sửa ngay được.

`;
const AIX_FIX=()=>`CÁCH VIẾT KHẮC PHỤC
- "fix_now": việc làm ngay trong ca tại đúng vị trí, nêu đúng vật thể. Ví dụ: "Dọn 3 thùng carton chắn cửa thoát nạn số 2, giữ trống 1 m". Không viết "tăng cường", "chú ý", "nhắc nhở" chung chung.
- "fix_root": biện pháp triệt để ngăn tái diễn, chọn bậc cao nhất khả thi theo thứ bậc: loại bỏ → thay thế → biện pháp kỹ thuật (che chắn, khóa liên động, khay, giá cố định) → hành chính (quy trình, vạch kẻ, kiểm tra định kỳ, đào tạo) → PPE. Nêu rõ cái gì, ở đâu.${AIX.cfg.owner?`
- Cuối "fix_root" ghi thêm "(Phụ trách: <bộ phận>; Hạn: <thời hạn>)". Bộ phận: Bảo trì cho thiết bị, điện, kết cấu; EHS cho PCCC, hóa chất, biển báo, chất thải; Bộ phận sử dụng khu vực cho sắp xếp, hành vi, PPE; Hành chính cho nhà ăn, vệ sinh, ký túc xá. Hạn: Priority "trong ca"; Major "7 ngày"; Minor "30 ngày".`:''}

`;

/* ---------- 2. Học chung cả đội ---------- */
const EXC=new Map();
async function teamExamples(area,note){
  if(!AIX.cfg.team||typeof clOn!=='function'||!clOn()||NET.off||!navigator.onLine)return '';
  const vendor=($('mUnit').value||'').trim(),key=`${area}|${vendor}|${note||''}`.toLowerCase();
  let c=EXC.get(key);
  if(!c||Date.now()-c.at>600000){
    try{const q=new URLSearchParams({area:area||'',vendor,q:note||'',n:'24'});
      const r=await Promise.race([api('GET','/api/ai/examples?'+q),new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),3500))]);
      c={at:Date.now(),list:r.examples||[]};EXC.set(key,c)}catch{return c?fmtEx(c.list):''}
  }
  return fmtEx(c.list);
}
function fmtEx(list){
  if(!list||!list.length)return '';
  const cut=(t,n)=>t&&t.length>n?t.slice(0,n-1)+'…':(t||'');
  return `MẪU LỖI ĐÃ ĐƯỢC NGƯỜI ĐÁNH GIÁ CỦA ĐỘI XÁC NHẬN (ưu tiên cùng khu vực, cùng đối tác; dùng làm chuẩn chọn mã, mức độ, văn phong và cách khắc phục; ảnh có tình huống tương tự thì báo đúng như mẫu)
${list.map(x=>`- [${x.req||x.code||'?'} | ${x.sev||'?'}${x.kind==='hazard'?' | mối nguy':''}] ${cut(x.title,160)}${x.area?` (khu: ${cut(x.area,40)})`:''}${x.vendor?' (cùng đối tác)':''}${x.from?` — AI từng gán ${[x.from.code,x.from.sev].filter(Boolean).join('/')} và đã được sửa thành ${[x.code,x.sev].filter(Boolean).join('/')}`:''}${x.fixNow?` → ngay: ${cut(x.fixNow,100)}`:''}${x.fixRoot?`; triệt để: ${cut(x.fixRoot,120)}`:''}`).join('\n')}

`;
}

/* ---------- 3. Ảnh gửi AI ---------- */
const BLOBP=new WeakMap();
async function hiBlob(p,side){const im=await ensureImg(p),k=Math.min(1,side/Math.max(p.w,p.h)),c=mk(p.w*k,p.h*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);return toBlob(c,'image/jpeg',.9)}
{const _ab=aiBlob;aiBlob=async function(p,f){const b=(!f&&AIX.cfg.hires&&tier()==='complex')?await hiBlob(p,2400):await _ab(p,f);try{BLOBP.set(b,p)}catch{}return b}}
const boxOk=b=>Array.isArray(b)&&b.length>=4&&b.slice(0,4).every(v=>Number.isFinite(Number(v)));
const box2=a=>{if(a&&Array.isArray(a.box_2d)&&a.box_2d.length>=4){const[y1,x1,y2,x2]=a.box_2d.map(Number);if([y1,x1,y2,x2].every(Number.isFinite))a.box=[x1,y1,x2,y2]}return a};
async function annotated(p,fs){
  const im=await ensureImg(p),k=Math.min(1,1600/Math.max(p.w,p.h)),c=mk(p.w*k,p.h*k),g=c.getContext('2d');g.drawImage(im,0,0,c.width,c.height);
  const lw=Math.max(3,c.width/300),fz=Math.max(18,Math.round(c.width/45));g.font=`bold ${fz}px sans-serif`;g.textBaseline='top';
  fs.forEach((a,i)=>{if(!boxOk(a.box))return;const[x1,y1,x2,y2]=a.box.map(Number),X=Math.min(x1,x2)/1000*c.width,Y=Math.min(y1,y2)/1000*c.height,W=Math.abs(x2-x1)/1000*c.width,H=Math.abs(y2-y1)/1000*c.height;
    g.lineWidth=lw;g.strokeStyle='#FF00C8';g.strokeRect(X,Y,W,H);const t=String(i+1),tw=g.measureText(t).width+fz*.6;g.fillStyle='#FF00C8';g.fillRect(X,Math.max(0,Y-fz*1.2),tw,fz*1.2);g.fillStyle='#fff';g.fillText(t,X+fz*.3,Math.max(0,Y-fz*1.2)+fz*.1)});
  return toBlob(c,'image/jpeg',.88);
}
async function zoomBlob(p,b){
  const im=await ensureImg(p),[x1,y1,x2,y2]=b.map(Number),bx=Math.min(x1,x2)/1000*p.w,by=Math.min(y1,y2)/1000*p.h,bw=Math.abs(x2-x1)/1000*p.w,bh=Math.abs(y2-y1)/1000*p.h;
  const pad=Math.max(bw,bh)*.25+20,x=Math.max(0,bx-pad),y=Math.max(0,by-pad),w=Math.min(p.w-x,bw+2*pad),hh=Math.min(p.h-y,bh+2*pad);
  if(w<8||hh<8)return null;const k=Math.min(1280/Math.max(w,hh),3),c=mk(w*k,hh*k);c.getContext('2d').drawImage(im,x,y,w,hh,0,0,c.width,c.height);return toBlob(c,'image/jpeg',.9);
}

/* ---------- 4. Bổ sung lời nhắc và AI tự kiểm tra lại ---------- */
const TASK='\nNHIỆM VỤ\n';
async function augment(prompt,p){
  const k=prompt.indexOf(TASK);if(k<0||!/DANH MỤC LỖI/.test(prompt))return prompt;
  const area=p?String(p.area||''):'',note=p?String(p.note||''):'',scene=p&&p.analysis?String(p.analysis.scene||''):'';
  const blk=areaLists(`${area} ${note} ${scene}`)+(await teamExamples(area,note))+AIX_RULES()+AIX_FIX();
  return prompt.slice(0,k)+'\n'+blk+prompt.slice(k);
}
async function verifyWhole(prompt,o,data,p){
  if(!AIX.cfg.verify||tier()==='quick'||!p||!data||!Array.isArray(data.findings)||!data.findings.length)return data;
  const fs=data.findings.slice(0,10),k=prompt.indexOf(TASK);if(k<0)return data;
  const ov=$('ovMsg');if(ov&&!$('ov').hidden)ov.textContent=`AI đang kiểm tra lại ${fs.length} lỗi…`;
  try{
    const imgs=[await annotated(p,fs)],zi=[];
    for(let i=0;i<fs.length&&zi.length<6;i++)if(boxOk(fs[i].box)){const z=await zoomBlob(p,fs[i].box);if(z){imgs.push(z);zi.push(i+1)}}
    const list=fs.map((a,i)=>({i:i+1,rule:a.rule||'',rba_code:a.rba_code||'',title:a.title||'',evidence:a.evidence||'',kind:a.kind||'',severity:a.severity||'',confidence:a.confidence}));
    const task=`${TASK}KIỂM TRA LẠI KẾT QUẢ SOÁT ẢNH. Ảnh 1 là toàn cảnh, các lỗi AI đã đề xuất được khoanh khung hồng và đánh số. ${zi.length?zi.map((n,j)=>`Ảnh ${j+2} là ảnh phóng to lỗi số ${n}.`).join(' '):''} Khung và số do ứng dụng vẽ, không phải vật thể hiện trường.
Với TỪNG lỗi trong danh sách dưới đây, làm lần lượt:
1. Nhìn kỹ ảnh phóng to: lỗi có thật và nhìn thấy rõ không? Không thấy rõ, chỉ là suy đoán, nhầm vật thể, hoặc cần hồ sơ mới kết luận được: "keep": false và nêu lý do ngắn ở "reason".
2. Kiểm tra id trong danh mục (hoặc mã khi KHAC) theo QUY TẮC CHỌN MÃ; sai thì ghi id đúng.
3. Kiểm tra mức độ theo MỐC MỨC ĐỘ và tiêu chí MỨC ĐỘ; sai thì ghi mức đúng.
4. Viết lại "title" và "evidence" cụ thể: vật thể, vị trí trong ảnh, số lượng, chữ hoặc ngày đọc được. Không viết chung chung.
5. Viết lại "fix_now", "fix_root" theo CÁCH VIẾT KHẮC PHỤC, bám đúng hiện trạng.
6. "box": chỉ sửa khi khung lệch khỏi vật thể; [x1,y1,x2,y2] thang 0 đến 1000 trên ảnh 1.
Sau đó nhìn lại toàn bộ ảnh 1 theo DANH SÁCH KIỂM TRA THEO KHU VỰC: lỗi nhìn thấy RÕ RÀNG mà danh sách chưa có thì ghi vào "missed" (tối đa 3, confidence từ 70 trở lên, không trùng lỗi đã có). Không chắc thì không ghi.
${ctx(p)}

DANH SÁCH LỖI CẦN KIỂM TRA
${JSON.stringify(list)}

Chỉ trả về một JSON:
{"findings":[{"i":1,"keep":true,"reason":"",${FIND},"box":[0,0,0,0]}],"missed":[{${FIND},"box":[0,0,0,0]}]}`;
    const r=await API_SAMPLE.json(prompt.slice(0,k)+task,{...o,images:imgs,onText:null,__aixInner:true});
    if(!r||!Array.isArray(r.findings))return data;
    const out=[],gone=[];
    fs.forEach((a,i)=>{const c=r.findings.find(x=>x&&Number(x.i)===i+1);if(!c){out.push(a);return}
      if(c.keep===false){gone.push(`AI kiểm tra lại đã loại: ${a.title}${c.reason?` (${str(c.reason)})`:''}`);return}
      const m={...a};for(const[key,v]of Object.entries(c)){if(['i','keep','reason','box_2d'].includes(key))continue;if(key==='box'){if(boxOk(v)&&v.some(n=>Number(n)>0))m.box=v;continue}if(v!==''&&v!=null)m[key]=v}
      out.push(m)});
    for(const a of(Array.isArray(r.missed)?r.missed:[]).slice(0,3)){box2(a);if(a&&a.title&&(Number(a.confidence)||0)>=70&&boxOk(a.box))out.push(a)}
    data.findings=out;data.verify=[...gone.slice(0,3),...(data.verify||[])];data._aixChecked=fs.length;
    return data;
  }catch(e){if(e&&e.code==='cancelled')throw e;console.warn('AI kiểm tra lại lỗi',e);return data}
}
{const _json=API_SAMPLE.json;
  API_SAMPLE.json=async(i,o={})=>{
    if(o.__aixInner||typeof i!=='string'||!/DANH MỤC LỖI/.test(i))return _json(i,o);
    const p=o.images&&o.images[0]?BLOBP.get(o.images[0]):null;
    const whole=/\nNHIỆM VỤ\nSoát ảnh hiện trường/.test(i),Q=typeof qxPrompt==='function';
    const prompt=await augment(whole&&Q?qxPrompt(i):i,p);
    let d=await _json(prompt,o);
    if(whole&&Q)d=qxGround(d);
    return whole?verifyWhole(prompt,o,d,p):d;
  }}

/* ---------- 5. Ghi nhận quyết định để thống kê độ chính xác ---------- */
const AIEV={q:(()=>{try{return JSON.parse(localStorage.getItem('soat-ehs-aiev')||'[]')}catch{return[]}})(),t:0,
  push(e){if(!e)return;const m=(AILOG.find(x=>x.ok&&x.model)||{}).model||'';this.q.push({id:uid()+uid(),at:Date.now(),audit_id:(typeof CL!=='undefined'&&CL.audit&&CL.audit.id)||'',model:m,...e});if(this.q.length>500)this.q.splice(0,this.q.length-500);this.save();clearTimeout(this.t);this.t=setTimeout(()=>this.flush(),4000)},
  save(){try{localStorage.setItem('soat-ehs-aiev',JSON.stringify(this.q))}catch{}},
  async flush(){if(!this.q.length||typeof clOn!=='function'||!clOn()||NET.off||(CL.auth&&CL.auth.user&&CL.auth.user.role==='viewer')){if(CL.auth&&CL.auth.user&&CL.auth.user.role==='viewer'){this.q=[];this.save()}return}
    const b=this.q.slice(0,200);try{await api('POST','/api/ai/events',{events:b});this.q=this.q.slice(b.length);this.save()}catch{}}
};
{const _learn=learn;learn=function(f,p){
  try{if(p&&!p.sample&&!f.learned&&String(f.title||'').trim()){const area=(p.area||'').trim(),title=f.title.trim();
    if(f.src==='ai'&&f.ai0){const a=f.ai0,same=a.req===f.req&&a.code===f.code&&a.sev===f.sev;AIEV.push({t:same?'keep':'fix',code:f.code||'',sev:f.sev||'',from_code:a.code||'',from_sev:a.sev||'',area,title})}
    else if(f.src==='manual'&&p.analysis)AIEV.push({t:'miss',code:f.code||'',sev:f.sev||'',area,title})}}catch{}
  return _learn(f,p)}}
{const _add=Learn.add.bind(Learn);Learn.add=function(x){try{if(x&&(x.t==='reject'||x.t==='unclear'))AIEV.push({t:x.t,code:(x.to&&x.to.code)||'',sev:(x.to&&x.to.sev)||'',area:x.area||'',title:x.title||''})}catch{}return _add(x)}}
setInterval(()=>{if(!document.hidden)AIEV.flush()},60000);

/* ---------- Cài đặt ---------- */
{const card=$('setAIcard')||$('setAI');if(card){
  const opt=(k,label,hint)=>h('label',{class:'aixo'},h('input',{type:'checkbox',checked:!!AIX.cfg[k],onchange:e=>{AIX.cfg[k]=e.target.checked;AIX.save();toast(`${label}: ${e.target.checked?'bật':'tắt'}.`)}}),h('span',null,h('b',null,label),h('small',null,hint)));
  card.append(h('div',{class:'aixbox'},h('h4',null,'Nâng cao độ chính xác'),
    opt('verify','AI tự kiểm tra lại','Sau khi soát, AI phóng to từng lỗi để xác nhận, sửa mã, mức độ, loại lỗi không chắc. Thêm 1 lượt gọi AI mỗi ảnh (không áp dụng ở chế độ Nhanh).'),
    opt('team','Học từ lỗi cả đội đã xác nhận','Dùng lỗi đã xác nhận trên hệ thống (cùng khu vực, cùng đối tác) làm mẫu. Cần đăng nhập và có mạng.'),
    opt('owner','Ghi bộ phận phụ trách và thời hạn','Thêm "(Phụ trách: …; Hạn: …)" vào cuối khắc phục triệt để, theo mức độ.'),
    opt('hires','Ảnh nét hơn ở chế độ Kỹ','Gửi ảnh 2400 px để đọc rõ tem, nhãn, ngày tháng, vật nhỏ.'),
    opt('det','Kết quả ổn định','Giảm độ ngẫu nhiên để cùng một ảnh soát nhiều lần cho kết quả giống nhau.')))}}

/* ---------- Quản trị: độ chính xác AI ---------- */
function clAdmAI(){
  const A=CL.adm;A.aiDays=A.aiDays||90;
  if(!A.ai||A.ai.days!==A.aiDays){api('GET','/api/admin/ai-stats?days='+A.aiDays).then(r=>{A.ai=r;renderAdmin()}).catch(e=>{A.ai={days:A.aiDays,err:e.message};renderAdmin()});
    return h('div',null,h('p',{class:'hint'},'Đang tải thống kê…'))}
  const S0=A.ai;if(S0.err)return h('div',null,h('p',{class:'hint'},S0.err));
  const T={};for(const r of S0.totals||[])T[r.t]=r.n;const dec=(T.keep||0)+(T.fix||0)+(T.reject||0)+(T.unclear||0);const pc=n=>dec?Math.round(n*100/dec)+'%':'—';
  const by={};for(const r of S0.by_code||[]){const c=r.c||'(chưa có mã)';by[c]=by[c]||{keep:0,fix:0,reject:0,unclear:0,miss:0};by[c][r.t]=(by[c][r.t]||0)+r.n}
  const rows=Object.entries(by).map(([c,v])=>({c,...v,tot:v.keep+v.fix+v.reject+v.unclear})).sort((a,b)=>b.tot-a.tot||b.miss-a.miss);
  const acc=r=>r.tot?Math.round(r.keep*100/r.tot):null;
  const per=h('select',{'aria-label':'Khoảng thời gian',onchange:e=>{A.aiDays=Number(e.target.value);A.ai=null;renderAdmin()}},...[[30,'30 ngày'],[90,'90 ngày'],[365,'12 tháng'],[3650,'Toàn bộ']].map(([d,l])=>h('option',{value:d,selected:A.aiDays===d},l)));
  const cards=h('div',{class:'clstats'},...[['Đề xuất đã xử lý',dec,''],['Giữ nguyên',pc(T.keep||0),`${T.keep||0} lỗi`],['Sửa mã hoặc mức độ',pc(T.fix||0),`${T.fix||0} lỗi`],['Bắt nhầm (bị loại)',pc(T.reject||0),`${T.reject||0} lỗi`],['AI bỏ sót',T.miss||0,'người đánh giá tự thêm']].map(([a,b,c])=>h('div',{class:'dcard'},h('small',null,a),h('b',null,String(b)),c?h('small',null,c):null)));
  const tb=h('div',{class:'tscroll'},h('table',{class:'ftab cltab'},h('thead',null,h('tr',null,...['Mã','Đề xuất','Giữ','Sửa','Loại','Không rõ','Bỏ sót','Độ chính xác'].map(t=>h('th',null,t)))),
    h('tbody',null,...(rows.length?rows.map(r=>{const a=acc(r);return h('tr',null,h('td',null,h('b',null,r.c)),h('td',null,String(r.tot)),h('td',null,String(r.keep)),h('td',null,String(r.fix)),h('td',null,String(r.reject)),h('td',null,String(r.unclear)),h('td',null,String(r.miss)),
      h('td',null,a==null?'—':h('span',{class:'pill '+(a>=80?'okc':a>=60?'Minor':'Priority')},a+'%')))}):[h('tr',null,h('td',{colspan:8},'Chưa có dữ liệu. Thống kê có khi người đánh giá xác nhận, sửa hoặc loại lỗi AI đề xuất.'))]))));
  const ch=(S0.changes||[]).length?h('div',{class:'dcard'},h('h3',null,'AI hay gán sai thế nào'),h('ul',{class:'aixch'},...S0.changes.map(c=>h('li',null,h('span',null,[c.from_code,c.from_sev].filter(Boolean).join(' / ')||'—'),' → ',h('b',null,[c.code,c.sev].filter(Boolean).join(' / ')||'—'),h('small',null,` ${c.n} lần`))))):null;
  const TL={fix:'Sửa',reject:'Loại',miss:'Bỏ sót'};
  const rec=(S0.recent||[]).length?h('div',{class:'dcard'},h('h3',null,'Gần đây'),h('ul',{class:'aixch'},...S0.recent.slice(0,20).map(e=>h('li',null,h('span',{class:'pill '+(e.t==='fix'?'Minor':e.t==='reject'?'Priority':'wait')},TL[e.t]||e.t),' ',e.title||'',h('small',null,` · ${[e.t==='fix'?`${e.from_code||'?'}/${e.from_sev||'?'} → ${e.code||'?'}/${e.sev||'?'}`:[e.code,e.sev].filter(Boolean).join('/'),e.area,e.user_name,vnDT(e.at)].filter(Boolean).join(' · ')}`))))):null;
  const bm={};for(const r of S0.by_model||[]){bm[r.model]=bm[r.model]||{keep:0,fix:0,reject:0,unclear:0,miss:0};bm[r.model][r.t]=r.n}
  const md=Object.keys(bm).length?h('div',{class:'dcard'},h('h3',null,'Theo model AI'),h('ul',{class:'aixch'},...Object.entries(bm).map(([m,v])=>{const t=v.keep+v.fix+v.reject+v.unclear;return h('li',null,h('b',null,m),h('small',null,` ${t} đề xuất · giữ nguyên ${t?Math.round(v.keep*100/t):0}% · bị loại ${t?Math.round(v.reject*100/t):0}%`))}))):null;
  return h('div',null,h('div',{class:'dhead aixhd'},h('h2',null,'Độ chính xác AI'),h('span',{class:'spacer'}),per,h('button',{class:'btn',onclick:()=>{A.ai=null;renderAdmin()}},'Làm mới')),
    h('p',{class:'hint'},'Tính từ quyết định của người đánh giá: Giữ = xác nhận đúng như AI đề xuất; Sửa = đổi mã hoặc mức độ; Loại = không phải lỗi; Bỏ sót = người đánh giá tự thêm. Mã có độ chính xác thấp: bổ sung mẫu (nạp file Findings cũ, sửa và xác nhận đúng) để AI học, hoặc chỉnh tiêu chí trong Cài đặt.'),
    cards,tb,h('div',{class:'sgrid'},ch,md),rec);
}
