# Phụ lục: danh mục lỗi, mã Guider và bảng thời hạn

Trích tự động từ mã nguồn `1-ma-nguon-app/soat-anh-ehs-rba.html` (hằng `RBA` và `HANDB`), bản v1.1. Muốn sửa danh mục, sửa trong mã nguồn rồi dựng lại (xem HUONG-DAN-DUNG-LAI.md).

## 1. Danh mục lỗi (77 lỗi)

Mức độ trong cột "Mức" là mức cố định khi bật "Mức độ lấy đúng theo danh mục" (mặc định). Mandatory chỉ khi mức là Priority.

### Điện (13)

| id | Lỗi | Dấu hiệu nhận biết | ID yêu cầu | Mức | Loại |
|---|---|---|---|---|---|
| D1 | Phía trước tủ điện không đánh dấu vị trí an toàn | sàn trước tủ điện không có vạch kẻ vùng an toàn | BH102-01 | Minor | Vi phạm |
| D2 | Tủ điện chưa trang bị thảm cách điện | sàn trước tủ điện không có thảm cách điện | BH102-01 | Minor | Vi phạm |
| D3 | Tủ điện chưa có tấm cover bên trong | cửa tủ mở thấy thanh cái, đầu cos hoặc dây trần không có tấm che | BH102-01 | Major | Vi phạm |
| D4 | Tủ điện thiếu thiết bị LOTO khi sửa chữa | tủ hoặc cầu dao đang sửa chữa nhưng không có khóa và thẻ LOTO | BH102-01 | Major | Vi phạm |
| D5 | Vật tư để chắn trước tủ điện | hàng hóa, thùng, xe đẩy để sát hoặc chắn cửa tủ điện | BH102-01 | Minor | Vi phạm |
| D6 | Dây điện hở, đấu nối tạm hoặc ổ cắm quá tải | dây trầy vỏ, mối nối quấn băng dính, ổ cắm nối tiếp, cáp nằm trên lối đi | BH102-01 | Major | Mối nguy tiềm ẩn |
| D7 | Vật lạ, bu lông, ốc vít bỏ quên trong tủ điện | bu lông, ốc, dụng cụ, rác nằm trong đáy hoặc trên thanh đỡ của tủ điện | BH102-01 | Minor | Mối nguy tiềm ẩn |
| D8 | Lỗ hoặc khe cáp của tủ điện không được bịt kín | khe hở ở đáy hoặc nóc tủ nơi cáp đi vào, có bụi bẩn hoặc lối vào cho côn trùng, chuột | BH102-01 | Minor | Mối nguy tiềm ẩn |
| D9 | Aptomat, mạch điện không có nhãn tên | aptomat, cầu dao không có nhãn ghi tên mạch hoặc phụ tải | BH102-01 | Minor | Vi phạm |
| D10 | Dấu hiệu quá nhiệt tại tủ điện: vết cháy sém, nhựa chảy, đổi màu | vết đen cháy sém, vỏ dây chảy, đầu cos đổi màu gần dây hoặc thiết bị | BH102-01 | Major | Mối nguy tiềm ẩn |
| D11 | Dây dẫn trong tủ đi tự do, không có máng hoặc kẹp cố định | chùm dây căng tự do, cọ vào mép kim loại, vỏ cáp tuốt dài | BH102-01 | Minor | Mối nguy tiềm ẩn |
| D12 | Đầu nối hoặc thanh đấu nối bị gỉ sét, quấn băng keo thay đầu cos | bu lông, đầu cos gỉ nâu; đầu dây quấn băng keo; dây cắt rời không đấu nối | BH102-01 | Major | Mối nguy tiềm ẩn |
| D13 | Thiết bị điện lắp nghiêng, lỏng, không được cố định chắc | aptomat, ổ cắm, hộp nối bị nghiêng, treo lơ lửng hoặc lỏng khỏi ray | BH102-01 | Minor | Mối nguy tiềm ẩn |

### Hóa chất (8)

