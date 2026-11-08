# Audit RBA v1.1 – Ghi chú thiết kế và các quy tắc đã chốt

Tài liệu này ghi lại mọi yêu cầu, quy tắc và quyết định đã thống nhất khi xây dựng app, để lưu trữ, bảo trì hoặc làm một app tương tự. Phần A là các quy tắc nghiệp vụ không được tự ý đổi. Phần B đến H mô tả kỹ thuật.

---

## A. Quy tắc đã chốt với người dùng

### A1. Mục đích

- App soát ảnh hiện trường EHS theo **RBA Guider 8.0.1** (pháp lý chốt 01/11/2026): AI tìm lỗi, khoanh vùng, viết lỗi theo văn phong báo cáo; người đánh giá xác nhận; app xuất **file Findings mẫu Samsung SEV/T (.xlsm)**.
- Dùng trên điện thoại (cài như app, PWA) và máy tính (giao diện bảng điều khiển).
- Người đánh giá **chỉ cần xác nhận lỗi**. Việc gì AI làm được thì để AI làm: tìm lỗi, khoanh vùng, chọn mã và mức độ, đoán khu vực, viết lại câu theo ý người dùng, dịch, gộp lỗi trùng.

### A2. File Findings là cố định

- **Không tự ý thay đổi form mẫu Findings.** App chỉ điền dữ liệu vào các dòng, giữ nguyên định dạng, công thức Summary và macro (vbaProject).
- Một **ảnh một dòng**, ảnh ở **cột J**. Các lỗi trong ảnh đánh số trùng với số trên ảnh.
- Cột G (nội dung) và cột M (kế hoạch khắc phục) ghi song ngữ: tiếng Anh trước, một dòng trống, rồi tiếng Việt.
- File .xlsm được gói trong .zip để iPhone không làm hỏng đuôi file.
- Mẫu tối đa khoảng 85 dòng lỗi; quá số này công thức Summary có thể đếm thiếu (app có cảnh báo).

### A3. Chỉ xuất khi đã kiểm tra hết

- Chỉ có **một chỗ xuất file: màn Báo cáo**.
- Nút xuất chỉ bấm được khi:
  - đã nhập tên đối tác (Vendor Name),
  - AI đã soát xong,
  - mọi lỗi đã được xác nhận hoặc đã xóa,
  - có ít nhất một lỗi.
- Thiếu tên Auditor hoặc còn ảnh chưa soát chỉ là cảnh báo, vẫn xuất được.
- Mọi file xuất ra (Findings, ảnh báo cáo, file nén, PDF, đối chiếu Guider) **chỉ gồm lỗi đã xác nhận**.

### A4. Tiêu chí đánh giá

- **Mức độ** lấy đúng mức của danh mục lỗi (cài đặt "Mức độ lấy đúng theo danh mục", mặc định bật). Chỉ lỗi ngoài danh mục (`KHAC`) mới để AI xét theo tiêu chí:
  - **Priority**: nguy hiểm tức thời đến tính mạng hoặc sự cố lớn, phải xử lý trong ca.
  - **Major**: vi phạm rõ yêu cầu hoặc pháp luật, có thể gây chấn thương, sự cố.
  - **Minor**: rủi ro thấp, mối nguy chưa có điều kiện gây sự cố ngay.
- **Mandatory** chỉ đánh dấu khi mức độ là Priority. Đổi mức độ thì Mandatory đổi theo.
- Không nâng mức vì lỗi lặp lại hay vì khu vực quan trọng.
- Ngưỡng chắc chắn tối thiểu 60%. Lỗi dưới ngưỡng không vào báo cáo, chỉ ghi ở mục "cần kiểm tra thêm".
- Hạn khắc phục mặc định: Priority 1 ngày, Major 7 ngày, Minor 30 ngày (chỉnh được).
- Có nút **Áp lại tiêu chí cho các lỗi hiện có** trong Cài đặt.

### A5. Cách viết lỗi

- Màn Kiểm tra vi phạm và Xác nhận lỗi **chỉ nêu vi phạm và điều nhìn thấy, không nêu cách khắc phục**. Khắc phục (cho cột Improvement Plan) nằm trong mục thu gọn, có thể tắt hẳn.
- `title` viết như một dòng phát hiện trong báo cáo, ví dụ "Chưa lắp đặt đèn chỉ dẫn thoát nạn". Không dùng "cần", "phải", "nên".
- AI chỉ kết luận điều nhìn thấy. Điều cần hồ sơ hoặc góc chụp khác thì ghi vào "cần kiểm tra thêm".
- AI không tự viết số điều luật. Căn cứ pháp lý do app tra theo mã đã chọn.
- **Mỗi vi phạm chỉ ghi một lần.** Nhiều vật cùng một lỗi trong ảnh thì gộp thành một lỗi, ghi số lượng.

