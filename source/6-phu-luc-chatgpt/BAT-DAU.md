# Cài Soát Ảnh EHS vào ChatGPT

Chọn một trong hai cách. Cả hai dùng chung một nội dung.

## Cách 1: ChatGPT Project (tài khoản cá nhân và mọi gói)

1. Trong ChatGPT, chọn **New project** ở thanh bên, đặt tên `Soát Ảnh EHS`.
2. Bấm **•••** rồi **Project settings**, dán toàn bộ nội dung `INSTRUCTIONS.txt` vào ô hướng dẫn.
3. Thêm 2 tệp vào project: `findings_tool.py` và `danh_muc_loi.md`.
4. Mở một cuộc trò chuyện mới trong project, gửi ảnh và ghi rõ Vendor, Auditor, ngày audit.

Sau này có thể thêm 2 loại tệp vào project, ChatGPT sẽ tự nạp ở mỗi cuộc trò chuyện mới:

- File RBA Guider `.xlsx` khi có bản mới.
- Sổ kinh nghiệm `So-kinh-nghiem-EHS.json`, có sau buổi soát đầu tiên.

Nếu ChatGPT báo không tìm thấy công cụ, hãy đính kèm thêm `findings_tool.py` vào tin nhắn đó rồi gửi lại.

## Cách 2: Skill (Business, Enterprise, Edu)

1. Trong ChatGPT, chọn **Plugins**, mở thẻ **Skills**.
2. Chọn **Create**, rồi **Upload from your computer**.
3. Tải lên `soat-anh-ehs-rba-skill.zip`.
4. Gửi ảnh trong một cuộc trò chuyện bình thường.

Skill không có chỗ để tệp cố định, nên hãy đính kèm file Guider mới và `So-kinh-nghiem-EHS.json` vào tin nhắn đầu tiên của mỗi cuộc trò chuyện.

## Cách dùng

Gửi ảnh dạng tệp JPG hoặc PNG. ChatGPT soát theo 5 bước:

1. Quan sát điều nhìn thấy.
2. Phân loại: Vi phạm hoặc Mối nguy tiềm ẩn. Cả hai đều được báo cáo.
3. Gán đúng ID yêu cầu trong Guider.
4. Chấm mức độ.
5. Loại những điều không nhìn thấy, cần hồ sơ, hoặc chưa chắc (dưới 70%).

Lỗi bị loại được liệt kê riêng để bạn xem lại.

Ảnh trả về có khoanh vùng, đánh số từ 1 cho mỗi ảnh, kèm lưới ô A đến J và 1 đến 10. Số lỗi viết dạng ảnh.lỗi, ví dụ 2.1 là lỗi 1 của ảnh 2. Bạn sửa bằng lời:

- `Lỗi 2.1 lệch rồi, chuyển sang ô C3:E5`
- `Xóa lỗi 3.2, không phải lỗi` (hoặc `ảnh không đủ rõ`, `trùng`)
- `Gộp lỗi 1.1 và 1.2`
- `Lỗi 2.1 đổi thành Priority`
- `Xác nhận tất cả lỗi`
- `Lỗi 3.1 là vi phạm, không phải mối nguy tiềm ẩn`
- `Thêm lỗi này vào ảnh 3` (người đánh giá quyết định, không lọc)
- `Xuất file Findings và ảnh báo cáo`
- `Xuất file đối chiếu Guider`
- `Xem sổ kinh nghiệm`, `Xóa kinh nghiệm số 4`

**File Findings giữ nguyên form gốc:** công thức Summary, danh sách chọn, macro.

- **Cột ảnh:** chỉ cột J (ô ảnh) được đặt rộng 36 để ảnh có chiều cao cố định 150pt. Ảnh lấp kín bề ngang ô, lấy vùng lỗi làm tâm và vẫn giữ hiện trạng xung quanh.
- **Mỗi ảnh có lỗi là một dòng.** Cột Audit ID ghi một mã: mã của lỗi nặng nhất trong ảnh, để Summary đếm đúng.
- **Số lỗi theo số trên ảnh:** cột Point of issue và Improvement Plan ghi các lỗi theo số trên ảnh. Lỗi thuộc mã khác được ghi kèm mã trong ngoặc, ví dụ "2. (CE201) …".
- **Ảnh báo cáo** chỉ ghi công ty, ngày và danh sách lỗi theo số trên ảnh.

## Học từ các lần bạn sửa (sổ kinh nghiệm)

