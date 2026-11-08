"""v20: Ảnh báo cáo xem từng ảnh, tem nhãn và thời hạn, Cài đặt gọn, màu theo khu vực, tối ưu bộ nhớ.

1. Ảnh báo cáo: xem lần lượt mọi ảnh có lỗi đã xác nhận (‹ ›, dải ảnh nhỏ, phím mũi tên, vuốt), lưu ảnh đang xem hoặc lưu tất cả.
2. Tem nhãn, hạn sử dụng, hạn kiểm định: 11 lỗi mới (nhóm "Tem nhãn & thời hạn"), bảng thời hạn có căn cứ, AI đọc ngày
   trên tem, nhãn và so với ngày audit.
3. Cài đặt: chia 5 mục Giao diện / AI soát ảnh / Tiêu chí & thời hạn / Dữ liệu tham chiếu / Dữ liệu & phiên bản; bỏ Nhật ký AI.
4. Màu nhận diện từng khu vực: Tổng quan, Ảnh, Kiểm tra vi phạm, Xác nhận lỗi, Báo cáo, Cài đặt.
5. Tối ưu: chỉ giải mã ảnh gốc khi cần (giữ tối đa 4 ảnh trong bộ nhớ), lưu ảnh gốc một lần, các lần sửa sau chỉ lưu dữ liệu nhỏ.

Chạy: python3 patch_v20.py app/v19.html app/soat-anh-ehs-rba.html
"""
import json
import sys

src, dst = sys.argv[1], sys.argv[2]
s = open(src, encoding="utf-8").read()


def rep(a, b, n=1):
    global s
    c = s.count(a)
    assert c == n, (c, a[:90])
    s = s.replace(a, b)


