/* ======================================================================
   Audit RBA v1.6 — Bổ sung dữ liệu kiểm tra
   1. Tủ điện: danh sách kiểm tra chi tiết (đầu cos, cover, gỉ sét, ốc lỏng, nhãn aptomat, màu dây,
      tiếp địa, khóa, biển cảnh báo) và lỗi mới D14–D21
   2. Bảng tên người phụ trách: tủ điện (D14), tủ thiết bị, máy, kho, cửa kho bãi (NT1)
   3. Bảng tin: kết quả quan trắc môi trường lao động và các tài liệu phải niêm yết (BT1–BT6)
   Chèn sau ai-quality.js, trước "Khởi động".
   ====================================================================== */
const DX_LD=[["BH102","05","Luật 84/2015/QH13 — Điều 16, 18, 23; TT 25/2022/TT-BLĐTBXH — Điều 7."],["BM102","07","NĐ 62/2025/NĐ-CP — Điều 26–29; TCVN 9385:2012."]];
const DX_LI=[["BM301","02","Luật 84/2015/QH13 — Điều 16; Luật 55/2024/QH15 — Điều 20."]];
const DX_QT="Luật 84/2015/QH13 — Điều 18 khoản 2 (quan trắc môi trường lao động ít nhất 1 lần/năm), khoản 4 điểm a (ngay sau khi có kết quả, thông báo công khai cho người lao động tại nơi quan trắc).";
const dxR=(id,g,t,k,c,q,l,v,n,x,z,kd,lx)=>({id,g,t,k,c,q,l,v,n,x,o:'m',z,kd,lx});
const DX_G='Bảng tin, bảng tên & niêm yết';
const DX_RULES=[
  dxR('D14','Điện','Tủ điện thiếu bảng tên người phụ trách','mặt trước tủ có tên tủ, biển cảnh báo, phiếu kiểm tra nhưng không có bảng ghi họ tên, số điện thoại người phụ trách hoặc người quản lý tủ','BH102','BH102-01',DX_LD,'Minor',
    'Dán ngay bảng tên người phụ trách (họ tên, bộ phận, số điện thoại) lên cửa tủ, cạnh biển cảnh báo điện.',
    'Lập danh sách tủ điện và người phụ trách; dùng mẫu bảng tên thống nhất cho mọi tủ điện, tủ thiết bị; cập nhật khi đổi người; thêm mục "bảng tên người phụ trách" vào phiếu kiểm tra tủ điện hằng tháng.','Administrative','violation'),
  dxR('D15','Điện','Đầu dây không bấm đầu cos hoặc cos không phù hợp, thiếu ống lồng đánh số dây','dây mềm nhiều sợi cắm thẳng vào cực aptomat, cầu đấu; lõi đồng lòi ra ngoài cực; tuốt vỏ quá dài; một cực kẹp nhiều dây; dây không có ống lồng ghi số','BH102','BH102-01',DX_LD,'Minor',
    'Cắt nguồn, bấm cos pin hoặc cos chĩa đúng tiết diện cho từng đầu dây, siết lại cực đấu; lồng ống đánh số dây.',
    'Quy định đấu nối tủ điện: dây mềm phải bấm cos đúng cỡ bằng kìm chuyên dụng, mỗi cực một đầu cos, lồng số dây theo sơ đồ; nghiệm thu đấu nối sau mỗi lần sửa chữa.','Facility','hazard'),
  dxR('D16','Điện','Ốc siết đấu nối lỏng, thiếu ốc hoặc dây tuột khỏi cực đấu','vít cực aptomat, bu lông thanh cái lỏng hoặc thiếu; đầu dây tuột một phần khỏi cực; thiếu vít bắt tấm che, cửa tủ','BH102','BH102-01',DX_LD,'Major',
    'Cắt nguồn, siết lại toàn bộ vít, bu lông đấu nối; thay ốc thiếu, ốc gỉ.',
    'Siết lại lực các điểm đấu nối định kỳ 6 tháng và chụp ảnh nhiệt các điểm đấu nối hằng quý; đánh dấu sơn kiểm lực sau khi siết để phát hiện ốc xoay lỏng.','Facility','hazard'),
  dxR('D17','Điện','Màu dây không đúng quy ước, dây vàng-xanh (tiếp địa) dùng làm dây pha hoặc trung tính','dây sọc vàng-xanh đấu vào cực aptomat; dây pha, trung tính, tiếp địa lẫn màu, không phân biệt được','BH102','BH102-01',DX_LD,'Major',
    'Cắt nguồn, thay dây đúng màu theo chức năng; dây vàng-xanh chỉ đấu vào thanh tiếp địa PE.',
    'Áp dụng quy ước màu dây theo IEC 60445 (vàng-xanh chỉ dùng cho dây bảo vệ PE, xanh dương cho dây trung tính N); kiểm tra màu dây khi nghiệm thu tủ trước khi đóng điện.','Facility','hazard'),
  dxR('D18','Điện','Vỏ hoặc cửa tủ điện không có dây tiếp địa','cửa tủ có lắp đèn báo, nút bấm, thiết bị nhưng không có dây nối đất ở bản lề; dây tiếp địa vỏ tủ đứt, lỏng','BH102','BH102-01',DX_LD,'Major',
    'Lắp dây tiếp địa mềm nối cửa tủ với thân tủ và thanh PE.',
    'Đưa mục tiếp địa vỏ, cửa tủ vào phiếu kiểm tra tủ điện; đo điện trở nối đất định kỳ hằng năm.','Facility','hazard'),
  dxR('D19','Điện','Tủ điện thiếu sơ đồ một sợi hoặc sơ đồ đấu nối','mặt trong cửa tủ, túi tài liệu không có sơ đồ một sợi; sơ đồ cũ, không khớp aptomat thực tế','BH102','BH102-01',DX_LD,'Minor',
    'Dán sơ đồ một sợi bản hiện hành vào mặt trong cửa tủ.',
    'Cập nhật sơ đồ sau mỗi lần thay đổi mạch; người phụ trách tủ ký xác nhận ngày cập nhật.','Administrative','violation'),
  dxR('D20','Điện','Tủ điện thiếu biển cảnh báo nguy hiểm điện','mặt trước tủ, cửa phòng điện không có biển cảnh báo điện giật','BH102','BH102-01',DX_LD,'Major',
    'Dán biển "Nguy hiểm — Điện giật" song ngữ lên cửa tủ.',
    'Rà soát toàn bộ tủ điện, phòng điện theo danh sách; dùng biển bền (mica, nhôm) thay giấy; kiểm tra biển trong phiếu kiểm tra tủ hằng tháng.','Administrative','violation'),
  dxR('D21','Điện','Tủ điện không khóa, cửa tủ mở hoặc khóa hỏng','cửa tủ để mở, hé, không có khóa hoặc ổ khóa hỏng, chìa cắm sẵn','BH102','BH102-01',DX_LD,'Major',
    'Đóng cửa và khóa tủ ngay; giao chìa cho người phụ trách.',
    'Lắp khóa cho mọi tủ điện, quản lý chìa khóa theo danh sách; kiểm tra khóa tủ khi đi tuần ca.','Administrative','violation'),
  dxR('NT1',DX_G,'Tủ thiết bị, máy, kho, cửa kho bãi thiếu bảng tên người phụ trách','cửa kho, kho bãi, tủ điều khiển máy, tủ thiết bị, khu chứa không có bảng ghi họ tên, số điện thoại người phụ trách','BM301','BM301-01',DX_LI,'Minor',
    'Gắn bảng tên người phụ trách (họ tên, bộ phận, số điện thoại) tại cửa kho, mặt trước tủ hoặc thân máy.',
    'Ban hành danh sách khu vực, thiết bị và người phụ trách; mẫu bảng tên thống nhất; cập nhật khi thay người; kiểm tra trong đợt đi tuần 5S, EHS hằng tháng.','Administrative','violation'),
  dxR('BT1',DX_G,'Bảng tin không niêm yết kết quả quan trắc môi trường lao động','đọc được tiêu đề các tài liệu trên bảng tin nhưng không có kết quả quan trắc môi trường lao động (vi khí hậu, ánh sáng, tiếng ồn, bụi, hơi khí độc) năm gần nhất','BH401','BH401-03',[["BH401","04","Luật 84/2015/QH13 — Điều 18."]],'Minor',
    'Niêm yết ngay bản kết quả quan trắc môi trường lao động gần nhất (bảng tổng hợp kết quả, vị trí vượt chuẩn, biện pháp khắc phục) tại bảng tin khu vực được quan trắc.',
    'Quy định niêm yết kết quả quan trắc ngay sau khi nhận báo cáo hằng năm, kèm kế hoạch khắc phục vị trí không đạt; thêm mục "kết quả quan trắc" vào danh mục kiểm tra bảng tin hằng tháng.','Administrative','violation',[["BH401","04",DX_QT]]),
  dxR('BT2',DX_G,'Kết quả quan trắc niêm yết đã quá 12 tháng hoặc thiếu vị trí vượt chuẩn và biện pháp khắc phục','đọc được năm hoặc ngày trên bản kết quả quan trắc cách ngày đánh giá hơn 12 tháng; chỉ niêm yết trang bìa, không có bảng kết quả và biện pháp khắc phục','BH401','BH401-03',[["BH401","04","Luật 84/2015/QH13 — Điều 18."]],'Minor',
    'Thay bằng kết quả quan trắc năm gần nhất, gồm bảng kết quả, vị trí vượt chuẩn và biện pháp khắc phục.',
    'Lập lịch quan trắc hằng năm; khi nhận báo cáo mới, gỡ bản cũ và niêm yết bản mới trong 7 ngày; người phụ trách EHS ký ngày niêm yết.','Administrative','violation',[["BH401","04",DX_QT]]),
  dxR('BT3',DX_G,'Bảng tin thiếu thông tin an toàn bắt buộc (nội quy an toàn, số điện thoại khẩn cấp, đội sơ cứu, ứng cứu)','bảng tin đọc được tiêu đề các tài liệu nhưng không có nội quy an toàn vệ sinh lao động, số điện thoại khẩn cấp, danh sách đội sơ cứu, đội PCCC, ứng cứu','BM301','BM301-01',DX_LI,'Minor',
    'Niêm yết ngay nội quy an toàn, số điện thoại khẩn cấp (114, 115, số nội bộ) và danh sách đội sơ cứu, ứng cứu theo ca.',
    'Lập danh mục tài liệu bắt buộc của bảng tin; người phụ trách EHS kiểm tra, cập nhật hằng tháng và khi thay đổi nhân sự đội ứng cứu.','Administrative','violation'),
  dxR('BT4',DX_G,'Bảng tin thiếu kênh phản ánh, khiếu nại an toàn','không có hòm thư góp ý, số đường dây nóng hoặc hướng dẫn phản ánh mối nguy, cam kết không trả đũa','BM302','BM302-01',[["BM302","02","Bộ luật Lao động 45/2019/QH14 — Điều 5; Luật 84/2015/QH13 — Điều 7."]],'Minor',
    'Niêm yết hướng dẫn phản ánh an toàn (hòm thư, số đường dây nóng, mã QR), cam kết bảo mật và không trả đũa.',
    'Duy trì kênh phản ánh ẩn danh; ghi sổ theo dõi, phản hồi và niêm yết kết quả xử lý định kỳ.','Administrative','violation'),
  dxR('BT5',DX_G,'Tài liệu niêm yết hết hiệu lực, rách, mờ hoặc dán chồng che nhau','thông báo quá hạn, tài liệu năm cũ, giấy rách, mờ, bạc màu, dán chồng lên nhau không đọc được','BM301','BM301-01',DX_LI,'Minor',
    'Gỡ tài liệu hết hiệu lực, thay bản rách, mờ; sắp xếp lại không để che nhau.',
    'Chia bảng tin theo khu (An toàn, Môi trường, Nhân sự); ghi ngày niêm yết và ngày gỡ trên từng tài liệu; kiểm tra hằng tháng.','Administrative','violation'),
  dxR('BT6',DX_G,'Bảng tin không niêm yết chính sách an toàn, sức khỏe, môi trường','bảng tin đọc được tiêu đề các tài liệu nhưng không có chính sách an toàn, sức khỏe, môi trường (EHS) của công ty','CM202','CM202-01',[["CM202","01","Luật 72/2020/QH14 — Điều 4; TCVN ISO 14001:2015 — Điều khoản 5.2."]],'Minor',
    'Niêm yết chính sách an toàn, sức khỏe, môi trường bản hiện hành có chữ ký lãnh đạo.',
    'Đưa chính sách EHS vào danh mục tài liệu bắt buộc của mọi bảng tin; cập nhật khi chính sách được soát xét.','Administrative','violation')
];
(function dxAdd(){
  for(const r of DX_RULES){
    if(RULES[r.id])continue;
    const base=r.l.map(x=>[...x]);if(r.lx)r.l=[...base,...r.lx];
    let at=-1;RBA.rules.forEach((x,i)=>{if(x.g===r.g)at=i});at=at<0?RBA.rules.length:at+1;
    RBA.rules.splice(at,0,r);BASELAW.splice(at,0,base);RULES[r.id]=r;
  }
})();
/* applyGuider thay căn cứ theo hạng mục của Guider; giữ thêm điều khoản cụ thể (lx) của lỗi bổ sung */
{const _ag=applyGuider;applyGuider=function(g){const res=_ag(g);for(const r of DX_RULES)if(r.lx&&RULES[r.id]===r)r.l=[...r.l.filter(l=>!r.lx.some(y=>y[2]===l[2])),...r.lx];return res}}