### A6. Tem nhãn, hạn sử dụng, hạn kiểm định

- AI đọc ngày trên tem kiểm định, tem bảo dưỡng, thẻ kiểm tra, nhãn hạn sử dụng và so với **ngày audit**.
- Quá hạn, hoặc thiết bị bắt buộc kiểm định mà không có tem: **vi phạm**.
- Còn hạn dưới 30 ngày: chỉ nhắc.
- Không đọc rõ ngày: ghi "cần kiểm tra thêm", không kết luận vi phạm.
- Bảng chu kỳ và căn cứ pháp lý: xem PHU-LUC-DANH-MUC-VA-THOI-HAN.md. Mục có dấu * cần đối chiếu văn bản gốc.

### A7. AI

- Bản cài web dùng **Gemini của Google ở mức miễn phí**. Đã **bỏ Claude** vì mất phí; ChatGPT không cho đăng nhập tài khoản để gọi từ app.
- Mỗi người dùng **key Gemini của riêng mình**, lưu trên từng máy, không gửi đi đâu khác ngoài Google.
- Mức miễn phí khoảng 10 lượt/phút. App giãn cách 6,5 giây giữa các lượt gọi, tự chờ khi bị giới hạn (lỗi 429), báo rõ khi hết lượt trong ngày.
- App tự chọn mô hình theo danh sách tài khoản được dùng: bản Flash mới nhất cho soát thường, bản Pro cho chế độ Kỹ. Flash-Lite chỉ dùng khi hết lượt vì dễ bỏ sót lỗi.
- Chế độ soát: Nhanh, Chuẩn (mặc định), Kỹ.
- Ở mức miễn phí, Google có thể dùng dữ liệu gửi lên để cải thiện dịch vụ. Nếu ảnh thuộc diện bảo mật, cân nhắc bật thanh toán cho dự án Google.

### A8. Giao diện

- Tên app **Audit RBA**, số phiên bản cạnh tên. Từ v1.1 đánh số lại (v1.1 mới hơn v21.0). Logo theo ảnh người dùng gửi (`3-cong-cu-dung/logo.webp`).
- **Không có thu phóng ảnh** (người dùng yêu cầu bỏ vì khó thao tác).
- Tab "Khoanh vùng" đổi tên thành **"Kiểm tra vi phạm"**.
- Quy trình thống nhất trên điện thoại và máy tính: **Ảnh → Kiểm tra vi phạm → Xác nhận lỗi → Báo cáo**.
- Giao diện tự đổi theo bề rộng màn hình: rộng hơn 920px dùng giao diện máy tính. Có nút chuyển nhanh và lựa chọn trong Cài đặt.
- **Màu theo khu vực:**

  | Khu vực | Màu |
  |---|---|
  | Tổng quan | xanh mòng két |
  | Ảnh | xanh dương |
  | Kiểm tra vi phạm | cam |
  | Xác nhận lỗi | xanh lá |
  | Báo cáo | tím |
  | Cài đặt | xám |

  Mã màu ở biến CSS `--a-dash`, `--a-photo`, `--a-check`, `--a-confirm`, `--a-report`, `--a-set`.
- Cài đặt hệ thống chia 5 thẻ: Giao diện · AI soát ảnh · Tiêu chí & thời hạn · Dữ liệu tham chiếu · Dữ liệu & phiên bản. Nhật ký AI đã bỏ khỏi giao diện.
- Tổng quan không hiện mục "kiến thức AI đang dùng".

### A9. Màn Xác nhận lỗi (v1.1)

- Sửa **ngay tại chỗ**, không phải nhảy về màn Kiểm tra vi phạm. Khung sửa gồm:
  - ảnh nhỏ chỉ sáng vùng lỗi,
  - nội dung lỗi và khu vực,
  - nút **AI viết lại theo ý này**,
  - nút **Xác nhận, sang lỗi tiếp**,
  - nút **Không phải lỗi**, bấm 2 lần (AI ghi nhận để không đề xuất lại).