# ---------- 2a. Thêm lỗi "Tem nhãn & thời hạn" vào danh mục ----------
i = s.index('const RBA=') + len('const RBA=')
rba, end = json.JSONDecoder().raw_decode(s[i:])
assert not any(r['id'].startswith('TN') for r in rba['rules'])
G = 'Tem nhãn & thời hạn'
NEW = [
    dict(id='TN1', t='Thiết bị nâng, xe nâng, thang máy, bình chịu áp lực không có tem kiểm định hoặc tem đã hết hạn',
         k='không thấy tem kiểm định trên xe nâng, cầu trục, pa lăng, thang máy, máy nén khí, bình tích áp; ngày hết hạn trên tem trước ngày audit',
         c='BM102', q='BM102-05', v='Major', z='Administrative', kd='violation',
         l=[['BM102', '06', 'Luật 84/2015/QH13 — Điều 31; NĐ 44/2016/NĐ-CP; TT 36/2019/TT-BLĐTBXH. Chu kỳ: cầu trục 3 năm (trên 12 năm: 1 năm) — QCVN 30:2016/BLĐTBXH; xe nâng 2 năm (trên 10 năm: 1 năm) — QTKĐ 17-2016/BLĐTBXH; thang máy 2 năm tại nhà xưởng, 3 năm nơi khác (trên 15 năm: 1 năm) — TT 12/2021/TT-BLĐTBXH; bình chịu áp lực 3 năm, 2 năm với môi chất độc, cháy nổ — QTKĐ 07-2016/BLĐTBXH.']],
         n='Dừng sử dụng thiết bị, treo biển cấm vận hành đến khi kiểm định lại.',
         x='Kiểm định lại bởi tổ chức kiểm định có thẩm quyền; lập danh sách thiết bị nghiêm ngặt kèm hạn kiểm định, nhắc trước 30 ngày.'),
    dict(id='TN2', t='Bình chữa cháy quá hạn bảo dưỡng, kiểm tra hoặc không có tem, thẻ theo dõi',
         k='tem hoặc thẻ treo ghi lần bảo dưỡng cuối quá 6 tháng so với ngày audit; không có tem kiểm định hoặc thẻ kiểm tra; tem rách, mờ',
         c='BH201', q='BH201-04', v='Major', z='Administrative', kd='violation',
         l=[['BH201', '04', 'QCVN 10:2025/BCA mục 1.5.13 (bảo dưỡng bình chữa cháy ít nhất 6 tháng/lần); TCVN 7435-2 (bảo dưỡng 6–12 tháng/lần); TT 36/2025/TT-BCA — Điều 5–8; NĐ 105/2025/NĐ-CP — Điều 46 (tem kiểm định phương tiện PCCC áp dụng đến 30/6/2026).']],
         n='Thay ngay bằng bình đã được bảo dưỡng, còn hạn.', x='Lập lịch bảo dưỡng bình 6 tháng/lần, cập nhật thẻ kiểm tra hằng tháng.'),
    dict(id='TN3', t='Bình chữa cháy áp suất không đạt hoặc hư hỏng',
         k='kim đồng hồ áp suất ngoài vùng xanh, mất chốt an toàn, vòi nứt, vỏ gỉ móp',
         c='BH201', q='BH201-04', v='Major', z='Facility', kd='violation',
         l=[['BH201', '04', 'TCVN 7435-2 (kiểm tra, bảo dưỡng bình chữa cháy); QCVN 10:2025/BCA; TT 36/2025/TT-BCA — Điều 5–8.']],
         n='Thay bình đạt áp suất, đưa bình lỗi đi nạp hoặc sửa.', x='Kiểm tra áp suất, chốt, vòi trong lần tự kiểm tra hằng tháng.'),
    dict(id='TN4', t='Đèn chiếu sáng sự cố, đèn chỉ dẫn thoát nạn, thiết bị báo cháy quá hạn bảo dưỡng',
         k='tem bảo dưỡng ghi lần cuối quá 12 tháng so với ngày audit; không có tem bảo dưỡng',
         c='BH201', q='BH201-04', v='Minor', z='Administrative', kd='violation',
         l=[['BH201', '04', 'QCVN 10:2025/BCA (hệ thống báo cháy, chiếu sáng sự cố, chỉ dẫn thoát nạn, cấp nước chữa cháy bảo dưỡng ít nhất 1 năm/lần); TCVN 3890:2023; TT 36/2025/TT-BCA.']],
         n='Thử hoạt động thiết bị, thay thiết bị hỏng.', x='Đưa vào kế hoạch bảo dưỡng PCCC hằng năm, dán tem ghi ngày bảo dưỡng.'),
    dict(id='TN5', t='Găng tay, ủng, thảm cách điện quá hạn thử nghiệm hoặc không có tem thử nghiệm',
         k='tem thử nghiệm ghi ngày quá 6 tháng so với ngày audit; không có tem, nhãn thử nghiệm; găng rách, chai cứng',
         c='BH102', q='BH102-01', v='Major', z='Administrative', kd='violation',
         l=[['BH102', '05', 'QCVN 24:2014/BLĐTBXH (găng tay cách điện thử nghiệm ít nhất 6 tháng/lần); QCVN 15:2013/BLĐTBXH (ủng cách điện thử nghiệm 6 tháng/lần); Luật 84/2015/QH13 — Điều 16, 23.']],
         n='Ngừng dùng dụng cụ quá hạn thử nghiệm.', x='Thử nghiệm định kỳ 6 tháng/lần, dán tem ghi hạn thử nghiệm tiếp theo.'),
    dict(id='TN6', t='Đồng hồ áp suất, cân, thiết bị đo không có tem hoặc tem kiểm định hết hạn',
         k='đồng hồ áp suất trên bình khí nén, nồi hơi, cân không có tem kiểm định; tem ghi hạn trước ngày audit',
         c='BH102', q='BH102-01', v='Minor', z='Administrative', kd='violation',
         l=[['BH102', '05', 'Luật Đo lường 04/2011/QH13; TT 23/2013/TT-BKHCN, sửa đổi TT 07/2019/TT-BKHCN (phương tiện đo nhóm 2 kiểm định theo chu kỳ trong danh mục, ví dụ thiết bị đo điện trở cách điện 12 tháng).']],
         n='Thay phương tiện đo còn hạn kiểm định.', x='Lập danh sách phương tiện đo kèm chu kỳ kiểm định, nhắc trước hạn.'),
    dict(id='TN7', t='Hệ thống chống sét, nối đất quá hạn đo kiểm tra định kỳ',
         k='biển hoặc tem kết quả đo điện trở nối đất ghi ngày quá 12 tháng so với ngày audit; dây nối đất đứt, gỉ',
         c='BH201', q='BH201-01', v='Minor', z='Administrative', kd='violation',
         l=[['BH201', '06', 'TCVN 9385:2012 mục 12.3.2 (kiểm tra, đo hệ thống chống sét định kỳ không quá 12 tháng; điện trở nối đất không lớn hơn 10 Ω); Luật 55/2024/QH15 — Điều 48.']],
         n='Đo lại điện trở nối đất, sửa điểm nối hỏng.', x='Đo kiểm hệ thống chống sét 12 tháng/lần, lưu biên bản đo.'),
    dict(id='TN8', t='Hóa chất đã quá hạn sử dụng ghi trên nhãn',
         k='nhãn chai, can ghi hạn sử dụng (EXP, HSD) trước ngày audit; vẫn để trong khu vực sử dụng',
         c='BH401', q='BH401-05', v='Major', z='Administrative', kd='violation',
         l=[['BH401', '02', 'Luật Hóa chất 69/2025/QH15 (ghi nhãn theo pháp luật nhãn hàng hóa và GHS); NĐ 43/2017/NĐ-CP, sửa đổi bởi NĐ 111/2021/NĐ-CP (nhãn có hạn sử dụng).']],
         n='Cách ly hóa chất quá hạn, không sử dụng tiếp.', x='Xử lý hóa chất quá hạn như chất thải nguy hại; kiểm kê hạn sử dụng hằng tháng.'),
    dict(id='TN9', t='Thực phẩm, nguyên liệu nấu ăn quá hạn sử dụng hoặc không có nhãn, hạn dùng',
         k='bao bì ghi hạn sử dụng trước ngày audit; thực phẩm đóng gói không nhãn trong kho bếp, tủ lạnh',
         c='BH702', q='BH702-03', v='Major', z='Administrative', kd='violation',
         l=[['BH702', '04', 'Luật An toàn thực phẩm 55/2010/QH12 — Điều 5 (cấm sử dụng thực phẩm quá hạn sử dụng); NĐ 43/2017/NĐ-CP, sửa đổi bởi NĐ 111/2021/NĐ-CP.']],
         n='Loại bỏ ngay thực phẩm quá hạn.', x='Kiểm tra hạn sử dụng khi nhập kho và hằng ngày, xuất trước hàng gần hết hạn.'),
    dict(id='TN10', t='Thuốc, vật tư sơ cứu quá hạn sử dụng',
         k='hộp thuốc, băng gạc, dung dịch sát khuẩn ghi hạn sử dụng trước ngày audit',
         c='BH302', q='BH302-04', v='Minor', z='Administrative', kd='violation',
         l=[['BH302', '04', 'TT 19/2016/TT-BYT (trang thiết bị sơ cứu tại nơi làm việc); thuốc, vật tư sơ cứu còn hạn sử dụng theo nhãn.']],
         n='Thay ngay thuốc, vật tư quá hạn.', x='Kiểm tra hộp sơ cứu hằng tháng theo danh mục, ghi phiếu kiểm tra.'),
    dict(id='TN11', t='PPE, dây đai an toàn, mặt nạ, phin lọc quá hạn sử dụng hoặc hư hỏng',
         k='nhãn PPE ghi hạn sử dụng trước ngày audit; phin lọc hết hạn; dây đai sờn, đứt',
         c='BH102', q='BH102-02', v='Major', z='Administrative', kd='violation',
         l=[['BH102', '05', 'Luật 84/2015/QH13 — Điều 23 (PPE đạt quy chuẩn, còn hạn sử dụng theo nhà sản xuất); TT 25/2022/TT-BLĐTBXH.']],
         n='Thu hồi PPE quá hạn, cấp PPE mới.', x='Theo dõi hạn sử dụng PPE, kiểm tra trước khi dùng.'),
]
for r in NEW:
    r.update(g=G, o='m')
    assert rba['codes'].get(r['c']), r['c']
    assert any(q[0] == r['q'] for q in rba['codes'][r['c']]['r']), r['q']
