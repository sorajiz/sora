import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '../../components/Navbar';
import { SubdomainTabs } from '../../components/SubdomainTabs';

export const metadata: Metadata = {
  title: 'Tutorial & Hướng Dẫn Kích Hoạt · Pade Store',
  description: 'Hướng dẫn kích hoạt Nitro Trial, kiểm tra link Trial, bật 2FA và lấy mã dự phòng tại Pade Store.',
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
                  <span>Bật 2FA &amp; Mã dự phòng</span>
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

            {/* Section 01: Yêu cầu bắt buộc */}
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

            {/* Section 02: Kiểm tra link Trial */}
            <section id="kiem-tra-link" className="scroll-mt-24 mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-lg bg-[#1b1c24] border border-white/[0.08] flex items-center justify-center font-mono text-sm font-bold text-[#838896]">
                  02
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

            {/* Section 03: Hướng dẫn Bật 2FA */}
            <section id="huong-dan-2fa" className="scroll-mt-24 mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-lg bg-[#1b1c24] border border-white/[0.08] flex items-center justify-center font-mono text-sm font-bold text-[#838896]">
                  03
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Hướng dẫn Bật 2FA &amp; Lấy Mã Dự Phòng
                </h2>
              </div>
              <p className="text-sm text-[#c5c8d4] leading-relaxed mb-4">
                Đối với các gói dịch vụ cần thao tác trực tiếp trên tài khoản (như Nitro Login, Nitro Trial nạp trực tiếp), việc cung cấp mã dự phòng giúp nhân viên xử lý đơn nhanh chóng mà không cần làm phiền bạn gửi mã OTP nhiều lần:
              </p>
              <div className="space-y-3 text-sm text-[#d1d5db]">
                <div className="p-4 rounded-xl bg-[#13141a] border border-white/[0.08]">
                  <h3 className="font-bold text-white mb-1.5 flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-[#6366f1]/20 text-[#818cf8] flex items-center justify-center font-mono text-xs">1</span>
                    <span>Truy cập Cài đặt Người dùng (User Settings)</span>
                  </h3>
                  <p className="text-xs text-[#9ca3af] leading-relaxed pl-7">
                    Mở Discord trên máy tính hoặc trình duyệt web &gt; Nhấn vào biểu tượng Bánh răng (Cài đặt) ở góc dưới bên trái &gt; Chọn mục <strong>Tài khoản của tôi (My Account)</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#13141a] border border-white/[0.08]">
                  <h3 className="font-bold text-white mb-1.5 flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-[#6366f1]/20 text-[#818cf8] flex items-center justify-center font-mono text-xs">2</span>
                    <span>Bật Xác thực 2 yếu tố (Enable Two-Factor Auth)</span>
                  </h3>
                  <p className="text-xs text-[#9ca3af] leading-relaxed pl-7">
                    Cuộn xuống phần Mật khẩu và Xác thực &gt; Nhấn nút <strong>Bật ứng dụng xác thực (Enable Authenticator App)</strong> &gt; Dùng app Google Authenticator hoặc Authy quét mã QR và nhập mã xác nhận 6 số.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#13141a] border border-white/[0.08]">
                  <h3 className="font-bold text-white mb-1.5 flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-[#6366f1]/20 text-[#818cf8] flex items-center justify-center font-mono text-xs">3</span>
                    <span>Lấy Danh sách Mã Dự Phòng (Backup Codes)</span>
                  </h3>
                  <p className="text-xs text-[#9ca3af] leading-relaxed pl-7">
                    Sau khi kích hoạt 2FA thành công, chọn mục <strong>Xem mã dự phòng (View Backup Codes)</strong> &gt; Nhập lại mật khẩu Discord &gt; Sao chép toàn bộ dãy 8-10 mã số hiển thị và gửi vào ticket hỗ trợ.
                  </p>
                </div>
              </div>
            </section>

            <hr className="border-t border-white/[0.08] my-8" />

            {/* Section 04: Video hướng dẫn */}
            <section id="video-huong-dan" className="scroll-mt-24 mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-lg bg-[#1b1c24] border border-white/[0.08] flex items-center justify-center font-mono text-sm font-bold text-[#838896]">
                  04
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Video hướng dẫn trực quan
                </h2>
              </div>
              <p className="text-sm text-[#c5c8d4] leading-relaxed mb-4">
                Nếu bạn gặp khó khăn trong quá trình kích hoạt hoặc lấy mã, vui lòng theo dõi video hướng dẫn từng bước chi tiết bên dưới:
              </p>

              <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/[0.1] bg-[#12131a] shadow-2xl">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="Tutorial Video Pade Store"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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
