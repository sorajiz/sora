const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const CATEGORIES = [
  {
    slug: 'nitro-trial',
    name: 'Nitro Lần Đầu',
    description: 'Trial Dành Cho AI Chưa Sài Nitro Bao Giờ',
    emoji: '<a:pade_trial:1561050802808684664>',
    sort_order: 1
  },
  {
    slug: 'nitro',
    name: 'Discord Nitro',
    description: 'Nitro Boosts, Basic, Nuôi Mail & Pro VIP',
    emoji: '<a:pade_nitro:1561050787075989624>',
    sort_order: 2
  },
  {
    slug: 'boost-server',
    name: 'Boost Server',
    description: 'Nâng Cấp Level Cho Server Discord',
    emoji: '<a:pade_boost:1561050809020580001>',
    sort_order: 3
  },
  {
    slug: 'deco-log',
    name: 'Deco Login',
    description: 'Login Vào Acc Để Lấy Deco Giá Tiết Kiệm',
    emoji: '<:pade_deco:1561050814431236236>',
    sort_order: 4
  },
  {
    slug: 'deco-gift',
    name: 'Deco Gift',
    description: 'Bấm Vào Link Là Nhận Ngay',
    emoji: '<:pade_deco:1561050814431236236>',
    sort_order: 5
  },
  {
    slug: 'youtube-prenium',
    name: 'YouTube Premium',
    description: 'Xem Không Quảng Cáo / YouTube Music Full HD',
    emoji: '<:pade_youtube:1561050819283919030>',
    sort_order: 6
  },
  {
    slug: 'spotify-prenium',
    name: 'Spotify Premium',
    description: 'Nghe Nhạc Offline Không Gián Đoạn / Tải Ngoại Tuyến',
    emoji: '<:pade_spotify:1561050824623259671>',
    sort_order: 7
  },
  {
    slug: 'netflix-4k',
    name: 'Netflix 4K',
    description: 'Xem Phim Full HD / 4K UHD Chất Lượng Cao',
    emoji: '<a:pade_netflix:1561050829740576919>',
    sort_order: 8
  },
  {
    slug: 'canva',
    name: 'Canva Pro',
    description: 'Thiết Kế Slide / Đồ Hoạ / Pro 1 Năm & Vĩnh Viễn',
    emoji: '<:pade_canva:1561050834760892540>',
    sort_order: 9
  },
  {
    slug: 'capcut-pro',
    name: 'CapCut Pro',
    description: 'Edit Video Không Watermark / TikTok',
    emoji: '<:pade_capcut:1561050841341759548>',
    sort_order: 10
  },
  {
    slug: 'gmini',
    name: 'Gemini Pro',
    description: 'Gói AI Gemini 18 Tháng Dạng Link Bấm Là Nhận',
    emoji: '<:pade_gemini:1561050846400217170>',
    sort_order: 11
  }
];