rba['rules'].extend(NEW)
s = s[:i] + json.dumps(rba, ensure_ascii=False, separators=(',', ':')) + s[i + end:]

# ---------- 2b. Bảng thời hạn và lời nhắc ----------
HANDB = r"""/* Thời hạn kiểm định, bảo dưỡng, tem nhãn: căn cứ đã tra cứu (mục có c:1 cần xác nhận lại với văn bản gốc) */
const HANDB=[
 {t:'Cầu trục, cổng trục',p:'3 năm; trên 12 năm sử dụng: 1 năm',b:'QCVN 30:2016/BLĐTBXH',v:'Major',id:'TN1'},
 {t:'Xe nâng hàng',p:'2 năm; trên 10 năm sử dụng: 1 năm',b:'QTKĐ 17-2016/BLĐTBXH',v:'Major',id:'TN1',c:1},
 {t:'Thang máy',p:'2 năm tại nhà xưởng, văn phòng, chung cư, nơi công cộng; 3 năm nơi khác; trên 15 năm: 1 năm',b:'TT 12/2021/TT-BLĐTBXH (QTKĐ 02-2021)',v:'Major',id:'TN1'},
 {t:'Bình chịu áp lực (bình khí nén, bình tích áp)',p:'3 năm; 2 năm với môi chất độc, ăn mòn, cháy nổ',b:'QTKĐ 07-2016/BLĐTBXH',v:'Major',id:'TN1',c:1},
 {t:'Thiết bị có yêu cầu nghiêm ngặt về an toàn (nói chung)',p:'Kiểm định trước khi dùng và định kỳ; có tem kiểm định còn hạn',b:'Luật 84/2015/QH13 Điều 31; NĐ 44/2016/NĐ-CP; TT 36/2019/TT-BLĐTBXH',v:'Major',id:'TN1'},
 {t:'Bình chữa cháy',p:'Bảo dưỡng ít nhất 6 tháng/lần (TCVN 7435-2: 6–12 tháng); tự kiểm tra hằng tháng',b:'QCVN 10:2025/BCA mục 1.5.13; TCVN 7435-2; TT 36/2025/TT-BCA',v:'Major',id:'TN2'},
 {t:'Tem kiểm định phương tiện PCCC',p:'Cơ chế tem tiếp tục áp dụng đến 30/6/2026',b:'NĐ 105/2025/NĐ-CP Điều 46',v:'Major',id:'TN2'},
 {t:'Báo cháy, đèn sự cố, đèn chỉ dẫn thoát nạn, cấp nước chữa cháy',p:'Bảo dưỡng ít nhất 1 năm/lần',b:'QCVN 10:2025/BCA; TCVN 3890:2023',v:'Minor',id:'TN4'},
 {t:'Găng tay cách điện',p:'Thử nghiệm ít nhất 6 tháng/lần',b:'QCVN 24:2014/BLĐTBXH',v:'Major',id:'TN5'},
 {t:'Ủng cách điện',p:'Thử nghiệm 6 tháng/lần',b:'QCVN 15:2013/BLĐTBXH',v:'Major',id:'TN5'},
 {t:'Phương tiện đo nhóm 2 (đồng hồ áp suất, cân, thiết bị đo điện)',p:'Theo chu kỳ trong danh mục, ví dụ đo điện trở cách điện 12 tháng',b:'TT 23/2013/TT-BKHCN, sửa đổi TT 07/2019/TT-BKHCN',v:'Minor',id:'TN6'},
 {t:'Hệ thống chống sét, nối đất',p:'Kiểm tra, đo không quá 12 tháng; điện trở nối đất ≤ 10 Ω',b:'TCVN 9385:2012 mục 12.3.2',v:'Minor',id:'TN7'},
 {t:'Hóa chất',p:'Nhãn GHS đủ: tên, hình đồ cảnh báo, từ cảnh báo, biện pháp phòng ngừa, hạn sử dụng; không dùng hóa chất quá hạn',b:'Luật 69/2025/QH15; NĐ 43/2017/NĐ-CP sửa đổi bởi NĐ 111/2021/NĐ-CP',v:'Major',id:'TN8'},
 {t:'Thực phẩm tại bếp ăn',p:'Có nhãn, hạn sử dụng; không dùng thực phẩm quá hạn',b:'Luật ATTP 55/2010/QH12 Điều 5; NĐ 43/2017/NĐ-CP',v:'Major',id:'TN9'},
 {t:'Thuốc, vật tư sơ cứu',p:'Còn hạn sử dụng theo nhãn',b:'TT 19/2016/TT-BYT',v:'Minor',id:'TN10',c:1},
 {t:'PPE, dây đai an toàn, phin lọc',p:'Trong hạn sử dụng của nhà sản xuất, không hư hỏng',b:'Luật 84/2015/QH13 Điều 23',v:'Major',id:'TN11'}];
const HANDB_PROMPT=()=>`THỜI HẠN KIỂM ĐỊNH, BẢO DƯỠNG VÀ TEM NHÃN (dùng khi ảnh có tem, nhãn, thẻ ghi ngày)
- Đọc ngày trên tem kiểm định, tem bảo dưỡng, thẻ kiểm tra, nhãn hạn sử dụng (EXP, HSD, "Hạn kiểm định", "Next inspection", "Due", "Ngày kiểm tra"). So với NGÀY AUDIT ở phần thông tin riêng.
- Ngày hết hạn trước ngày audit, hoặc lần kiểm tra, bảo dưỡng cuối cũ hơn chu kỳ dưới đây: là vi phạm, dùng id nhóm "Tem nhãn & thời hạn", ghi rõ ngày đọc được trong "evidence".
- Thiết bị bắt buộc kiểm định mà không thấy tem kiểm định: là vi phạm.
- Còn hạn dưới 30 ngày: không phải lỗi, ghi vào "verify" để nhắc.
- Không đọc rõ ngày hoặc chỉ thấy một phần: không kết luận, ghi vào "verify" (cần kiểm tra hồ sơ).
${HANDB.map(x=>`- ${x.t}: ${x.p} (${x.b}) → id ${x.id}`).join('\n')}

`;
"""
rep("const ctx=p=>", HANDB + "const ctx=p=>")
rep("const ctx=p=>[p.area&&`Khu vực: ${p.area}`,",
    "const ctx=p=>[`NGÀY AUDIT: ${vnDate($('mDate').value||today())}`,p.area&&`Khu vực: ${p.area}`,")