| id | Lỗi | Dấu hiệu nhận biết | ID yêu cầu | Mức | Loại |
|---|---|---|---|---|---|
| H1 | Thùng chứa hóa chất không đặt trong khay chống tràn | thùng phuy, can, IBC đặt trực tiếp trên sàn, không có khay hoặc pallet chống tràn | BH102-01 | Major | Vi phạm |
| H2 | Hóa chất không có nhãn hoặc nhãn GHS không đọc được | chai, can, thùng chiết không nhãn, nhãn rách, mờ | BH401-05 | Major | Vi phạm |
| H3 | Hóa chất lưu trữ sai cách hoặc để lẫn loại không tương thích | hóa chất để ngoài khu quy định, mở nắp, xếp chung loại oxy hóa với dễ cháy, axit với bazơ | BH401-05 | Major | Vi phạm |
| H4 | Rò rỉ hoặc tràn đổ hóa chất, dầu chưa xử lý | vệt loang, vũng chất lỏng, thùng rò rỉ trên sàn hoặc gần cống | BH401-05 | Major | Mối nguy tiềm ẩn |
| H5 | Công đoạn phát sinh hơi, bụi nhưng không có hút cục bộ | khói, hơi, bụi tại điểm thao tác, không có chụp hút hoặc chụp hút không ở gần nguồn | BH401-02 | Major | Vi phạm |
| H6 | Thiếu bồn rửa mắt hoặc vòi sen khẩn cấp, hoặc bị che chắn | khu pha chế, chiết rót hóa chất không có trạm rửa mắt hoặc trạm bị chắn | BH401-05 | Major | Vi phạm |
| H7 | Bình khí không được cố định, thiếu nắp bảo vệ van | chai gas, oxy, argon đứng tự do, không có xích hoặc giá giữ | BM102-10 | Major | Mối nguy tiềm ẩn |
| V5 | Ô thông gió, quạt hút khu hóa chất bị hư hỏng hoặc bị che | tấm che bong, lá gió gãy, quạt hỏng hoặc bị vật cản che | BH401-02 | Minor | Mối nguy tiềm ẩn |

### PCCC & thoát nạn (13)

| id | Lỗi | Dấu hiệu nhận biết | ID yêu cầu | Mức | Loại |
|---|---|---|---|---|---|
| F1 | Lối thoát hiểm bị che chắn hoặc không đủ chiều rộng | hàng hóa, pallet, xe đẩy nằm trên lối thoát nạn hoặc thu hẹp lối đi | BH203-01 | Priority | Vi phạm |
| F2 | Cửa thoát hiểm bị khóa hoặc che chắn | cửa exit có xích, khóa, chốt ngoài hoặc đồ chắn phía trước | BH203-01 | Priority | Vi phạm |
| F3 | Cửa thoát hiểm không mở theo hướng thoát nạn | bản lề, tay nắm cho thấy cửa mở vào trong | BH203-01 | Major | Vi phạm |
| F4 | Lối thoát hiểm dùng chung đường di chuyển của robot | AGV, robot, băng tải cắt ngang lối thoát nạn | BH203-01 | Major | Vi phạm |
| F5 | Đèn exit hoặc đèn khẩn cấp hỏng, thiếu, bị che | đèn tắt, treo lệch, bị hàng che, không có đèn chỉ hướng tại lối ra | BH203-02 | Major | Vi phạm |
| F6 | Chuông, nút báo cháy bị che hoặc hư hỏng | nút nhấn báo cháy, chuông bị chắn, vỡ, treo bảng che | BH203-02 | Major | Vi phạm |
| F7 | Thiếu sơ đồ thoát hiểm hoặc sơ đồ thiếu thông tin | khu vực, hành lang không có sơ đồ, sơ đồ mờ, thiếu điểm tập kết | BH203-03 | Minor | Vi phạm |
| F8 | Bình chữa cháy bị che chắn, sai vị trí hoặc không đạt | bình bị che, đặt sàn, kim đồng hồ ngoài vùng xanh, thiếu tem hoặc thẻ kiểm tra | BH201-04 | Major | Vi phạm |
| F9 | Tủ, họng chữa cháy bị che chắn hoặc thiếu phụ kiện | tủ vòi bị chắn, không mở được, thiếu vòi, lăng, van rò | BH201-04 | Major | Vi phạm |
| F10 | Đầu phun, đầu báo cháy bị che, sơn phủ hoặc hàng xếp quá sát | hàng xếp sát trần, đầu sprinkler bị sơn, đầu báo bị bọc nilon | BH201-03 | Major | Vi phạm |
| F11 | Vật liệu dễ cháy tích tụ gần nguồn nhiệt hoặc nguồn điện | giấy, carton, giẻ dầu, bao bì chất gần máy nóng, tủ điện, khu hàn | BH201-02 | Major | Mối nguy tiềm ẩn |
| F12 | Điểm tập kết chưa có biển nhận diện | khu vực tập kết không có biển hoặc bị chiếm chỗ | BH202-04 | Minor | Vi phạm |
| F13 | Phiếu tự kiểm tra thiết bị PCCC không được cập nhật | phiếu treo tại bình, họng, tủ chữa cháy bỏ trống các tháng gần đây hoặc ghi năm cũ | BH201-01 | Minor | Vi phạm |

