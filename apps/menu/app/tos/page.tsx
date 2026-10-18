import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '../../components/Navbar';
import { SubdomainTabs } from '../../components/SubdomainTabs';

export const metadata: Metadata = {
  title: 'Terms of Service · Pade Store',
  description: 'Điều khoản dịch vụ và chính sách mua hàng chính thức tại Pade Store · discord.gg/pade',
};

export default function TosPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0c0d12] text-[#f1f2f6]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        <SubdomainTabs />

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Left Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0 lg:sticky lg:top-24">
            <div className="mb-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#838896] block mb-3 px-3">
                CHÍNH SÁCH CHUNG
              </span>
              <nav className="flex flex-col space-y-1">
                <a
                  href="#hoan-tien"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold bg-[#21232d] text-white"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                  <span>Chính sách Hoàn tiền</span>
                </a>
                <a
                  href="#bao-hanh"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5c606e]" />
                  <span>Bảo hành &amp; Feedback</span>
                </a>
                <a
                  href="#dieu-khoan-01-07"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5c606e]" />
                  <span>Điều khoản 01–07</span>
                </a>
              </nav>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#838896] block mb-3 px-3">
                THEO TỪNG DỊCH VỤ
              </span>
              <nav className="flex flex-col space-y-1">
                <a
                  href="#policy-nitro"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5c606e]" />
                  <span>Discord Nitro</span>
                </a>
                <a
                  href="#policy-boost"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5c606e]" />
                  <span>Boost Server</span>
                </a>
                <a
                  href="#policy-deco"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5c606e]" />
                  <span>Avatar Decoration</span>
                </a>
                <a
                  href="#policy-streaming"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5c606e]" />
                  <span>Streaming Services</span>
                </a>
              </nav>
            </div>
          </aside>

          {/* Main Content (Right) */}
          <main className="flex-1 max-w-3xl">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#838896] block mb-2">
              ĐIỀU KHOẢN &amp; CHÍNH SÁCH
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4 font-display">
              Terms of Service
            </h1>

            {/* Meta Badge with SVG Icon */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.035] border border-white/[0.08] text-xs text-[#c5c8d4] mb-8">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#838896]">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>
                Cập nhật lần cuối: 2026 ·{' '}
                <a
                  href="https://discord.gg/pade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:underline font-semibold"
                >
                  discord.gg/pade
                </a>
              </span>
            </div>

            <hr className="border-t border-white/[0.08] my-8" />

            {/* Section 01: Chính sách Hoàn tiền */}
            <section id="hoan-tien" className="scroll-mt-24 mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-lg bg-[#1b1c24] border border-white/[0.08] flex items-center justify-center font-mono text-sm font-bold text-[#838896]">
                  01
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Chính Sách Hoàn Tiền (Refund Policy)
                </h2>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#13141a] border border-white/[0.08]">
                  <h3 className="text-sm font-bold text-[#22c55e] mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-[#22c55e]/10 text-[#22c55e] flex items-center justify-center border border-[#22c55e]/20">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </span>
                    <span>Các trường hợp ĐƯỢC hoàn tiền:</span>
                  </h3>
                  <ul className="space-y-1.5 text-sm text-[#d1d5db]">
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span>Shop vi phạm quá thời hạn giao hàng (quá 48h) hoặc không xử lý được sự cố bảo hành theo cam kết.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span>Sản phẩm bị lỗi từ phía nhà cung cấp và shop không còn giải pháp thay thế tương đương.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span>Thời gian bảo hành xử lý kéo dài bất thường không có lý do chính đáng thông báo trước.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span>Tiền hoàn được tính chính xác theo tỷ lệ thời gian chưa sử dụng của dịch vụ.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[#13141a] border border-white/[0.08]">
                  <h3 className="text-sm font-bold text-[#ef4444] mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-[#ef4444]/10 text-[#ef4444] flex items-center justify-center border border-[#ef4444]/20">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                    </span>
                    <span>Các trường hợp KHÔNG hoàn tiền:</span>
                  </h3>
                  <ul className="space-y-1.5 text-sm text-[#d1d5db]">
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span>Khách hàng đổi ý, không có nhu cầu sử dụng tiếp sau khi đơn đã xử lý hoàn tất.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span>Tự ý thay đổi thông tin tài khoản (đối với gói yêu cầu giữ nguyên thông tin hoặc nuôi mail).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span>Vi phạm ToS của Discord hoặc nền tảng gốc dẫn đến việc bị vô hiệu hóa hoặc bị khóa vĩnh viễn.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span>Khách hàng mua nhầm sản phẩm do không đọc kỹ mô tả và yêu cầu.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <hr className="border-t border-white/[0.08] my-8" />

            {/* Section 02: Bảo Hành & Feedback */}
            <section id="bao-hanh" className="scroll-mt-24 mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-lg bg-[#1b1c24] border border-white/[0.08] flex items-center justify-center font-mono text-sm font-bold text-[#838896]">
                  02
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Chính Sách Bảo Hành &amp; Feedback
                </h2>
              </div>

              <div className="p-4 rounded-xl bg-[#1c160c] border border-[rgba(245,158,11,0.35)] text-sm mb-4">
                <p className="text-[#fef3c7] font-semibold mb-2 flex items-center gap-2">
                  <span className="text-[#f59e0b]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  </span>
                  <span>Lưu ý quan trọng về Điều kiện Bảo hành:</span>
                </p>
                <ul className="space-y-2 text-[#fde68a]">
                  <li className="flex items-start gap-2">
                    <span>1.</span>
                    <span><strong>Không Feedback = Không Bảo Hành:</strong> Sau khi hoàn thành đơn, khách hàng bắt buộc phải gửi feedback tại kênh phản hồi chính thức của server mới được kích hoạt chế độ bảo hành.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>2.</span>
                    <span><strong>Rời Server = Hủy Bảo Hành:</strong> Nếu khách hàng tự ý rời khỏi server (out server) trong thời gian sử dụng gói, quyền bảo hành sẽ tự động chấm dứt ngay lập tức.</span>
                  </li>
                </ul>
              </div>
            </section>

            <hr className="border-t border-white/[0.08] my-8" />

            {/* Section 03: Điều khoản 01–07 */}
            <section id="dieu-khoan-01-07" className="scroll-mt-24 mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-lg bg-[#1b1c24] border border-white/[0.08] flex items-center justify-center font-mono text-sm font-bold text-[#838896]">
                  03
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Điều Khoản Dịch Vụ Cốt Lõi (01 – 07)
                </h2>
              </div>

              <ul className="space-y-3 text-sm text-[#d1d5db]">
                <li className="flex items-start gap-3 p-3 rounded-lg bg-[#13141a] border border-white/[0.06]">
                  <span className="font-mono text-xs font-bold text-[#838896] px-1.5 py-0.5 rounded bg-[#1b1c24]">01</span>
                  <span>Đơn hàng được cam kết hoàn thành tối đa trong vòng <strong>48 giờ</strong> kể từ lúc nhận đủ thông tin.</span>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg bg-[#13141a] border border-white/[0.06]">
                  <span className="font-mono text-xs font-bold text-[#838896] px-1.5 py-0.5 rounded bg-[#1b1c24]">02</span>
                  <span>Khách hàng có trách nhiệm tuân thủ đầy đủ các hướng dẫn kích hoạt do nhân viên kỹ thuật cung cấp.</span>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg bg-[#13141a] border border-white/[0.06]">
                  <span className="font-mono text-xs font-bold text-[#838896] px-1.5 py-0.5 rounded bg-[#1b1c24]">03</span>
                  <span>Tuyệt đối không chia sẻ tài khoản cho bên thứ ba trong quá trình đang thực hiện đơn hàng.</span>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg bg-[#13141a] border border-white/[0.06]">
                  <span className="font-mono text-xs font-bold text-[#838896] px-1.5 py-0.5 rounded bg-[#1b1c24]">04</span>
                  <span>Đơn hàng sau khi đã xử lý thành công sẽ không được hủy hoặc đổi trả sang mặt hàng khác.</span>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg bg-[#13141a] border border-white/[0.06]">
                  <span className="font-mono text-xs font-bold text-[#838896] px-1.5 py-0.5 rounded bg-[#1b1c24]">05</span>
                  <span>Giữ thái độ lịch sự, tôn trọng nhân sự hỗ trợ trong suốt quá trình trao đổi tại ticket.</span>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg bg-[#13141a] border border-white/[0.06]">
                  <span className="font-mono text-xs font-bold text-[#838896] px-1.5 py-0.5 rounded bg-[#1b1c24]">06</span>
                  <span>Mọi hành vi gian lận thông tin, tranh chấp giả mạo hoặc cố tình chargeback sẽ bị đưa vào danh sách đen (Blacklist) vĩnh viễn trên toàn hệ sinh thái.</span>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg bg-[#13141a] border border-white/[0.06]">
                  <span className="font-mono text-xs font-bold text-[#838896] px-1.5 py-0.5 rounded bg-[#1b1c24]">07</span>
                  <span>Trong mọi tình huống tranh chấp phát sinh, quyền quyết định cuối cùng thuộc về Ban quản trị Pade Community.</span>
                </li>
              </ul>
            </section>

            <hr className="border-t border-white/[0.08] my-8" />

            {/* Section 04: Theo từng dịch vụ */}
            <section id="policy-nitro" className="scroll-mt-24 mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-lg bg-[#1b1c24] border border-white/[0.08] flex items-center justify-center font-mono text-sm font-bold text-[#838896]">
                  04
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Chính Sách Discord Nitro (Login / Trial / Gift)
                </h2>
              </div>
              <ul className="space-y-2 text-sm text-[#d1d5db]">
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e]">•</span>
                  <span><strong>Nitro Login:</strong> Cần cung cấp tài khoản, mật khẩu và 5–10 mã dự phòng 2FA chưa sử dụng. Không đổi mật khẩu trong lúc shop đang thao tác.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e]">•</span>
                  <span><strong>Gói Nuôi Mail (2 tháng):</strong> Cần nuôi mail trong 7 ngày đầu để duy trì trạng thái đăng ký của Discord.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e]">•</span>
                  <span><strong>Nitro Trial:</strong> Tài khoản phải tạo trên 1 tháng, chưa từng dùng Nitro hoặc đã hết hạn trên 12 tháng. Không liên kết thẻ thanh toán.</span>
                </li>
              </ul>
            </section>

            <hr className="border-t border-white/[0.08] my-8" />

            <section id="policy-boost" className="scroll-mt-24 mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-lg bg-[#1b1c24] border border-white/[0.08] flex items-center justify-center font-mono text-sm font-bold text-[#838896]">
                  05
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Chính Sách Server Boost
                </h2>
              </div>
              <ul className="space-y-2 text-sm text-[#d1d5db]">
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e]">•</span>
                  <span>Cung cấp đúng link mời vĩnh viễn của server. Không mở xét duyệt vào (Apply to Join) hoặc xác minh SĐT khắt khe trong lúc bot boost join.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e]">•</span>
                  <span>Không kick hoặc ban bot boost của shop. Nếu bot bị kick/ban bởi server, shop từ chối bảo hành gói boost đó.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e]">•</span>
                  <span>Bắt buộc phải bật tính năng <strong>Lịch sử Boost</strong> trong server settings.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e]">•</span>
                  <span>Boost 1 tháng bảo hành 25 ngày; Boost 4 tháng bảo hành 3 tháng.</span>
                </li>
              </ul>
            </section>

            <hr className="border-t border-white/[0.08] my-8" />

            <section id="policy-deco" className="scroll-mt-24 mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-lg bg-[#1b1c24] border border-white/[0.08] flex items-center justify-center font-mono text-sm font-bold text-[#838896]">
                  06
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Chính Sách Avatar Decoration &amp; Gift
                </h2>
              </div>
              <ul className="space-y-2 text-sm text-[#d1d5db]">
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e]">•</span>
                  <span>Deco Login: Kỹ thuật viên login vào tài khoản để mua decor lưu vĩnh viễn vào kho đồ.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e]">•</span>
                  <span>Deco Gift: Gửi thẳng dưới dạng quà tặng trực tiếp hoặc link gift từ shop, bảo hành link claim an toàn 100%.</span>
                </li>
              </ul>
            </section>

            <hr className="border-t border-white/[0.08] my-8" />

            <section id="policy-streaming" className="scroll-mt-24 mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-lg bg-[#1b1c24] border border-white/[0.08] flex items-center justify-center font-mono text-sm font-bold text-[#838896]">
                  07
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Chính Sách YouTube / Spotify / Netflix
                </h2>
              </div>
              <ul className="space-y-2 text-sm text-[#d1d5db]">
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e]">•</span>
                  <span>YouTube Premium: Nâng cấp tài khoản chính chủ qua nhóm gia đình Google hoặc cấp acc riêng, bảo hành suốt thời hạn gói.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e]">•</span>
                  <span>Spotify Premium: Nâng cấp trực tiếp trên tài khoản cá nhân, giữ trọn vẹn danh sách bài hát và playlist.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e]">•</span>
                  <span>Netflix: Cấp tài khoản profile riêng có mã PIN bảo mật, chất lượng chuẩn 4K UHD. Không thay đổi mật khẩu hoặc thông tin thanh toán gốc.</span>
                </li>
              </ul>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
