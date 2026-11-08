# Audit RBA v1.1 – Gói mã nguồn

App soát ảnh hiện trường EHS theo RBA Guider 8.0.1, AI khoanh vùng và viết lỗi, người đánh giá xác nhận, xuất file Findings mẫu Samsung SEV/T, ảnh báo cáo song ngữ và PDF trình chiếu.

Đang chạy tại: https://ehsrba.netlify.app

## Trong gói có gì

| Thư mục, file | Dùng để |
|---|---|
| `DOC-TRUOC.md` | File này |
| `GHI-CHU-THIET-KE.md` | **Các quy tắc đã chốt** (file Findings cố định, điều kiện xuất, tiêu chí mức độ, tem nhãn, AI, giao diện, PDF...), kiến trúc, lưu trữ, lời nhắc AI, giới hạn, lịch sử phiên bản |
| `HUONG-DAN-DUNG-LAI.md` | Dựng lại bản cài web từ mã nguồn, đưa lên Netlify, sửa app, kiểm thử, làm app tương tự |
| `PHU-LUC-DANH-MUC-VA-THOI-HAN.md` | 77 lỗi trong danh mục, 41 mã Guider, bảng thời hạn kiểm định và tem nhãn kèm căn cứ |
| `1-ma-nguon-app/soat-anh-ehs-rba.html` | **Toàn bộ mã nguồn** trong một file: giao diện, xử lý, danh mục RBA, mẫu Findings nhúng sẵn. Mở được trong Claude (Artifact) |
| `2-ban-cai-web/` | Bản cài web đã dựng sẵn (PWA), kéo thả lên Netlify là chạy. Có `HUONG-DAN-CAI-APP.md` cho người dùng cuối |
| `3-cong-cu-dung/` | `patch_pwa.py` (biến mã nguồn thành bản cài web dùng Gemini), `pwa_assets.py` (tạo icon, manifest, service worker), `logo.webp` |
| `4-lich-su-thay-doi/` | Các bản vá từ v10 đến v1.1, mỗi file ghi rõ thay đổi ở đầu file. Chỉ để tham khảo |
| `5-mau-findings-goc/` | Mẫu Findings SEV/T gốc (.xlsm) dùng để nhúng vào app |
| `6-phu-luc-chatgpt/` | Bản dùng trong ChatGPT (Project hoặc GPT), làm ở giai đoạn đầu |
| `7-kiem-thu/mock-gemini.js` | AI giả lập để kiểm thử trên máy, không tốn lượt Gemini |

## Dùng nhanh

- **Đưa app lên mạng:** kéo thư mục `2-ban-cai-web` vào Netlify (xem `2-ban-cai-web/HUONG-DAN-CAI-APP.md`).
- **Sửa app:** sửa `1-ma-nguon-app/soat-anh-ehs-rba.html`, rồi dựng lại bản cài web bằng 2 lệnh trong `HUONG-DAN-DUNG-LAI.md`.
- **Làm app tương tự** (tiêu chuẩn khác, mẫu báo cáo khác): xem phần 5 của `HUONG-DAN-DUNG-LAI.md`.

## Lưu ý quan trọng nhất

1. **File Findings là cố định**: không tự ý thay đổi form mẫu.
2. Chỉ xuất khi đã kiểm tra hết, và chỉ gồm lỗi đã xác nhận.
3. AI chỉ đề xuất; người đánh giá luôn xác nhận từng lỗi.
4. Key Gemini là của từng người, lưu trên máy, không gửi qua nhóm chat.
5. Gói này **không chứa** key AI, ảnh hiện trường hay file Findings cũ của khách hàng.