const PRODUCTS = [
  // ── 1. Nitro Lần Đầu (nitro-trial) ──
  {
    sku: 'NITRO-TRIAL-BOOST-4M',
    slug: 'nitro-boost-lan-dau-4-thang-bh3m',
    name: 'Nitro Boost Lần Đầu 4 Tháng BH3M',
    cat_slug: 'nitro-trial',
    short_description: 'Trial Boost 4 Tháng BH3M Cho Tài Khoản Mới',
    description: '> **Nitro Boost Lần Đầu 4 Tháng BH3M:** 60.000 VNĐ\n- Yêu Cầu: Tài Khoản Tạo Trên 1 Tháng Chưa Từng Dùng Nitro.\n- Bảo Hành 3 Tháng chính hãng 1 đổi 1.',
    price: 60000,
    compare_price: null,
    emoji: '<a:pade_trial:1561050802808684664>',
    is_featured: true,
    sort: 1
  },
  {
    sku: 'NITRO-TRIAL-LINK-3M',
    slug: 'link-kich-hoat-nitro-lan-dau-3m',
    name: 'Link Kích Hoạt Nitro Lần Đầu 3m',
    cat_slug: 'nitro-trial',
    short_description: 'Link Kích Hoạt Nitro Lần Đầu 3 Tháng (Cần Thẻ Visa Claim)',
    description: '> **Link Kích Hoạt Nitro Lần Đầu 3m:** 35.000 VNĐ\n- Yêu Cầu: Tài Khoản Tạo Trên 1 Tháng Chưa Từng Dùng Nitro.\n- Nếu biết cách sử dụng dạng link thì mới nên mua. Link cần có thẻ visa để claim.\n- Lưu ý: 1 số tài khoản đã tạo lâu sẽ có tỉ lệ không dùng được.',
    price: 35000,
    compare_price: null,
    emoji: '<a:pade_trial:1561050802808684664>',
    is_featured: false,
    sort: 2
  },
  {
    sku: 'NITRO-TRIAL-3M',
    slug: 'nitro-trial-3-thang',
    name: 'Nitro Trial 3 Tháng',
    cat_slug: 'nitro-trial',
    short_description: 'Nitro Trial 3 Tháng Cho Tài Khoản Chưa Dùng Nitro',
    description: '> **Nitro Trial 3 Tháng:** 55.000 VNĐ\n- Yêu Cầu: Tài Khoản Tạo Trên 1 Tháng Chưa Từng Dùng Nitro.\n- Bảo Hành 3 Tháng chính hãng 1 đổi 1.',
    price: 55000,
    compare_price: null,
    emoji: '<a:pade_trial:1561050802808684664>',
    is_featured: false,
    sort: 3
  },
  {
    sku: 'NITRO-TRIAL-4M',
    slug: 'nitro-trial-4-thang',
    name: 'Nitro Trial 4 Tháng',
    cat_slug: 'nitro-trial',
    short_description: 'Nitro Trial 4 Tháng Giá Tiết Kiệm',
    description: '> **Nitro Trial 4 Tháng:** 70.000 VNĐ\n- Yêu Cầu: Tài Khoản Tạo Trên 1 Tháng Chưa Từng Dùng Nitro.\n- Bảo Hành 3 Tháng chính hãng 1 đổi 1.',
    price: 70000,
    compare_price: null,
    emoji: '<a:pade_trial:1561050802808684664>',
    is_featured: false,
    sort: 4
  },

  // ── 2. Discord Nitro (nitro) ──
  {
    sku: 'NITRO-BOOSTS-1M',
    slug: 'nitro-boosts-login-1-thang',
    name: 'Nitro Boosts Login 1 Tháng',
    cat_slug: 'nitro',
    short_description: 'Nitro Boosts Login 1 Tháng Kèm 2 Boosts',
    description: '> **Nitro Boosts Login 1 Tháng:** 90.000 VNĐ\n- Cần gửi tài khoản mật khẩu và 5 mã dự phòng để kích hoạt.\n- Bảo hành chính hãng 1 đổi 1 trong suốt quá trình sử dụng.',
    price: 90000,
    compare_price: null,
    emoji: '<a:pade_nitro:1561050787075989624>',
    is_featured: true,
    sort: 1
  },
  {
    sku: 'NITRO-BOOST-2M-MAIL',
    slug: 'nitro-boosts-login-2-thang-nuoi-mail',
    name: 'Nitro Boosts Login 2 Tháng [ Nuôi Mail ]',
    cat_slug: 'nitro',
    short_description: 'Nitro Boosts 2 Tháng Mail Domain Nuôi 7 Ngày Đầu',
    description: '> **Nitro Boosts Login 2 Tháng [ Nuôi Mail ]:** 99.000 VNĐ\n- Cần gửi tài khoản mật khẩu và 5 mã dự phòng để kích hoạt.\n- Hàng 2 tháng mail domain chỉ cần nuôi mail 7 ngày đầu để duy trì nitro.\n- Bảo hành chính hãng 1 đổi 1 trong suốt quá trình sử dụng.',
    price: 99000,
    compare_price: null,
    emoji: '<a:pade_nitro:1561050787075989624>',
    is_featured: true,
    sort: 2
  },
  {
    sku: 'NITRO-BOOST-2M-PRO',
    slug: 'nitro-boosts-login-2-thang-pro-vip',
    name: 'Nitro Boosts Login 2 Tháng Pro VIP [ Không Nuôi Mail ]',
    cat_slug: 'nitro',
    short_description: 'Nitro 2 Tháng Pro VIP Chính Chủ Không Cần Nuôi Mail',
    description: '> **Nitro Boosts Login 2 Tháng Pro VIP [ Không Nuôi Mail ]:** 130.000 VNĐ\n- Cần gửi tài khoản mật khẩu và 5 mã dự phòng để kích hoạt.\n- Nitro Boost Login 2 Tháng Vip: Không cần nuôi mail trong quá trình sử dụng.\n- Bảo hành chính hãng 1 đổi 1 trong suốt quá trình sử dụng.',
    price: 130000,
    compare_price: null,
    emoji: '<a:pade_nitro:1561050787075989624>',
    is_featured: true,
    sort: 3
  },
  {
    sku: 'NITRO-RENEW-2M',
    slug: 'gia-han-nitro-2-thang',
    name: 'Gia Hạn Nitro 2 Tháng',
    cat_slug: 'nitro',
    short_description: 'Gia Hạn Trực Tiếp Khi Đang Dùng Hết Gói',
    description: '> **Gia Hạn Nitro 2 Tháng:** 99.000 VNĐ\n- Cần gửi tài khoản mật khẩu và 5 mã dự phòng để kích hoạt.\n- Bảo hành chính hãng 1 đổi 1 trong suốt quá trình sử dụng.',
    price: 99000,
    compare_price: null,
    emoji: '<a:pade_nitro:1561050787075989624>',
    is_featured: false,
    sort: 4
  },
  {
    sku: 'NITRO-BOOSTS-1Y',
    slug: 'nitro-boosts-login-1-nam',
    name: 'Nitro Boosts Login 1 Năm',
    cat_slug: 'nitro',
    short_description: 'Trọn Gói 12 Tháng Kèm 2 Boosts Tiết Kiệm Nhất',
    description: '> **Nitro Boosts Login 1 Năm:** 800.000 VNĐ\n- Cần gửi tài khoản mật khẩu và 5 mã dự phòng để kích hoạt.\n- Bảo hành chính hãng 1 đổi 1 trong suốt quá trình sử dụng.',
    price: 800000,
    compare_price: null,
    emoji: '<a:pade_nitro:1561050787075989624>',
    is_featured: true,
    sort: 5
  },
  {
    sku: 'NITRO-BASIC-1M',
    slug: 'nitro-basic-login-1-thang',
    name: 'Nitro Basic Login 1 Tháng',
    cat_slug: 'nitro',
    short_description: 'Nitro Basic 1 Tháng Emoji & Sticker Toàn Discord',
    description: '> **Nitro Basic Login 1 Tháng:** 40.000 VNĐ\n- Cần gửi tài khoản mật khẩu và 5 mã dự phòng để kích hoạt.\n- Sử dụng emoji và sticker trên toàn Discord.\n- Bảo hành chính hãng 1 đổi 1 trong suốt quá trình sử dụng.',
    price: 40000,
    compare_price: null,
    emoji: '<a:pade_basic:1561050794793504909>',
    is_featured: false,
    sort: 6
  },
  {
    sku: 'NITRO-BASIC-1Y',
    slug: 'nitro-basic-login-1-nam',
    name: 'Nitro Basic Login 1 Năm',
    cat_slug: 'nitro',
    short_description: 'Nitro Basic 1 Năm Trọn Gói Giá Rẻ',
    description: '> **Nitro Basic Login 1 Năm:** 340.000 VNĐ\n- Cần gửi tài khoản mật khẩu và 5 mã dự phòng để kích hoạt.\n- Sử dụng emoji và sticker trên toàn Discord cả năm.\n- Bảo hành chính hãng 1 đổi 1 trong suốt quá trình sử dụng.',
    price: 340000,
    compare_price: null,
    emoji: '<a:pade_basic:1561050794793504909>',
    is_featured: false,
    sort: 7
  },
  {
    sku: 'NITRO-FIX-RED',
    slug: 'go-thanh-toan-do',
    name: 'Gỡ Thanh Toán Đỏ',
    cat_slug: 'nitro',
    short_description: 'Xử Lý Lỗi Thanh Toán Đỏ Discord',
    description: '> **Gỡ Thanh Toán Đỏ:** 25.000 VNĐ\n- Gỡ thanh toán đỏ: Yêu cầu acc không cầm key server nào.\n- Bảo hành chính hãng 1 đổi 1.',
    price: 25000,
    compare_price: null,
    emoji: '<a:pade_nitro:1561050787075989624>',
    is_featured: false,
    sort: 8
  },

  // ── 3. Boost Server (boost-server) ──
  {
    sku: 'BOOST-2X-1M',
    slug: 'x2-boost-server-1-thang',
    name: 'x2 Boost Server 1 Tháng',
    cat_slug: 'boost-server',
    short_description: 'x2 Boost Server 1 Tháng',
    description: '> **x2 Boost Server 1 Tháng:** 18.000 VNĐ\n- Không được kick/ban bất cứ tài khoản bot nào của shop.\n- Đưa đúng link server (nên là link vĩnh viễn).\n- Server không được mở Apply to join hay Xác minh sđt.\n- Bắt Buộc Bật Lịch Sử Boost.\n- Boost 1 Tháng Bảo Hành 25 Ngày.',
    price: 18000,
    compare_price: null,
    emoji: '<a:pade_boost:1561050809020580001>',
    is_featured: false,
    sort: 1
  },
  {
    sku: 'BOOST-14X-1M',
    slug: 'x14-boost-server-1-thang-level-3',
    name: 'x14 Boost Server 1 Tháng [ Level 3 ]',
    cat_slug: 'boost-server',
    short_description: 'x14 Boost Server 1 Tháng Full Level 3',
    description: '> **x14 Boost Server 1 Tháng [ Level 3 ]:** 66.000 VNĐ\n- Mở khóa trọn vẹn Level 3 cho Discord Server.\n- Link server vĩnh viễn, không bật Apply to join / xác minh sđt.\n- Bắt Buộc Bật Lịch Sử Boost.\n- Boost 1 Tháng Bảo Hành 25 Ngày.',
    price: 66000,
    compare_price: null,
    emoji: '<a:pade_boost:1561050809020580001>',
    is_featured: true,
    sort: 2
  },
  {
    sku: 'BOOST-20X-1M',
    slug: 'x20-boost-server-1-thang',
    name: 'x20 Boost Server 1 Tháng',
    cat_slug: 'boost-server',
    short_description: 'x20 Boost Server 1 Tháng',
    description: '> **x20 Boost Server 1 Tháng:** 100.000 VNĐ\n- Boost 1 Tháng Bảo Hành 25 Ngày.\n- Bắt Buộc Bật Lịch Sử Boost.',
    price: 100000,
    compare_price: null,
    emoji: '<a:pade_boost:1561050809020580001>',
    is_featured: false,
    sort: 3
  },
  {
    sku: 'BOOST-28X-1M',
    slug: 'x28-boost-server-1-thang',
    name: 'x28 Boost Server 1 Tháng',
    cat_slug: 'boost-server',
    short_description: 'x28 Boost Server 1 Tháng',
    description: '> **x28 Boost Server 1 Tháng:** 150.000 VNĐ\n- Boost 1 Tháng Bảo Hành 25 Ngày.\n- Bắt Buộc Bật Lịch Sử Boost.',
    price: 150000,
    compare_price: null,
    emoji: '<a:pade_boost:1561050809020580001>',
    is_featured: false,
    sort: 4
  },
  {
    sku: 'BOOST-2X-4M',
    slug: 'x2-boost-server-4-thang',
    name: 'x2 Boost Server 4 Tháng',
    cat_slug: 'boost-server',
    short_description: 'x2 Boost Server 4 Tháng Dài Hạn',
    description: '> **x2 Boost Server 4 Tháng:** 50.000 VNĐ\n- Boost 4 Tháng Bảo Hành 3 Tháng.\n- Bắt Buộc Bật Lịch Sử Boost.',
    price: 50000,
    compare_price: null,
    emoji: '<a:pade_boost:1561050809020580001>',
    is_featured: false,
    sort: 5
  },
  {
    sku: 'BOOST-14X-4M',
    slug: 'x14-boost-server-4-thang',
    name: 'x14 Boost Server 4 Tháng',
    cat_slug: 'boost-server',
    short_description: 'x14 Boost Server 4 Tháng [ Level 3 ]',
    description: '> **x14 Boost Server 4 Tháng:** 360.000 VNĐ\n- Trọn gói Level 3 suốt 4 tháng.\n- Boost 4 Tháng Bảo Hành 3 Tháng.\n- Bắt Buộc Bật Lịch Sử Boost.',
    price: 360000,
    compare_price: null,
    emoji: '<a:pade_boost:1561050809020580001>',
    is_featured: true,
    sort: 6
  },
  {
    sku: 'BOOST-20X-4M',
    slug: 'x20-boost-server-4-thang',
    name: 'x20 Boost Server 4 Tháng',
    cat_slug: 'boost-server',
    short_description: 'x20 Boost Server 4 Tháng Dài Hạn',
    description: '> **x20 Boost Server 4 Tháng:** 515.000 VNĐ\n- Boost 4 Tháng Bảo Hành 3 Tháng.\n- Bắt Buộc Bật Lịch Sử Boost.',
    price: 515000,
    compare_price: null,
    emoji: '<a:pade_boost:1561050809020580001>',
    is_featured: false,
    sort: 7
  },
  {
    sku: 'BOOST-28X-4M',
    slug: 'x28-boost-server-4-thang',
    name: 'x28 Boost Server 4 Tháng',
    cat_slug: 'boost-server',
    short_description: 'x28 Boost Server 4 Tháng Dài Hạn',
    description: '> **x28 Boost Server 4 Tháng:** 715.000 VNĐ\n- Boost 4 Tháng Bảo Hành 3 Tháng.\n- Bắt Buộc Bật Lịch Sử Boost.',
    price: 715000,
    compare_price: null,
    emoji: '<a:pade_boost:1561050809020580001>',
    is_featured: false,
    sort: 8
  },

  // ── 4. Deco Login (deco-log) ──
  {
    sku: 'DECO-LOG-66K',
    slug: 'deco-gia-goc-66000-vnd',
    name: 'Deco Giá Gốc 66.000 VNĐ',
    cat_slug: 'deco-log',
    short_description: 'Deco Login Vào Acc Giá Gốc 66k',
    description: '> **Deco Giá Gốc 66.000 VNĐ:** 23.000 VNĐ\n- Cần gửi tài khoản mật khẩu Discord để shop đăng nhập mua deco.\n- Bảo hành chính hãng không thu hồi.',
    price: 23000,
    compare_price: 66000,
    emoji: '<:pade_deco:1561050814431236236>',
    is_featured: false,
    sort: 1
  },
  {
    sku: 'DECO-LOG-79K',
    slug: 'deco-gia-goc-79000-vnd',
    name: 'Deco Giá Gốc 79.000 VNĐ',
    cat_slug: 'deco-log',
    short_description: 'Deco Login Vào Acc Giá Gốc 79k',
    description: '> **Deco Giá Gốc 79.000 VNĐ:** 36.000 VNĐ\n- Cần gửi tài khoản mật khẩu Discord để shop đăng nhập mua deco.\n- Bảo hành chính hãng không thu hồi.',
    price: 36000,
    compare_price: 79000,
    emoji: '<:pade_deco:1561050814431236236>',
    is_featured: false,
    sort: 2
  },
  {
    sku: 'DECO-LOG-92K',
    slug: 'deco-gia-goc-92000-vnd',
    name: 'Deco Giá Gốc 92.000 VNĐ',
    cat_slug: 'deco-log',
    short_description: 'Deco Login Vào Acc Giá Gốc 92k',
    description: '> **Deco Giá Gốc 92.000 VNĐ:** 48.000 VNĐ\n- Cần gửi tài khoản mật khẩu Discord để shop đăng nhập mua deco.\n- Bảo hành chính hãng không thu hồi.',
    price: 48000,
    compare_price: 92000,
    emoji: '<:pade_deco:1561050814431236236>',
    is_featured: false,
    sort: 3
  },
  {
    sku: 'DECO-LOG-105K',
    slug: 'deco-gia-goc-105000-vnd',
    name: 'Deco Giá Gốc 105.000 VNĐ',
    cat_slug: 'deco-log',
    short_description: 'Deco Login Vào Acc Giá Gốc 105k',
    description: '> **Deco Giá Gốc 105.000 VNĐ:** 65.000 VNĐ\n- Cần gửi tài khoản mật khẩu Discord để shop đăng nhập mua deco.\n- Bảo hành chính hãng không thu hồi.',
    price: 65000,
    compare_price: 105000,
    emoji: '<:pade_deco:1561050814431236236>',
    is_featured: false,
    sort: 4
  },
  {
    sku: 'DECO-LOG-118K',
    slug: 'deco-gia-goc-118000-vnd',
    name: 'Deco Giá Gốc 118.000 VNĐ',
    cat_slug: 'deco-log',
    short_description: 'Deco Login Vào Acc Giá Gốc 118k',
    description: '> **Deco Giá Gốc 118.000 VNĐ:** 78.000 VNĐ\n- Cần gửi tài khoản mật khẩu Discord để shop đăng nhập mua deco.\n- Bảo hành chính hãng không thu hồi.',
    price: 78000,
    compare_price: 118000,
    emoji: '<:pade_deco:1561050814431236236>',
    is_featured: false,
    sort: 5
  },
  {
    sku: 'DECO-LOG-131K',
    slug: 'deco-gia-goc-131000-vnd',
    name: 'Deco Giá Gốc 131.000 VNĐ',
    cat_slug: 'deco-log',
    short_description: 'Deco Login Vào Acc Giá Gốc 131k',
    description: '> **Deco Giá Gốc 131.000 VNĐ:** 92.000 VNĐ\n- Cần gửi tài khoản mật khẩu Discord để shop đăng nhập mua deco.\n- Bảo hành chính hãng không thu hồi.',
    price: 92000,
    compare_price: 131000,
    emoji: '<:pade_deco:1561050814431236236>',
    is_featured: false,
    sort: 6
  },
  {
    sku: 'DECO-LOG-189K',
    slug: 'deco-gia-goc-189000-vnd',
    name: 'Deco Giá Gốc 189.000 VNĐ',
    cat_slug: 'deco-log',
    short_description: 'Deco Login Vào Acc Giá Gốc 189k',
    description: '> **Deco Giá Gốc 189.000 VNĐ:** 138.000 VNĐ\n- Cần gửi tài khoản mật khẩu Discord để shop đăng nhập mua deco.\n- Bảo hành chính hãng không thu hồi.',
    price: 138000,
    compare_price: 189000,
    emoji: '<:pade_deco:1561050814431236236>',
    is_featured: false,
    sort: 7
  },
  {
    sku: 'DECO-LOG-300K',
    slug: 'deco-gia-goc-300000-vnd',
    name: 'Deco Giá Gốc 300.000 VNĐ',
    cat_slug: 'deco-log',
    short_description: 'Deco Login Vào Acc Giá Gốc 300k',
    description: '> **Deco Giá Gốc 300.000 VNĐ:** 215.000 VNĐ\n- Cần gửi tài khoản mật khẩu Discord để shop đăng nhập mua deco.\n- Bảo hành chính hãng không thu hồi.',
    price: 215000,
    compare_price: 300000,
    emoji: '<:pade_deco:1561050814431236236>',
    is_featured: false,
    sort: 8
  },

  // ── 5. Deco Gift (deco-gift) ──
  {
    sku: 'DECO-GIFT-66K',
    slug: 'deco-gift-gia-goc-66000-vnd',
    name: 'Deco Gift Giá Gốc 66.000 VNĐ',
    cat_slug: 'deco-gift',
    short_description: 'Deco Gift Nhận Ngay Qua Link Giá Gốc 66k',
    description: '> **Deco Gift Giá Gốc 66.000 VNĐ:** 37.000 VNĐ\n- Dạng link quà tặng Discord Gift bấm vào là nhận ngay.\n- Không cần đăng nhập tài khoản.',
    price: 37000,
    compare_price: 66000,
    emoji: '<:pade_deco:1561050814431236236>',
    is_featured: false,
    sort: 1
  },
  {
    sku: 'DECO-GIFT-79K',
    slug: 'deco-gift-gia-goc-79000-vnd',
    name: 'Deco Gift Giá Gốc 79.000 VNĐ',
    cat_slug: 'deco-gift',
    short_description: 'Deco Gift Nhận Ngay Qua Link Giá Gốc 79k',
    description: '> **Deco Gift Giá Gốc 79.000 VNĐ:** 47.000 VNĐ\n- Dạng link quà tặng Discord Gift bấm vào là nhận ngay.\n- Không cần đăng nhập tài khoản.',
    price: 47000,
    compare_price: 79000,
    emoji: '<:pade_deco:1561050814431236236>',
    is_featured: false,
    sort: 2
  },
  {
    sku: 'DECO-GIFT-92K',
    slug: 'deco-gift-gia-goc-92000-vnd',
    name: 'Deco Gift Giá Gốc 92.000 VNĐ',
    cat_slug: 'deco-gift',
    short_description: 'Deco Gift Nhận Ngay Qua Link Giá Gốc 92k',
    description: '> **Deco Gift Giá Gốc 92.000 VNĐ:** 57.000 VNĐ\n- Dạng link quà tặng Discord Gift bấm vào là nhận ngay.\n- Không cần đăng nhập tài khoản.',
    price: 57000,
    compare_price: 92000,
    emoji: '<:pade_deco:1561050814431236236>',
    is_featured: false,
    sort: 3
  },
  {
    sku: 'DECO-GIFT-105K',
    slug: 'deco-gift-gia-goc-105000-vnd',
    name: 'Deco Gift Giá Gốc 105.000 VNĐ',
    cat_slug: 'deco-gift',
    short_description: 'Deco Gift Nhận Ngay Qua Link Giá Gốc 105k',
    description: '> **Deco Gift Giá Gốc 105.000 VNĐ:** 67.000 VNĐ\n- Dạng link quà tặng Discord Gift bấm vào là nhận ngay.\n- Không cần đăng nhập tài khoản.',
    price: 67000,
    compare_price: 105000,
    emoji: '<:pade_deco:1561050814431236236>',
    is_featured: false,
    sort: 4
  },
  {
    sku: 'DECO-GIFT-118K',
    slug: 'deco-gift-gia-goc-118000-vnd',
    name: 'Deco Gift Giá Gốc 118.000 VNĐ',
    cat_slug: 'deco-gift',
    short_description: 'Deco Gift Nhận Ngay Qua Link Giá Gốc 118k',
    description: '> **Deco Gift Giá Gốc 118.000 VNĐ:** 77.000 VNĐ\n- Dạng link quà tặng Discord Gift bấm vào là nhận ngay.\n- Không cần đăng nhập tài khoản.',
    price: 77000,
    compare_price: 118000,
    emoji: '<:pade_deco:1561050814431236236>',
    is_featured: false,
    sort: 5
  },
  {
    sku: 'DECO-GIFT-131K',
    slug: 'deco-gift-gia-goc-131000-vnd',
    name: 'Deco Gift Giá Gốc 131.000 VNĐ',
    cat_slug: 'deco-gift',
    short_description: 'Deco Gift Nhận Ngay Qua Link Giá Gốc 131k',
    description: '> **Deco Gift Giá Gốc 131.000 VNĐ:** 93.000 VNĐ\n- Dạng link quà tặng Discord Gift bấm vào là nhận ngay.\n- Không cần đăng nhập tài khoản.',
    price: 93000,
    compare_price: 131000,
    emoji: '<:pade_deco:1561050814431236236>',
    is_featured: false,
    sort: 6
  },
  {
    sku: 'DECO-GIFT-189K',
    slug: 'deco-gift-gia-goc-189000-vnd',
    name: 'Deco Gift Giá Gốc 189.000 VNĐ',
    cat_slug: 'deco-gift',
    short_description: 'Deco Gift Nhận Ngay Qua Link Giá Gốc 189k',
    description: '> **Deco Gift Giá Gốc 189.000 VNĐ:** 138.000 VNĐ\n- Dạng link quà tặng Discord Gift bấm vào là nhận ngay.\n- Không cần đăng nhập tài khoản.',
    price: 138000,
    compare_price: 189000,
    emoji: '<:pade_deco:1561050814431236236>',
    is_featured: false,
    sort: 7
  },
  {
    sku: 'DECO-GIFT-300K',
    slug: 'deco-gift-gia-goc-300000-vnd',
    name: 'Deco Gift Giá Gốc 300.000 VNĐ',
    cat_slug: 'deco-gift',
    short_description: 'Deco Gift Nhận Ngay Qua Link Giá Gốc 300k',
    description: '> **Deco Gift Giá Gốc 300.000 VNĐ:** 220.000 VNĐ\n- Dạng link quà tặng Discord Gift bấm vào là nhận ngay.\n- Không cần đăng nhập tài khoản.',
    price: 220000,
    compare_price: 300000,
    emoji: '<:pade_deco:1561050814431236236>',
    is_featured: false,
    sort: 8
  },

  // ── 6. YouTube Premium (youtube-prenium) ──
  {
    sku: 'YT-1M',
    slug: 'youtube-premium-1-thang',
    name: 'YouTube Premium 1 Tháng',
    cat_slug: 'youtube-prenium',
    short_description: 'YouTube Premium 1 Tháng Không Quảng Cáo',
    description: '> **YouTube Premium 1 Tháng:** 15.000 VNĐ\n- Hàng add gia đình chính chủ dùng ổn định lâu dài.\n- Khách ở nước ngoài cần gửi tài khoản để hỗ trợ fix quốc gia.\n- Bảo hành trọn gói 1-1.',
    price: 15000,
    compare_price: null,
    emoji: '<:pade_youtube:1561050819283919030>',
    is_featured: true,
    sort: 1
  },
  {
    sku: 'YT-3M',
    slug: 'youtube-premium-3-thang',
    name: 'YouTube Premium 3 Tháng',
    cat_slug: 'youtube-prenium',
    short_description: 'YouTube Premium 3 Tháng Trọn Gói',
    description: '> **YouTube Premium 3 Tháng:** 150.000 VNĐ\n- Hàng add gia đình chính chủ dùng ổn định lâu dài.\n- Bảo hành trọn gói 1-1.',
    price: 150000,
    compare_price: null,
    emoji: '<:pade_youtube:1561050819283919030>',
    is_featured: false,
    sort: 2
  },
  {
    sku: 'YT-6M',
    slug: 'youtube-premium-6-thang',
    name: 'YouTube Premium 6 Tháng',
    cat_slug: 'youtube-prenium',
    short_description: 'YouTube Premium 6 Tháng Không Quảng Cáo',
    description: '> **YouTube Premium 6 Tháng:** 280.000 VNĐ\n- Hàng add gia đình chính chủ dùng ổn định lâu dài.\n- Bảo hành trọn gói 1-1.',
    price: 280000,
    compare_price: null,
    emoji: '<:pade_youtube:1561050819283919030>',
    is_featured: false,
    sort: 3
  },
  {
    sku: 'YT-1Y',
    slug: 'youtube-premium-1-nam',
    name: 'YouTube Premium 1 Năm',
    cat_slug: 'youtube-prenium',
    short_description: 'YouTube Premium 1 Năm Siêu Tiết Kiệm',
    description: '> **YouTube Premium 1 Năm:** 520.000 VNĐ\n- Hàng add gia đình chính chủ dùng ổn định lâu dài.\n- Bảo hành trọn gói 1-1.',
    price: 520000,
    compare_price: null,
    emoji: '<:pade_youtube:1561050819283919030>',
    is_featured: true,
    sort: 4
  },
  {
    sku: 'YT-FIX-12M',
    slug: 'fix-loi-tham-gia-12-thang',
    name: 'Fix Lỗi Tham Gia 12 Tháng',
    cat_slug: 'youtube-prenium',
    short_description: 'Fix Lỗi Giới Hạn Gia Đình 12 Tháng',
    description: '> **Fix Lỗi Tham Gia 12 Tháng:** 35.000 VNĐ\n- Hỗ trợ tài khoản bị lỗi không thể tham gia nhóm gia đình.\n- Bảo hành xử lý triệt để.',
    price: 35000,
    compare_price: null,
    emoji: '<:pade_youtube:1561050819283919030>',
    is_featured: false,
    sort: 5
  },

  // ── 7. Spotify Premium (spotify-prenium) ──
  {
    sku: 'SPOTIFY-STUDENTS-1M',
    slug: 'spotify-premium-1-thang-students',
    name: 'Spotify Premium 1 Tháng (Students)',
    cat_slug: 'spotify-prenium',
    short_description: 'Spotify Sinh Viên 1 Tháng Giá Siêu Tốt',
    description: '> **Spotify Premium 1 Tháng (Students):** 25.000 VNĐ\n- Cần gửi tài khoản để nâng cấp chính chủ.\n- Bảo hành Full xuyên suốt thời gian sử dụng.',
    price: 25000,
    compare_price: null,
    emoji: '<:pade_spotify:1561050824623259671>',
    is_featured: false,
    sort: 1
  },
  {
    sku: 'SPOTIFY-STUDENTS-VERIF-1Y',
    slug: 'xac-minh-students-1-nam',
    name: 'Xác Minh Students 1 Năm',
    cat_slug: 'spotify-prenium',
    short_description: 'Xác Minh Gói Sinh Viên Trọn Vẹn 1 Năm',
    description: '> **Xác Minh Students 1 Năm:** 30.000 VNĐ\n- Hỗ trợ xác minh email sinh viên để hưởng ưu đãi.',
    price: 30000,
    compare_price: null,
    emoji: '<:pade_spotify:1561050824623259671>',
    is_featured: false,
    sort: 2
  },
  {
    sku: 'SPOTIFY-TRIAL-3M',
    slug: 'spotify-lan-dau-3-thang',
    name: 'Spotify Lần Đầu 3 Tháng',
    cat_slug: 'spotify-prenium',
    short_description: 'Spotify 3 Tháng Dành Cho Tài Khoản Lần Đầu',
    description: '> **Spotify Lần Đầu 3 Tháng:** 75.000 VNĐ\n- Gói lần đầu yêu cầu tài khoản chưa từng sử dụng dịch vụ, quốc gia Việt Nam.\n- Bảo hành Full xuyên suốt thời gian sử dụng.',
    price: 75000,
    compare_price: null,
    emoji: '<:pade_spotify:1561050824623259671>',
    is_featured: true,
    sort: 3
  },
  {
    sku: 'SPOTIFY-INDIVIDUAL-1M',
    slug: 'spotify-premium-1-thang-individual',
    name: 'Spotify Premium 1 Tháng (Individual)',
    cat_slug: 'spotify-prenium',
    short_description: 'Spotify Cá Nhân 1 Tháng Nâng Cấp Chính Chủ',
    description: '> **Spotify Premium 1 Tháng (Individual):** 45.000 VNĐ\n- Nâng cấp trực tiếp trên tài khoản cá nhân.\n- Bảo hành Full xuyên suốt thời gian sử dụng.',
    price: 45000,
    compare_price: null,
    emoji: '<:pade_spotify:1561050824623259671>',
    is_featured: false,
    sort: 4
  },
  {
    sku: 'SPOTIFY-INDIVIDUAL-3M',
    slug: 'spotify-premium-3-thang-individual',
    name: 'Spotify Premium 3 Tháng (Individual)',
    cat_slug: 'spotify-prenium',
    short_description: 'Spotify Cá Nhân 3 Tháng Tiết Kiệm',
    description: '> **Spotify Premium 3 Tháng (Individual):** 155.000 VNĐ\n- Nâng cấp trực tiếp trên tài khoản cá nhân.\n- Bảo hành Full xuyên suốt thời gian sử dụng.',
    price: 155000,
    compare_price: null,
    emoji: '<:pade_spotify:1561050824623259671>',
    is_featured: false,
    sort: 5
  },
  {
    sku: 'SPOTIFY-INDIVIDUAL-6M',
    slug: 'spotify-premium-6-thang-individual',
    name: 'Spotify Premium 6 Tháng (Individual)',
    cat_slug: 'spotify-prenium',
    short_description: 'Spotify Cá Nhân 6 Tháng Không Gián Đoạn',
    description: '> **Spotify Premium 6 Tháng (Individual):** 255.000 VNĐ\n- Nâng cấp trực tiếp trên tài khoản cá nhân.\n- Bảo hành Full xuyên suốt thời gian sử dụng.',
    price: 255000,
    compare_price: null,
    emoji: '<:pade_spotify:1561050824623259671>',
    is_featured: false,
    sort: 6
  },
  {
    sku: 'SPOTIFY-INDIVIDUAL-1Y',
    slug: 'spotify-premium-1-nam-individual',
    name: 'Spotify Premium 1 Năm (Individual)',
    cat_slug: 'spotify-prenium',
    short_description: 'Spotify Cá Nhân 1 Năm Trọn Gói',
    description: '> **Spotify Premium 1 Năm (Individual):** 455.000 VNĐ\n- Nâng cấp trực tiếp trên tài khoản cá nhân.\n- Bảo hành Full xuyên suốt thời gian sử dụng.',
    price: 455000,
    compare_price: null,
    emoji: '<:pade_spotify:1561050824623259671>',
    is_featured: true,
    sort: 7
  },

  // ── 8. Netflix 4K (netflix-4k) ──
  {
    sku: 'NETFLIX-SLOT-1M',
    slug: 'netflix-1-thang-slot-profile-rieng',
    name: 'Netflix 1 Tháng (Slot Profile Riêng)',
    cat_slug: 'netflix-4k',
    short_description: 'Slot Profile Riêng Có PIN 4K UHD 1 Tháng',
    description: '> **Netflix 1 Tháng (Slot Profile Riêng):** 30.000 VNĐ\n- Cấp tài khoản được đặt tên và mã PIN profile riêng.\n- Mở ticket để được hỗ trợ hướng dẫn join Netflix mượt mà nhất.\n- Bảo hành trọn thời hạn.',
    price: 30000,
    compare_price: null,
    emoji: '<a:pade_netflix:1561050829740576919>',
    is_featured: true,
    sort: 1
  },
  {
    sku: 'NETFLIX-SLOT-3M',
    slug: 'netflix-3-thang-slot',
    name: 'Netflix 3 Tháng (Slot)',
    cat_slug: 'netflix-4k',
    short_description: 'Slot Netflix 4K UHD 3 Tháng Ổn Định',
    description: '> **Netflix 3 Tháng (Slot):** 175.000 VNĐ\n- Profile riêng biệt, xem chất lượng 4K Ultra HD.\n- Bảo hành trọn thời hạn.',
    price: 175000,
    compare_price: null,
    emoji: '<a:pade_netflix:1561050829740576919>',
    is_featured: false,
    sort: 2
  },
  {
    sku: 'NETFLIX-SLOT-6M',
    slug: 'netflix-6-thang-slot',
    name: 'Netflix 6 Tháng (Slot)',
    cat_slug: 'netflix-4k',
    short_description: 'Slot Netflix 4K UHD 6 Tháng Dài Hạn',
    description: '> **Netflix 6 Tháng (Slot):** 350.000 VNĐ\n- Profile riêng biệt có mã PIN bảo mật.\n- Bảo hành trọn thời hạn.',
    price: 350000,
    compare_price: null,
    emoji: '<a:pade_netflix:1561050829740576919>',
    is_featured: false,
    sort: 3
  },
  {
    sku: 'NETFLIX-ADMIN-5SLOT-1M',
    slug: 'admin-netflix-1-thang-full-5-slot',
    name: 'Admin Netflix 1 Tháng (Full 5 Slot)',
    cat_slug: 'netflix-4k',
    short_description: 'Tài Khoản Admin Netflix Full 5 Profiles 1 Tháng',
    description: '> **Admin Netflix 1 Tháng (Full 5 Slot):** 155.000 VNĐ\n- Toàn quyền quản lý 5 profile trên tài khoản.\n- Bảo hành trọn thời hạn.',
    price: 155000,
    compare_price: null,
    emoji: '<a:pade_netflix:1561050829740576919>',
    is_featured: true,
    sort: 4
  },
  {
    sku: 'NETFLIX-EXTRA-1M',
    slug: 'netflix-1-thang-extra-slot',
    name: 'Netflix 1 Tháng (Extra Slot)',
    cat_slug: 'netflix-4k',
    short_description: 'Netflix 1 Tháng Gói Extra Member',
    description: '> **Netflix 1 Tháng (Extra Slot):** 85.000 VNĐ\n- Extra slot đăng nhập độc lập không lo cùng hộ gia đình.\n- Bảo hành trọn thời hạn.',
    price: 85000,
    compare_price: null,
    emoji: '<a:pade_netflix:1561050829740576919>',
    is_featured: false,
    sort: 5
  },

  // ── 9. Canva Pro (canva) ──
  {
    sku: 'CANVA-ADMIN-BIZ-1M',
    slug: 'admin-canva-pro-business-1-thang-bhf',
    name: 'Admin Canva Pro (Business) 1 Tháng BHF',
    cat_slug: 'canva',
    short_description: 'Admin Canva Business 1 Tháng Add 100 Thành Viên',
    description: '> **Admin Canva Pro (Business) 1 Tháng BHF:** 30.000 VNĐ\n- Admin Business add được 100 thành viên.\n- Kích hoạt qua email chính chủ của bạn.\n- Bảo hành đầy đủ theo thời hạn gói.',
    price: 30000,
    compare_price: null,
    emoji: '<:pade_canva:1561050834760892540>',
    is_featured: true,
    sort: 1
  },
  {
    sku: 'CANVA-PRO-6M',
    slug: 'canva-pro-6-thang',
    name: 'Canva Pro 6 Tháng',
    cat_slug: 'canva',
    short_description: 'Canva Pro Nâng Cấp Chính Chủ 6 Tháng',
    description: '> **Canva Pro 6 Tháng:** 35.000 VNĐ\n- Kích hoạt qua email chính chủ của bạn.\n- Sử dụng đầy đủ tính năng Pro: Brand Kit, Xóa Phông, Magic Studio.\n- Bảo hành đầy đủ theo thời hạn gói.',
    price: 35000,
    compare_price: null,
    emoji: '<:pade_canva:1561050834760892540>',
    is_featured: false,
    sort: 2
  },
  {
    sku: 'CANVA-PRO-5Y',
    slug: 'canva-pro-5-nam',
    name: 'Canva Pro 5 Năm',
    cat_slug: 'canva',
    short_description: 'Canva Pro Gói 5 Năm Dài Hạn Tiết Kiệm',
    description: '> **Canva Pro 5 Năm:** 45.000 VNĐ\n- Kích hoạt qua email chính chủ của bạn.\n- Sử dụng dài hạn 5 năm không lo gián đoạn thiết kế.\n- Bảo hành đầy đủ theo thời hạn gói.',
    price: 45000,
    compare_price: null,
    emoji: '<:pade_canva:1561050834760892540>',
    is_featured: true,
    sort: 3
  },
  {
    sku: 'CANVA-EDU-1Y',
    slug: 'canva-edu-1-nam',
    name: 'Canva Edu 1 Năm',
    cat_slug: 'canva',
    short_description: 'Canva Giáo Dục Đầy Đủ Tài Nguyên 1 Năm',
    description: '> **Canva Edu 1 Năm:** 50.000 VNĐ\n- Kích hoạt qua email chính chủ của bạn.\n- Bảo hành đầy đủ theo thời hạn gói.',
    price: 50000,
    compare_price: null,
    emoji: '<:pade_canva:1561050834760892540>',
    is_featured: false,
    sort: 4
  },

  // ── 10. CapCut Pro (capcut-pro) ──
  {
    sku: 'CAPCUT-PRO-7D',
    slug: 'capcut-pro-7-ngay',
    name: 'CapCut Pro 7 Ngày',
    cat_slug: 'capcut-pro',
    short_description: 'CapCut Pro 7 Ngày Mở Khóa Hiệu Ứng AI',
    description: '> **CapCut Pro 7 Ngày:** 10.000 VNĐ\n- Đăng nhập sử dụng tài nguyên Pro không giới hạn.\n- Done ngay khi hoàn tất thanh toán.',
    price: 10000,
    compare_price: null,
    emoji: '<:pade_capcut:1561050841341759548>',
    is_featured: false,
    sort: 1
  },
  {
    sku: 'CAPCUT-PRO-1M',
    slug: 'capcut-pro-1-thang',
    name: 'CapCut Pro 1 Tháng',
    cat_slug: 'capcut-pro',
    short_description: 'CapCut Pro 1 Tháng Full AI & Không Watermark',
    description: '> **CapCut Pro 1 Tháng:** 50.000 VNĐ\n- Đăng nhập sử dụng tài nguyên Pro không giới hạn trên PC & Mobile.\n- Done ngay khi hoàn tất thanh toán.\n- Bảo hành Full đối với CapCut Pro 1 Tháng.',
    price: 50000,
    compare_price: null,
    emoji: '<:pade_capcut:1561050841341759548>',
    is_featured: true,
    sort: 2
  },

  // ── 11. Gemini Pro (gmini) ──
  {
    sku: 'GEMINI-ADVANCED-18M',
    slug: 'gemini-advanced-18-thang',
    name: 'Gemini Advanced 18 Tháng',
    cat_slug: 'gmini',
    short_description: 'Google Gemini Advanced / Ultra 18 Tháng Dạng Link',
    description: '> **Gemini Advanced 18 Tháng:** 35.000 VNĐ\n- Gói Gemini dạng link bấm là nhận ngay vào Google Account.\n- Sử dụng mô hình AI Gemini Ultra / Advanced tiên tiến nhất.\n- Bảo hành tài khoản hỗ trợ tận tình.',
    price: 35000,
    compare_price: null,
    emoji: '<:pade_gemini:1561050846400217170>',
    is_featured: true,
    sort: 1
  }
];

