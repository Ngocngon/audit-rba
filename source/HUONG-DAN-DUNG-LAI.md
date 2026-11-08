# Hướng dẫn dựng lại, sửa và làm app tương tự

## 1. Cần gì

- Máy tính có **Python 3** và thư viện **Pillow**. Pillow chỉ dùng để tạo icon:

  ```bash
  python3 -m pip install Pillow
  ```

- Trình duyệt Chrome hoặc Edge để thử.
- Tài khoản Netlify (miễn phí) để đưa app lên mạng.
- Tài khoản Google để lấy key Gemini tại https://aistudio.google.com/apikey.

## 2. Dựng bản cài web từ mã nguồn

Mở Terminal tại thư mục gói này. Bước 1: tạo trang chính, có Gemini, nút cài app, số phiên bản. Thay `1.2` bằng số phiên bản mới:

```bash
mkdir -p out && python3 3-cong-cu-dung/patch_pwa.py 1-ma-nguon-app/soat-anh-ehs-rba.html out/index.html 1.2
```

Bước 2: tạo icon, manifest, service worker, chép file cấu hình Netlify:

```bash
python3 3-cong-cu-dung/pwa_assets.py out 1.2 3-cong-cu-dung/logo.webp && cp 3-cong-cu-dung/_headers out/
```

Thư mục `out` là bản cài web hoàn chỉnh, giống `2-ban-cai-web`. Chép thêm `HUONG-DAN-CAI-APP.md` nếu muốn gửi kèm hướng dẫn.

**Số phiên bản phải đổi mỗi lần phát hành.** Service worker dùng số này làm tên bộ nhớ đệm; không đổi số thì điện thoại có thể giữ bản cũ.

## 3. Đưa lên mạng (Netlify)

1. Mở https://app.netlify.com, đăng nhập.
2. Lần đầu: mở https://app.netlify.com/drop, kéo thư mục bản cài vào. Đổi tên project ở **Project configuration → Project details → Change project name**. Đặt **Project configuration → General → Visitor access: Public**.
3. Các lần sau: mở project → **Deploys** → kéo thư mục mới vào ô "Drag and drop".
4. Kiểm tra: mở địa chỉ app, xem số phiên bản cạnh tên app.

Project hiện tại: `ehsrba`, địa chỉ https://ehsrba.netlify.app.

Có thể dùng chỗ khác (GitHub Pages, Cloudflare Pages, máy chủ nội bộ), miễn là:

- chạy **HTTPS**, để cài app và chạy khi mất mạng;
- trả `manifest.webmanifest` với Content-Type `application/manifest+json`;
- để `sw.js` và `index.html` ở chế độ `no-cache` (xem file `_headers`).

## 4. Sửa app

Mọi thứ nằm trong `1-ma-nguon-app/soat-anh-ehs-rba.html`. Mở bằng trình soạn thảo mã (VS Code), tìm theo các dòng chú thích `/* ---------- Tên phần ---------- */`. Bản đồ các phần ở mục B3 của GHI-CHU-THIET-KE.md.

| Muốn sửa | Tìm trong mã nguồn |
|---|---|
| Danh mục lỗi, mức độ gợi ý, mã RBA, khắc phục mẫu | Hằng `RBA` (JSON: `rules`, `codes`, `tpl`) |
| Lời nhắc cho AI, tiêu chí mức độ | `const BASE=`, `promptWhole`, `promptRegion`, `promptHint` |
| Bảng thời hạn kiểm định, tem nhãn | `const HANDB=`, `HANDB_PROMPT` |
| Tiêu chí mặc định (khóa mức, Mandatory, ngưỡng, hạn khắc phục) | `const CFG=` |
| Cách điền file Findings | `photoRow`, `exportFindings`, `RBA.tpl.map` (mã → cột B, C, E) |
| Ảnh báo cáo | `reportCanvas` |
| PDF trình chiếu | `slideCanvas`, `coverCanvas`, `buildPdf` |
| Ngôn ngữ phụ đề, nhãn song ngữ | `CAPS`, `CAPL`, `TRP` (văn phong dịch), `CJKF` (font) |
| Nhận biết lỗi trùng | `isDup`, `mergeDups` |
| Màu theo khu vực | Biến CSS `--a-dash`, `--a-photo`, `--a-check`, `--a-confirm`, `--a-report`, `--a-set` |
| Gọi Gemini (chỉ trong bản cài web) | `3-cong-cu-dung/patch_pwa.py`: `geminiCall`, `geminiModels`, `G_GAP` (giãn cách 6500 ms) |

**Đổi mẫu Findings:**

1. Mẫu đang nhúng ở `RBA.tpl.b64` (file .xlsm dạng base64, đã làm sạch dòng mẫu).
2. Muốn dùng mẫu khác: chuẩn bị file .xlsm sạch.
3. Đổi sang base64:

   ```bash
   base64 -i mau-moi.xlsm | tr -d '\n' > mau.b64
   ```

4. Thay chuỗi trong `RBA.tpl.b64`.
5. Sửa `photoRow` cho đúng cột của mẫu mới.
6. Nhớ quy tắc: không thay đổi form mẫu khi người dùng chưa đồng ý.

Sau khi sửa: mở file trong Claude để chạy bản Artifact, hoặc dựng lại bản cài web theo mục 2.