rep("DANH MỤC LỖI (id", "${HANDB_PROMPT()}DANH MỤC LỖI (id")

# ---------- 1. Ảnh báo cáo: xem từng ảnh ----------
rep('''  <div class="dh"><h2>Ảnh báo cáo</h2><span class="spacer"></span><button class="btn primary" id="prevSave">Lưu ảnh</button><button class="btn" id="prevX">Đóng</button></div>
  <div class="db"><img id="prevImg" alt="Ảnh báo cáo có khoanh vùng và danh sách lỗi"></div>''',
    '''  <div class="dh pvh"><div class="pvt"><h2 id="prevT">Ảnh báo cáo</h2><small id="prevSub"></small></div><span class="spacer"></span>
    <button class="btn" id="prevPrev" aria-label="Ảnh trước">‹</button><button class="btn" id="prevNext" aria-label="Ảnh sau">›</button>
    <button class="btn primary" id="prevSave">Lưu ảnh này</button><button class="btn" id="prevAll">Lưu tất cả (.zip)</button><button class="btn" id="prevX">Đóng</button></div>
  <div class="pstrip" id="prevStrip"></div>
  <div class="db pvb"><p class="hint" id="prevBusy" hidden>Đang tạo ảnh báo cáo…</p><img id="prevImg" alt="Ảnh báo cáo có khoanh vùng và danh sách lỗi"></div>''')
GAL = r"""/* Ảnh báo cáo: xem lần lượt mọi ảnh có lỗi đã xác nhận */
const GAL={list:[],i:0,cache:new Map(),tok:0};
async function galShow(i){
  const L=GAL.list;if(!L.length)return;GAL.i=(i+L.length)%L.length;const p=L[GAL.i],tok=++GAL.tok;
  $('prevT').textContent=`Ảnh báo cáo ${GAL.i+1}/${L.length}`;$('prevSub').textContent=p.area||p.name;
  $('prevPrev').disabled=$('prevNext').disabled=L.length<2;
  [...$('prevStrip').children].forEach((b,k)=>{b.classList.toggle('on',k===GAL.i);if(k===GAL.i)try{b.scrollIntoView({block:'nearest',inline:'center'})}catch{}});
  let e=GAL.cache.get(p.id);
  if(!e){$('prevBusy').hidden=false;$('prevImg').style.opacity='.35';
    let c,blob;try{c=await reportCanvas(p);blob=await toBlob(c,'image/jpeg',.92)}catch{$('prevBusy').hidden=true;$('prevImg').style.opacity='1';return toast('Không tạo được ảnh này. Hãy thử lại.')}
    e={url:URL.createObjectURL(blob),blob,name:`Bao-cao-EHS_${String(GAL.i+1).padStart(2,'0')}_${safeName(p.area||p.name)}.jpg`};GAL.cache.set(p.id,e)}
  if(tok!==GAL.tok)return;$('prevImg').src=e.url;$('prevImg').style.opacity='1';$('prevBusy').hidden=true;S.prev=e;
}
function galClose(){for(const e of GAL.cache.values())URL.revokeObjectURL(e.url);GAL.cache.clear();GAL.list=[];S.prev=null}
"""
rep("async function previewImage(){\n  if(!gateExport())return;const p=cur();if(!p)return;if(!numbered(p).length)return toast('Ảnh này không có lỗi. Chọn ảnh có lỗi ở màn Kiểm tra vi phạm.');const c=await reportCanvas(p),blob=await toBlob(c,'image/jpeg',.92);\n  if(S.prev)URL.revokeObjectURL(S.prev.url);S.prev={url:URL.createObjectURL(blob),blob,name:`Bao-cao-EHS_${safeName(p.area||p.name)}.jpg`};\n  $('prevImg').src=S.prev.url;$('dlgPrev').showModal();\n}",
    GAL + "async function previewImage(){\n  if(!gateExport())return;galClose();GAL.list=gather().map(g=>g.p);if(!GAL.list.length)return toast('Chưa có ảnh nào có lỗi đã xác nhận.');\n"
    "  $('prevStrip').replaceChildren(...GAL.list.map((p,k)=>h('button',{class:'pth',title:p.area||p.name,onclick:()=>galShow(k)},h('img',{src:p.thumb,alt:''}),h('span',null,String(k+1)))));\n"
    "  $('dlgPrev').showModal();galShow(Math.max(0,GAL.list.indexOf(cur())));\n}")