### PPE (2)

| id | Lỗi | Dấu hiệu nhận biết | ID yêu cầu | Mức | Loại |
|---|---|---|---|---|---|
| P1 | Người lao động không dùng hoặc dùng sai PPE | thiếu kính, găng, khẩu trang, giày, nút tai, mũ tại công đoạn nguy hiểm, đeo sai cách | BH102-02 | Major | Vi phạm |
| P2 | Thiếu biển báo yêu cầu PPE tại khu vực nguy hiểm | lối vào khu nguy hiểm không có biển bắt buộc | BH102-02 | Minor | Vi phạm |

### Máy móc (6)

| id | Lỗi | Dấu hiệu nhận biết | ID yêu cầu | Mức | Loại |
|---|---|---|---|---|---|
| M1 | Máy thiếu che chắn bộ phận chuyển động | dây đai, xích, bánh răng, trục quay, điểm kẹp để hở | BH601-02 | Major | Vi phạm |
| M2 | Thiết bị an toàn của máy bị tháo hoặc vô hiệu hóa | cảm biến bị dán băng keo, công tắc cửa bị nối tắt, nắp che bị tháo | BH601-03 | Priority | Vi phạm |
| M3 | Nút dừng khẩn cấp thiếu, hỏng hoặc khó tiếp cận | không thấy nút E-stop đỏ nền vàng, nút bị che, bị vỡ | BH601-02 | Major | Vi phạm |
| M4 | Máy thiếu quy trình an toàn hoặc biển cảnh báo dễ hiểu | máy không có SOP, biển cảnh báo, nhãn tiếng Việt | BH601-04 | Minor | Vi phạm |
| M5 | Thiết bị nghiêm ngặt không thấy tem kiểm định hoặc tem hết hạn | máy nén khí, xe nâng, cẩu trục, thang máy, nồi hơi có tem quá hạn hoặc không thấy tem | BH601-01 | Major | Vi phạm |
| M6 | Có người trong thang máy chở hàng | người đứng trong thang chỉ dành cho hàng | BH102-01 | Major | Vi phạm |

### Nâng hạ & kho (3)

| id | Lỗi | Dấu hiệu nhận biết | ID yêu cầu | Mức | Loại |
|---|---|---|---|---|---|
| L1 | Xe nâng vận hành không an toàn hoặc chưa phân luồng với người đi bộ | tài xế không cài dây, nâng quá cao khi di chuyển, người đi chung đường, không có vạch phân luồng | BM102-05 | Major | Vi phạm |
| L2 | Nâng hạ bằng cẩu không an toàn | người đứng dưới tải, móc thiếu chốt, cáp xơ, xích biến dạng | BM102-06 | Priority | Vi phạm |
| L3 | Hàng xếp cao không ổn định hoặc kệ hư hỏng | kệ cong, thiếu chốt, hàng nghiêng, chồng quá cao | BM102-10 | Major | Mối nguy tiềm ẩn |

### Công việc rủi ro cao (5)

| id | Lỗi | Dấu hiệu nhận biết | ID yêu cầu | Mức | Loại |
|---|---|---|---|---|---|
| W1 | Làm việc trên cao không có biện pháp chống rơi | đứng trên thang, giàn, mái không dây an toàn hoặc không lan can | BM102-04 | Priority | Vi phạm |
| W2 | Hàn cắt không có biện pháp phòng cháy | tia lửa gần vật cháy, không có tấm che, không có bình chữa cháy, không người giám sát | BM102-04 | Major | Vi phạm |
| W3 | Vào không gian kín không có kiểm soát | người ở trong bể, hầm, không có người giám sát, không đo khí, không thông gió | BM102-04 | Priority | Vi phạm |
| W4 | Bảo trì máy khi chưa khóa cô lập năng lượng | người sửa bên trong máy, không thấy khóa và thẻ LOTO | BM102-04 | Priority | Vi phạm |
| W5 | Sàn trơn, vật cản hoặc lỗ hở gây trượt ngã | sàn ướt, dầu, dây vướng, hố không nắp, lan can thiếu | BH102-01 | Minor | Mối nguy tiềm ẩn |

