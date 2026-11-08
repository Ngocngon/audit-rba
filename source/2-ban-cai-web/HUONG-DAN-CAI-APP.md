# Cài app Audit RBA lên điện thoại

App chạy trên iPhone và Android, không cần App Store hay CH Play, không mất phí. AI dùng Gemini của Google ở mức miễn phí. Làm 3 bước:

1. Đưa thư mục app lên mạng (một lần, khoảng 5 phút).
2. Lấy key Gemini miễn phí.
3. Cài app trên từng điện thoại.

Số phiên bản hiện cạnh tên app ở đầu màn hình (ví dụ **Audit RBA v1.1**). Từ bản này app đánh số lại: v1.1 là bản mới nhất, mới hơn v21.0.

## Bước 1. Đưa app lên mạng (làm trên máy tính)

Dùng Netlify, miễn phí.

1. Giải nén `soat-anh-ehs-app.zip`, được thư mục `soat-anh-ehs-app`.
2. Mở **app.netlify.com/drop** bằng Chrome trên máy tính, đăng nhập (có thể dùng tài khoản Google).
3. Kéo cả thư mục `soat-anh-ehs-app` thả vào ô trên trang.
4. Chờ khoảng 30 giây. Netlify cho một địa chỉ dạng `https://ten-ngau-nhien.netlify.app`.
5. Đổi tên dễ nhớ: vào **Project configuration**, mục **Project details**, chọn **Change project name**.
6. Vào **Project configuration** → **General** → **Visitor access**, đặt **Public** để ai có địa chỉ cũng mở được.

Gửi địa chỉ này cho các thành viên trong đội. Dữ liệu ảnh và lỗi của mỗi người chỉ nằm trên máy người đó.

**Khi có bản mới:** vào site trên Netlify, mở thẻ **Deploys**, kéo thư mục mới thả vào ô "Drag and drop". Điện thoại tự nhận bản mới ở lần mở app tiếp theo khi có mạng.

## Bước 2. Lấy key Gemini (miễn phí)

1. Mở **https://aistudio.google.com/apikey** (hoặc bấm nút **Mở trang lấy key Gemini** trong app) và đăng nhập tài khoản Google.
2. Bấm **Create API key** (lần đầu chọn hoặc tạo một dự án), sao chép key (thường bắt đầu bằng `AIza`).

Mức miễn phí của Gemini:

- Giới hạn khoảng **10 lượt mỗi phút** và vài trăm lượt mỗi ngày cho mô hình Flash. Con số chính xác do Google đặt cho từng dự án, xem trong AI Studio.
- App tự giãn cách các lượt gọi và tự chờ khi bị giới hạn, nên không cần làm gì thêm.
- Hết lượt trong ngày thì app báo rõ; lượt được cấp lại khoảng 15:00 giờ Việt Nam. Có thể chọn mô hình **Flash-Lite** trong **Cài đặt AI** (nhiều lượt hơn nhưng **dễ bỏ sót lỗi**; chỉ dùng khi hết lượt Flash).
- Ở mức miễn phí, Google có thể dùng dữ liệu gửi lên để cải thiện dịch vụ. Nếu ảnh thuộc diện bảo mật của khách hàng, cân nhắc bật thanh toán (billing) cho dự án.
- Mỗi người nên dùng key của riêng mình để không dùng chung hạn mức.

Giữ key như mật khẩu. Không gửi key qua nhóm chat. Nếu lộ key, vào AI Studio xóa key đó và tạo key mới.

## Bước 3. Cài app trên điện thoại

**iPhone:** mở địa chỉ app bằng **Safari**, bấm nút **Chia sẻ** (ô vuông có mũi tên), chọn **Thêm vào MH chính**, rồi bấm **Thêm**.

**Android:** mở địa chỉ app bằng **Chrome**, bấm **Cài app** ngay trên trang, hoặc bấm **⋮** rồi chọn **Thêm vào màn hình chính** (hay **Cài đặt ứng dụng**).

Sau đó luôn mở app bằng biểu tượng **Audit RBA** trên màn hình chính.