/* Bảng quy tắc từ khóa (xem QX_KW trong ai-quality.js) */
Object.assign(QX_KW,{
  D14:['tu dien|hop dien|phong dien|tu dieu khien dien','bang ten|ten nguoi|nguoi phu trach|nguoi quan ly|nguoi chiu trach nhiem|so dien thoai|nguoi vao','thieu|khong co|chua'],
  D15:['dau day|day dan|day mem|loi dong|day','dau cos|cos pin|cos|ong long|danh so day|so day','khong bam|khong co|thieu|chua|cam truc tiep|lo loi|tuot vo|khong phu hop|sai co','!gi set|han ri|ri set|bang keo|bang dinh'],
  D16:['oc|bu long|vit|oc siet|vit cuc','long|thieu|tuot|khong siet|khong chat|lung lay|xoay','tu dien|thanh cai|cau dau|aptomat|dau noi|dau cos|cuc dau|tam che|cover','!gi set|han ri|ri set|bo quen|vat la|roi vai'],
  D17:['day tiep dia|day vang xanh|day soc vang xanh|day vang soc xanh|day pe|mau day','sai|nham|dau vao aptomat|vao cuc|lam day pha|lam day trung tinh|khong dung quy uoc|khong theo quy uoc|dung sai|lan mau|khong phan biet'],
  D18:['tiep dia|noi dat','vo tu|cua tu|than tu|ban le','thieu|khong co|dut|chua|long','!mau day|vang xanh|dau vao aptomat'],
  D19:['so do mot soi|so do dau noi|so do mach|so do nguyen ly|so do dien','thieu|khong co|chua|cu|khong khop','!thoat hiem|thoat nan'],
  D20:['tu dien|hop dien|phong dien|tram bien ap','bien canh bao|canh bao dien giat|bien nguy hiem|nhan canh bao|bien bao dien','thieu|khong co|chua'],
  D21:['tu dien|hop dien|cua tu dien|phong dien','khong khoa|de mo|mo cua|cua mo|khong dong|hong khoa|khoa hong|thieu khoa|chia cam san'],
  NT1:['kho|cua kho|kho bai|bai chua|tu may|tu thiet bi|tu dieu khien|may|thiet bi|khu vuc|khu chua','bang ten|nguoi phu trach|nguoi quan ly|nguoi chiu trach nhiem','thieu|khong co|chua','!tu dien|hop dien|phong dien|xu ly nuoc|xu ly khi'],
  BT1:['bang tin|bang thong bao|niem yet|bang noi bo','quan trac moi truong|ket qua quan trac|quan trac mtld|do kiem moi truong|quan trac','thieu|khong co|chua niem yet|khong niem yet|chua co','!qua han|het han|qua 12 thang|da cu|nam cu|vuot chuan'],
  BT2:['quan trac moi truong|ket qua quan trac|quan trac','qua han|het han|qua 12 thang|da cu|nam cu|khong cap nhat|vi tri vuot|vuot chuan|bien phap khac phuc|trang bia','!khong niem yet|chua niem yet|khong co ket qua'],
  BT3:['bang tin|bang thong bao|niem yet','noi quy an toan|noi quy atvsld|noi quy ve sinh lao dong|so dien thoai khan cap|hotline khan cap|doi so cuu|doi ung cuu|doi pccc|so khan cap','thieu|khong co|chua niem yet|khong niem yet'],
  BT4:['bang tin|bang thong bao|niem yet|hom thu','phan anh|khieu nai|gop y|duong day nong|kenh bao cao','thieu|khong co|chua'],
  BT5:['bang tin|bang thong bao|tai lieu niem yet|thong bao niem yet','het hieu luc|qua han|rach|mo|bong|dan chong|che lap|bac mau|khong doc duoc|nam cu','!quan trac'],
  BT6:['bang tin|bang thong bao|niem yet','chinh sach (an toan|moi truong|ehs|hse|atvsld|suc khoe)','thieu|khong co|chua niem yet|khong niem yet']
});
for(const id of Object.keys(QX_KW))if(!QX_RX[id])QX_RX[id]=QX_KW[id].map(g=>{const neg=g[0]==='!';return{neg,rx:new RegExp('(?:^|[^a-z0-9])(?:'+(neg?g.slice(1):g)+')(?=$|[^a-z0-9])')}});