### Sơ cứu (1)

| id | Lỗi | Dấu hiệu nhận biết | ID yêu cầu | Mức | Loại |
|---|---|---|---|---|---|
| A1 | Hộp sơ cứu thiếu, bị khóa, che chắn hoặc thiếu vật phẩm | không có hộp, hộp rỗng, thiếu danh mục, thiếu sổ kiểm tra | BH302-04 | Minor | Vi phạm |

### Công thái học (1)

| id | Lỗi | Dấu hiệu nhận biết | ID yêu cầu | Mức | Loại |
|---|---|---|---|---|---|
| G1 | Tư thế làm việc bất lợi hoặc mang vác nặng thủ công | cúi gập, với cao, xoắn người, bê vác nặng, đứng lâu không có hỗ trợ | BH501-01 | Minor | Mối nguy tiềm ẩn |

### Chất thải (5)

| id | Lỗi | Dấu hiệu nhận biết | ID yêu cầu | Mức | Loại |
|---|---|---|---|---|---|
| T1 | Chất thải nguy hại không phân loại hoặc để lẫn | giẻ dầu, bao bì hóa chất, bóng đèn để chung rác thường | CE201-01 | Major | Vi phạm |
| T2 | Thùng hoặc khu chứa chất thải nguy hại thiếu nhãn, cảnh báo | thùng không ghi tên, mã CTNH, không có biển cảnh báo | CE201-01 | Major | Vi phạm |
| T3 | Khu lưu giữ chất thải nguy hại không đạt yêu cầu | không mái che, không gờ chống tràn, không sàn chống thấm, không có bình chữa cháy | CE201-01 | Major | Vi phạm |
| T4 | Chất thải thông thường để bừa bãi, không phân loại | rác tràn thùng, thùng không nắp, phế liệu vứt ngoài khu quy định | CE301-01 | Minor | Vi phạm |
| T5 | Xe vận chuyển chất thải không che chắn | xe chở rác không phủ bạt, chất thải rơi vãi | CE301-01 | Minor | Vi phạm |

### Khí thải, nước thải, tiếng ồn (4)

| id | Lỗi | Dấu hiệu nhận biết | ID yêu cầu | Mức | Loại |
|---|---|---|---|---|---|
| V1 | Thiết bị xử lý khí, nước thải thiếu cảnh báo và thông tin người quản lý | trạm xử lý không có biển cảnh báo, tên và số điện thoại người phụ trách | CE201-01 | Minor | Vi phạm |
| V2 | Thiết bị xử lý khí thải hư hỏng hoặc rò rỉ | ống gió thủng, quạt hỏng, khói rò ra ngoài hệ thống | CE401-01 | Major | Vi phạm |
| V3 | Nước thải hoặc chất lỏng chảy vào cống thoát nước mưa | dòng chất lỏng lạ, vệt màu dẫn tới cống mưa | CE501-01 | Priority | Vi phạm |
| V4 | Khu vực tiếng ồn cao thiếu biển báo hoặc nút tai | máy ồn lớn, người lao động không đeo nút tai, không có biển | CE402-01 | Minor | Vi phạm |

### Nhà ăn & ký túc xá (5)

| id | Lỗi | Dấu hiệu nhận biết | ID yêu cầu | Mức | Loại |
|---|---|---|---|---|---|
| K1 | Khu bếp, nhà ăn mất vệ sinh | sàn bẩn, thực phẩm để dưới sàn, côn trùng, dụng cụ không sạch | BH702-02 | Major | Vi phạm |
| K2 | Nhân viên nhà ăn không đủ trang phục vệ sinh | thiếu mũ, khẩu trang, găng tay khi chế biến, chia thức ăn | BH702-02 | Minor | Vi phạm |
| K3 | Nguyên liệu nấu ăn bảo quản sai hoặc không phân loại | thực phẩm sống chín lẫn nhau, không nhãn, không che đậy | BH702-03 | Major | Vi phạm |
| K4 | Ký túc xá hoặc khu vệ sinh không sạch sẽ | phòng, hành lang, nhà vệ sinh bẩn, rác tồn đọng | BH701-02 | Minor | Vi phạm |
| K5 | Ký túc xá không đảm bảo an toàn PCCC và thoát nạn | cầu thang thiếu sáng, lối ra bị chắn, nấu ăn trong khu ở, thiếu bình chữa cháy | BH701-02 | Major | Vi phạm |