**Nhập key lần đầu:** mở tab **Kiểm tra vi phạm**, bấm **Nhập API key để AI soát**, dán key Gemini, bấm **Lưu và kiểm tra**. Thấy dòng "Kiểm tra thành công" là xong. Key chỉ lưu trên điện thoại đó. Sau này đổi key hoặc mô hình: **Cài đặt hệ thống** (bánh răng góc trên) → thẻ **AI soát ảnh**.

## Dùng trên máy tính (PC)

Mở **https://ehsrba.netlify.app** bằng Chrome hoặc Edge, cửa sổ rộng từ 920px trở lên (nên phóng to toàn màn hình). Có thể cài như app: bấm biểu tượng cài đặt ở thanh địa chỉ.

- **Menu trái:** Tổng quan · Kiểm tra vi phạm · Xác nhận lỗi · Báo cáo & xuất file · Cài đặt hệ thống. Màn hình hẹp hơn 1366px thì menu thu thành biểu tượng.
- **Màu theo khu vực** (giống nhau trên máy tính và điện thoại): Tổng quan màu xanh mòng két, Ảnh màu xanh dương, Kiểm tra vi phạm màu cam, Xác nhận lỗi màu xanh lá, Báo cáo màu tím, Cài đặt màu xám. Thanh màu nằm ở tiêu đề mỗi màn, viền trên các khung và mục đang chọn ở menu.
- **Tiến trình audit** (dưới menu): Thông tin audit → Ảnh hiện trường → AI soát ảnh → Xác nhận lỗi → Xuất báo cáo. Bước xong có dấu ✓; bấm vào bước để đi tới màn đó.
- **Tổng quan:** số ảnh, số lỗi, tiến độ xác nhận, **Việc tiếp theo** (một nút bấm), biểu đồ mức độ, vi phạm/mối nguy, lỗi theo mã RBA và khu vực (bấm thanh để lọc danh sách), ảnh hiện trường, các lần audit trước.
- **Xác nhận lỗi:** bảng mọi lỗi; lọc theo mức độ, trạng thái, loại, mã, khu vực, ô tìm kiếm; chọn nhiều để Xác nhận, Bỏ xác nhận, Xóa; **Sửa** mở khung sửa ngay dưới dòng lỗi (xem phần Bản v1.1).
- **Cài đặt hệ thống** (biểu tượng bánh răng ở góc trên, hoặc mục cuối menu trái) chia 5 thẻ:
  - **Giao diện:** máy tính / điện thoại / tự động; sáng / tối; **phụ đề ảnh báo cáo** (Việt – Hàn, Việt – Trung, Việt – Anh, chỉ tiếng Việt).
  - **AI soát ảnh:** key và mô hình Gemini, chế độ soát, tự soát ngầm.
  - **Tiêu chí & thời hạn:** quy tắc mức độ, Mandatory, ngưỡng chắc chắn, hạn khắc phục; bảng **thời hạn kiểm định, bảo dưỡng và tem nhãn** AI đang dùng.
  - **Dữ liệu tham chiếu:** dữ liệu Guider, tài liệu tham chiếu, thư viện lỗi, sổ kinh nghiệm.
  - **Dữ liệu & phiên bản:** dung lượng trên máy, xóa dữ liệu, giới thiệu.

## Quy trình làm một lần audit (giống nhau trên máy tính và điện thoại)

1. **Ảnh**: chụp hoặc thêm ảnh; AI tự soát ngầm.
2. **Kiểm tra vi phạm**: xem ảnh, khoanh vùng, AI soát lại hoặc nhập gợi ý khi lỗi chưa đúng.
3. **Xác nhận lỗi**: danh sách mọi lỗi theo từng ảnh; mỗi lỗi có **Sửa** và **Xác nhận**; lọc **Chờ xác nhận**; **Xác nhận tất cả** khi đã xem hết. Bấm **Sửa** để mở chi tiết, **← Tất cả lỗi** để quay lại.
4. **Báo cáo**: nhập thông tin audit và xuất file. Đây là **chỗ duy nhất** để xuất file. Nút xuất chỉ bấm được khi đã: nhập tên đối tác, AI soát xong, **xác nhận hoặc xóa hết lỗi**. Ngay trên nút có danh sách điều kiện còn thiếu kèm nút đi tới chỗ cần làm.

## Đổi giao diện máy tính / điện thoại