## 5. Kiểm thử trên máy không tốn lượt AI

1. Dựng bản cài vào `out` (mục 2) và chép AI giả lập vào đó:

   ```bash
   cp 7-kiem-thu/mock-gemini.js out/_mock.js
   ```

2. Chạy máy chủ thử ở cổng 8765:

   ```bash
   cd out && python3 -m http.server 8765
   ```

3. Mở http://localhost:8765 bằng Chrome, bấm F12 → Console, dán đoạn sau. Đoạn này đặt **key thử** (không phải key thật) và nạp AI giả lập:

   ```js
   localStorage.setItem('soat-ehs-gkey','AIza-test-key');
   localStorage.setItem('soat-ehs-gmodels',JSON.stringify({all:['gemini-2.5-flash'],main:'gemini-2.5-flash',deep:'gemini-2.5-flash'}));
   await import('/_mock.js'); await __addPhotos(4);
   ```

4. AI giả lập trả lỗi mẫu, có cả lỗi trùng, để thử: soát ngầm, gộp lỗi trùng, sửa tại chỗ, xuất Findings, ảnh báo cáo, PDF. `await __addZip()` thử nhập file .zip.
5. Thử xong:
   - Xóa dữ liệu: F12 → Application → Clear site data.
   - Xóa `out/_mock.js` trước khi đưa lên mạng.

Danh sách nên thử trước mỗi lần phát hành:

- [ ] Thêm ảnh: AI tự soát, khu vực tự điền, không có lỗi trùng.
- [ ] Màn Xác nhận lỗi: Sửa tại chỗ, AI viết lại, Xác nhận và sang lỗi tiếp, Không phải lỗi.
- [ ] Nút xuất chỉ bấm được khi đủ điều kiện.
- [ ] File Findings mở được bằng Excel, đủ ảnh ở cột J, macro còn, Summary đếm đúng.
- [ ] Xem ảnh báo cáo đủ ảnh; phụ đề đúng ngôn ngữ; PDF đủ trang, không có mức độ, mã.
- [ ] Giao diện điện thoại (bề rộng 375px) và máy tính (1440px), sáng và tối.
- [ ] Mở lại app: ảnh, lỗi còn nguyên.

## 6. Làm một app tương tự

Cách làm nhanh nhất là **sao chép file mã nguồn rồi thay phần nghiệp vụ**, giữ nguyên phần khung (ảnh, khoanh vùng, AI, xác nhận, xuất file, lưu trữ, cài app).

Ví dụ: audit 5S, ISO 14001, PCCC nội bộ, an toàn công trình xây dựng, hoặc mẫu báo cáo của khách hàng khác.

1. **Danh mục lỗi.** Thay `RBA.rules`. Mỗi lỗi gồm:
   - `id`, `g` (nhóm), `t` (tên lỗi), `k` (dấu hiệu nhìn thấy)
   - `c` (mã), `q` (ID yêu cầu), `v` (mức), `kd` (`violation` hoặc `hazard`), `z` (nguyên nhân)
   - `n`, `x` (khắc phục ngay, triệt để), `l` (căn cứ pháp lý)

   Danh mục càng có "dấu hiệu nhìn thấy" rõ thì AI càng ít bỏ sót.
2. **Bộ mã của tiêu chuẩn.** Thay `RBA.codes`, gồm mã, nội dung, ID yêu cầu, hạng mục pháp lý.
3. **Lời nhắc.** Sửa `BASE`: vai trò chuyên gia, nguyên tắc chỉ nói điều nhìn thấy, logic đề xuất lỗi, tiêu chí mức độ, văn phong câu lỗi. Giữ cấu trúc JSON trả về để không phải sửa phần xử lý.
4. **Mẫu báo cáo.** Thay mẫu nhúng và hàm `photoRow` (mục 4). Nếu báo cáo chỉ cần ảnh và PDF, có thể ẩn nút Findings.
5. **Bảng thời hạn** (`HANDB`) nếu tiêu chuẩn có yêu cầu kiểm định, hạn dùng.
6. **Tên, logo, màu.** Sửa tên trong `patch_pwa.py` và `pwa_assets.py` (`name`, `short_name`), thay `logo.webp`, đổi biến màu CSS.
7. **Tách dữ liệu:** đổi tiền tố lưu trữ `soat-ehs` (IndexedDB và localStorage) sang tên mới. Như vậy hai app chạy trên cùng một trình duyệt không đè dữ liệu nhau.
8. Dựng, kiểm thử (mục 5), đưa lên một project Netlify mới.

Nguyên tắc nên giữ khi làm app tương tự:

- AI chỉ đề xuất, người đánh giá xác nhận; file báo cáo chỉ gồm lỗi đã xác nhận.
- Mức độ lấy theo danh mục để kết quả ổn định giữa các lần soát và giữa các người.
- Phần lời nhắc cố định đặt trước, phần riêng từng ảnh đặt sau, để Gemini dùng lại và trả lời nhanh hơn.
- Chỉ gửi ảnh đã thu nhỏ (tối đa 1600px) cho AI; giữ ảnh gốc 2400px để xuất báo cáo.
- Lưu mọi thứ trên máy; có Xuất gói để chuyển máy và gộp nhóm.
