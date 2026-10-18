import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '../../components/Navbar';
import { SubdomainTabs } from '../../components/SubdomainTabs';

export const metadata: Metadata = {
  title: 'Server Rules · Pade Community',
  description: 'Nội quy và quy chuẩn cộng đồng chính thức tại máy chủ Pade Discord · discord.gg/pade',
};

export default function RulesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0c0d12] text-[#f1f2f6]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 w-full flex-1">
        <SubdomainTabs />

        {/* Mobile Horizontal Section Chips (Giống hệt Mobile Category Bar của Menu) */}
        <div className="lg:hidden sticky top-16 z-30 -mx-4 px-4 py-2 mb-6 bg-[#0c0d12]/92 backdrop-blur-md border-b border-white/[0.08] overflow-x-auto scrollbar-none flex items-center gap-2">
          <a
            href="#luat-le-chung"
            className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#21232d] text-white border border-white/[0.14] shadow-sm transition-all active:scale-95"
          >
            Luật Lệ Chung
          </a>
          <a
            href="#rules-ticket"
            className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium text-[#9ca3af] hover:text-white bg-white/[0.035] border border-white/[0.06] transition-all active:scale-95"
          >
            Rules Ticket
          </a>
          <a
            href="#rules-giveaway"
            className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium text-[#9ca3af] hover:text-white bg-white/[0.035] border border-white/[0.06] transition-all active:scale-95"
          >
            Rules Giveaway
          </a>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* Left Sidebar (Desktop Only) */}
          <aside className="hidden lg:block w-64 flex-shrink-0 lg:sticky lg:top-24">
            <div className="mb-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#838896] block mb-3 px-3">
                MỤC LỤC NỘI QUY
              </span>
              <nav className="flex flex-col space-y-1">
                <a
                  href="#luat-le-chung"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold bg-[#21232d] text-white"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                  <span>Luật Lệ Chung</span>
                </a>
                <a
                  href="#rules-ticket"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5c606e]" />
                  <span>Rules Ticket</span>
                </a>
                <a
                  href="#rules-giveaway"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5c606e]" />
                  <span>Rules Giveaway</span>
                </a>
              </nav>
            </div>
          </aside>

          {/* Main Content (Right) */}
          <main className="flex-1 max-w-3xl min-w-0 w-full">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#838896] block mb-2">
              NỘI QUY MÁY CHỦ
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4 font-display">
              Server Rules
            </h1>

            {/* Meta Badge with SVG Icon */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.035] border border-white/[0.08] text-xs text-[#c5c8d4] mb-8">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#838896]">
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

            {/* Section 01: Luật Lệ Chung */}
            <section id="luat-le-chung" className="scroll-mt-24 mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-lg bg-[#1b1c24] border border-white/[0.08] flex items-center justify-center font-mono text-sm font-bold text-[#838896]">
                  01
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Luật Lệ Chung
                </h2>
              </div>
              <ul className="space-y-2.5 text-sm text-[#d1d5db]">
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Các đơn hàng sẽ hoàn thành trong vòng <strong>24h</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Hoàn tiền / Bảo hành <strong>bắt buộc phải có</strong>: Lịch sử giao dịch, tin nhắn bot (DMs bot), và lịch sử ticket.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Hạn chế spam ping và hối thúc nhân sự; khi đơn hàng hoàn tất, hệ thống sẽ ping thông báo ngay cho bạn.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Trước khi tiến hành thanh toán hoặc mua hàng, bắt buộc phải đọc kỹ <strong>Terms of Service (ToS)</strong>.</span>
                </li>
              </ul>
            </section>

            <hr className="border-t border-white/[0.08] my-8" />

            {/* Section 02: Rules Ticket */}
            <section id="rules-ticket" className="scroll-mt-24 mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-lg bg-[#1b1c24] border border-white/[0.08] flex items-center justify-center font-mono text-sm font-bold text-[#838896]">
                  02
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Rules Ticket
                </h2>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#13141a] border border-white/[0.08]">
                  <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-[#38bdf8]/10 text-[#38bdf8] flex items-center justify-center border border-[#38bdf8]/20">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                    </span>
                    <span>Khi Tạo Ticket:</span>
                  </h3>
                  <ul className="space-y-1.5 text-sm text-[#d1d5db]">
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span>Vui lòng điền đầy đủ thông tin vào Ticket để shop thực hiện chuẩn xác.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span>Tạo đúng với mục đích muốn xử lý đối với Ticket đó.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span>Nêu rõ nội dung &amp; văn bản cần được thực hiện.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[#13141a] border border-white/[0.08]">
                  <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-[#c084fc]/10 text-[#c084fc] flex items-center justify-center border border-[#c084fc]/20">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    </span>
                    <span>Khi Close Ticket:</span>
                  </h3>
                  <ul className="space-y-1.5 text-sm text-[#d1d5db]">
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span>Sau khi đơn hàng hoàn thành sẽ được gửi thông báo để close ticket.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span>Nếu còn điều gì muốn hỏi hoặc cần giải đáp, bạn không cần đóng ticket vội.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[#13141a] border border-white/[0.08]">
                  <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-[#f59e0b]/10 text-[#f59e0b] flex items-center justify-center border border-[#f59e0b]/20">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    </span>
                    <span>Luật Ticket:</span>
                  </h3>
                  <ul className="space-y-1.5 text-sm text-[#d1d5db]">
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span>Tuyệt đối không tạo ticket chơi, tạo cho vui rồi không nhắn gì.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span>Tạo xong hãy ping <strong>@386528085681635328</strong> (Pade Owner) để được phản hồi sớm nhất.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span>Nghiêm cấm hành vi spam ping gây nghẽn tiến độ.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <hr className="border-t border-white/[0.08] my-8" />

            {/* Section 03: Rules Giveaway */}
            <section id="rules-giveaway" className="scroll-mt-24 mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-lg bg-[#1b1c24] border border-white/[0.08] flex items-center justify-center font-mono text-sm font-bold text-[#838896]">
                  03
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Rules Giveaway
                </h2>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#13141a] border border-white/[0.08]">
                  <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-[#f472b6]/10 text-[#f472b6] flex items-center justify-center border border-[#f472b6]/20">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
                    </span>
                    <span>Giveaway Có Yêu Cầu (Req):</span>
                  </h3>
                  <ul className="space-y-1.5 text-sm text-[#d1d5db]">
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span>Nếu giveaway có ghi yêu cầu req, hãy gửi yêu cầu vào đúng channel req có tên tương ứng.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span>Phải gửi yêu cầu trước thời gian giveaway được tạo ra không dưới <strong>30 phút</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span>Vui lòng đọc kỹ yêu cầu để biết rõ điều kiện cần làm nhằm nhận giải hợp lệ.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span>Profile cá nhân vui lòng không để ở chế độ riêng tư (private) để ban quản trị kiểm tra.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span>Chỉ tính Profile Global của Discord, không tính profile custom riêng theo server.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[#13141a] border border-white/[0.08]">
                  <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-[#facc15]/10 text-[#facc15] flex items-center justify-center border border-[#facc15]/20">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                    </span>
                    <span>Giveaway Không Req:</span>
                  </h3>
                  <p className="text-sm text-[#d1d5db]">
                    Nếu giveaway không có yêu cầu nào, các bạn chỉ cần tham gia (join) như bình thường.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#13141a] border border-white/[0.08]">
                  <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-[#60a5fa]/10 text-[#60a5fa] flex items-center justify-center border border-[#60a5fa]/20">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                    </span>
                    <span>Quy Chế Nhận Giải Giveaway:</span>
                  </h3>
                  <ul className="space-y-1.5 text-sm text-[#d1d5db]">
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span>Nếu bạn trúng giải, vui lòng tạo ticket đúng hạn quy định để nhận giải.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span>Nếu không tạo ticket đúng hạn, ban tổ chức sẽ reroll và hủy quyền nhận giải của bạn.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span>Thời hạn tạo ticket claim giải là <strong>6 tiếng</strong> kể từ thời điểm giveaway kết thúc.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span>Nếu reroll liên tiếp 5 lần mà không ai hoàn thành yêu cầu hoặc không tạo ticket, giveaway đó sẽ bị hủy.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span>Nếu trúng giveaway về <strong>Decor</strong>, người trúng nếu chưa có sẵn Nitro trong tài khoản thì cần cộng thêm <strong>10.000 VNĐ</strong> phụ phí kích hoạt.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
