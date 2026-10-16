const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const CATEGORIES = [
  { slug: 'nitro', name: 'Nitro Discord', emoji: '<a:nicho:1498671634524016792>', desc: 'Các gói Nitro Boost & Nitro Basic chính hãng', sort: 1 },
  { slug: 'nitro-trial', name: 'Nitro Trial', emoji: '<a:Nichobasic:1499105974072377418>', desc: 'Trial dành cho tài khoản mới chưa từng dùng Nitro', sort: 2 },
  { slug: 'boost', name: 'Server Boost', emoji: '<a:boosts:1498672467378704388>', desc: 'Nâng cấp Level 1/2/3 cho Server Discord', sort: 3 },
  { slug: 'spotify', name: 'Spotify Premium', emoji: '<:ped_emoji_23:1560012189648035840>', desc: 'Nghe nhạc không giới hạn không quảng cáo', sort: 4 },
  { slug: 'youtube', name: 'YouTube Premium', emoji: '<:yuotube:1483467082367500448>', desc: 'Xem video không quảng cáo kèm YouTube Music', sort: 5 },
  { slug: 'minecraft', name: 'Minecraft Premium', emoji: '⛏️', desc: 'Tài khoản Minecraft Java & Bedrock chính hãng', sort: 6 },
  { slug: 'capcut', name: 'CapCut Pro', emoji: '<:cutcut:1483467161174540348>', desc: 'Mở khóa toàn bộ hiệu ứng và AI Pro', sort: 7 },
  { slug: 'canva', name: 'Canva Pro', emoji: '<:canva:1497292473188225124>', desc: 'Kho tài nguyên đồ họa vô tận và xóa phông', sort: 8 },
  { slug: 'discord-acc', name: 'Discord Account', emoji: '<:dsc:1497292544453644329>', desc: 'Tài khoản Discord năm cũ, full verif', sort: 9 },
  { slug: 'deco', name: 'Decoration', emoji: '<:ped_emoji_11:1560011544371269773>', desc: 'Trang trí hồ sơ avatar, banner hiệu ứng độc quyền', sort: 10 },
  { slug: 'subscriptions', name: 'Gói đăng ký', emoji: '💎', desc: 'Các gói đăng ký xem phim, giải trí cao cấp', sort: 11 },
  { slug: 'services', name: 'Dịch vụ khác', emoji: '🎫', desc: 'Tiện ích và dịch vụ kỹ thuật số độc quyền', sort: 12 },
  { slug: 'test', name: 'Test', emoji: '🧪', desc: 'Khu vực thử nghiệm sản phẩm mới', sort: 13 },
];

