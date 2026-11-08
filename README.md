# Audit RBA

App soát ảnh hiện trường EHS theo RBA Guider 8.0.1: AI khoanh vùng và viết lỗi, người đánh giá xác nhận, xuất file Findings mẫu SEV/T, ảnh báo cáo song ngữ, PDF trình chiếu. Có lưu dữ liệu online theo phân vùng, đăng nhập và phân quyền 3 cấp.

- **Link dùng app (24/24):** https://ngocngon.github.io/audit-rba/
- **Máy chủ API (Cloudflare Workers + D1):** `https://audit-rba-api.likiop00.workers.dev`

## Cấu trúc

| Thư mục | Nội dung |
|---|---|
| `docs/` | Bản cài web (PWA) đang chạy trên GitHub Pages |
| `server/` | Máy chủ Cloudflare Workers + cơ sở dữ liệu D1 (`schema.sql`, `src/index.js`, `wrangler.toml`) |
| `source/` | Gói mã nguồn gốc v1.1 + lớp online (`3-cong-cu-dung/cloud/`, `patch_cloud.py`) |

## Phân vùng và quyền

- **Phân vùng trong Kho audit:** Đối tác (Vendor) → Lần audit (ngày) → Khu vực → Ảnh và lỗi.
- **Ba vai trò** (máy chủ kiểm tra ở mọi thao tác):
  - **Quản trị viên (Admin):** quản lý người dùng, giao audit, khóa audit, cài đặt hệ thống, nhật ký, sửa và xóa mọi audit.
  - **Auditor:** tạo audit mới; chỉ sửa audit do mình tạo hoặc được Admin giao.
  - **Người xem:** chỉ xem và tải báo cáo, không sửa được dữ liệu online.
- Mất mạng vẫn dùng trên máy như bình thường; có mạng tự đồng bộ lên Kho audit.

## Phát hành bản mới

```bash
cd source
mkdir -p out
python3 3-cong-cu-dung/patch_pwa.py 1-ma-nguon-app/soat-anh-ehs-rba.html out/index.html 1.4
python3 3-cong-cu-dung/pwa_assets.py out 1.4 3-cong-cu-dung/logo.webp
cp 3-cong-cu-dung/_headers out/
python3 3-cong-cu-dung/patch_cloud.py out/index.html https://audit-rba-api.likiop00.workers.dev
cd .. && rm -rf docs/* && cp -r source/out/. docs/ && touch docs/.nojekyll && rm -rf source/out
git add -A && git commit -m "v1.4" && git push
```

Nếu sửa `server/`: `cd server && npx wrangler deploy` (nếu đổi bảng thì chạy thêm `npx wrangler d1 execute audit-rba --remote --file schema.sql`).

Nhớ tăng số phiên bản mỗi lần phát hành để điện thoại lấy bản mới.