- Mặc định **Tự động theo thiết bị**: màn hình rộng hơn 920px dùng giao diện máy tính, hẹp hơn dùng giao diện điện thoại.
- Bấm biểu tượng **màn hình** ở góc trên để chuyển nhanh giữa hai giao diện, hoặc vào **Cài đặt hệ thống → Giao diện** để chọn Tự động / Máy tính / Điện thoại và màu Sáng / Tối. Lựa chọn lưu riêng trên từng máy.

## Tiêu chí đánh giá (Cài đặt hệ thống)

- **Mức độ** lấy đúng mức gợi ý của danh mục lỗi; chỉ lỗi ngoài danh mục mới để AI xác định theo tiêu chí Priority / Major / Minor.
- **Mandatory** chỉ đánh dấu khi mức độ là Priority; đổi mức độ thì Mandatory đổi theo. Người đánh giá vẫn tick tay được.
- **Màn kiểm tra chỉ nêu vi phạm** và điều nhìn thấy. Phương án khắc phục (cho cột Improvement Plan) nằm trong mục thu gọn **Thông tin cho báo cáo** của thẻ lỗi; tắt được hẳn trong Cài đặt.
- Chỉnh được ngưỡng chắc chắn tối thiểu và số ngày hạn khắc phục theo mức độ. Nút **Áp lại tiêu chí cho các lỗi hiện có** sửa lại mức độ và Mandatory của các lỗi đã soát trước đó.

## Kế thừa giữa các lần audit

- Mỗi lần **xuất file Findings**, app lưu một dòng **lịch sử audit** (đối tác, ngày, số lỗi) và tự thêm các lỗi đã xác nhận vào **Thư viện lỗi** kèm ảnh cắt vùng lỗi (tắt được trong Thư viện lỗi).
- Khi audit lại cùng đối tác (cùng tên trong Vendor Name), AI ưu tiên rà các lỗi lần trước của chính đối tác đó.
- Sổ kinh nghiệm, thư viện, tài liệu, key AI được giữ khi bấm **Audit mới**.

## Tài liệu tham chiếu

**Cài đặt hệ thống → Dữ liệu tham chiếu → Tài liệu tham chiếu → Nạp tài liệu**: quy định nội bộ, checklist của khách hàng, văn bản pháp luật, hướng dẫn an toàn (PDF dưới 14 MB, Word .docx, Excel, ảnh, văn bản). AI đọc và rút ra các **điểm kiểm tra nhìn thấy được bằng ảnh** (yêu cầu, dấu hiệu vi phạm, mã RBA, mức độ, mục trong tài liệu). Khi soát, AI rà các điểm này và ghi nguồn tài liệu vào phần "Nhìn thấy trong ảnh". Mỗi tài liệu tốn vài lượt AI khi đọc lần đầu.

## Tem nhãn, hạn sử dụng, hạn kiểm định (từ v20)

AI đọc ngày trên tem kiểm định, nhãn, thẻ bảo dưỡng trong ảnh và so với **Audit Date** ở Báo cáo → Thông tin audit (nhớ để đúng ngày audit).

- Quá hạn, hoặc thiết bị bắt buộc kiểm định mà không có tem: AI đề xuất **vi phạm**.
- Còn hạn dưới 30 ngày: chỉ ghi vào mục **cần kiểm tra thêm**.
- Không đọc rõ ngày: ghi **cần kiểm tra thêm**, không kết luận vi phạm.
- Bảng thời hạn và căn cứ pháp lý xem ở **Cài đặt hệ thống → Tiêu chí & thời hạn**. Mục có dấu \* lấy từ nguồn thứ cấp, nên đối chiếu văn bản gốc trước khi ghi vào báo cáo.
- Danh mục lỗi có thêm nhóm **Tem nhãn & thời hạn** (11 lỗi: tem kiểm định thiết bị nghiêm ngặt, bình chữa cháy, đèn sự cố/báo cháy, găng ủng cách điện, thiết bị đo, chống sét/tiếp địa, hóa chất, thực phẩm, tủ y tế, PPE). Mức độ lấy theo danh mục như các lỗi khác.

## Tốc độ và bộ nhớ (từ v20)