### Tem nhãn & thời hạn (11)

| id | Lỗi | Dấu hiệu nhận biết | ID yêu cầu | Mức | Loại |
|---|---|---|---|---|---|
| TN1 | Thiết bị nâng, xe nâng, thang máy, bình chịu áp lực không có tem kiểm định hoặc tem đã hết hạn | không thấy tem kiểm định trên xe nâng, cầu trục, pa lăng, thang máy, máy nén khí, bình tích áp; ngày hết hạn trên tem trước ngày audit | BM102-05 | Major | Vi phạm |
| TN2 | Bình chữa cháy quá hạn bảo dưỡng, kiểm tra hoặc không có tem, thẻ theo dõi | tem hoặc thẻ treo ghi lần bảo dưỡng cuối quá 6 tháng so với ngày audit; không có tem kiểm định hoặc thẻ kiểm tra; tem rách, mờ | BH201-04 | Major | Vi phạm |
| TN3 | Bình chữa cháy áp suất không đạt hoặc hư hỏng | kim đồng hồ áp suất ngoài vùng xanh, mất chốt an toàn, vòi nứt, vỏ gỉ móp | BH201-04 | Major | Vi phạm |
| TN4 | Đèn chiếu sáng sự cố, đèn chỉ dẫn thoát nạn, thiết bị báo cháy quá hạn bảo dưỡng | tem bảo dưỡng ghi lần cuối quá 12 tháng so với ngày audit; không có tem bảo dưỡng | BH201-04 | Minor | Vi phạm |
| TN5 | Găng tay, ủng, thảm cách điện quá hạn thử nghiệm hoặc không có tem thử nghiệm | tem thử nghiệm ghi ngày quá 6 tháng so với ngày audit; không có tem, nhãn thử nghiệm; găng rách, chai cứng | BH102-01 | Major | Vi phạm |
| TN6 | Đồng hồ áp suất, cân, thiết bị đo không có tem hoặc tem kiểm định hết hạn | đồng hồ áp suất trên bình khí nén, nồi hơi, cân không có tem kiểm định; tem ghi hạn trước ngày audit | BH102-01 | Minor | Vi phạm |
| TN7 | Hệ thống chống sét, nối đất quá hạn đo kiểm tra định kỳ | biển hoặc tem kết quả đo điện trở nối đất ghi ngày quá 12 tháng so với ngày audit; dây nối đất đứt, gỉ | BH201-01 | Minor | Vi phạm |
| TN8 | Hóa chất đã quá hạn sử dụng ghi trên nhãn | nhãn chai, can ghi hạn sử dụng (EXP, HSD) trước ngày audit; vẫn để trong khu vực sử dụng | BH401-05 | Major | Vi phạm |
| TN9 | Thực phẩm, nguyên liệu nấu ăn quá hạn sử dụng hoặc không có nhãn, hạn dùng | bao bì ghi hạn sử dụng trước ngày audit; thực phẩm đóng gói không nhãn trong kho bếp, tủ lạnh | BH702-03 | Major | Vi phạm |
| TN10 | Thuốc, vật tư sơ cứu quá hạn sử dụng | hộp thuốc, băng gạc, dung dịch sát khuẩn ghi hạn sử dụng trước ngày audit | BH302-04 | Minor | Vi phạm |
| TN11 | PPE, dây đai an toàn, mặt nạ, phin lọc quá hạn sử dụng hoặc hư hỏng | nhãn PPE ghi hạn sử dụng trước ngày audit; phin lọc hết hạn; dây đai sờn, đứt | BH102-02 | Major | Vi phạm |

## 2. Mã RBA Guider 8.0.1 (41 mã)

