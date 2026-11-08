// AI giả lập cho Audit RBA: thay lời gọi Gemini bằng câu trả lời mẫu để kiểm thử, không tốn lượt, không cần key thật.
// Chỉ dùng trên máy thử (http://localhost). Không đưa file này lên mạng.
// Cách dùng (trong Console của trình duyệt, xem HUONG-DAN-DUNG-LAI.md mục 5):
//   await import('/_mock.js'); await __addPhotos(4);   // thêm 4 ảnh thử, AI giả lập tự soát
//   await __addZip();                                   // thử nhập file .zip chứa ảnh
//   window.__g                                          // các lời nhắc app đã gửi cho AI (để kiểm tra)
window.__g = [];
const realFetch = window.fetch.bind(window);
let k = 0;
const AREAS = ['Kho hóa chất', 'Trạm khí nén', 'Xưởng dập', 'Nhà ăn'];
const KO = ['지게차 검사 필증 유효기간 경과', '소화기 점검 기한 경과 및 점검표 미부착', '화학물질 창고', '공기압축기실', '비상구 앞 적재물 방치로 대피로 확보 불가', '분전반 커버 미설치 및 경고 표지 미부착', '프레스 작업장', '구내식당'];
const ZH = ['叉车检验标签已过期', '灭火器超过检查期限且未悬挂检查卡', '化学品仓库', '空压机房', '紧急出口前堆放物品，疏散通道受阻', '配电箱未安装盖板且未张贴警示标签', '冲压车间', '员工食堂'];
// box_2d theo cách của Gemini: [y1, x1, y2, x2], thang 0–1000
const F = (rule, title, sev, box, code) => ({ rule, kind: 'violation', title, evidence: 'Nhìn thấy trong ảnh', severity: sev, confidence: 88, fix_now: 'Xử lý ngay', fix_root: 'Khắc phục triệt để', cause: 'Facility', rba_code: code || '', box_2d: box });

window.fetch = async (u, o = {}) => {
  u = String(u);
  if (!u.includes('generativelanguage')) return realFetch(u, o);
  if (u.includes('/models?')) return new Response(JSON.stringify({ models: [{ name: 'models/gemini-2.5-flash', supportedGenerationMethods: ['generateContent'] }] }));
  const b = JSON.parse(o.body), t = b.contents[0].parts.at(-1).text, sys = b.systemInstruction ? b.systemInstruction.parts[0].text : '';
  window.__g.push({ sys, t });
  let out;
  if (t.includes('một chữ')) out = 'OK';                                   // kiểm tra key
  else if (t.includes('Dịch')) {                                           // dịch phụ đề, tiếng Anh
    const list = JSON.parse(t.slice(t.lastIndexOf('[')));
    const tb = t.includes('tiếng Hàn') ? KO : t.includes('tiếng Trung') ? ZH : null;
    out = JSON.stringify(list.map((s, i) => tb ? tb[(s.length + i) % tb.length] : 'EN: ' + s));
  } else if (t.includes('CĂN CỨ CỦA NGƯỜI ĐÁNH GIÁ')) {                    // AI viết lại theo ý người dùng
    const hint = (t.match(/CĂN CỨ CỦA NGƯỜI ĐÁNH GIÁ \(bắt buộc dùng làm căn cứ\): ([^\n]*)/) || [])[1] || '';
    out = JSON.stringify({ no_violation: false, ...F('', 'AI viết lại: ' + hint, 'Major', [300, 300, 600, 600], 'BH201') });
  } else {                                                                  // soát cả ảnh
    const i = k++ % 4;
    let list = [F(i % 2 ? 'TN2' : 'TN1', i % 2 ? 'Bình chữa cháy quá hạn bảo dưỡng, thẻ ghi 03/2026' : 'Xe nâng có tem kiểm định hết hạn 08/2026', 'Minor', [150, 150, 550, 550])];
    if (i === 2) list = [                                                   // ảnh thứ 3: có 2 cặp lỗi trùng để thử gộp
      F('TN1', 'Xe nâng có tem kiểm định hết hạn 08/2026', 'Minor', [100, 100, 400, 400]),
      F('TN1', 'Tem kiểm định của xe nâng thứ hai đã hết hạn', 'Minor', [600, 100, 900, 400]),
      F('', 'Lối thoát hiểm bị chắn bởi pallet hàng hóa, không đảm bảo lối đi thoát nạn', 'Priority', [600, 500, 950, 900]),
      F('', 'Pallet hàng hóa chắn lối thoát hiểm, không đảm bảo lối thoát nạn', 'Priority', [610, 510, 940, 890]),
      F('', 'Tủ điện không có nắp che và không có biển cảnh báo nguy hiểm điện', 'Major', [100, 600, 400, 950])];
    out = JSON.stringify({ scene: 'Khu vực', area_guess: AREAS[i], findings: list, compliant: [], verify: [] });
  }
  await new Promise(r => setTimeout(r, 150));
  const enc = new TextEncoder();
  return new Response(new ReadableStream({ start(c) { c.enqueue(enc.encode('data: ' + JSON.stringify({ candidates: [{ content: { parts: [{ text: out }] }, finishReason: 'STOP' }] }) + '\n\n')); c.close() } }));
};

window.__img = async (i, portrait) => {
  const c = document.createElement('canvas'); c.width = portrait ? 1800 : 2400; c.height = portrait ? 2400 : 1800;
  const g = c.getContext('2d'); g.fillStyle = `hsl(${i * 70},35%,55%)`; g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = '#fff'; g.font = '200px sans-serif'; g.fillText('Ảnh ' + (i + 1), 200, 400);
  return new Promise(r => c.toBlob(r, 'image/jpeg', .85));
};
window.__addPhotos = async n => {
  const dt = new DataTransfer();
  for (let i = 0; i < n; i++) dt.items.add(new File([await __img(i, i === 1)], `anh-${i + 1}.jpg`, { type: 'image/jpeg' }));
  const inp = document.getElementById('file'); inp.files = dt.files; inp.dispatchEvent(new Event('change', { bubbles: true }));
};
window.__addZip = async () => {
  const z = new JSZip(); z.file('B/anh-10.jpg', await __img(5)); z.file('A/anh-2.jpg', await __img(6)); z.file('__MACOSX/A/._anh-2.jpg', 'x'); z.file('ghichu.txt', 'abc');
  const dt = new DataTransfer(); dt.items.add(new File([await z.generateAsync({ type: 'blob' })], 'anh-hien-truong.zip', { type: 'application/zip' }));
  const inp = document.getElementById('pack'); inp.files = dt.files; inp.dispatchEvent(new Event('change', { bubbles: true }));
};