- App chỉ giữ tối đa 4 ảnh gốc đang mở trong bộ nhớ, ảnh khác dùng ảnh thu nhỏ. Mở app nhanh hơn và iPhone ít bị tải lại giữa chừng khi có nhiều ảnh.
- Lần đầu mở v20, app chuyển ảnh cũ sang cách lưu mới (vài giây, chỉ một lần). Ảnh và lỗi cũ giữ nguyên.

## Bản v1.1: người đánh giá chỉ cần xác nhận

**Sửa lỗi tại chỗ (màn Xác nhận lỗi, cả điện thoại và máy tính).** Bấm vào lỗi hoặc nút **Sửa**, khung sửa mở ngay dưới lỗi đó, không phải sang màn Kiểm tra vi phạm:
- Ảnh nhỏ làm tối phần xung quanh, chỉ sáng vùng lỗi, để biết lỗi nằm ở đâu.
- **Nội dung lỗi** sửa trực tiếp. Muốn AI viết lại cho chuẩn: gõ ý đúng (gõ không dấu, viết tắt cũng được) rồi bấm **AI viết lại theo ý này**. AI viết lại câu, chọn lại mã, mức độ, khắc phục.
- **Khu vực** của ảnh sửa ngay tại đây.
- **✓ Xác nhận, sang lỗi tiếp**: xác nhận rồi tự mở lỗi chờ tiếp theo, cứ bấm lần lượt đến hết.
- **Không phải lỗi** (bấm 2 lần): xóa đề xuất của AI và ghi vào sổ kinh nghiệm để lần sau AI không đề xuất lại.
- **Chỉnh khung trên ảnh ›**: chỉ khi cần kéo lại khung, mới sang màn Kiểm tra vi phạm.

**Lỗi trùng trong một ảnh.**
- AI được dặn mỗi vi phạm chỉ ghi một lần; nhiều vật cùng một lỗi (ví dụ 2 bình chữa cháy quá hạn) gộp thành một lỗi.
- App tự gộp các đề xuất gần giống nhau trong cùng ảnh.
- Bấm **AI soát lại** không còn chép lại lỗi đã xác nhận.
- Lần đầu mở v1.1, app tự dọn các đề xuất trùng chưa xác nhận trong dữ liệu cũ và báo số lỗi đã gộp.
- Cặp lỗi đã xác nhận mà vẫn giống nhau thì có nhãn vàng **Có thể trùng lỗi n**; mở **Sửa** để xóa lỗi trùng.

**Nhập ảnh từ file .zip hoặc thư mục.**
- Tab **Ảnh**: nút **Thư mục ảnh** và **File .zip**.
- Báo cáo → **Hiện trường và làm việc nhóm**: **Nhập gói hoặc file .zip**, **Nhập cả thư mục ảnh**.
- File .zip là gói của app thì gộp như cũ; file .zip bất kỳ thì app lấy mọi ảnh JPG, PNG bên trong. AI tự soát ngầm các ảnh mới.
- Chọn thư mục chạy trên máy tính và Android. iPhone không cho chọn cả thư mục: hãy nén thư mục thành .zip (trong app Tệp, giữ thư mục → Nén) rồi chọn **File .zip**.

**AI tự làm sẵn.**
- Khi đã xác nhận hết lỗi, AI tự dịch sẵn tiếng Anh (cho file Findings) và phụ đề, nên lúc xuất file không phải chờ.
- Ô **Vendor Name** gợi ý tên các đối tác đã audit trước.

## Phụ đề song ngữ và PDF trình chiếu (từ v21)

- **Chọn ngôn ngữ phụ đề:** **Cài đặt hệ thống → Giao diện → Phụ đề ảnh báo cáo và PDF trình chiếu**, hoặc ô **Phụ đề** ngay trong màn **Xem ảnh báo cáo**. Mặc định **Việt – Hàn**; có **Việt – Trung** (giản thể), **Việt – Anh**, **Chỉ tiếng Việt**.
- Dưới mỗi câu lỗi tiếng Việt có câu dịch màu xanh; dòng **Khu vực** ở đầu ảnh cũng có hai thứ tiếng. Áp dụng cho Xem ảnh báo cáo, Lưu ảnh, Tất cả ảnh (.zip) và PDF.
- AI dịch tên khu vực và nội dung lỗi **một lần**, lưu trên máy; mở lại không dịch lại. Lần dịch đầu cần mạng và key AI; nếu chưa dịch được, phụ đề tạm hiện tiếng Việt và app báo số câu còn thiếu. Sửa nội dung lỗi thì câu đó được dịch lại.
- **Xuất PDF trình chiếu:** Báo cáo → **Xuất PDF trình chiếu**, hoặc nút cùng tên trong màn Xem ảnh báo cáo. File gồm:
  - Trang bìa song ngữ: đối tác, ngày audit, người đánh giá, tổng số phát hiện, số ảnh.
  - Mỗi ảnh một trang khổ 16:9 (như slide PowerPoint): ảnh có khoanh vùng bên trái; bên phải là từng lỗi với câu tiếng Việt và câu dịch. Chữ tự co cho vừa trang. Từ v1.1, PDF **không ghi mức độ và mã RBA**.
