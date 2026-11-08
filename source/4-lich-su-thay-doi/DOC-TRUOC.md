# Lịch sử thay đổi (các bản vá)

Mỗi file `patch_vNN.py` là một bước nâng cấp app, áp lên bản ngay trước đó. Đầu mỗi file có mô tả thay đổi bằng tiếng Việt.

Thứ tự: v10 → v11 → … → v21 → v1.1. Từ v1.1 app đánh số lại.

Các file này **chỉ để tham khảo**, để biết mỗi tính năng được thêm thế nào và vì sao. Không cần chạy lại: mã nguồn cuối cùng đã có sẵn ở `1-ma-nguon-app/soat-anh-ehs-rba.html`. Các bản HTML trung gian dùng làm đầu vào cho từng bản vá không có trong gói.

Khi sửa app về sau, sửa trực tiếp file mã nguồn, hoặc viết bản vá mới theo cùng cách. Cách viết bản vá: thay đúng một chuỗi, kiểm tra số lần xuất hiện bằng hàm `rep()`, để biết ngay khi mã nguồn đã đổi khác.