const PRODUCTS = [
  // Ảnh 1
  {
    sku: 'NITRO-BOOSTS',
    slug: 'nitro-boosts-login',
    name: 'Nitro Boosts Login',
    short_description: 'Nitro Boosts Giá Rẻ / Done Nhanh',
    description: '> **Nitro Boosts Login 1 Tháng:** 90.000 VNĐ\n> **Nitro Boosts Login 2 Tháng:** 105.000 VNĐ\n> **Nitro Boosts Login 2 Tháng Vip:** 145.000 VNĐ\n> **Nitro Boosts Login 1 Năm:** 850.000 VNĐ\n> **Gỡ Thanh Toán Đỏ:** 25.000 VNĐ\n> **Nitro Basic Login 1 Tháng:** 50.000 VNĐ\n> **Nitro Basic Login 1 Năm:** 340.000 VNĐ\n- Cần gửi tài khoản mật khẩu và 5 mã dự phòng để kích hoạt.\n- Bảo hành trọn đời thời hạn sử dụng.',
    cat_slug: 'nitro',
    price: 90000,
    compare_price: 120000,
    emoji: '<a:nicho:1498671634524016792>',
    is_featured: true,
    sort: 1
  },
  {
    sku: 'BOOST-SERVER-14X',
    slug: 'server-boost-x14-level-3',
    name: 'Server Boost x14 Level 3',
    short_description: 'Nâng Cấp Level 3 Trọn Gói Cho Server Discord',
    description: '> **x2 Boost Server 1 Tháng:** 18.000 VNĐ\n> **x14 Boost Server 1 Tháng:** 660.000 VNĐ\n> **x20 Boost Server 1 Tháng:** 100.000 VNĐ\n> **x28 Boost Server 1 Tháng:** 150.000 VNĐ\n> **x14 Boost Server 4 Tháng:** 360.000 VNĐ\n- Link server vĩnh viễn, không bật kiểm duyệt sđt.\n- Bảo hành đầy đủ theo thời gian gói.',
    cat_slug: 'boost',
    price: 660000,
    compare_price: 1200000,
    emoji: '<a:boosts:1498672467378704388>',
    is_featured: true,
    sort: 2
  },
  {
    sku: 'NETFLIX-4K',
    slug: 'netflix-premium-4k-uhd',
    name: 'Netflix Premium 4K UHD',
    short_description: 'Tài Khoản Netflix Gói Cao Cấp 4K HDR',
    description: '> **Profile Riêng 1 Tháng:** 65.000 VNĐ\n> **Profile Riêng 3 Tháng:** 185.000 VNĐ\n- Đầy đủ phụ đề Tiếng Việt, xem mượt mà trên Smart TV, PC, Điện thoại.\n- Bảo hành 1 đổi 1 suốt thời gian sử dụng.',
    cat_slug: 'subscriptions',
    price: 65000,
    compare_price: 90000,
    emoji: '🍿',
    is_featured: true,
    sort: 3
  },
  {
    sku: 'NITRO-TRIAL',
    slug: 'nitro-trial-3-thang',
    name: 'Nitro Trial 3 Tháng',
    short_description: 'Trial Dành Cho Tài Khoản Mới Chưa Từng Dùng Nitro',
    description: '> **Nitro trial 3 tháng:** 55.000 VNĐ\n> **Nitro trial 4 tháng:** 70.000 VNĐ\n> **Promo Link 3 Tháng:** 40.000 VNĐ\n- Yêu Cầu: Tài Khoản Tạo Trên 1 Tháng Chưa Từng Dùng Nitro.\n- Bảo Hành 3 Tháng.',
    cat_slug: 'nitro-trial',
    price: 55000,
    compare_price: 80000,
    emoji: '<a:Nichobasic:1499105974072377418>',
    is_featured: false,
    sort: 4
  },
  {
    sku: 'DECO-LOGIN',
    slug: 'deco-login-theo-yeu-cau',
    name: 'Deco Login Theo Yêu Cầu',
    short_description: 'Login Vào Acc Để Lấy Deco Giá Cực Ưu Đãi',
    description: 'Gói trang trí avatar và banner profile Discord chính hãng giá tiết kiệm 40-60% so với giá gốc Store.',
    cat_slug: 'deco',
    price: 230000,
    compare_price: 360000,
    emoji: '<:ped_emoji_11:1560011544371269773>',
    is_featured: false,
    sort: 5
  },
  {
    sku: 'DECO-GIFT',
    slug: 'deco-dang-gift-truc-tiep',
    name: 'Deco Dạng Gift Trực Tiếp',
    short_description: 'Bấm Vào Là Nhận Liền Không Cần Cung Cấp Mật Khẩu',
    description: 'Gói quà tặng trang trí profile gửi trực tiếp qua tin nhắn Discord. Nhận ngay lập tức, an toàn tuyệt đối 100%.',
    cat_slug: 'deco',
    price: 370000,
    compare_price: 790000,
    emoji: '<:ped_emoji_11:1560011544371269773>',
    is_featured: false,
    sort: 6
  },
  {
    sku: 'YT-PREMIUM',
    slug: 'youtube-premium-khong-quang-cao',
    name: 'YouTube Premium Không Quảng Cáo',
    short_description: 'Xem Video Không Quảng Cáo / Âm Nhạc YouTube Music Full HD',
    description: '> **YouTube Premium 1 Tháng:** 150.000 VNĐ\n> **YouTube Premium 3 Tháng:** 150.000 VNĐ\n> **YouTube Premium 6 Tháng:** 280.000 VNĐ\n> **YouTube Premium 1 Năm:** 520.000 VNĐ\n- Hàng add gia đình chính chủ hoặc cấp slot.\n- Bảo hành trọn gói.',
    cat_slug: 'youtube',
    price: 150000,
    compare_price: 300000,
    emoji: '<:yuotube:1483467082367500448>',
    is_featured: false,
    sort: 7
  },
  {
    sku: 'SPOTIFY-PREMIUM',
    slug: 'spotify-premium-ca-nhan',
    name: 'Spotify Premium Cá Nhân',
    short_description: 'Nghe Nhạc Không Giới Hạn / Tải Ngoại Tuyến Chất Lượng Cao',
    description: '> **Spotify 1 Tháng:** 350.000 VNĐ\n> **Spotify 3 Tháng:** 95.000 VNĐ\n> **Spotify 6 Tháng:** 180.000 VNĐ\n> **Spotify 1 Năm:** 320.000 VNĐ\n- Nâng cấp trên chính tài khoản của bạn.\n- Không gián đoạn playlist yêu thích.',
    cat_slug: 'spotify',
    price: 350000,
    compare_price: 500000,
    emoji: '<:ped_emoji_23:1560012189648035840>',
    is_featured: false,
    sort: 8
  },
  {
    sku: 'CAPCUT-PRO',
    slug: 'capcut-pro-ban-quyen',
    name: 'CapCut Pro Bản Quyền',
    short_description: 'Mở Khóa Toàn Bộ Hiệu Ứng, Font Chữ, Tính Năng AI Cao Cấp',
    description: '> **CapCut Pro 1 Tháng:** 400.000 VNĐ\n> **CapCut Pro 1 Năm:** 290.000 VNĐ\n- Đăng nhập sử dụng trên cả máy tính (PC/Mac) và điện thoại.',
    cat_slug: 'capcut',
    price: 400000,
    compare_price: 800000,
    emoji: '<:cutcut:1483467161174540348>',
    is_featured: false,
    sort: 9
  },
  {
    sku: 'CANVA-PRO',
    slug: 'canva-pro-giao-duc-ca-nhan',
    name: 'Canva Pro Giáo Dục / Cá Nhân',
    short_description: 'Kho Tài Nguyên Đồ Họa Vô Tận & Xóa Phông Một Chạm',
    description: '> **Canva Pro Vĩnh Viễn:** 250.000 VNĐ\n> **Canva Pro 1 Năm:** 60.000 VNĐ\n- Kích hoạt qua email chính chủ của bạn.',
    cat_slug: 'canva',
    price: 250000,
    compare_price: 500000,
    emoji: '<:canva:1497292473188225124>',
    is_featured: false,
    sort: 10
  },
  {
    sku: 'GEMINI-PRO',
    slug: 'google-gemini-advanced-ai-pro',
    name: 'Google Gemini Advanced / AI Pro',
    short_description: 'Trợ Lý Trí Tuệ Nhân Tạo Thông Minh Nhất Từ Google',
    description: '> **Gemini Advanced 1 Tháng:** 500.000 VNĐ\n- Bao gồm 2TB Google One lưu trữ drive/photos.',
    cat_slug: 'services',
    price: 500000,
    compare_price: 1500000,
    emoji: '✨',
    is_featured: false,
    sort: 11
  },

  // Ảnh 2: Biến thể Nitro
  {
    sku: 'NITRO-BOOST-1M',
    slug: 'nitro-boost-1-thang',
    name: 'Nitro Boost 1 Tháng',
    short_description: 'Gói Nitro 1 Tháng Kèm 2 Boost Server',
    description: 'Kích hoạt trực tiếp vào tài khoản Discord của bạn. Bảo hành trọn gói 30 ngày.',
    cat_slug: 'nitro',
    price: 90000,
    compare_price: null,
    emoji: '<a:nicho:1498671634524016792>',
    is_featured: false,
    sort: 12
  },
  {
    sku: 'NITRO-BOOST-2M-MAIL',
    slug: 'nitro-boost-2-thang-nuoi-mail',
    name: 'Nitro Boost 2 Tháng [ Nuôi Mail ]',
    short_description: 'Nitro 2 Tháng Dạng Nuôi Mail Ổn Định',
    description: 'Gói Nitro 2 Tháng tiết kiệm, tài khoản mail bảo hành xuyên suốt.',
    cat_slug: 'nitro',
    price: 99000,
    compare_price: null,
    emoji: '<a:nicho:1498671634524016792>',
    is_featured: false,
    sort: 13
  },
  {
    sku: 'NITRO-BOOST-2M-PRO',
    slug: 'nitro-boost-2-thang-pro-vip',
    name: 'Nitro Boost 2 Tháng Pro Vip [ Không Nuôi Mail ]',
    short_description: 'Nitro 2 Tháng Pro Vip Chính Chủ Không Cần Nuôi Mail',
    description: 'Dành cho khách hàng muốn dùng ngay không cần giữ email riêng. Nhanh gọn và bảo mật.',
    cat_slug: 'nitro',
    price: 130000,
    compare_price: null,
    emoji: '<a:nicho:1498671634524016792>',
    is_featured: false,
    sort: 14
  },
  {
    sku: 'NITRO-RENEW-2M',
    slug: 'gia-han-nitro-2-thang',
    name: 'Gia Hạn Nitro 2 Tháng',
    short_description: 'Gia Hạn Trực Tiếp Khi Đang Dùng Hết Gói',
    description: 'Gia hạn thêm 2 tháng cho tài khoản sắp hết hạn Nitro.',
    cat_slug: 'nitro',
    price: 99000,
    compare_price: null,
    emoji: '<a:nicho:1498671634524016792>',
    is_featured: false,
    sort: 15
  },
  {
    sku: 'NITRO-BOOST-1Y',
    slug: 'nitro-boost-1-nam',
    name: 'Nitro Boost 1 Năm',
    short_description: 'Gói Tiết Kiệm Nhất Cho Tín Đồ Discord',
    description: 'Trọn gói 12 tháng Nitro kèm 2 Server Boosts. Tiết kiệm hơn 60% so với mua hàng tháng.',
    cat_slug: 'nitro',
    price: 800000,
    compare_price: null,
    emoji: '<a:nicho:1498671634524016792>',
    is_featured: true,
    sort: 16
  },
  {
    sku: 'NITRO-BASIC-1M',
    slug: 'nitro-basic-1-thang',
    name: 'Nitro Basic 1 Tháng',
    short_description: 'Gói Cơ Bản Emoji & Sticker Toàn Discord',
    description: 'Sử dụng custom emoji và sticker ở mọi server, tăng dung lượng upload 50MB.',
    cat_slug: 'nitro',
    price: 40000,
    compare_price: null,
    emoji: '<a:Nichobasic:1499105974072377418>',
    is_featured: false,
    sort: 17
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

async function runSeed() {
  console.log('Seeding / updating categories...');
  const catMap = {};

  for (const cat of CATEGORIES) {
    const res = await pool.query(`
      INSERT INTO menu_categories (slug, name, description, emoji, sort_order, status, updated_at)
      VALUES ($1, $2, $3, $4, $5, 'ACTIVE', NOW())
      ON CONFLICT (slug) DO UPDATE
      SET name = EXCLUDED.name,
          description = EXCLUDED.description,
          emoji = EXCLUDED.emoji,
          sort_order = EXCLUDED.sort_order,
          updated_at = NOW()
      RETURNING id, slug;
    `, [cat.slug, cat.name, cat.desc, cat.emoji, cat.sort]);

    catMap[cat.slug] = res.rows[0].id;
  }

  console.log('Categories synced:', Object.keys(catMap).length);

  console.log('Seeding / updating products...');
  for (const p of PRODUCTS) {
    const catId = catMap[p.cat_slug] || null;
    const emojiInfo = parseEmojiParts(p.emoji);

    await pool.query(`
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
      ON CONFLICT (sku) DO UPDATE
      SET name = EXCLUDED.name,
          slug = EXCLUDED.slug,
          short_description = EXCLUDED.short_description,
          description = EXCLUDED.description,
          category_id = EXCLUDED.category_id,
          price_amount = EXCLUDED.price_amount,
          compare_at_price = EXCLUDED.compare_at_price,
          discord_select_label = EXCLUDED.discord_select_label,
          discord_select_description = EXCLUDED.discord_select_description,
          discord_select_emoji_name = EXCLUDED.discord_select_emoji_name,
          discord_select_emoji_id = EXCLUDED.discord_select_emoji_id,
          discord_select_emoji_animated = EXCLUDED.discord_select_emoji_animated,
          is_featured = EXCLUDED.is_featured,
          sort_order = EXCLUDED.sort_order,
          updated_at = NOW();
    `, [
      p.sku, p.slug, p.name, p.short_description, p.description,
      catId, p.price, p.compare_price,
      p.name.slice(0, 100), (p.short_description || '').slice(0, 100),
      emojiInfo.name, emojiInfo.id, emojiInfo.animated,
      p.is_featured, p.sort
    ]);
  }

  console.log('Products synced successfully!');
  await pool.end();
}

runSeed().catch(err => {
  console.error(err);
  process.exit(1);
});