- Mở PDF bằng Acrobat, Preview hoặc trình duyệt rồi bật chế độ toàn màn hình để chiếu. Gửi đối tác qua Zalo, Mail như file thường.
- Chỉ xuất được khi đã kiểm tra hết lỗi, giống file Findings. **File Findings (.xlsm) không thay đổi.**

## Dùng app

- **Chụp ảnh / Thêm ảnh:** mở camera hoặc thư viện ảnh.
- **Audit mới:** nút **Audit mới** ở tab Ảnh (hoặc **Báo cáo → Thông tin audit → Bắt đầu audit mới**). App xóa ảnh và lỗi của lần audit đang làm, đặt lại tên đối tác và ngày; giữ thư viện lỗi, sổ kinh nghiệm, key AI và tên Auditor. App hỏi trước và có nút **Xuất gói để lưu lại trước**.
- **Chọn nhiều ảnh:** tab Ảnh → **Chọn nhiều ảnh** → chạm ảnh để chọn, hoặc **Chọn tất cả / Bỏ chọn tất cả** → **AI soát lại** hoặc **Xóa** các ảnh đã chọn → **Xong**.
- **Chọn nhiều lỗi:** tab Lỗi → **Tất cả ảnh** → **Chọn nhiều lỗi** → chạm lỗi để chọn, hoặc **Chọn tất cả / Bỏ chọn tất cả** → **Xác nhận**, **Bỏ xác nhận** hoặc **Xóa** (khi xóa đề xuất của AI, chọn "không phải lỗi" để AI rút kinh nghiệm) → **Xong**.
- **Tự soát ngầm:** chụp hoặc thêm ảnh xong, AI tự soát ngay, anh cứ chụp tiếp. Thanh phía trên cho biết đang soát mấy ảnh, mấy ảnh chờ, có nút **Dừng**. Ảnh đang soát có nhãn "AI đang soát…". Mở lại app thì ảnh chưa soát tự được soát tiếp. Tắt trong **Cài đặt hệ thống → AI soát ảnh → Tự soát ngay khi thêm ảnh**.
- **Kiểm tra và xác nhận lỗi** (tab **Lỗi** → **Tất cả ảnh**): danh sách mọi lỗi của mọi ảnh, nhóm theo ảnh. Mỗi lỗi có nút **Xác nhận** và **Sửa** (mở thẻ lỗi đầy đủ). Lọc **Chờ xác nhận** để xem lỗi chưa duyệt; **Xác nhận tất cả** (bấm 2 lần) khi đã xem hết. Chuyển sang **Ảnh đang mở** để xem lỗi của riêng ảnh đang mở.
- **Lỗi AI viết chưa đúng:** bấm **Sửa** → mục **Lỗi chưa đúng? Nhập gợi ý cho AI** → mô tả lỗi đúng (ví dụ "Tủ điện không có biển cảnh báo điện giật, cánh tủ không có dây tiếp địa") → **AI phân tích lại theo gợi ý**. AI lấy gợi ý làm căn cứ, không bác bỏ, viết lại lỗi theo văn phong báo cáo, chọn lại mã, mức độ, cách khắc phục. Kiểm tra rồi bấm **Xác nhận**.
- **Lỗi AI bỏ sót:** dưới mỗi ảnh trong danh sách có **+ Thêm lỗi AI bỏ sót** → mô tả lỗi → **AI tìm, khoanh và viết lỗi**. AI tự tìm vị trí trong ảnh và khoanh vùng; nếu khoanh lệch, mở ảnh kéo khung lại. Có thể khoanh tay bằng công cụ Khung như trước.
- **AI học từ các lần sửa:** khi xác nhận lỗi đã sửa theo gợi ý hoặc lỗi thêm do AI bỏ sót, app ghi vào **Sổ kinh nghiệm**; lần soát sau AI tránh lặp lại.
- **Báo cáo cuối chỉ gồm lỗi đã xác nhận:** file Findings, ảnh báo cáo, file nén và file đối chiếu chỉ lấy lỗi đã xác nhận. Nếu còn lỗi chờ, app hỏi: xem và xác nhận từng lỗi, xác nhận tất cả rồi xuất, hoặc chỉ xuất lỗi đã xác nhận.
- **Ảnh chưa soát được** (mất mạng, hết lượt): thanh phía trên báo lý do và có nút **Thử lại**.
- **Chế độ soát** (**Cài đặt hệ thống → AI soát ảnh**): **Chuẩn** (mặc định, soát đủ lỗi hơn), **Nhanh** (nhanh hơn nhưng dễ bỏ sót), **Kỹ** (dùng mô hình Pro, chậm hơn và tốn nhiều lượt hơn, dùng cho ảnh khó).
- **Không có mạng:** vẫn mở app, chụp ảnh, khoanh vùng, chọn lỗi từ danh mục và xuất file. Có mạng lại thì app tự soát các ảnh đang chờ.
- **Thư viện lỗi từ báo cáo cũ** (**Cài đặt hệ thống → Dữ liệu tham chiếu**): bấm **Nạp file Findings cũ**, chọn một hoặc nhiều file .xlsm/.xlsx của các lần audit trước (mẫu SEV/T hoặc file app đã xuất). App lấy mã, khu vực, nội dung lỗi, khắc phục, câu tiếng Anh và ảnh. Từ đó:
  - AI dùng các lỗi cũ làm danh sách kiểm tra, rà xem ảnh mới có lỗi tương tự không, và viết lỗi theo văn phong cũ.
  - File Findings xuất ra dùng lại câu tiếng Anh cũ khi nội dung giống.
  - Gõ từ khóa để tra lỗi cũ, có ảnh minh họa.
  - **Xuất thư viện** ra file .json gửi cho đồng đội; đồng đội bấm **Nạp file Findings cũ** và chọn file .json đó. Nạp lại cùng một file không làm trùng.
