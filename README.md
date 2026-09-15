# CÁ VIÊN VỈA HÈ

Game quản lý thời gian thuần HTML/CSS/JavaScript về một quầy đồ chiên đường phố ở Biên Hòa, Đồng Nai. Người chơi khởi nghiệp lại với 300.000đ, một chiếc xe cũ và một chảo chiên nhỏ; từ đó phục vụ khách, xây quan hệ với người quen quanh khu trường học, nâng cấp quầy và mở khóa chế độ vô tận.

> THPT Chuyên Lương Thế Vinh chỉ là cảm hứng địa lý cho bối cảnh. Mọi học sinh, giáo viên, cán bộ, phụ huynh và sự kiện trong game đều hoàn toàn hư cấu.

## Gameplay

1. Đọc món và sốt trong bong bóng gọi món của khách.
2. Bấm nguyên liệu để đưa vào một ô chảo trống.
3. Theo dõi các trạng thái **Sống → Đang chiên → Sẵn sàng → Cháy**.
4. Bấm món ở trạng thái **Sẵn sàng** để chuyển sang khay.
5. Chọn đúng sốt, chọn khách và bấm **Phục vụ**.
6. Dùng lợi nhuận nâng cấp chảo, khay, thời gian chờ và sức hút của quầy.

Đơn đúng tăng doanh thu, tiền boa, uy tín, quan hệ và combo. Đơn sai, khách bỏ đi hoặc món cháy sẽ làm mất combo và giảm kết quả cuối ngày. Doanh thu, giá vốn, tiền boa, tiền phạt và lợi nhuận được theo dõi riêng.

## Tính năng nổi bật

- 8 món đồ chiên mở dần theo ngày, 5 loại sốt và đơn có món lặp lại.
- Từng ô chảo hoạt động độc lập, có khoảng thời gian lấy món trước khi cháy.
- Khay phục vụ giới hạn dung lượng; cấp cao mở các đơn nhóm lớn.
- 23 khách quen hư cấu thuộc nhiều nhóm: học sinh, giáo viên, phụ huynh, bảo vệ, tài xế và chủ quầy đối thủ.
- Hơn 300 câu thoại theo cá tính, tình huống, quan hệ, thời tiết, mùa thi và tốt nghiệp.
- 6 chương truyện ngắn tại Biên Hòa và chế độ vô tận từ ngày 18.
- Sự kiện: giờ ra chơi, tan trường, mưa chiều, tuần thi, hội thao, ngày CLB, Valentine, tốt nghiệp và Food Street Rush.
- Quan hệ 5 cấp: Khách mới, Khách quen, Thân thuộc, Bạn của quầy, Khách ruột.
- Đơn thứ hai đặc biệt của Khánh và tuyến khách bí ẩn “Anh 4:37”.
- 8 nhánh nâng cấp có giá tăng theo cấp và hiệu ứng áp dụng trực tiếp vào gameplay.
- Hướng dẫn tương tác lần đầu, tạm dừng, thống kê dài hạn, âm thanh Web Audio và lưu tự động.
- Giao diện co giãn cho desktop, tablet và điện thoại; có hỗ trợ bàn phím và focus rõ ràng.

## Điều khiển

- **Chuột/chạm:** toàn bộ thao tác chơi.
- **Esc:** tạm dừng/tiếp tục; cũng dùng để đóng hộp thoại thông thường.
- **Space:** phục vụ khi đang ở màn chơi và không chọn nút khác.
- **Thùng rác:** bỏ toàn bộ món cháy; nếu không có món cháy thì dọn khay.

## Chạy trên máy

Không có bước build và không cần cài package. Có thể mở `index.html` trực tiếp bằng trình duyệt hiện đại. Nếu trình duyệt giới hạn một số tính năng khi mở tệp trực tiếp, dùng một static server bất kỳ, chẳng hạn Live Server trong VS Code.

## Triển khai GitHub Pages

1. Tạo repository GitHub mới.
2. Tải toàn bộ nội dung thư mục này lên nhánh `main`, bảo đảm `index.html` nằm ở thư mục gốc.
3. Mở **Settings → Pages**.
4. Trong **Build and deployment**, chọn **Deploy from a branch**.
5. Chọn nhánh **main**, thư mục **/(root)**, rồi bấm **Save**.
6. Chờ GitHub tạo đường dẫn dạng `https://username.github.io/ten-repository/`.

Mọi đường dẫn trong game đều là đường dẫn tương đối nên hoạt động đúng khi repository được xuất bản dưới một subpath.

## Lưu tiến trình

Game dùng `localStorage` với khóa `caVienViaHeSave_v1`. Dữ liệu gồm tiền, ngày, uy tín, nâng cấp, món đã mở, thiết lập âm thanh, thống kê, quan hệ nhân vật, chương và cảnh truyện đã xem. Trạng thái đang chiên dở không được lưu. Dữ liệu sai định dạng được kiểm tra và phục hồi về cấu hình an toàn; nút **Xóa toàn bộ tiến trình** luôn yêu cầu xác nhận.

## Cấu trúc

```text
.
├── index.html
├── README.md
├── .nojekyll
├── css/
│   ├── main.css
│   ├── game.css
│   ├── animations.css
│   └── responsive.css
├── js/
│   ├── main.js
│   ├── config.js
│   ├── characters.js
│   ├── game.js
│   ├── customers.js
│   ├── cooking.js
│   ├── orders.js
│   ├── economy.js
│   ├── upgrades.js
│   ├── storage.js
│   ├── story.js
│   ├── audio.js
│   ├── tutorial.js
│   └── ui.js
├── assets/
    ├── food/
    ├── characters/
    ├── restaurant/
    ├── ui/
    └── audio/
└── qa/
    └── validate.mjs
```

Có thể chạy `node qa/validate.mjs` nếu máy đã có Node.js để kiểm tra cú pháp, đường dẫn asset, ID giao diện và logic gameplay. Node.js chỉ dùng cho QA tùy chọn, hoàn toàn không cần để chơi hoặc triển khai game.

## Công nghệ và asset

- HTML5, CSS3, Vanilla JavaScript ES6+.
- Không Node.js, npm, framework, backend, API key, analytics hoặc tracker.
- Toàn bộ minh họa SVG được tạo riêng cho dự án và lưu trong repository.
- Không hotlink hình ảnh, font, âm thanh hay thư viện bên ngoài.
- Âm thanh phản hồi được tổng hợp lúc chạy bằng Web Audio API; nếu trình duyệt không hỗ trợ, gameplay vẫn hoạt động bình thường.

## Hướng mở rộng

- Thêm món theo mùa và trang phục quầy sau chế độ vô tận.
- Thêm tuyến truyện nhân vật sau tốt nghiệp.
- Thêm thử thách ngày với seed chia sẻ được.
- Thêm nhiều quầy ở các khu vực khác của Biên Hòa.

## Giấy phép nội dung

Mã nguồn và asset trong repository này được tạo cho dự án **Cá Viên Vỉa Hè**. Không có asset nào được sao chép hoặc hotlink từ ảnh tham chiếu.
