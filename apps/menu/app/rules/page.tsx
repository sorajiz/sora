import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '../../components/Navbar';

export const metadata: Metadata = {
  title: 'Server Rules · Pade Community',
  description: 'Nội quy và quy chuẩn cộng đồng chính thức tại máy chủ Pade Discord · discord.gg/pade',
};

export default function RulesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0c0d12] text-[#f1f2f6]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Left Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0 lg:sticky lg:top-24">
            <div className="mb-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#838896] block mb-3 px-3">
                NỘI QUY CHUNG
              </span>
              <nav className="flex flex-col space-y-1">
                <a href="#ung-xu" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold bg-[#21232d] text-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                  <span>Ứng xử & Tôn trọng</span>
                </a>
                <a href="#kenh-chat" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.04] transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5c606e]" />
                  <span>Quy định kênh Chat</span>
                </a>
                <a href="#spam-nsfw" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.04] transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5c606e]" />
                  <span>Cấm Spam & NSFW</span>
                </a>
                <a href="#quang-cao" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.04] transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5c606e]" />
                  <span>Cấm Quảng cáo</span>
                </a>
                <a href="#giao-dich" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.04] transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5c606e]" />
                  <span>An toàn giao dịch</span>
                </a>
                <a href="#voice" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.04] transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5c606e]" />
                  <span>Kênh Voice & Âm thanh</span>
                </a>
              </nav>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#838896] block mb-3 px-3">
                HỖ TRỢ & XỬ PHẠT
              </span>
              <nav className="flex flex-col space-y-1">
                <a href="#ticket" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.04] transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5c606e]" />
                  <span>Quy định Ticket</span>
                </a>
                <a href="#giveaway" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.04] transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5c606e]" />
                  <span>Giveaways & Sự kiện</span>
                </a>
                <a href="#hinh-phat" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.04] transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5c606e]" />
                  <span>Khung hình phạt</span>
                </a>
              </nav>
            </div>
          </aside>

          {/* Main Content (Right) */}
          <main className="flex-1 max-w-3xl">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#838896] block mb-2">
              NỘI QUY CỘNG ĐỒNG
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4 font-display">
              Server Rules
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
            <section id="ung-xu" className="scroll-mt-24 mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-lg bg-[#1b1c24] border border-white/[0.08] flex items-center justify-center font-mono text-sm font-bold text-[#838896]">
                  01
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Ứng xử & Tôn trọng lẫn nhau
                </h2>
              </div>
              <p className="text-sm text-[#c5c8d4] leading-relaxed mb-4">
                Pade Community là môi trường giao lưu văn minh, tích cực. Mọi hành vi thiếu tôn trọng đều không được chấp nhận.
              </p>
              <ul className="space-y-2 text-sm text-[#d1d5db]">
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Tôn trọng tất cả các thành viên và đội ngũ Điều hành viên.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Không công kích cá nhân, phân biệt vùng miền, giới tính, tôn giáo.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Tuân thủ Điều khoản Dịch vụ và Nguyên tắc cộng đồng của Discord.</span>
                </li>
              </ul>
            </section>

            <hr className="border-t border-white/[0.08] my-8" />

            {/* Section 02 */}
            <section id="kenh-chat" className="scroll-mt-24 mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-lg bg-[#1b1c24] border border-white/[0.08] flex items-center justify-center font-mono text-sm font-bold text-[#838896]">
                  02
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Quy định kênh Chat
                </h2>
              </div>
              <ul className="space-y-2 text-sm text-[#d1d5db]">
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Chat đúng kênh, đúng chủ đề của phòng chat.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Không spam tag vô cớ (@everyone, @here hoặc tag Admin liên tục).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Hạn chế sử dụng từ ngữ thô tục, chửi thề gây khó chịu cho người khác.</span>
                </li>
              </ul>
            </section>

            <hr className="border-t border-white/[0.08] my-8" />

            {/* Section 03 */}
            <section id="spam-nsfw" className="scroll-mt-24 mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-lg bg-[#1b1c24] border border-white/[0.08] flex items-center justify-center font-mono text-sm font-bold text-[#838896]">
                  03
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Cấm Spam & Nội dung NSFW 18+
                </h2>
              </div>

              {/* Danger Callout */}
              <div className="bg-[#1c0e0e] border border-red-500/35 border-l-4 border-l-red-500 rounded-lg p-3.5 my-4 flex items-start gap-3">
                <span className="text-red-500 text-lg">🚫</span>
                <span className="text-xs sm:text-sm font-semibold text-red-100 leading-snug">
                  Cấm 100% các hình ảnh/video 18+, đồi trụy hoặc tệp tin mã độc. Vi phạm sẽ bị BAN VĨNH VIỄN không cảnh cáo.
                </span>
              </div>
            </section>

            <hr className="border-t border-white/[0.08] my-8" />

            {/* Section 04 */}
            <section id="quang-cao" className="scroll-mt-24 mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-lg bg-[#1b1c24] border border-white/[0.08] flex items-center justify-center font-mono text-sm font-bold text-[#838896]">
                  04
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Nghiêm cấm Quảng cáo & Chèo kéo
                </h2>
              </div>
              <ul className="space-y-2 text-sm text-[#d1d5db]">
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Không gửi link mời server Discord khác trong mọi kênh chat.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Cấm nhắn tin riêng (DM) cho thành viên trong server để quảng cáo dịch vụ hoặc bán đồ.</span>
                </li>
              </ul>
            </section>

            <hr className="border-t border-white/[0.08] my-8" />

            {/* Section 05 */}
            <section id="giao-dich" className="scroll-mt-24 mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-lg bg-[#1b1c24] border border-white/[0.08] flex items-center justify-center font-mono text-sm font-bold text-[#838896]">
                  05
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  An toàn giao dịch & Chống lừa đảo
                </h2>
              </div>
              <ul className="space-y-2 text-sm text-[#d1d5db]">
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Chỉ giao dịch qua hệ thống website menu chính thức hoặc ticket Discord.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Admin Pade Store không bao giờ nhắn tin trước để xin mã OTP, mật khẩu hay yêu cầu chuyển tiền ngoài.</span>
                </li>
              </ul>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