- **Xem ảnh báo cáo** (Báo cáo → **Xem ảnh báo cáo**): xem lần lượt **mọi ảnh** có lỗi đã xác nhận. Bấm **‹ ›**, vuốt ngang trên điện thoại hoặc phím mũi tên trên máy tính; chạm ảnh nhỏ ở dải phía trên để nhảy tới ảnh đó. **Lưu ảnh này** lưu ảnh đang xem; **Tất cả ảnh (.zip)** lưu cả bộ.
- **Xuất file trên iPhone:** app mở bảng Chia sẻ. Chọn **Lưu vào Tệp** để giữ trên máy, hoặc chọn Zalo, Mail để gửi đi. Nếu bảng không tự mở, bấm **Lưu hoặc gửi**.
- **Xuất file trên Android:** file vào thư mục Tải xuống (Download).
- **Thẻ lỗi:** phần hay dùng (nội dung, mức độ, khắc phục, nút Xác nhận) nằm trên; mã RBA, pháp lý và hạn khắc phục nằm trong mục thu gọn bên dưới.
- **Dùng chung trong đội:** dùng **Gói nhóm** trong tab Báo cáo để chuyển ảnh, lỗi và sổ kinh nghiệm sang máy khác.

## Lưu ý

- Ảnh hiện trường được gửi tới Google để AI phân tích. Hãy kiểm tra quy định của công ty và khách hàng.
- AI chỉ đề xuất. Người đánh giá luôn xem và xác nhận từng lỗi trước khi xuất file.
- Xóa app hoặc xóa dữ liệu Safari/Chrome sẽ xóa ảnh và lỗi chưa xuất. Hãy xuất file hoặc gói nhóm sau mỗi buổi audit.
- File Findings xuất ra giữ nguyên form mẫu gốc.