rep("$('prevSave').onclick=()=>S.prev&&saveFile(S.prev.name,S.prev.blob);$('prevX').onclick=()=>$('dlgPrev').close();",
    "$('prevSave').onclick=()=>S.prev&&saveFile(S.prev.name,S.prev.blob);$('prevX').onclick=()=>$('dlgPrev').close();\n"
    "$('prevPrev').onclick=()=>galShow(GAL.i-1);$('prevNext').onclick=()=>galShow(GAL.i+1);$('prevAll').onclick=()=>exportZip().catch(()=>toast('Không tạo được file nén. Hãy thử lại.'));\n"
    "$('dlgPrev').addEventListener('close',galClose);$('dlgPrev').addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();galShow(GAL.i-1)}if(e.key==='ArrowRight'){e.preventDefault();galShow(GAL.i+1)}});\n"
    "{let x0=null;$('prevImg').addEventListener('pointerdown',e=>{x0=e.clientX});$('prevImg').addEventListener('pointerup',e=>{if(x0==null)return;const d=e.clientX-x0;x0=null;if(Math.abs(d)>50)galShow(GAL.i+(d<0?1:-1))})}")
rep('<div class="g2"><button class="btn" id="btnImg">Ảnh báo cáo</button>', '<div class="g2"><button class="btn" id="btnImg">Xem ảnh báo cáo</button>')

# ---------- 5. Tối ưu bộ nhớ và lưu trữ ----------
IMG = r"""/* Ảnh gốc chỉ giải mã khi cần, giữ tối đa 4 ảnh trong bộ nhớ (ảnh đang mở luôn được giữ) */
const IMGC=[],IMGP=new Map();
function touchImg(p){const i=IMGC.indexOf(p);if(i>=0)IMGC.splice(i,1);IMGC.push(p);
  const keep=new Set(IMGC.slice(-4));keep.add(cur());
  for(const x of S.photos)if(x.img&&x.blob&&!keep.has(x)){x.img=null;const j=IMGC.indexOf(x);if(j>=0)IMGC.splice(j,1)}}
async function ensureImg(p){
  if(p.img){touchImg(p);return p.img}if(!p.blob)return null;
  if(!IMGP.has(p.id))IMGP.set(p.id,(async()=>{try{const c=await decodeImg(p.blob);p.img=c;touchImg(p);return c}finally{IMGP.delete(p.id)}})());
  return IMGP.get(p.id);
}
"""
rep("function makePhoto(o){", IMG + "function makePhoto(o){")
rep("g.imageSmoothingQuality='high';g.drawImage(p.img,S.vx,S.vy,p.w*S.z,p.h*S.z);",
    "if(!p.img){ensureImg(p).then(()=>{if(cur()===p)draw()});return}touchImg(p);g.imageSmoothingQuality='high';g.drawImage(p.img,S.vx,S.vy,p.w*S.z,p.h*S.z);")
rep("async function aiBlob(p,f){const k=Math.min(1,1600/Math.max(p.w,p.h)),c=mk(p.w*k,p.h*k),g=c.getContext('2d');g.drawImage(p.img,0,0,c.width,c.height);",
    "async function aiBlob(p,f){const im=await ensureImg(p),k=Math.min(1,1600/Math.max(p.w,p.h)),c=mk(p.w*k,p.h*k),g=c.getContext('2d');g.drawImage(im,0,0,c.width,c.height);")
rep("async function cropBlob(p,f){const r=cropRect(p,f),k=Math.min(1600/Math.max(r.w,r.h),3),c=mk(r.w*k,r.h*k);c.getContext('2d').drawImage(p.img,",
    "async function cropBlob(p,f){const im=await ensureImg(p),r=cropRect(p,f),k=Math.min(1600/Math.max(r.w,r.h),3),c=mk(r.w*k,r.h*k);c.getContext('2d').drawImage(im,")
rep("async function reportCanvas(p){\n  await fonts();", "async function reportCanvas(p){\n  const im=await ensureImg(p);await fonts();")
rep("g.fillStyle='#1A2125';g.fillRect(pad,py,W-2*pad,ph);g.drawImage(p.img,px,py,pw,ph);", "g.fillStyle='#1A2125';g.fillRect(pad,py,W-2*pad,ph);g.drawImage(im,px,py,pw,ph);")
rep("async function photoCell(p,items){\n", "async function photoCell(p,items){\n  const im=await ensureImg(p);\n")
rep("const c=mk(W,H),g=c.getContext('2d');g.drawImage(p.img,cx,cy,cw,ch,0,0,W,H);", "const c=mk(W,H),g=c.getContext('2d');g.drawImage(im,cx,cy,cw,ch,0,0,W,H);")
rep("function rotate(){\n  const p=cur();if(!p||S.busy)return;\n  const c=mk(p.h,p.w),g=c.getContext('2d');g.translate(c.width,0);g.rotate(Math.PI/2);g.drawImage(p.img,0,0);",
    "async function rotate(){\n  const p=cur();if(!p||S.busy)return;const im=await ensureImg(p);if(!im)return;\n  const c=mk(p.h,p.w),g=c.getContext('2d');g.translate(c.width,0);g.rotate(Math.PI/2);g.drawImage(im,0,0);")