| Mã | Nội dung | Số ID yêu cầu | Số hạng mục pháp lý |
|---|---|---|---|
| BH101 | An toàn công nghiệp | 3 | 10 |
| BH102 | An toàn công nghiệp | 3 | 6 |
| BH103 | An toàn công nghiệp | 3 | 5 |
| BH201 | Đối phó tình trạng khẩn cấp | 6 | 6 |
| BH202 | Đối phó tình trạng khẩn cấp | 5 | 6 |
| BH203 | Đối phó tình trạng khẩn cấp | 3 | 4 |
| BH204 | Đối phó tình trạng khẩn cấp | 2 | 4 |
| BH301 | Tai nạn công nghiệp | 1 | 4 |
| BH302 | Tai nạn công nghiệp | 4 | 6 |
| BH401 | Báo cáo và sự cho phép môi trường | 5 | 6 |
| BH501 | Công việc chân tay quá sức | 1 | 5 |
| BH601 | An toàn máy móc | 4 | 6 |
| BH701 | An toàn máy móc | 2 | 5 |
| BH702 | An toàn máy móc | 3 | 6 |
| BM101 | An Toàn vệ sinh công nghiệp | 2 | 4 |
| BM102 | An Toàn Công Nghiệp / An Toàn Máy Móc | 10 | 10 |
| BM201 | An Toàn Công Nghiệp / An Toàn Máy Móc | 3 | 5 |
| BM202 | An Toàn Công Nghiệp / An Toàn Máy Móc | 14 | 10 |
| BM203 | An Toàn Công Nghiệp / An Toàn Máy Móc | 2 | 6 |
| BM301 | An Toàn Công Nghiệp / An Toàn Máy Móc | 2 | 4 |
| BM302 | An Toàn Công Nghiệp / An Toàn Máy Móc | 1 | 4 |
| BM401 | An Toàn Công Nghiệp / An Toàn Máy Móc | 1 | 4 |
| BM402 | An Toàn Công Nghiệp / An Toàn Máy Móc | 1 | 4 |
| BM403 | Đi tham quan vendor trực tiếp | 1 | 4 |
| CE101 | Đi tham quan vendor trực tiếp | 1 | 5 |
| CE201 | Đi tham quan vendor trực tiếp | 1 | 5 |
| CE301 | Đi tham quan vendor trực tiếp | 1 | 5 |
| CE401 | Đi tham quan vendor trực tiếp | 1 | 5 |
| CE402 | Đi tham quan vendor trực tiếp | 1 | 5 |
| CE501 | Đi tham quan vendor trực tiếp | 1 | 5 |
| CE601 | Đi tham quan vendor trực tiếp | 2 | 5 |
| CM101 | Đi tham quan vendor trực tiếp | 2 | 4 |
| CM102 | Đi tham quan vendor trực tiếp | 4 | 5 |
| CM201 | Đi tham quan vendor trực tiếp | 2 | 4 |
| CM202 | Đi tham quan vendor trực tiếp | 11 | 10 |
| CM203 | Đi tham quan vendor trực tiếp | 10 | 10 |
| CM301 | Đi tham quan vendor trực tiếp | 1 | 4 |
| CM302 | Đi tham quan vendor trực tiếp | 1 | 4 |
| CM401 | Đi tham quan vendor trực tiếp | 1 | 4 |
| CM402 | Đi tham quan vendor trực tiếp | 1 | 4 |
| CM403 | Đi tham quan vendor trực tiếp | 1 | 4 |

## 3. Thời hạn kiểm định, bảo dưỡng và tem nhãn

AI đọc ngày trên tem, nhãn, thẻ và so với ngày audit: quá hạn hoặc thiếu tem bắt buộc là vi phạm; còn hạn dưới 30 ngày chỉ nhắc; không đọc rõ ngày thì ghi "cần kiểm tra thêm". Mục có dấu * chỉ có nguồn thứ cấp, cần đối chiếu văn bản gốc.