/* ---------- Danh sách kiểm tra chi tiết tủ điện ---------- */
{const e=AREA_CK.find(a=>/^Tủ điện/.test(a.n));if(e)e.i=[
  'BÊN NGOÀI: tên tủ; BẢNG TÊN NGƯỜI PHỤ TRÁCH (họ tên, số điện thoại) — tên tủ, biển cảnh báo, phiếu kiểm tra KHÔNG thay thế được bảng này (D14)',
  'Biển cảnh báo điện giật: có, còn rõ (D20); cửa tủ đóng và khóa, khóa không hỏng, chìa không cắm sẵn (D21)',
  'Dây tiếp địa cửa tủ ở bản lề khi cửa có đèn báo, nút bấm (D18); phiếu kiểm tra tủ cập nhật đến tháng hiện tại (đọc ngày nếu rõ)',
  'Trước tủ: vạch vùng an toàn (D1), thảm cách điện (D2), khoảng trống ≥ 1 m không bị hàng hóa chắn (D5); bình chữa cháy CO2 gần đó',
  'BÊN TRONG (soát kỹ từng aptomat, từng đầu dây, đếm số lượng và nêu vị trí, ví dụ "aptomat thứ 2 từ trái"):',
  'Tấm cover che thanh cái, đầu cực, ô trống trên mặt che không có nắp bịt (D3)',
  'Đầu cos: dây mềm nhiều sợi cắm thẳng vào cực không bấm cos, lõi đồng lòi ra ngoài cực, tuốt vỏ dài, một cực kẹp nhiều dây, thiếu ống lồng đánh số dây (D15)',
  'Gỉ sét: đầu cos, bu lông, thanh cái, cầu đấu gỉ nâu; đầu dây quấn băng keo thay cos (D12)',
  'Ốc siết lỏng, thiếu ốc, dây tuột một phần khỏi cực, thiếu vít bắt tấm che (D16)',
  'Nhãn tên mạch trên từng aptomat, cầu dao: đếm số aptomat không có nhãn (D9); sơ đồ một sợi ở mặt trong cửa (D19)',
  'Màu dây: dây vàng-xanh chỉ được đấu vào thanh tiếp địa PE, đấu vào cực aptomat là lỗi (D17); pha, trung tính lẫn màu',
  'Dây đi tự do, không máng, không kẹp, chùm dây cọ mép kim loại (D11); mối nối quấn băng keo, dây hở (D6)',
  'Vết cháy sém, đổi màu, nhựa chảy ở đầu cos, aptomat (D10); thiết bị lắp nghiêng, lỏng khỏi ray (D13)',
  'Vật lạ, ốc vít, giẻ, bụi, côn trùng trong tủ (D7); lỗ luồn cáp không bịt kín (D8); thiếu LOTO khi đang sửa chữa (D4)'
]}