rep("p.thumb=thumbOf(c);toBlob(c,'image/jpeg',.9).then(b=>{p.blob=b;Store.touch(p)});renderAll();fit();",
    "p.thumb=thumbOf(c);toBlob(c,'image/jpeg',.9).then(b=>{p.blob=b;p._bs=false;Store.touch(p)});renderAll();fit();")
rep("function findingThumb(p,f){try{const r=cropRect(p,f),k=Math.min(1,220/Math.max(r.w,r.h)),c=mk(Math.max(1,r.w*k),Math.max(1,r.h*k));c.getContext('2d').drawImage(p.img,",
    "function findingThumb(p,f,im){try{const r=cropRect(p,f),k=Math.min(1,220/Math.max(r.w,r.h)),c=mk(Math.max(1,r.w*k),Math.max(1,r.h*k));c.getContext('2d').drawImage(im||p.img,")
rep("function inheritAfterExport(groups){", "async function inheritAfterExport(groups){")
rep("  const rows=its.map(({p,f})=>{const t=f.title.trim(),fx=planVi(f),a=(p.area||'').trim();\n    return{code:f.code||'',vi:t,en:TR.get(t)||'',fixVi:fx,fixEn:TR.get(fx)||'',loc:a,locEn:TR.get(a)||'',cause:f.cause||'',mand:!!f.mand,sev:f.sev||'',vendor,date,file,th:findingThumb(p,f)}});",
    "  const rows=[];for(const{p,f}of its){const t=f.title.trim(),fx=planVi(f),a=(p.area||'').trim(),im=await ensureImg(p);\n    rows.push({code:f.code||'',vi:t,en:TR.get(t)||'',fixVi:fx,fixEn:TR.get(fx)||'',loc:a,locEn:TR.get(a)||'',cause:f.cause||'',mand:!!f.mand,sev:f.sev||'',vendor,date,file,th:im?findingThumb(p,f,im):''})}")
rep("    try{inheritAfterExport(groups)}catch(e){console.error(e)}", "    inheritAfterExport(groups).catch(e=>console.error(e));")
rep("S.photos.push(p);Store.touch(p);news.push(p);added=added||p}", "S.photos.push(p);Store.touch(p);touchImg(p);news.push(p);added=added||p}")
# khởi động: không giải mã mọi ảnh, dùng ảnh nhỏ đã lưu
rep("  for(const r of saved){try{const b=await createImageBitmap(r.blob),c=mk(b.width,b.height);c.getContext('2d').drawImage(b,0,0);b.close();S.photos.push(makePhoto({...r,img:c,thumb:thumbOf(c),findings:r.findings||[]}))}catch{}}",
    "  for(const r of saved){try{if(!r.blob)continue;let th=r.thumb;if(!th){const c=await decodeImg(r.blob);th=thumbOf(c)}const np=makePhoto({...r,img:null,thumb:th,findings:r.findings||[]});S.photos.push(np);if(!r.thumb||!r._bs)Store.touch(np,true)}catch{}}")
# lưu ảnh gốc riêng một lần
rep("const q=indexedDB.open('soat-ehs',2);q.onupgradeneeded=()=>{const d=q.result;if(!d.objectStoreNames.contains('photos'))d.createObjectStore('photos',{keyPath:'id'});if(!d.objectStoreNames.contains('kv'))d.createObjectStore('kv')};",
    "const q=indexedDB.open('soat-ehs',3);q.onupgradeneeded=()=>{const d=q.result;if(!d.objectStoreNames.contains('photos'))d.createObjectStore('photos',{keyPath:'id'});if(!d.objectStoreNames.contains('kv'))d.createObjectStore('kv');if(!d.objectStoreNames.contains('blobs'))d.createObjectStore('blobs')};")
rep("  all(){return new Promise(res=>{if(!this.db)return res([]);try{const q=this.tx('readonly').getAll();q.onsuccess=()=>res(q.result||[]);q.onerror=()=>res([])}catch{res([])}})},",
    "  hasB(){return!!this.db&&this.db.objectStoreNames.contains('blobs')},\n"
    "  all(){return new Promise(res=>{if(!this.db)return res([]);try{const st=this.hasB()?['photos','blobs']:['photos'],t=this.db.transaction(st,'readonly'),q=t.objectStore('photos').getAll();let recs=[],bm=new Map();\n"
    "    q.onsuccess=()=>{recs=q.result||[]};if(this.hasB()){const b=t.objectStore('blobs'),k=b.getAllKeys(),v=b.getAll();v.onsuccess=()=>{(k.result||[]).forEach((key,i)=>bm.set(key,v.result[i]))}}\n"
    "    t.oncomplete=()=>res(recs.map(r=>r.blob?{...r,_bs:false}:{...r,blob:bm.get(r.id)||null,_bs:true}));t.onerror=()=>res(recs)}catch{res([])}})},")
rep("this.t[p.id]=setTimeout(()=>{try{this.tx('readwrite').put({id:p.id,ord:p.ord,name:p.name,blob:p.blob,w:p.w,h:p.h,area:p.area,note:p.note,",
    "this.t[p.id]=setTimeout(()=>{try{const hb=this.hasB(),t=this.db.transaction(hb?['photos','blobs']:['photos'],'readwrite');if(hb&&!p._bs&&p.blob){t.objectStore('blobs').put(p.blob,p.id);p._bs=true}t.objectStore('photos').put({id:p.id,ord:p.ord,name:p.name,blob:hb?null:p.blob,thumb:p.thumb,w:p.w,h:p.h,area:p.area,note:p.note,")
