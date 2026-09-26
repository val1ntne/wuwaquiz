# Ô chữ Thế chiến II — bản dành cho GitHub Pages

Gói này chứa toàn bộ trang hiện tại: ô chữ tiếng Việt, nền Yangyang, lông vũ, con trỏ bút lông và các hiệu ứng. Không cần cài thư viện hoặc chạy bước build.

## Đưa lên repository trống

1. Giải nén tệp ZIP trên máy tính.
2. Mở repository công khai của bạn trên GitHub.
3. Trong phần Quick setup của repository trống, bấm “uploading an existing file”. Nếu repository đã có tệp, chọn Add file → Upload files.
4. Kéo toàn bộ NỘI DUNG vừa giải nén vào trang upload, gồm các tệp HTML/CSS/JS/MJS, thư mục assets và các tệp đi kèm. Giữ nguyên thư mục assets. Không tải chính tệp ZIP lên.
5. Bấm Commit changes. Kiểm tra index.html nằm ngay ngoài cùng repository, cùng cấp với thư mục assets; không để bên trong một thư mục bọc khác.
6. Vào Settings → Pages. Ở Build and deployment, chọn Source: Deploy from a branch.
7. Chọn Branch: main, thư mục /(root), rồi Save.
8. Khi triển khai hoàn tất, GitHub hiển thị địa chỉ trang trong Settings → Pages.

Địa chỉ thường có dạng https://TEN-GITHUB.github.io/TEN-REPOSITORY/.

## Các tệp chính

- index.html: bố cục và các hộp thoại tiếng Việt.
- style.css: giao diện, lông vũ chuyển động và con trỏ tùy chỉnh.
- script.js: tương tác ô chữ.
- puzzle.mjs: câu hỏi, đáp án và logic từ khóa.
- effects.mjs: vệt mực, vòng sáng và hiệu ứng lông vũ.
- assets/: toàn bộ ảnh cần thiết.
- .nojekyll: yêu cầu GitHub Pages phục vụ trực tiếp các tệp tĩnh.

## Xem thử trên máy

Mở thư mục bằng VS Code và dùng tiện ích Live Server để phục vụ trang qua HTTP. Không nên mở index.html bằng cách bấm đúp vì trang dùng JavaScript modules; trình duyệt có thể chặn module qua file://.

Phông Be Vietnam Pro tải từ Google Fonts khi có mạng. Con trỏ bút lông áp dụng trên thiết bị dùng chuột; thiết bị cảm ứng dùng thao tác chạm. Chế độ giảm chuyển động của thiết bị được tôn trọng.

Hướng dẫn chính thức:
https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