Công cụ tự ghi vào sổ kinh nghiệm khi:

- Bạn đổi mã, mức độ hoặc loại của một lỗi AI đề xuất, rồi xác nhận lỗi đó.
- Bạn xóa đề xuất của AI và nói lý do là "không phải lỗi" hoặc "ảnh không đủ rõ". Nếu bạn không nói lý do, ChatGPT sẽ hỏi lại. Xóa vì sai vị trí hoặc trùng thì không ghi.
- Bạn tự thêm lỗi mà AI bỏ sót.

Ở các lần soát sau:

- ChatGPT đọc sổ trước khi soát.
- Công cụ tự áp dụng mức độ hoặc mã bạn từng chốt khi gặp lại đúng lỗi đó.
- Lỗi bạn từng bác bỏ được tự chuyển vào danh sách bị loại. Mọi điều tự áp dụng đều được báo lại để bạn xem.

Vùng làm việc Python của ChatGPT bị xóa khi hết cuộc trò chuyện, nên sổ phải được lưu ra ngoài:

1. Khi xuất file Findings, nếu có kinh nghiệm mới, ChatGPT đưa thêm liên kết tải `So-kinh-nghiem-EHS.json`.
2. Tải file đó về.
3. Thêm vào project, thay file cũ.

Với Skill, đính kèm file này ở cuộc trò chuyện sau.

## Cập nhật file Guider

Thêm file RBA Guider `.xlsx` mới vào project, thay file cũ, hoặc đính kèm vào tin nhắn. Khi bắt đầu, ChatGPT tự nạp file và báo:

- Mã mới, mã không còn.
- ID yêu cầu mới, ID yêu cầu không còn.
- Số hạng mục căn cứ pháp lý đã đổi.
- Lỗi nào trong danh mục cần chọn lại mã.

Căn cứ pháp lý của từng lỗi tự cập nhật theo file mới.

Bản có sẵn trong công cụ là RBA Guider 8.0.1, pháp lý chốt 01/11/2026. Muốn quay về bản này, gõ `Dùng lại Guider có sẵn` và gỡ file Guider khỏi project.

## Đối chiếu sang Đánh giá 41 mã và CAP

Gõ `Xuất file đối chiếu Guider`. ChatGPT lấy file Guider đang dùng (hoặc bản 8.0.1 có sẵn) và điền vào 3 sheet:

- **Đánh giá 41 mã:** kết quả của từng mã (lấy mức nặng nhất), phát hiện, bằng chứng, hạn hoàn thành, ngày đánh giá, người đánh giá, ghi chú.
- **CAP:** nguyên nhân gốc, hành động khắc phục, ngày mở, hạn hoàn thành.
- **Guider chi tiết:** đánh giá chi tiết và ghi chú cho từng ID yêu cầu.

Lỗi đánh số dạng No.điểm, theo số dòng của file Findings. Công thức trong file không bị đụng tới và sẽ tự tính lại khi mở. File được lưu thành `Doi-chieu-Guider_<công ty>_<ngày>.xlsx`, không ghi đè file Guider gốc.

## Kiểm tra lần đầu

Thử một ảnh và kiểm tra đủ 5 điều sau trước khi dùng thật:

1. ChatGPT chạy được Python và hiện ảnh có lưới ô.
2. Khung khoanh đúng vật thể.
3. Tải được file `.xlsm`. Nếu không tải được, dùng file `.zip` đi kèm rồi giải nén.
4. Mở file trong Excel: sheet `Summary` đếm đúng và phím Ctrl+Q vẫn chèn được ảnh.
5. Mở file đối chiếu trong Excel: sheet `Đánh giá 41 mã` và `CAP` có số liệu, các cột tính tự động (điểm, cảnh báo hạn) hiện đúng.

## Lưu ý

- Không sửa file Findings hoặc file Guider bằng công cụ khác trong ChatGPT, macro và định dạng có thể bị mất.
- Tải file về ngay khi xong. Vùng làm việc Python của ChatGPT có thể bị xóa sau một thời gian, khi đó phải gửi lại ảnh.
- Ảnh hiện trường sẽ gửi tới OpenAI. Hãy kiểm tra quy định của công ty và khách hàng.
- Nội dung trong `danh_muc_loi.md` nên được chuyên viên EHS duyệt. Bảng này rút từ bản 8.0.1. Khi đã nạp Guider mới, hạng mục và căn cứ pháp lý lấy theo kết quả của công cụ.