rep("  del(id){clearTimeout(this.t[id]);if(!this.db)return;try{this.tx('readwrite').delete(id)}catch{}},",
    "  del(id){clearTimeout(this.t[id]);if(!this.db)return;try{this.tx('readwrite').delete(id);if(this.hasB())this.db.transaction('blobs','readwrite').objectStore('blobs').delete(id)}catch{}},")

# ---------- 3. Cài đặt: 5 mục, bỏ Nhật ký AI ----------
rep('<div class="dhead"><h2>Cài đặt hệ thống</h2><small id="setVer"></small></div>',
    '<div class="dhead"><h2>Cài đặt hệ thống</h2><small id="setVer"></small></div>\n'
    '    <div class="stabs" id="setTabs" role="tablist" aria-label="Mục cài đặt">'
    '<button data-st="ui" role="tab">Giao diện</button><button data-st="ai" role="tab">AI soát ảnh</button><button data-st="crit" role="tab">Tiêu chí &amp; thời hạn</button>'
    '<button data-st="ref" role="tab">Dữ liệu tham chiếu</button><button data-st="data" role="tab">Dữ liệu &amp; phiên bản</button></div>')
rep('<div class="dcard"><h3>Giao diện</h3>', '<div class="dcard" data-st="ui"><h3>Giao diện</h3>')
rep('<div class="dcard"><h3>AI soát ảnh</h3>', '<div class="dcard" data-st="ai" id="setAIcard"><h3>AI soát ảnh</h3>')
rep('<p class="hint">Key, mô hình Gemini và nhật ký AI nằm trong mục Kiến thức AI bên dưới.</p>', '')
rep('<div class="dcard"><h3>Tiêu chí đánh giá</h3>', '<div class="dcard" data-st="crit"><h3>Tiêu chí đánh giá</h3>')
rep('<div class="dcard"><h3>Dữ liệu trên máy</h3>', '<div class="dcard" data-st="data"><h3>Dữ liệu trên máy</h3>')
rep('<div class="dcard"><h3>Giới thiệu</h3>',
    '<div class="dcard wide" data-st="crit"><h3>Thời hạn kiểm định, bảo dưỡng và tem nhãn</h3>'
    '<p class="hint">AI đọc ngày trên tem, nhãn, thẻ kiểm tra và so với ngày audit. Quá hạn hoặc thiếu tem bắt buộc là vi phạm; còn hạn dưới 30 ngày chỉ nhắc; không đọc rõ ngày thì ghi cần kiểm tra hồ sơ. Mục đánh dấu * lấy từ nguồn thứ cấp, nên đối chiếu văn bản gốc.</p>'
    '<div class="htab"><table><thead><tr><th>Đối tượng</th><th>Chu kỳ, thời hạn</th><th>Căn cứ</th><th>Mức độ</th></tr></thead><tbody id="hbBody"></tbody></table></div></div>\n'
    '      <div class="dcard" data-st="data"><h3>Giới thiệu</h3>')
rep('<div class="dhead"><h2>Kiến thức AI</h2><small>Danh mục, tài liệu, thư viện lỗi, sổ kinh nghiệm dùng khi AI soát ảnh</small></div>',
    '<div class="dhead" data-st="ref"><h2>Dữ liệu tham chiếu cho AI</h2><small>Danh mục Guider, tài liệu, thư viện lỗi, sổ kinh nghiệm</small></div>')
rep('<div class="sgrid sknow" id="setKnow"></div>', '<div class="sgrid sknow" id="setKnow" data-st="ref"></div>')
SETJS = r"""
function setTab(t){const S2=$('settings');S2.dataset.st=t;try{localStorage.setItem('soat-ehs-stab',t)}catch{}
  document.querySelectorAll('#setTabs>button').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.st===t)));
  S2.querySelectorAll('[data-st]').forEach(el=>{if(el.parentElement.id!=='setTabs')el.hidden=el.dataset.st!==t})}
"""
rep("function renderSettings(){", SETJS + "function renderSettings(){\n  $('hbBody').replaceChildren(...HANDB.map(x=>h('tr',null,h('td',null,x.t+(x.c?' *':'')),h('td',null,x.p),h('td',null,x.b),h('td',null,h('span',{class:'pill '+x.v},x.v)))));\n  setTab($('settings').dataset.st||(()=>{try{return localStorage.getItem('soat-ehs-stab')}catch{return null}})()||'ui');")
rep("$('btnSet').onclick=openSettings;",
    "$('btnSet').onclick=openSettings;\n"
    "document.querySelectorAll('#setTabs>button').forEach(b=>b.onclick=()=>setTab(b.dataset.st));\n"
    "{const ar=$('aiRow');if(ar){ar.classList.remove('box');$('setAIcard').insertBefore(ar,$('setAI'))}const lg=$('aiLog');if(lg){const d=lg.closest('details,.box');if(d)d.remove()}}")