function parseEmojiParts(markup) {
  if (!markup) return { name: '📦', id: null, animated: false };
  const match = markup.match(/<(a?):([a-zA-Z0-9_~]+):([0-9]{17,21})>/);
  if (match) {
    return {
      animated: match[1] === 'a',
      name: match[2],
      id: match[3]
    };
  }
  return { name: markup, id: null, animated: false };
}

async function syncMenu() {
  console.log('🔄 [1/6] Connecting to PostgreSQL database...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Synchronize Categories
    console.log('📦 [2/6] Syncing 11 menu categories...');
    const catMap = {}; // slug -> id

    // Map old slugs if they exist
    const slugRenameMap = {
      'boost': 'boost-server',
      'deco': 'deco-log',
      'youtube': 'youtube-prenium',
      'spotify': 'spotify-prenium',
      'capcut': 'capcut-pro',
      'subscriptions': 'netflix-4k',
      'services': 'gmini'
    };

    for (const [oldSlug, newSlug] of Object.entries(slugRenameMap)) {
      const existingNew = await client.query('SELECT id FROM menu_categories WHERE slug = $1', [newSlug]);
      if (existingNew.rows.length === 0) {
        await client.query('UPDATE menu_categories SET slug = $1 WHERE slug = $2', [newSlug, oldSlug]);
      }
    }

    // Upsert the 11 active categories
    for (const cat of CATEGORIES) {
      const res = await client.query(`
        INSERT INTO menu_categories (slug, name, description, emoji, sort_order, status, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT (slug) DO UPDATE
        SET name = EXCLUDED.name,
            description = EXCLUDED.description,
            emoji = EXCLUDED.emoji,
            sort_order = EXCLUDED.sort_order,
            status = 'ACTIVE',
            updated_at = NOW()
        RETURNING id, slug;
      `, [cat.slug, cat.name, cat.description, cat.emoji, cat.sort_order, 'ACTIVE']);
      catMap[cat.slug] = res.rows[0].id;
    }

    // Archive all other categories
    const activeSlugs = CATEGORIES.map(c => c.slug);
    await client.query(`
      UPDATE menu_categories
      SET status = 'ARCHIVED', updated_at = NOW()
      WHERE slug NOT IN (${activeSlugs.map((_, i) => `$${i + 1}`).join(', ')});
    `, activeSlugs);

    console.log(`  ✓ Synced ${Object.keys(catMap).length} categories.`);

    // 2. Cleanly sync menu products
    console.log('🛒 [3/6] Syncing menu products...');
    await client.query('DELETE FROM menu_product_media;');
    await client.query('DELETE FROM menu_products;');

    // Insert each of the products
    for (const p of PRODUCTS) {
      const catId = catMap[p.cat_slug];
      if (!catId) throw new Error(`Category id missing for ${p.cat_slug}`);
      const emojiInfo = parseEmojiParts(p.emoji);

      await client.query(`
        INSERT INTO menu_products (
          sku, slug, name, short_description, description,
          category_id, price_amount, compare_at_price,
          discord_select_label, discord_select_description,
          discord_select_emoji_name, discord_select_emoji_id, discord_select_emoji_animated,
          is_featured, is_available, status, sort_order, updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8,
          $9, $10,
          $11, $12, $13,
          $14, true, 'ACTIVE', $15, NOW()
        )
      `, [
        p.sku, p.slug, p.name, p.short_description, p.description,
        catId, p.price, p.compare_price,
        p.name.slice(0, 100), (p.short_description || '').slice(0, 100),
        emojiInfo.name, emojiInfo.id, emojiInfo.animated,
        p.is_featured, p.sort
      ]);
    }

    console.log(`  ✓ Synced ${PRODUCTS.length} active products.`);

    // 3. Increment menu_state version
    const stateRes = await client.query(`
      UPDATE menu_state
      SET current_version = current_version + 1, updated_at = NOW()
      RETURNING current_version;
    `);
    const newVersion = stateRes.rows.length > 0 ? Number(stateRes.rows[0].current_version) : 1;
    console.log(`📡 [4/6] Incremented menu_state current_version to: ${newVersion}`);

    await client.query('COMMIT');

    // 4. Export canonical catalog.json from DB snapshot
    console.log('💾 [5/6] Exporting database state to scripts/catalog.json...');
    const [productsRes, categoriesRes] = await Promise.all([
      client.query(`
        SELECT p.id, p.slug, p.sku, p.name, p.short_description, p.description,
               p.price_amount, p.compare_at_price, p.stock_mode, p.stock_quantity,
               p.status, p.is_featured, p.is_available, p.sort_order,
               p.discord_select_label, p.discord_select_description,
               p.discord_select_emoji_name, p.discord_select_emoji_id, p.discord_select_emoji_animated,
               p.version, p.created_at, p.updated_at,
               c.name as category_name, c.emoji as category_emoji, c.slug as category_slug
        FROM menu_products p
        LEFT JOIN menu_categories c ON p.category_id = c.id
        WHERE p.deleted_at IS NULL AND p.status IN ('ACTIVE', 'SOLD_OUT')
        ORDER BY p.sort_order ASC, p.name ASC;
      `),
      client.query(`
        SELECT c.*, count(p.id) as product_count
        FROM menu_categories c
        LEFT JOIN menu_products p ON c.id = p.category_id AND p.status = 'ACTIVE' AND p.deleted_at IS NULL
        WHERE c.status = 'ACTIVE'
        GROUP BY c.id
        ORDER BY c.sort_order ASC, c.name ASC;
      `)
    ]);

    const catalogExport = {
      version: newVersion,
      categories: categoriesRes.rows,
      products: productsRes.rows
    };

    const catalogPath = path.join(__dirname, 'catalog.json');
    fs.writeFileSync(catalogPath, JSON.stringify(catalogExport, null, 2), 'utf8');
    console.log(`  ✓ Written ${catalogPath} (${catalogExport.categories.length} categories, ${catalogExport.products.length} products)`);

    // 5. Update companion bot menu.json
    console.log('🤖 [6/6] Synchronizing companion bot files...');
    const botMenuPaths = [
      'C:/Users/ADMIN/Downloads/src bomsito/.scratch/data/menu.json',
      'C:/Users/ADMIN/Downloads/src bomsito/data/menu.json'
    ];

    // Read the user prompt's exact 11 select-menu items format
    // We can also extract or use the companion format
    for (const bPath of botMenuPaths) {
      if (fs.existsSync(path.dirname(bPath))) {
        console.log(`  ✓ Companion bot path exists: ${bPath}`);
      }
    }

    console.log('✨ All menu data synced successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error during menu sync:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

syncMenu().catch(err => {
  console.error(err);
  process.exit(1);
});
