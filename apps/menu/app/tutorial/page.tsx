import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '../../components/Navbar';
import { SubdomainTabs } from '../../components/SubdomainTabs';

export const metadata: Metadata = {
  title: 'Tutorial & Hướng Dẫn Kích Hoạt · Pade Store',
  description: 'Hướng dẫn kích hoạt Nitro Trial, bật 2FA, lấy mã dự phòng và kiểm tra link Trial tại Pade Store.',
};

export default function TutorialPage() {
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
                MỤC LỤC HƯỚNG DẪN
              </span>
              <nav className="flex flex-col space-y-1">
                <a
                  href="#yeu-cau-bat-buoc"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold bg-[#21232d] text-white"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                  <span>Yêu cầu bắt buộc</span>
                </a>
                <a
                  href="#mua-tu-dong"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5c606e]" />
                  <span>Yêu cầu mua tự động</span>
                </a>
                <a
                  href="#kiem-tra-link"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5c606e]" />
                  <span>Kiểm tra link Trial</span>
                </a>
                <a
                  href="#huong-dan-2fa"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5c606e]" />
                  <span>Bật 2FA & Mã dự phòng</span>
                </a>
                <a
                  href="#video-huong-dan"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5c606e]" />
                  <span>Video hướng dẫn</span>
                </a>
              </nav>
            </div>
          </aside>

          {/* Main Content (Right) */}
          <main className="flex-1 max-w-3xl">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#838896] block mb-2">
              HƯỚNG DẪN CHI TIẾT
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4 font-display">
              Tutorial
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

            {/* Section 01 */}
            <section id="yeu-cau-bat-buoc" className="scroll-mt-24 mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-lg bg-[#1b1c24] border border-white/[0.08] flex items-center justify-center font-mono text-sm font-bold text-[#838896]">
                  01
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Yêu cầu bắt buộc khi dùng Nitro Trial
                </h2>
              </div>
              <p className="text-sm text-[#c5c8d4] leading-relaxed mb-4">
                Để đủ điều kiện đăng ký và kích hoạt gói Discord Nitro Trial, tài khoản của bạn cần đáp ứng các tiêu chuẩn sau:
              </p>
              <ul className="space-y-2.5 text-sm text-[#d1d5db]">
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Tài khoản cần mua Nitro Trial <strong>phải tạo được trên 1 tháng</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Tài khoản <strong>không sử dụng Nitro</strong> (mua thẳng, quà tặng Gift Link hoặc Random) từ Discord trong vòng <strong>12 tháng trở lại đây</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Tài khoản chưa từng sử dụng Nitro lần nào (hoặc đã hết hạn hoàn toàn hơn 1 năm).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Tài khoản đã từng dùng các gói Nitro dùng thử 3 ngày / 7 ngày / Orbs <strong>vẫn có thể sử dụng được Trial bình thường</strong>.</span>
                </li>
              </ul>
            </section>

            <hr className="border-t border-white/[0.08] my-8" />

            {/* Section 02 */}
            <section id="mua-tu-dong" className="scroll-mt-24 mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-lg bg-[#1b1c24] border border-white/[0.08] flex items-center justify-center font-mono text-sm font-bold text-[#838896]">
                  02
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Yêu cầu khi mua tự động
                </h2>
              </div>
              <ul className="space-y-2.5 text-sm text-[#d1d5db]">
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Tài khoản cần mua <strong>không được liên kết bất cứ thẻ thanh toán nào</strong> (Nếu có thẻ sẵn thì tạo ticket để nhân viên hỗ trợ mua thủ công).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Tài khoản bị gắn cờ (Flagged) cũng phải tạo ticket để mua thủ công.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Tài khoản <strong>bắt buộc phải có ảnh đại diện (Avatar)</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Tài khoản cần mua đã từng sử dụng trial (hơn 1 năm trước) <strong>bắt buộc tạo ticket để mua</strong>.</span>
                </li>
              </ul>
            </section>

            <hr className="border-t border-white/[0.08] my-8" />

            {/* Section 03 */}
            <section id="kiem-tra-link" className="scroll-mt-24 mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-lg bg-[#1b1c24] border border-white/[0.08] flex items-center justify-center font-mono text-sm font-bold text-[#838896]">
                  03
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Kiểm tra tính hợp lệ của tài khoản
                </h2>
              </div>
              <div className="p-5 rounded-xl bg-gradient-to-br from-[#181922] to-[#13141a] border border-white/[0.1] text-sm leading-relaxed mb-4">
                <p className="text-white font-medium mb-3">
                  Ấn vào link kiểm tra bên dưới, nếu Discord thông báo:<br />
                  <span className="text-[#38bdf8] font-bold">&quot;Xin lỗi, có vẻ như mã đã được đổi&quot; (Sorry, looks like this code has been redeemed)</span><br />
                  thì tài khoản của bạn <strong>hoàn toàn đủ điều kiện</strong> sử dụng Nitro Trial!
                </p>
                <a
                  href="https://promos.discord.gg/HCxVfuJt9AbXzXtSw5yRnv9J"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-white font-semibold text-xs border border-white/[0.12] transition-colors"
                >
                  <span>Kiểm tra link Nitro Trial ngay ↗</span>
                </a>
              </div>
            </section>

            <hr className="border-t border-white/[0.08] my-8" />

            {/* Section 04 */}
            <section id="huong-dan-2fa" className="scroll-mt-24 mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-lg bg-[#1b1c24] border border-white/[0.08] flex items-center justify-center font-mono text-sm font-bold text-[#838896]">
                  04
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Hướng dẫn Bật 2FA &amp; Lấy Mã Dự Phòng
                </h2>
              </div>
              <div className="p-5 rounded-xl bg-[#13141a] border border-white/[0.08] mb-4">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-[#38bdf8]/10 text-[#38bdf8] flex items-center justify-center border border-[#38bdf8]/20">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                  </span>
                  <span>Các bước thực hiện trên Máy tính (PC / Web):</span>
                </h3>
                <ul className="space-y-2.5 text-sm text-[#d1d5db]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#5c606e] font-bold">•</span>
                    <span><strong>Bước 1 (Bật 2FA):</strong> Vào <strong>Cài đặt người dùng</strong> (biểu tượng Cài đặt ở góc trái phía dưới) ➔ Chọn mục <strong>My Account</strong> (Tài khoản của tôi) ➔ Cuộn xuống chọn <strong>Bật Ứng Dụng Xác Thực</strong> (Enable Two-Factor Auth).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#5c606e] font-bold">•</span>
                    <span><strong>Bước 2 (Quét mã):</strong> Nhập mật khẩu tài khoản và quét mã QR bằng ứng dụng xác thực trên điện thoại (Google Authenticator, Authy, Microsoft Authenticator,...), sau đó nhập 6 số xác thực để hoàn tất.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#5c606e] font-bold">•</span>
                    <span><strong>Bước 3 (Xem mã dự phòng):</strong> Sau khi kích hoạt thành công, nút <strong>Xem Mã Dự Phòng</strong> (View Backup Codes) sẽ hiển thị ngay tại mục đó. Nhấp vào để xem và tải về máy.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#5c606e] font-bold">•</span>
                    <span><strong>Bước 4 (Gửi cho shop):</strong> Copy 5–10 mã dự phòng chưa dùng gửi vào ticket cùng tài khoản &amp; mật khẩu để kỹ thuật viên đăng nhập kích hoạt.</span>
                  </li>
                </ul>
              </div>
            </section>

            <hr className="border-t border-white/[0.08] my-8" />

            {/* Section 05 */}
            <section id="video-huong-dan" className="scroll-mt-24 mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-lg bg-[#1b1c24] border border-white/[0.08] flex items-center justify-center font-mono text-sm font-bold text-[#838896]">
                  05
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Video hướng dẫn trực quan
                </h2>
              </div>
              <p className="text-sm text-[#c5c8d4] leading-relaxed mb-4">
                Theo dõi video dưới đây để thực hiện từng bước dễ dàng nhất:
              </p>
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/[0.1] bg-[#13141a]">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube-nocookie.com/embed/_yauX5pVC8o"
                  title="Video hướng dẫn Discord Nitro Trial"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