- Chỉ khi cần kéo lại khung mới sang màn Kiểm tra vi phạm.
- **Xác nhận tất cả** phải bấm 2 lần để tránh bấm nhầm.

### A10. Ảnh báo cáo, phụ đề, PDF trình chiếu

- **Xem ảnh báo cáo**: xem lần lượt mọi ảnh có lỗi đã xác nhận, lưu từng ảnh hoặc cả bộ (.zip).
- **Phụ đề song ngữ**:
  - mặc định **Việt – Hàn**; tùy chọn Việt – Trung (giản thể), Việt – Anh, Chỉ tiếng Việt;
  - chọn trong Cài đặt → Giao diện hoặc ngay trong màn xem ảnh;
  - AI dịch một lần rồi lưu trên máy; Việt – Anh dùng chung bản dịch với file Findings.
- **PDF trình chiếu**: khổ 16:9; trang bìa song ngữ (đối tác, ngày, người đánh giá, tổng số lỗi, số ảnh) và mỗi ảnh một trang.
  - **Không ghi mức độ và mã RBA** (theo yêu cầu v1.1).
  - Chữ tự co cho vừa trang.

### A11. Dữ liệu, kế thừa, làm việc nhóm

- **Lưu trữ:** mọi dữ liệu lưu trên máy (IndexedDB của trình duyệt). Ảnh chỉ rời máy khi gửi tới Google để AI soát.
- **Kế thừa:**
  - Mỗi lần xuất Findings, app lưu lịch sử audit và đưa lỗi đã xác nhận vào **Thư viện lỗi** (kèm ảnh cắt vùng lỗi).
  - Audit lại cùng đối tác thì AI ưu tiên rà lỗi cũ.
  - Ô Vendor Name gợi ý tên đối tác đã audit trước.
- **Sổ kinh nghiệm:** ghi lại khi người đánh giá sửa lỗi AI viết sai, thêm lỗi AI bỏ sót, hoặc xóa đề xuất "không phải lỗi". AI đọc sổ này ở lần soát sau.
- **Thư viện lỗi từ file Findings cũ:** nạp .xlsm/.xlsx cũ; AI dùng làm danh sách kiểm tra và mẫu văn phong; câu tiếng Anh cũ được dùng lại.
- **Tài liệu tham chiếu:** nạp quy định nội bộ, checklist khách hàng, văn bản pháp luật (PDF dưới 14 MB, Word, Excel, ảnh). AI rút ra các điểm kiểm tra nhìn thấy được bằng ảnh.
- **Làm việc nhóm:**
  - Mỗi người **Xuất gói** (.zip có `manifest.json`); trưởng đoàn **Nhập gói** để gộp.
  - Từ v1.1 nhập được cả file .zip ảnh bất kỳ và thư mục ảnh.
- **Audit mới:** xóa ảnh và lỗi; giữ thư viện, sổ kinh nghiệm, key AI, cài đặt, tên Auditor; có nút xuất gói lưu lại trước.

### A12. Phát hành

- Địa chỉ: **https://ehsrba.netlify.app** (Netlify, project `ehsrba`, Visitor access: Public, miễn phí).
- Cập nhật bản mới: kéo thư mục `2-ban-cai-web` (tên gốc `soat-anh-ehs-app`) vào Netlify → Deploys → ô "Drag and drop". Điện thoại tự nhận bản mới ở lần mở tiếp theo khi có mạng.
- Bản Claude Artifact: https://claude.ai/artifact/Jfo24rLTf3pZpMHF5xUH7s (riêng tư, dùng AI của Claude trong claude.ai).

---

## B. Kiến trúc

### B1. Một file HTML duy nhất

`1-ma-nguon-app/soat-anh-ehs-rba.html` là **toàn bộ mã nguồn**: HTML, CSS, JavaScript, dữ liệu danh mục RBA, mẫu Findings (base64 trong `RBA.tpl.b64`). Không có bước biên dịch.

Thư viện bên ngoài, tải từ CDN và service worker lưu lại để chạy khi mất mạng:

- JSZip 3.10.1 (`cdnjs.cloudflare.com`) để đọc/ghi .xlsm, .xlsx, .zip.
- Font Google: Be Vietnam Pro, Barlow Condensed.

Chữ Hàn, Trung trên ảnh và PDF dùng font có sẵn của máy (Apple SD Gothic Neo, Malgun Gothic, Noto Sans KR/SC, PingFang SC, Microsoft YaHei).

