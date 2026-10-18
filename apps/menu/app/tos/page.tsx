import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '../../components/Navbar';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service · Pade Store',
  description: 'Điều khoản dịch vụ và chính sách mua hàng chính thức tại Pade Store · discord.gg/pade',
};

export default function TosPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0c0d12] text-[#f1f2f6]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Left Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0 lg:sticky lg:top-24">
            <div className="mb-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#838896] block mb-3 px-3">
                ĐIỀU KHOẢN CHUNG
              </span>
              <nav className="flex flex-col space-y-1">
                <a href="#dieu-kien" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold bg-[#21232d] text-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                  <span>Điều kiện sử dụng</span>
                </a>
                <a href="#dat-hang" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.04] transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5c606e]" />
                  <span>Đặt hàng & thanh toán</span>
                </a>
                <a href="#bao-hanh" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.04] transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5c606e]" />
                  <span>Chính sách bảo hành</span>
                </a>
                <a href="#bi-cam" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.04] transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5c606e]" />
                  <span>Hành vi bị cấm</span>
                </a>
                <a href="#trach-nhiem" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.04] transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5c606e]" />
                  <span>Trách nhiệm & giới hạn</span>
                </a>
                <a href="#ho-tro" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.04] transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5c606e]" />
                  <span>Liên hệ & hỗ trợ</span>
                </a>
              </nav>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#838896] block mb-3 px-3">
                THEO DỊCH VỤ
              </span>
              <nav className="flex flex-col space-y-1">
                <a href="#nitro" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.04] transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5c606e]" />
                  <span>Nitro Login</span>
                </a>
                <a href="#boost" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.04] transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5c606e]" />
                  <span>Boost Server</span>
                </a>
                <a href="#gift" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.04] transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5c606e]" />
                  <span>Nitro Gift & Deco Gift</span>
                </a>
                <a href="#deco" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.04] transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5c606e]" />
                  <span>Deco Login</span>
                </a>
                <a href="#youtube" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.04] transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5c606e]" />
                  <span>YouTube Premium</span>
                </a>
                <a href="#spotify" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.04] transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5c606e]" />
                  <span>Spotify Premium</span>
                </a>
                <a href="#netflix" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.04] transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5c606e]" />
                  <span>Netflix Premium</span>
                </a>
              </nav>
            </div>
          </aside>

          {/* Main Content (Right) */}
          <main className="flex-1 max-w-3xl">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#838896] block mb-2">
              ĐIỀU KHOẢN DỊCH VỤ
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4 font-display">
              Terms of Service
            </h1>

            {/* Meta Pill with discord.gg/pade */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.035] border border-white/[0.08] text-xs text-[#c5c8d4] mb-8">
              <span>🎂</span>
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
            <section id="dieu-kien" className="scroll-mt-24 mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-lg bg-[#1b1c24] border border-white/[0.08] flex items-center justify-center font-mono text-sm font-bold text-[#838896]">
                  01
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Điều kiện sử dụng dịch vụ
                </h2>
              </div>
              <p className="text-sm text-[#c5c8d4] leading-relaxed mb-4">
                Bằng cách sử dụng dịch vụ của Pade Store, bạn đồng ý tuân thủ các điều khoản dưới đây. Vui lòng đọc kỹ trước khi đặt hàng.
              </p>
              <ul className="space-y-2 text-sm text-[#d1d5db]">
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Bạn phải từ 13 tuổi trở lên để sử dụng dịch vụ.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Tài khoản Discord của bạn phải đang hoạt động và không bị cấm (ban).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Bạn chịu trách nhiệm hoàn toàn về các thông tin cung cấp khi đặt hàng.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Pade Store có quyền từ chối phục vụ bất kỳ khách hàng nào vi phạm điều khoản.</span>
                </li>
              </ul>
            </section>

            <hr className="border-t border-white/[0.08] my-8" />

            {/* Section 02 */}
            <section id="dat-hang" className="scroll-mt-24 mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-lg bg-[#1b1c24] border border-white/[0.08] flex items-center justify-center font-mono text-sm font-bold text-[#838896]">
                  02
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Quy trình đặt hàng & thanh toán
                </h2>
              </div>

              {/* Warning Alert Box (Amber) */}
              <div className="bg-[#1c160c] border border-amber-500/35 border-l-4 border-l-amber-500 rounded-lg p-3.5 my-4 flex items-start gap-3">
                <span className="text-amber-500 text-lg">⚠️</span>
                <span className="text-xs sm:text-sm font-semibold text-amber-100 leading-snug">
                  Thanh toán trước khi nhận hàng. Chúng tôi không hỗ trợ nợ hay trả sau dưới bất kỳ hình thức nào.
                </span>
              </div>

              <ul className="space-y-2 text-sm text-[#d1d5db]">
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Khách hàng chuyển khoản đúng số tiền và nội dung chuyển khoản được cung cấp bởi hệ thống VietQR tự động.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Hệ thống MBBank Napas tự động nhận diện và cập nhật đơn trong vòng 30s đến 2 phút.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Sau khi thanh toán hoàn tất, vui lòng tạo ticket hoặc gửi bill để nhân viên hỗ trợ xử lý tức thì.</span>
                </li>
              </ul>
            </section>

            <hr className="border-t border-white/[0.08] my-8" />

            {/* Section 03 */}
            <section id="bao-hanh" className="scroll-mt-24 mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-lg bg-[#1b1c24] border border-white/[0.08] flex items-center justify-center font-mono text-sm font-bold text-[#838896]">
                  03
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Chính sách bảo hành & đổi trả
                </h2>
              </div>
              <ul className="space-y-2 text-sm text-[#d1d5db]">
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span><strong>Bảo hành 1 đổi 1:</strong> Toàn bộ thời gian sử dụng đối với các lỗi phát sinh từ phía shop hoặc nhà cung cấp.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span><strong>Xử lý bảo hành:</strong> Thời gian phản hồi và bảo hành trong 15 phút - 24 giờ kể từ khi nhận ticket báo lỗi.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Không bảo hành trường hợp khách tự đổi email/mật khẩu tài khoản cấp sẵn hoặc vi phạm ToS của Discord dẫn đến khóa tài khoản.</span>
                </li>
              </ul>
            </section>

            <hr className="border-t border-white/[0.08] my-8" />

            {/* Section 04 */}
            <section id="bi-cam" className="scroll-mt-24 mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-lg bg-[#1b1c24] border border-white/[0.08] flex items-center justify-center font-mono text-sm font-bold text-[#838896]">
                  04
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Hành vi bị cấm
                </h2>
              </div>
              <ul className="space-y-2 text-sm text-[#d1d5db]">
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Không spam ticket, chửi bới nhân viên hoặc có thái độ xúc phạm.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Nghiêm cấm hành vi gian lận bill thanh toán, chargeback hoặc bôi nhọ uy tín của shop.</span>
                </li>
              </ul>
            </section>

            <hr className="border-t border-white/[0.08] my-8" />

            {/* Section 05 */}
            <section id="trach-nhiem" className="scroll-mt-24 mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-lg bg-[#1b1c24] border border-white/[0.08] flex items-center justify-center font-mono text-sm font-bold text-[#838896]">
                  05
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Trách nhiệm & giới hạn
                </h2>
              </div>
              <ul className="space-y-2 text-sm text-[#d1d5db]">
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Pade Store cam kết bảo mật tuyệt đối 100% tài khoản, email và mã 2FA của khách hàng.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Khách hàng có thể đổi lại mật khẩu ngay sau khi shop hoàn tất kích hoạt.</span>
                </li>
              </ul>
            </section>

            <hr className="border-t border-white/[0.08] my-8" />

            {/* Section 06 */}
            <section id="ho-tro" className="scroll-mt-24 mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-lg bg-[#1b1c24] border border-white/[0.08] flex items-center justify-center font-mono text-sm font-bold text-[#838896]">
                  06
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Liên hệ & hỗ trợ
                </h2>
              </div>
              <p className="text-sm text-[#c5c8d4] leading-relaxed mb-4">
                Tham gia máy chủ chính thức để được hỗ trợ nhanh nhất:
              </p>
              <div className="p-4 rounded-xl bg-[#13141a] border border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-white mb-0.5">Discord Community & Ticket Support</div>
                  <div className="text-xs text-[#838896]">Kênh #ticket-support hoạt động 24/7</div>
                </div>
                <a
                  href="https://discord.gg/pade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-bold transition-colors"
                >
                  discord.gg/pade
                </a>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