# ---------- 4. Màu nhận diện từng khu vực ----------
CSS = r"""
:root{--a-dash:#0E7C86;--a-photo:#2563EB;--a-check:#C2410C;--a-confirm:#15803D;--a-report:#7C3AED;--a-set:#52606D;
  --a-dash-s:#DDF3F4;--a-photo-s:#E1EAFD;--a-check-s:#FCE7DB;--a-confirm-s:#DDF2E3;--a-report-s:#ECE4FD;--a-set-s:#E4E8EC}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--a-dash:#4FC7CF;--a-photo:#7AA7FF;--a-check:#FB9A63;--a-confirm:#5BD08F;--a-report:#B79CFB;--a-set:#AAB6C2;
  --a-dash-s:#12383B;--a-photo-s:#1A2C4F;--a-check-s:#43230F;--a-confirm-s:#12372A;--a-report-s:#2C2148;--a-set-s:#262E35}}
:root[data-theme="dark"]{--a-dash:#4FC7CF;--a-photo:#7AA7FF;--a-check:#FB9A63;--a-confirm:#5BD08F;--a-report:#B79CFB;--a-set:#AAB6C2;
  --a-dash-s:#12383B;--a-photo-s:#1A2C4F;--a-check-s:#43230F;--a-confirm-s:#12372A;--a-report-s:#2C2148;--a-set-s:#262E35}
#dash,.dnav>button[data-dv="dash"]{--ac:var(--a-dash);--acs:var(--a-dash-s)}
.rail,.tabbar button[data-v="photos"]{--ac:var(--a-photo);--acs:var(--a-photo-s)}
.edit,.dnav>button[data-dv="review"],.tabbar button[data-v="review"]{--ac:var(--a-check);--acs:var(--a-check-s)}
.panel,#tbl,.dnav>button[data-dv="table"],.tabbar button[data-v="list"]{--ac:var(--a-confirm);--acs:var(--a-confirm-s)}
.hub,.dnav>button[data-dv="report"],.tabbar button[data-v="hub"],#dlgPrev{--ac:var(--a-report);--acs:var(--a-report-s)}
#settings,.dnav>button[data-dv="set"]{--ac:var(--a-set);--acs:var(--a-set-s)}
.dnav>button svg.i{color:var(--ac)}
#dnav>button[aria-current="page"]{background:var(--acs);color:var(--ink);box-shadow:inset 3px 0 0 var(--ac)}
.tabbar button svg.i{color:var(--ac)}
#app .tabbar button[aria-current="page"]{color:var(--ink);background:var(--acs)}
#app .tabbar button[aria-current="page"]::before{background:var(--ac);left:20%;right:20%}
.dhead h2::before,.rail h2::before,.hubh h2::before,.sum h2::before,#dlgPrev h2::before{content:"";display:inline-block;width:6px;height:.9em;border-radius:3px;background:var(--ac);margin-right:8px;vertical-align:-1px}
#app .rail{border-top:3px solid var(--ac)}#app .edit .tools{border-top:3px solid var(--ac)}#app .panel{border-top:3px solid var(--ac)}#app .hubh{border-top:3px solid var(--ac)}
#dash .dwrap,#tbl .dwrap,#settings .dwrap{border-top:3px solid var(--ac)}
#dash .kpi{border-top:3px solid var(--line)}
#dash .kpi:nth-child(1){border-top-color:var(--a-photo)}#dash .kpi:nth-child(2){border-top-color:var(--a-check)}#dash .kpi:nth-child(3){border-top-color:var(--a-confirm)}#dash .kpi.next{border-top-color:var(--accent)}
#dnSteps .dstep:nth-of-type(2) i{border-color:var(--a-photo)}.dstep:nth-of-type(3) i,.dstep:nth-of-type(4) i{border-color:var(--a-check)}.dstep:nth-of-type(5) i{border-color:var(--a-confirm)}.dstep:nth-of-type(6) i{border-color:var(--a-report)}
#app .agrp2{border-left:3px solid var(--ac)}
.stabs{display:flex;gap:6px;flex-wrap:wrap;border-bottom:1px solid var(--line);padding-bottom:8px}
.stabs button{border:1px solid var(--line);background:var(--panel);border-radius:999px;padding:8px 14px;font-weight:600;font-size:13.5px;color:var(--muted);min-height:38px}
#setTabs button[aria-selected="true"]{background:var(--acs);border-color:var(--ac);color:var(--ink)}
.dcard.wide{grid-column:1/-1}
.htab{overflow:auto}.htab table{width:100%;border-collapse:collapse;font-size:13px}
.htab th{text-align:left;font-size:12px;color:var(--muted);font-weight:600;padding:6px 8px;border-bottom:1px solid var(--line);background:var(--soft)}
.htab td{padding:7px 8px;border-bottom:1px solid var(--line);vertical-align:top}
#setAIcard .airow{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:13.5px;border:1px solid var(--line);border-radius:8px;padding:8px 10px}
.pvh{flex-wrap:wrap;gap:6px}.pvt{display:flex;flex-direction:column;min-width:0}.pvt small{color:var(--muted);font-size:12.5px}
#prevPrev,#prevNext{min-width:44px;font-size:20px;line-height:1}
.pstrip{display:flex;gap:6px;overflow-x:auto;padding:6px 12px;border-bottom:1px solid var(--line)}
.pth{flex:none;border:2px solid transparent;border-radius:6px;padding:0;background:none;position:relative}
.pth img{width:64px;height:48px;object-fit:cover;border-radius:4px;display:block}
.pth span{position:absolute;left:3px;top:3px;background:rgba(20,25,28,.75);color:#fff;font-size:11px;font-weight:700;border-radius:3px;padding:0 4px}
.pth.on{border-color:var(--ac)}
.pvb{position:relative}.pvb img{transition:opacity .15s}
#prevBusy{position:absolute;left:16px;top:12px}
@media (max-width:920px){.pvh .btn{min-height:40px}#prevAll{display:none}.stabs{overflow-x:auto;flex-wrap:nowrap}.stabs button{flex:none}}
"""
rep(".dnav,.dpage{display:none}", ".dnav,.dpage{display:none}" + CSS)

open(dst, "w", encoding="utf-8").write(s)
print("ok", len(s), "rules", len(rba['rules']))