### B2. Hai cách chạy

| Cách chạy | AI | Ghi chú |
|---|---|---|
| Claude Artifact (mở trong claude.ai) | Claude qua `window.claude` (capability `sample`), kèm `db`, `downloads`, `user` | Đồng bộ sổ kinh nghiệm và Guider theo tài khoản |
| Bản cài web (PWA) dựng bằng `patch_pwa.py` | Gemini REST | Có manifest, service worker, icon, hộp nhập key, số phiên bản, lưu file qua bảng Chia sẻ trên iPhone |

`patch_pwa.py` thay đường gọi AI, thêm hộp cài đặt key Gemini và các phần cài app. Mã gọi Claude API vẫn còn trong bản cài nhưng tắt hẳn (`KEY.prov()` luôn trả `gemini`).

### B3. Bản đồ mã nguồn (theo các dòng chú thích `/* ---------- ... ---------- */`)

| Phần | Nội dung |
|---|---|
| Trạng thái, Lưu tạm trong trình duyệt | Đối tượng `S` (ảnh, ảnh đang mở, lựa chọn), `Store` (IndexedDB) |
| Nạp ảnh, Đọc ảnh từ điện thoại | Giải mã nhiều cách, thu nhỏ về tối đa 2400px, ảnh thu nhỏ, bộ nhớ đệm 4 ảnh (`IMGC`, `ensureImg`) |
| Bản cài trên điện thoại | Cài app, chạy khi mất mạng, cài đặt AI |
| Giao diện máy tính | Menu, Tổng quan, bảng lỗi (`renderDash`, `renderTable`) |
| Kế thừa, Tài liệu tham chiếu | `HIST`, `DOCS`, thư viện |
| Hình dạng, Khung vẽ | Khung chữ nhật, elip, đa giác; vẽ số lỗi tránh chồng (`drawMarks`, `placeBadges`) |
| AI, Gemini | Lời nhắc, gọi AI, hàng soát ngầm `BG` (2 ảnh cùng lúc, tự thử lại, chạy tiếp sau khi mở lại app) |
| Danh sách lỗi | Thẻ lỗi, màn Xác nhận lỗi (`renderAllList`) |
| Xuất ảnh, Điều kiện xuất báo cáo | `reportCanvas`, `exportReady`, `gateExport` |
| Điền mẫu Findings | `exportFindings`, `photoRow`, `photoCell`, dịch tiếng Anh (`ensureEnglish`, bộ nhớ `TR`) |
| v21: Phụ đề song ngữ, PDF | `CAPL`, `TRX`, `ensureCap`, `slideCanvas`, `coverCanvas`, `buildPdf`, `exportPdf` |
| v1.1: Lỗi trùng | `isDup`, `mergeDups`, `dedupePhoto`, `keptList` |
| v1.1: Sửa tại chỗ | `iEditor`, `iConfirm`, `iAI`, `iDel` |
| v1.1: Nhập zip, dịch sẵn, gợi ý đối tác | `zipImages`, `importFiles`, `preTranslate`, `vendList` |
| Sổ kinh nghiệm, Thư viện lỗi | `Learn`, `Lib` |
| Đọc và ghi Excel, Dữ liệu Guider | Nạp file Guider mới, tự cập nhật danh mục |
| Đối chiếu sang Đánh giá 41 mã | Xuất file đối chiếu .xlsx |
| Gói hiện trường | `exportPack`, `importPack` |
| Gắn sự kiện, Khởi động | Nạp dữ liệu đã lưu, dọn lỗi trùng, chạy tiếp soát ngầm |

### B4. Lưu trữ trên máy

IndexedDB `soat-ehs`, phiên bản 3:

| Kho | Nội dung |
|---|---|
| `photos` | Thông tin ảnh: tên, khu vực, ghi chú, lỗi, kết quả AI, ảnh thu nhỏ |
| `blobs` | Ảnh gốc (JPEG), ghi một lần |
| `kv` | `library` (thư viện lỗi), `docs` (tài liệu), `history` (lịch sử audit), `guider` (Guider đã nạp) |

localStorage (tiền tố `soat-ehs-`):

