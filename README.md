# Audit RBA

App soát ảnh hiện trường EHS theo RBA Guider 8.0.1: AI khoanh vùng và viết lỗi, người đánh giá xác nhận, xuất file Findings mẫu SEV/T, ảnh báo cáo song ngữ, PDF trình chiếu.

**Link dùng app (online 24/24):** https://ngocngon.github.io/audit-rba/

## Cấu trúc

| Thư mục | Nội dung |
|---|---|
| `docs/` | Bản cài web (PWA) đang chạy trên GitHub Pages |
| `source/` | Toàn bộ gói mã nguồn gốc v1.1 (mã nguồn app, công cụ dựng, tài liệu, mẫu Findings, kiểm thử) |

## Phát hành bản mới

```bash
cd source
mkdir -p out && python3 3-cong-cu-dung/patch_pwa.py 1-ma-nguon-app/soat-anh-ehs-rba.html out/index.html 1.3
python3 3-cong-cu-dung/pwa_assets.py out 1.3 3-cong-cu-dung/logo.webp
cd .. && rm -rf docs/* && cp -r source/out/. docs/ && touch docs/.nojekyll && rm -rf source/out
git add -A && git commit -m "v1.3" && git push
```

GitHub Pages tự đăng bản mới sau khoảng 1 phút. Nhớ tăng số phiên bản mỗi lần để điện thoại lấy bản mới.

Mỗi người dùng nhập key Gemini của mình (https://aistudio.google.com/apikey) trong **Cài đặt AI**; key chỉ lưu trên máy người dùng.