/* ---------- Quy tắc chung: bảng tên người phụ trách, bảng tin ---------- */
const DX_BLK=`BẢNG TÊN NGƯỜI PHỤ TRÁCH (áp dụng cho mọi ảnh)
- Tủ điện, tủ điều khiển máy, tủ thiết bị, máy nén khí, cửa kho, kho bãi, khu chứa chất thải, trạm xử lý: phải có bảng ghi họ tên, số điện thoại người phụ trách.
- Mặt trước tủ hoặc cửa kho nhìn RÕ trong ảnh mà không có bảng này: tủ điện dùng D14; thiết bị xử lý khí, nước thải dùng V1; tủ máy, tủ thiết bị, kho, cửa kho bãi dùng NT1. Tên tủ (ví dụ "TỦ ĐIỆN PHÒNG 2"), biển cảnh báo, phiếu kiểm tra không phải bảng người phụ trách.
- Chỉ thấy một phần mặt tủ, cửa: không kết luận, ghi vào "verify".

BẢNG TIN, BẢNG THÔNG BÁO (chỉ áp dụng khi ảnh có bảng tin)
- Trong "objects" liệt kê từng tài liệu trên bảng kèm tiêu đề đọc được (ví dụ "tờ A4 hàng trên thứ 3: THÔNG BÁO ..."); không đọc được thì ghi "không đọc được tiêu đề".
- Đối chiếu danh mục phải có:
  + Kết quả quan trắc môi trường lao động năm gần nhất, có vị trí vượt chuẩn và biện pháp khắc phục (thiếu: BT1; đọc được năm cách ngày đánh giá hơn 12 tháng hoặc chỉ có trang bìa: BT2). Căn cứ ${DX_QT}
  + Nội quy an toàn vệ sinh lao động, số điện thoại khẩn cấp (114, 115, nội bộ), danh sách đội sơ cứu, đội PCCC, ứng cứu (BT3).
  + Chính sách an toàn, sức khỏe, môi trường của công ty (BT6). Kênh phản ánh, khiếu nại an toàn (BT4).
  + Sơ đồ thoát hiểm có vị trí "bạn đang ở đây" và điểm tập kết, nếu bảng tin là nơi đặt sơ đồ (F7).
  + Tài liệu hết hiệu lực, rách, mờ, dán chồng che nhau (BT5).
  + Chỉ nhắc vào "verify" (không có mã RBA tương ứng): nội quy lao động (Bộ luật Lao động 2019 Điều 118), thang lương bảng lương, định mức lao động, thỏa ước lao động tập thể, quy chế dân chủ cơ sở; bản tiếng nước ngoài khi có lao động nước ngoài.
- Kết luận "thiếu" khi đọc được tiêu đề phần lớn tài liệu, các tài liệu không đọc được rõ ràng không phải mục đó (poster tuyển dụng, sơ đồ, khẩu hiệu), và không tài liệu nào là mục đó; nêu các tiêu đề đã đọc trong "evidence". Còn tài liệu dạng văn bản chưa đọc được tiêu đề: không kết luận, ghi vào "verify" (ví dụ "Kiểm tra bảng tin có kết quả quan trắc môi trường lao động năm gần nhất không").
- Lỗi thiếu tài liệu niêm yết là lỗi nhìn thấy được trên bảng tin, không phải lỗi hồ sơ: "obj" là chính bảng tin, "box" bao cả bảng tin. Mỗi mục thiếu là một lỗi riêng. Mức độ Minor; Major khi đọc được kết quả quan trắc có vị trí vượt chuẩn mà không có biện pháp khắc phục.

`;
{const _al=areaLists;areaLists=function(text){const s=_al(text),e=AREA_CK.find(a=>/^Tủ điện/.test(a.n));
  const el=e&&!s.includes(`[${e.n}]`)?`TỦ ĐIỆN, HỘP ĐIỆN, APTOMAT (chỉ áp dụng khi ảnh có tủ điện hoặc thiết bị điện)\n${e.i.map(x=>`- ${x}`).join('\n')}\n\n`:'';
  return s+el+DX_BLK}}
window.__DX={rules:DX_RULES.map(r=>r.id),blk:()=>DX_BLK};