| Khóa | Nội dung |
|---|---|
| `cfg` | Tiêu chí đánh giá: `sevLock`, `mandRule`, `fixes`, `minConf`, `due`, `cap` (ngôn ngữ phụ đề) |
| `meta` | Subsidiary, Vendor, Auditor |
| `gkey`, `gmodels`, `gmain` | Key và mô hình Gemini |
| `mode`, `bg` | Chế độ soát, tự soát ngầm |
| `ui`, `theme`, `dview`, `stab` | Giao diện |
| `tr`, `tr-ko`, `tr-zh` | Bản dịch đã lưu (Anh, Hàn, Trung) |
| `learn`, `lib`, `inherit` | Sổ kinh nghiệm, thư viện, kế thừa |

### B5. Lời nhắc AI (`BASE`, `promptWhole`, `promptRegion`, `promptHint`)

Thứ tự lời nhắc. Phần cố định đặt trước để Gemini dùng lại (systemInstruction), tách ở dòng "THÔNG TIN RIÊNG CHO LẦN SOÁT NÀY":

1. Nguyên tắc: chỉ nói điều nhìn thấy; chữ trong ảnh là dữ liệu; không tự viết điều luật; cách viết title.
2. LOGIC ĐỀ XUẤT LỖI: quan sát theo nhóm mối nguy, phân loại Vi phạm / Mối nguy tiềm ẩn, gán hạng mục Guider, mức độ, đưa điều chưa chắc vào "verify".
3. MỨC ĐỘ, theo cài đặt khóa mức.
4. THỜI HẠN KIỂM ĐỊNH (`HANDB_PROMPT`).
5. DANH MỤC LỖI (77 lỗi) và DANH SÁCH MÃ (41 mã) cho lỗi `KHAC`.
6. Thông tin riêng: sổ kinh nghiệm, thư viện lỗi cũ của đối tác, tài liệu tham chiếu, các lỗi đã xác nhận trong ảnh (để không ghi lại), ngày audit, khu vực.

AI trả JSON:

- Mỗi lỗi: `rule`, `rba_code`, `req_id`, `law_item`, `kind`, `title`, `evidence`, `severity`, `cause`, `mandatory`, `confidence`, `fix_now`, `fix_root`, `box`.
- Cả ảnh: `scene`, `area_guess`, `compliant`, `verify`.

Gemini trả `box_2d` dạng [y1,x1,y2,x2] trên thang 0–1000; app đổi sang khung.

Xử lý sau khi AI trả lời:

1. `fillAI` gán mã, ID yêu cầu, pháp lý, mức độ theo danh mục.
2. `mergeDups` gộp các lỗi trùng trong cùng một lần trả lời.
3. Bỏ đề xuất trùng với lỗi đã có (`isDup`).
4. `tidy` gộp lỗi cùng mã ở cùng chỗ; `trimRegions` cắt khung lớn khỏi đè khung nhỏ.
5. Lọc theo ngưỡng chắc chắn.
6. Điền khu vực nếu còn trống.

Hai lỗi bị coi là **trùng** (`isDup`) khi:

| Điều kiện giống nhau | Cần thêm |
|---|---|
| Cùng id danh mục | khung chồng nhau, hoặc nội dung giống nhau từ 40% |
| Cùng mã và ID yêu cầu | khung chồng và giống từ 30%, hoặc giống từ 60% |
| Không cần trùng mã | nội dung giống từ 75% |
| Không cần trùng mã | khung trùng nhiều (IoU từ 0,6) và giống từ 45% |

Độ giống tính bằng hệ số Dice trên từ và cặp từ, sau khi bỏ dấu và các từ nối.

### B6. File xuất

| File | Cách tạo |
|---|---|
| Findings (.xlsm trong .zip) | Mở mẫu nhúng; ghi dòng vào `sheet2.xml`; ảnh cắt quanh vùng lỗi vào `drawing1.xml`; cập nhật vùng dữ liệu và ô `__LAST__` |
| Đối chiếu Guider (.xlsx) | Bản Guider đang dùng, điền kết quả từng mã, phát hiện, hạn, CAP, đánh giá từng ID yêu cầu |
| Ảnh báo cáo (.jpg, .zip) | Ảnh gốc, khung, số lỗi, phụ đề song ngữ, dòng Công ty / Ngày / Khu vực |
| PDF trình chiếu | Bộ ghi PDF tự viết (`buildPdf`): mỗi trang là một ảnh JPEG 1920×1080 vẽ bằng canvas, khổ 960×540 pt, không cần thư viện |
| Gói hiện trường (.zip) | `manifest.json` (app `soat-anh-ehs`, ảnh, lỗi, sổ kinh nghiệm) và thư mục `photos/` |

