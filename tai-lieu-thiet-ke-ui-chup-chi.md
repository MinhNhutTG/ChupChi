# Chụp Chi — Tài liệu thiết kế UI

> Ghi lại toàn bộ hệ thống thiết kế — màu sắc, typography, bố cục, luồng màn hình và các quyết định UX — của app quản lý chi tiêu cá nhân bằng ảnh "Chụp Chi", để tham chiếu khi phát triển thật.

**▶ [Xem demo UI trực tiếp (prototype tương tác)](https://claude.ai/artifact/6Cb5MWXHKYN2AAGxeSGLjg)**

---

## 01. Định vị sản phẩm

Ứng dụng quản lý chi tiêu cá nhân dùng chủ yếu trên điện thoại. Điểm khác biệt cốt lõi: thay vì nhập liệu bằng form, người dùng **chụp ảnh giao dịch** (giống Locket) kèm giá tiền + danh mục, giảm tối đa số thao tác để ghi lại một khoản chi.

- **Nhanh là ưu tiên số 1** — Mọi quyết định thiết kế đều nhắm tới việc giảm số bước: chọn danh mục + giá tiền trước, chụp là lưu luôn — không có màn xác nhận trung gian.
- **Đáng tin cậy vì là tiền** — Bảng màu và typography nghiêng về cảm giác "sổ chi tiêu" đáng tin, không quá trẻ con/vui nhộn dù thao tác chính là chụp ảnh.
- **Ảnh là dữ liệu chính** — Mỗi giao dịch gắn đúng 1 ảnh. Lịch theo ngày hiển thị ảnh thu nhỏ thay vì số liệu khô khan, giúp gợi nhớ trực quan.

---

## 02. Bảng màu

Tông sáng, trung tính, nghiêng tài chính — nền gần trắng ánh sage, chữ navy đậm, 1 màu accent xanh dương tin cậy làm điểm nhấn hành động chính.

| Tên | Mã màu | Vai trò |
|---|---|---|
| Paper | `#F8FAF3` | Nền chính toàn app |
| Paper Deep | `#EEF2E7` | Nền phụ, khối nổi nhẹ |
| Card | `#FFFFFF` | Nền thẻ, input |
| Ink | `#17233B` | Màu chữ chính |
| Ink Soft | `#6B7789` | Màu chữ phụ, mô tả |
| Accent | `#2F6FED` | Nút CTA chính, nút Chụp, link |
| Accent Deep | `#1F52C7` | Trạng thái nhấn/active |
| Gold | `#B08A2E` | Điểm nhấn phụ (tài khoản...) |
| Camera BG | `#0F1826` | Nền khung camera |

**5 danh mục mặc định** (tông trầm, giảm độ chói để nhìn lâu không mỏi mắt):

| Danh mục | Mã màu |
|---|---|
| Ăn uống | `#B4654A` |
| Di chuyển | `#4E6E8C` |
| Giải trí | `#7A5A8A` |
| Hoá đơn | `#5C7A50` |
| Khác | `#7C7566` |

---

## 03. Typography

3 vai trò rõ ràng, không dùng font mặc định của hệ thống cho phần thương hiệu.

| Vai trò | Font | Ví dụ |
|---|---|---|
| Wordmark / tiêu đề | Fraunces (italic) | *Chụp Chi* |
| Giao diện / nội dung | Work Sans | Nhãn, nút, mô tả |
| Số tiền / dữ liệu | Space Mono | `1.210.000₫` |

---

## 04. Bố cục & khung ảnh

- **Khung camera vuông (1:1)** — Không tràn viền, có margin cách mép màn hình, bo góc 30px, 4 góc ngắm kiểu ống kính. Nền chrome xung quanh (thanh trên/dưới) dùng nền sáng đồng bộ toàn app.
- **Khối Chụp = khung + nút** — Khung ảnh và hàng nút bên dưới được gộp thành 1 khối, căn giữa trong khoảng trống còn lại, tránh khoảng trắng lệch giữa hai phần.
- **Lịch theo ngày** — Lưới 7 cột (T2→CN), mỗi ô ngày có giao dịch hiển thị 1–2 ảnh thu nhỏ đại diện (không phải số tiền). Ô hôm nay có viền accent nổi bật rõ rệt.

---

## 05. Thanh điều hướng

3 mục, nút **Chụp** là FAB nổi cao ở giữa:

`Nhật ký (lịch tháng)` · `★ Chụp — FAB nổi, to hơn` · `Tài khoản`

> **Quan trọng**: Nút FAB không phải nút điều hướng thuần tuý — nếu đang ở màn khác → bấm để *vào* màn Chụp; nếu đã ở màn Chụp → bấm để *chụp ảnh thật*. Tránh trùng lặp 2 nút chụp cùng lúc trên 1 màn hình.

---

## 06. Luồng ghi giao dịch (đã tối giản)

Không còn màn "Xác nhận" riêng — mọi input nằm ngay trên màn Chụp, chụp xong là lưu:

1. Chọn danh mục (chip)
2. Nhập giá tiền (**bắt buộc**)
3. Tên món (tuỳ chọn)
4. Bấm Chụp
5. ✓ Lưu ngay + toast xác nhận

Nếu bấm Chụp mà chưa nhập giá tiền, **hoặc giá tiền dưới 1.000₫**: ô giá tiền rung nhẹ + toast báo lỗi màu đỏ, không mở camera. "Nhập tay" (không chụp ảnh) dùng chung luồng, chỉ khác ảnh đại diện là ảnh placeholder.

---

## 06b. Danh mục cá nhân hoá & sửa ảnh giao dịch

Bổ sung sau vòng trả lời bảng câu hỏi yêu cầu — không còn danh mục dùng chung toàn hệ thống.

- **Quản lý danh mục** (Tài khoản → Quản lý danh mục) — Mỗi user có bộ danh mục riêng, khởi tạo từ 5 danh mục mặc định. Bấm vào 1 danh mục để đổi tên + chọn màu từ bảng màu có sẵn. Xoá được (trừ "Khác" bị khoá cứng), tạo mới không giới hạn qua nút "+ Thêm danh mục".
- **Đổi ảnh giao dịch sau khi lưu** — Trong modal chi tiết giao dịch, nút "Đổi ảnh" nổi ở góc ảnh cho phép thay ảnh khác bất kỳ lúc nào (khác thiết kế ban đầu là ảnh bất biến).
- **Xác thực email sau đăng ký** — Đăng ký bằng email → chuyển ngay sang màn "Xác thực email" (không vào thẳng app), có nút gửi lại email và xác nhận đã xác thực. Đăng ký bằng Google bỏ qua bước này.

---

## 07. Bộ icon

Icon dạng outline/line, stroke `1.8px`, bo tròn đầu nét (`stroke-linecap: round`), viewBox `24×24` — đồng bộ độ bo mềm mại của toàn giao diện. Icon Google giữ nguyên bản gốc đa sắc, không chỉnh sửa.

| Icon | Vị trí dùng | Kích thước nút | Ghi chú |
|---|---|---|---|
| Camera | FAB giữa thanh điều hướng | 66×66px | Kiêm vai trò nút chụp thật khi đang ở màn Chụp |
| Lịch | Tab trái (Nhật ký) | 44px vùng chạm | Active/inactive đổi màu accent |
| Người dùng | Tab phải (Tài khoản) | 44px vùng chạm | |
| Đổi camera | Góc trái hàng nút màn Chụp | 42×42px | Đổi camera trước/sau |
| Bút chì | Góc phải hàng nút màn Chụp | 42×42px | Nhập tay (không cần chụp ảnh) |
| Đóng (X) | Đóng màn Tài khoản | 34×34px | |
| Chevron trái/phải | Chuyển tháng trong lịch | 32×32px | Cặp trái/phải |

---

## 08. Nhật ký quyết định thiết kế

**Vì sao bỏ màn "Xác nhận" riêng?**
Vì danh mục + giá tiền đã được chọn ngay trên màn Chụp trước khi bấm nút — có thêm 1 màn hỏi lại là dư thừa, tăng số bước không cần thiết.

**Vì sao gộp nút FAB và nút chụp thật làm một?**
Ban đầu có 2 hình tròn xanh giống hệt nhau (FAB điều hướng + nút chụp thật) nằm sát nhau, gây nhầm lẫn "2 nút cùng chức năng". Gộp lại giúp giao diện gọn và không còn nút giả gây confusion.

**Vì sao khung camera không tràn viền (full-bleed)?**
Từng thử kiểu tràn viền giống Locket, nhưng quyết định cuối cùng là giữ khung có margin/bo góc rõ ràng — nhìn giống "khung ảnh" hơn là "camera app" thuần tuý, hợp với việc app còn có nhiều màn hình khác (Nhật ký, Tài khoản) chứ không chỉ có mỗi camera.

**Vì sao đổi màu accent từ xanh lá sang xanh dương?**
Xanh lá đậm ban đầu (nghĩ theo hướng "tiền/tăng trưởng") bị đánh giá là không đẹp. Xanh dương tươi vừa sáng sủa vừa vẫn giữ cảm giác đáng tin cậy của app tài chính (tương tự Revolut, N26).

**Vì sao lịch hiện ảnh thay vì số tiền trong ô ngày?**
Đúng tinh thần cốt lõi của app — "ảnh là dữ liệu chính". Nhìn ảnh gợi nhớ giao dịch trực quan hơn một con số khô khan.

**Vì sao bỏ danh mục dùng chung, chuyển sang mỗi user 1 bộ riêng?**
Vì trả lời bảng câu hỏi yêu cầu xác nhận người dùng muốn tự đổi tên/màu danh mục theo sở thích — nếu dùng chung, sửa của người này sẽ ảnh hưởng người khác. Danh mục "Khác" được khoá cứng làm nơi hứng giao dịch mồ côi khi xoá danh mục khác.

**Vì sao thêm màn Xác thực email thay vì vào thẳng app sau đăng ký?**
Theo yêu cầu bảo mật: tài khoản đăng ký bằng email phải xác thực trước khi dùng được, tránh tài khoản ảo/email giả. Đăng ký qua Google được miễn vì Google đã xác thực email sẵn.

**Vì sao giới hạn giá tiền tối thiểu 1.000₫?**
Tránh dữ liệu rác/nhập nhầm (vd bấm nhầm để trống hoặc gõ số quá nhỏ không có ý nghĩa thực tế với đơn vị VNĐ).

---
*Chụp Chi · Tài liệu thiết kế UI · Cập nhật theo tiến trình thiết kế prototype*