| Đối tượng | Chu kỳ, thời hạn | Căn cứ | Mức | Lỗi |
|---|---|---|---|---|
| Cầu trục, cổng trục | 3 năm; trên 12 năm sử dụng: 1 năm | QCVN 30:2016/BLĐTBXH | Major | TN1 |
| Xe nâng hàng * | 2 năm; trên 10 năm sử dụng: 1 năm | QTKĐ 17-2016/BLĐTBXH | Major | TN1 |
| Thang máy | 2 năm tại nhà xưởng, văn phòng, chung cư, nơi công cộng; 3 năm nơi khác; trên 15 năm: 1 năm | TT 12/2021/TT-BLĐTBXH (QTKĐ 02-2021) | Major | TN1 |
| Bình chịu áp lực (bình khí nén, bình tích áp) * | 3 năm; 2 năm với môi chất độc, ăn mòn, cháy nổ | QTKĐ 07-2016/BLĐTBXH | Major | TN1 |
| Thiết bị có yêu cầu nghiêm ngặt về an toàn (nói chung) | Kiểm định trước khi dùng và định kỳ; có tem kiểm định còn hạn | Luật 84/2015/QH13 Điều 31; NĐ 44/2016/NĐ-CP; TT 36/2019/TT-BLĐTBXH | Major | TN1 |
| Bình chữa cháy | Bảo dưỡng ít nhất 6 tháng/lần (TCVN 7435-2: 6–12 tháng); tự kiểm tra hằng tháng | QCVN 10:2025/BCA mục 1.5.13; TCVN 7435-2; TT 36/2025/TT-BCA | Major | TN2 |
| Tem kiểm định phương tiện PCCC | Cơ chế tem tiếp tục áp dụng đến 30/6/2026 | NĐ 105/2025/NĐ-CP Điều 46 | Major | TN2 |
| Báo cháy, đèn sự cố, đèn chỉ dẫn thoát nạn, cấp nước chữa cháy | Bảo dưỡng ít nhất 1 năm/lần | QCVN 10:2025/BCA; TCVN 3890:2023 | Minor | TN4 |
| Găng tay cách điện | Thử nghiệm ít nhất 6 tháng/lần | QCVN 24:2014/BLĐTBXH | Major | TN5 |
| Ủng cách điện | Thử nghiệm 6 tháng/lần | QCVN 15:2013/BLĐTBXH | Major | TN5 |
| Phương tiện đo nhóm 2 (đồng hồ áp suất, cân, thiết bị đo điện) | Theo chu kỳ trong danh mục, ví dụ đo điện trở cách điện 12 tháng | TT 23/2013/TT-BKHCN, sửa đổi TT 07/2019/TT-BKHCN | Minor | TN6 |
| Hệ thống chống sét, nối đất | Kiểm tra, đo không quá 12 tháng; điện trở nối đất ≤ 10 Ω | TCVN 9385:2012 mục 12.3.2 | Minor | TN7 |
| Hóa chất | Nhãn GHS đủ: tên, hình đồ cảnh báo, từ cảnh báo, biện pháp phòng ngừa, hạn sử dụng; không dùng hóa chất quá hạn | Luật 69/2025/QH15; NĐ 43/2017/NĐ-CP sửa đổi bởi NĐ 111/2021/NĐ-CP | Major | TN8 |
| Thực phẩm tại bếp ăn | Có nhãn, hạn sử dụng; không dùng thực phẩm quá hạn | Luật ATTP 55/2010/QH12 Điều 5; NĐ 43/2017/NĐ-CP | Major | TN9 |
| Thuốc, vật tư sơ cứu * | Còn hạn sử dụng theo nhãn | TT 19/2016/TT-BYT | Minor | TN10 |
| PPE, dây đai an toàn, phin lọc | Trong hạn sử dụng của nhà sản xuất, không hư hỏng | Luật 84/2015/QH13 Điều 23 | Major | TN11 |

Nguồn đã tra (tháng 11/2026):

- Thang máy, xe nâng, bình chịu áp lực, chống sét: vnce.vn (quy-dinh-thoi-han-kiem-dinh-thang-may-thang-cuon, kiem-dinh-xe-nang-hang, quy-trinh-kiem-dinh-binh-ap-luc, tcvn-9385-2012).
- Cầu trục: kiemdinhantoan.com.vn/kiem-dinh-cau-truc-2026/.
- TT 12/2021/TT-BLĐTBXH, TT 23/2013/TT-BKHCN, ghi nhãn hóa chất, NĐ 12/2022/NĐ-CP: thuvienphapluat.vn.
- Tem kiểm định bình chữa cháy, NĐ 105/2025/NĐ-CP: thietbi114.vn; pccchuongduong.vn.
- QCVN 24:2014, QCVN 15:2013, TT 37/2014/TT-BLĐTBXH: luatvietnam.vn.
- TCVN 9385:2012: sxd.laocai.gov.vn; kiemdinhsitc.com; luatminhkhue.vn.

Lưu ý: các nguồn ghi khác nhau về chu kỳ xe nâng và thang máy; cơ chế tem kiểm định phương tiện PCCC theo NĐ 105/2025 chỉ đến 30/6/2026, audit sau ngày này cần xem quy định mới.