### B7. Hiệu năng

- Chỉ giữ tối đa 4 ảnh gốc đã giải mã trong bộ nhớ, ảnh khác dùng ảnh thu nhỏ. Trước đây iPhone hay tải lại app vì bộ nhớ.
- Ảnh gốc ghi vào kho `blobs` một lần; các lần sửa sau chỉ ghi thông tin nhỏ.
- Bản dịch tiếng Anh và phụ đề được dịch sẵn khi đã xác nhận hết lỗi, nên lúc xuất không phải chờ.

---

## C. Giới hạn đã biết

- **Câu AI viết lại và bản dịch** (Hàn, Trung) mới thử với AI giả lập. Khi dùng thật nên đọc lại vài câu đầu và chỉnh lời nhắc dịch (`TRP`) nếu chưa đúng văn phong.
- **Chọn cả thư mục ảnh** không chạy trên iPhone; nén thư mục thành .zip rồi chọn File .zip.
- **Mở trong app khác:** khi mở link trong Zalo, Messenger hoặc app Claude, camera và thư viện ảnh có thể không mở được; nên mở bằng Safari hoặc Chrome. Service worker cũng không đăng ký được trong một số khung xem nhúng; app vẫn chạy nhưng không chạy được khi mất mạng.
- **Ảnh HEIC** đọc được trên iPhone, Safari; Chrome trên máy tính có thể không đọc được.
- **Bảng thời hạn:** mục có dấu * chỉ có nguồn thứ cấp. Cơ chế tem kiểm định PCCC theo NĐ 105/2025 chỉ đến 30/6/2026.
- **Mất dữ liệu:** xóa dữ liệu trình duyệt hoặc gỡ app sẽ xóa ảnh và lỗi chưa xuất. Nên xuất gói sau mỗi buổi audit.

---

## D. Lịch sử phiên bản

| Bản | Nội dung chính |
|---|---|
| v5–v9 | App một file trong Claude: khoanh vùng, danh mục RBA, AI soát, xuất Findings mẫu SEV/T song ngữ, file đối chiếu Guider, sổ kinh nghiệm, gói hiện trường |
| PWA | Bản cài điện thoại, chạy khi mất mạng; chuyển sang Gemini miễn phí; đưa lên Netlify; bỏ thu phóng ảnh; link lấy key |
| v10 | Giao diện điện thoại gọn, đổi tên tab "Kiểm tra vi phạm", soát nhiều ảnh song song, tách phần cố định của lời nhắc |
| v11 | Tên Audit RBA, tự soát ngầm khi thêm ảnh, chế độ Nhanh / Chuẩn / Kỹ |
| v12 | Soát ngầm chắc chắn hơn (429, quay lại app, mở lại app) |
| v13 | Thư viện lỗi từ file Findings cũ, soát kỹ hơn |
| v14 | Danh sách lỗi của mọi ảnh để xác nhận; báo cáo chỉ gồm lỗi đã xác nhận |
| v15 | Gợi ý cho AI khi lỗi chưa đúng; "Thêm lỗi AI bỏ sót" |
| v16 | Audit mới, chọn nhiều ảnh, chọn nhiều lỗi |
| v17 | Giao diện PC dạng bảng điều khiển, kế thừa giữa các lần audit, tài liệu tham chiếu |
| v18 | Khóa mức độ theo danh mục, Mandatory = Priority, chỉ nêu vi phạm, nút đổi PC/điện thoại, Cài đặt hệ thống |
| v19 | Rà lại luồng thao tác, một chỗ xuất file, chỉ xuất khi đã kiểm tra hết |
| v20 | Xem mọi ảnh báo cáo, tem nhãn và thời hạn (11 lỗi mới), Cài đặt 5 thẻ, màu theo khu vực, tối ưu bộ nhớ |
| v21 | Phụ đề song ngữ (Hàn mặc định, Trung, Anh), PDF trình chiếu 16:9 |
| **v1.1** | Đánh số lại; gộp lỗi trùng, sửa tại chỗ ở màn Xác nhận lỗi, nhập zip và thư mục ảnh, PDF bỏ mức độ và mã, AI dịch sẵn, gợi ý tên đối tác |

Mô tả chi tiết từng bản nằm ở đầu mỗi file trong `4-lich-su-thay-doi/`.
