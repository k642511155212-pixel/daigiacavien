# Bản sửa 2026.09.16-CLEAN-STORY-v4

- Xóa hoàn toàn Trâm, My, Gia Huy và giáo viên đã bỏ khỏi runtime/data/assets.
- Giữ đúng 3 giáo viên thường: Thầy Tùng (Tin), Thầy Phong (Toán), Cô Linh (Anh); giữ hiệu trưởng/phó hiệu trưởng.
- Thêm Phước Nguyên, Anh Quân, Thiên Ân, Hoàng Linh; đổi An thành nam sinh bóng rổ tóc xoăn.
- Nhân là nữ du học sinh Hong Kong; Thủy là nam sinh IT cùng lớp Dương và rất thích chị Thảo.
- Thêm Homi, corgi mascot của quầy.
- Sửa order generator: khách không thể gọi món/nước/sốt chưa mở khóa.
- Số khách/ngày: 8 → 10 → 12 → 14 → 16, sau đó ổn định 16–18.
- Khánh xuất hiện ổn định hơn; Day 2 có invasion đảm bảo, có cơ chế 1–2 ngày; order lớn, tip cao, second order và câu “Ngon cỡ Poseidon.”
- Banner “KHÁNH BÉO ĐANG ĐỔ BỘ!!!” chạy hết màn hình trong 3.5 giây mỗi vòng rồi mới reset ngoài màn hình, không giật ngược giữa chừng.
- Menu sản phẩm mở khóa chậm lại: mỗi giai đoạn/ngày chỉ thêm tối đa 1–2 sản phẩm mới.
- Đồng bộ portrait nhân vật theo một pixel-art style; chỉnh các icon món hàng dưới theo style bo tròn/outline giống cá viên, bò viên, xúc xích.
- Bỏ phụ thuộc font dễ lỗi; dùng system font stack hỗ trợ tiếng Việt rộng rãi.
- Thêm build string để kiểm tra đúng bản deploy: 2026.09.16-CLEAN-STORY-v4.
- QA: syntax check toàn bộ JS, asset/path validation, save migration, order unlock simulation, runtime Khánh invasion test.


## 2026.09.16 — v5 layout and font polish
- Loaded Be Vietnam Pro from Google Fonts for stable Vietnamese rendering on GitHub Pages.
- Rebalanced gameplay area to a denser 16:9 composition so the playfield no longer feels too wide and empty on desktop.
- Enlarged customer, fryer, ingredient, drink, sauce, tray and dialogue UI so the stall reads larger inside the play screen.
- Kept responsive fallbacks for shorter laptop screens.
