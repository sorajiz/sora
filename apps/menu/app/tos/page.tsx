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
                  href="#quy-dinh-mua-hang"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold bg-[#21232d] text-white"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                  <span>Quy định mua hàng</span>
                </a>
                <a
                  href="#chinh-sach-bao-hanh"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5c606e]" />
                  <span>Chính sách Bảo hành</span>
                </a>
                <a
                  href="#chinh-sach-hoan-tien"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5c606e]" />
                  <span>Chính sách Hoàn tiền</span>
                </a>
                <a
                  href="#login-nuoi-mail"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5c606e]" />
                  <span>Login &amp; Nuôi Mail</span>
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
                  href="#policy-youtube"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5c606e]" />
                  <span>YouTube Premium</span>
                </a>
                <a
                  href="#policy-spotify"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5c606e]" />
                  <span>Spotify Premium</span>
                </a>
                <a
                  href="#policy-netflix"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5c606e]" />
                  <span>Netflix Premium</span>
                </a>
              </nav>
            </div>
          </aside>

          {/* Main Content (Right) */}
          <main className="flex-1 max-w-3xl">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#838896] block mb-2">
              TERM OF SERVICE (TOS)
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4 font-display">
              Điều Khoản Dịch Vụ
            </h1>

            {/* Meta Badge with SVG Icon */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.035] border border-white/[0.08] text-xs text-[#c5c8d4] mb-8">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#838896]">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>
                Quy định mua hàng chính thức ·{' '}
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

            {/* Section 01: Quy định mua hàng */}
            <section id="quy-dinh-mua-hang" className="scroll-mt-24 mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-lg bg-[#1b1c24] border border-white/[0.08] flex items-center justify-center font-mono text-sm font-bold text-[#838896]">
                  01
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Quy Định Mua Hàng Tại Server
                </h2>
              </div>
              <ul className="space-y-2.5 text-sm text-[#d1d5db]">
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Tất cả các sản phẩm đều được cam kết hoàn thành trong vòng <strong>24h</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Một khi đã đặt đơn, khách hàng bắt buộc phải chấp hành tất cả điều khoản dịch vụ của shop.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Hạn chế hối / giục người làm đơn; khi done đơn được lúc nào nhân viên sẽ chủ động thông báo lại ngay cho bạn.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Vui lòng đọc kỹ ToS trước khi đặt đơn để tránh các tình huống phát sinh không mong muốn.</span>
                </li>
              </ul>
            </section>

            <hr className="border-t border-white/[0.08] my-8" />

            {/* Section 02: Chính Sách Bảo Hành */}
            <section id="chinh-sach-bao-hanh" className="scroll-mt-24 mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-lg bg-[#1b1c24] border border-white/[0.08] flex items-center justify-center font-mono text-sm font-bold text-[#838896]">
                  02
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Chính Sách Bảo Hành (Warranty)
                </h2>
              </div>

              <div className="p-4 rounded-xl bg-[#1c160c] border border-[rgba(245,158,11,0.35)] text-sm mb-4">
                <p className="text-[#fef3c7] font-semibold mb-2 flex items-center gap-2">
                  <span className="text-[#f59e0b]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  </span>
                  <span>Điều Kiện Kích Hoạt Bảo Hành Bắt Buộc:</span>
                </p>
                <div className="space-y-2 text-[#fde68a] text-xs sm:text-sm">
                  <p>
                    • <strong>Bắt buộc phải feedback trong vòng 24h</strong> kể từ khi đơn hoàn thành. Không feedback = đóng ticket và từ chối bảo hành.
                  </p>
                  <p>
                    • Tuyệt đối <strong>không bảo hành</strong> khi khách hàng không để lại feedback, hoặc <strong>out server</strong> trong thời gian sử dụng.
                  </p>
                </div>
              </div>

              <ul className="space-y-2 text-sm text-[#d1d5db]">
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Sau khi seller đưa sản phẩm và báo done đơn, khách sẽ có <strong>24h</strong> để hoàn thành và kiểm tra đơn. Nếu quá thời gian mà không vouch hoặc không phản hồi thêm gì về sản phẩm thì shop không chịu trách nhiệm bảo hành.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span><strong>Bù ngày bảo hành:</strong> Bù lại số ngày bị mất đối với các đơn hàng cần thời gian dài để bảo hành.</span>
                </li>
              </ul>
            </section>

            <hr className="border-t border-white/[0.08] my-8" />

            {/* Section 03: Chính Sách Hoàn Tiền */}
            <section id="chinh-sach-hoan-tien" className="scroll-mt-24 mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-lg bg-[#1b1c24] border border-white/[0.08] flex items-center justify-center font-mono text-sm font-bold text-[#838896]">
                  03
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Chính Sách Hoàn Tiền (Refund)
                </h2>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#13141a] border border-white/[0.08]">
                  <h3 className="text-sm font-bold text-[#22c55e] mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-[#22c55e]/10 text-[#22c55e] flex items-center justify-center border border-[#22c55e]/20">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </span>
                    <span>Điều Kiện Hoàn Tiền:</span>
                  </h3>
                  <ul className="space-y-1.5 text-sm text-[#d1d5db]">
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span><strong>Hoàn 100%:</strong> Nếu lỗi phát sinh từ Store, hoặc quá <strong>3 ngày</strong> chưa done đơn.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span><strong>Đơn đã xác nhận (Ticket được Rename):</strong> Không hoàn tiền; nếu trường hợp đặc biệt được duyệt hoàn thì chỉ hoàn tối đa <strong>60%</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span><strong>Hoàn 50% – 70%:</strong> Áp dụng đối với các trường hợp lỗi phát sinh từ phía khách hàng (tùy theo lý do cụ thể).</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[#13141a] border border-white/[0.08]">
                  <h3 className="text-sm font-bold text-[#ef4444] mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-[#ef4444]/10 text-[#ef4444] flex items-center justify-center border border-[#ef4444]/20">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                    </span>
                    <span>Tuyệt Đối Không Hoàn Tiền Với Các Trường Hợp:</span>
                  </h3>
                  <ul className="space-y-1.5 text-sm text-[#d1d5db]">
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span>Đơn hàng không để lại feedback tại kênh phản hồi chính thức của server.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span>Khách hàng làm sai quy định của sản phẩm khi thực hiện bảo hành.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <hr className="border-t border-white/[0.08] my-8" />

            {/* Section 04: Login & Nuôi Mail */}
            <section id="login-nuoi-mail" className="scroll-mt-24 mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-lg bg-[#1b1c24] border border-white/[0.08] flex items-center justify-center font-mono text-sm font-bold text-[#838896]">
                  04
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Sản Phẩm Cần Login / Nuôi Mail
                </h2>
              </div>

              <div className="p-4 rounded-xl bg-[#13141a] border border-white/[0.08]">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-[#38bdf8]/10 text-[#38bdf8] flex items-center justify-center border border-[#38bdf8]/20">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                  </span>
                  <span>Quy Định Tài Khoản Gmail &amp; Login:</span>
                </h3>
                <ul className="space-y-2 text-sm text-[#d1d5db]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#5c606e]">•</span>
                    <span>Các đơn cấp tài khoản Gmail khách cần <strong>tự nuôi mail</strong>. Trường hợp để chết mail hoặc mất tài khoản do không nuôi thì shop không bảo hành.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#5c606e]">•</span>
                    <span>Đối với những đơn cần login acc, khi done xong <strong>vui lòng thay đổi mật khẩu và thay cả mã dự phòng 2FA</strong> để tránh phát sinh vấn đề không cần thiết.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#5c606e]">•</span>
                    <span>Khi hoàn thành đơn, shop đều chủ động logout tài khoản và không còn can thiệp đơn đó. Mọi vấn đề phát sinh sau <strong>12h</strong> kể từ khi done đơn, shop xin phép miễn trừ trách nhiệm.</span>
                  </li>
                </ul>
              </div>
            </section>

            <hr className="border-t border-white/[0.08] my-8" />

            {/* Section 05: Discord Nitro */}
            <section id="policy-nitro" className="scroll-mt-24 mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-lg bg-[#1b1c24] border border-white/[0.08] flex items-center justify-center font-mono text-sm font-bold text-[#838896]">
                  05
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Chính Sách Discord Nitro (Login &amp; Gift)
                </h2>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#13141a] border border-white/[0.08]">
                  <h3 className="text-sm font-bold text-[#a855f7] mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-[#a855f7]/10 text-[#a855f7] flex items-center justify-center border border-[#a855f7]/20">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    </span>
                    <span>Nitro Login:</span>
                  </h3>
                  <ul className="space-y-1.5 text-sm text-[#d1d5db]">
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span><strong>100% Bảo Hành</strong> trong suốt thời gian sử dụng gói.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span>Hàng chính hãng có bill thanh toán rõ ràng, không lo chuyện bị thu hồi.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[#13141a] border border-white/[0.08]">
                  <h3 className="text-sm font-bold text-[#ec4899] mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-[#ec4899]/10 text-[#ec4899] flex items-center justify-center border border-[#ec4899]/20">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
                    </span>
                    <span>Nitro Gift:</span>
                  </h3>
                  <ul className="space-y-1.5 text-sm text-[#d1d5db]">
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span>Không bảo hành khi link bị Discord revoke.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span>Không bảo hành khi shop đã bàn giao link cho bạn (trước khi gửi shop đã kiểm tra kỹ lưỡng 100%).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span>Không bảo hành khi bạn không tiến hành claim quà trong vòng <strong>48h</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span>Không regen lại link trong mọi trường hợp.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <hr className="border-t border-white/[0.08] my-8" />

            {/* Section 06: Boost Server */}
            <section id="policy-boost" className="scroll-mt-24 mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-lg bg-[#1b1c24] border border-white/[0.08] flex items-center justify-center font-mono text-sm font-bold text-[#838896]">
                  06
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Chính Sách Boost Server
                </h2>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#13141a] border border-white/[0.08]">
                  <h3 className="text-sm font-bold text-[#f59e0b] mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-[#f59e0b]/10 text-[#f59e0b] flex items-center justify-center border border-[#f59e0b]/20">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m13 2-2 10h5L11 22l2-10H8l5-10z"/></svg>
                    </span>
                    <span>Thời Gian Giữ Boost:</span>
                  </h3>
                  <ul className="space-y-1.5 text-sm text-[#d1d5db]">
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span>Có <strong>25 – 31 ngày</strong> bảo hành đối với gói 1 tháng.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span>Có <strong>75 – 90 ngày</strong> bảo hành đối với gói 3 tháng (4 tháng).</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[#13141a] border border-white/[0.08]">
                  <h3 className="text-sm font-bold text-[#ef4444] mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-[#ef4444]/10 text-[#ef4444] flex items-center justify-center border border-[#ef4444]/20">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                    </span>
                    <span>Sẽ KHÔNG hoàn tiền hoặc thay thế trong các trường hợp sau:</span>
                  </h3>
                  <ul className="space-y-1.5 text-sm text-[#d1d5db]">
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span>Boost bị Discord thu hồi do quét nền tảng chung.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span>Khách hàng hoặc thành viên ban quản trị kick/ban tài khoản boost của shop.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span>Đưa nhầm link server cần boost.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span>Server vẫn bật chế độ Antiraid hoặc các lớp bot lọc chặn bot mới.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5c606e]">•</span>
                      <span>Server bị Discord gắn cờ giới hạn (Limited).</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <hr className="border-t border-white/[0.08] my-8" />

            {/* Section 07: Avatar Decoration */}
            <section id="policy-deco" className="scroll-mt-24 mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-lg bg-[#1b1c24] border border-white/[0.08] flex items-center justify-center font-mono text-sm font-bold text-[#838896]">
                  07
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Chính Sách Avatar Decoration
                </h2>
              </div>

              <div className="p-4 rounded-xl bg-[#13141a] border border-white/[0.08]">
                <h3 className="text-sm font-bold text-[#38bdf8] mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-[#38bdf8]/10 text-[#38bdf8] flex items-center justify-center border border-[#38bdf8]/20">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path></svg>
                  </span>
                  <span>Quy Định Nhận &amp; Bảo Hành Decoration:</span>
                </h3>
                <ul className="space-y-2 text-sm text-[#d1d5db]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#5c606e]">•</span>
                    <span>Sau khi shop dùng bot gửi bill và có link decoration gift, <strong>bạn phải claim ngay</strong>. Sau đó shop không chịu trách nhiệm vì link quà là dạng private chỉ mình bạn và shop biết.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#5c606e]">•</span>
                    <span>Khuyến khích bạn <strong>quay video khi claim</strong> để bảo vệ tối đa quyền lợi của mình.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#5c606e]">•</span>
                    <span>Nếu đã gửi quá <strong>48h</strong> mà link bị hết hạn, shop xin phép sẽ không bảo hành nữa.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#5c606e]">•</span>
                    <span>Hàng thuộc dạng <strong>Legal Paid</strong> nên không lo bị revoke. <strong>100% đổi mới</strong> nếu phát sinh sự cố bị revoke.</span>
                  </li>
                </ul>
              </div>
            </section>

            <hr className="border-t border-white/[0.08] my-8" />

            {/* Section 08: YouTube Premium */}
            <section id="policy-youtube" className="scroll-mt-24 mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-lg bg-[#1b1c24] border border-white/[0.08] flex items-center justify-center font-mono text-sm font-bold text-[#838896]">
                  08
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Chính Sách YouTube Premium
                </h2>
              </div>
              <ul className="space-y-2 text-sm text-[#d1d5db]">
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Bảo hành toàn bộ thời gian theo đúng gói dịch vụ bạn đã mua.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Khi bị lỗi, yêu cầu cung cấp đầy đủ: <strong>Bill từ bot, email của bạn, và email chủ family</strong> để shop tiến hành hỗ trợ bảo hành.</span>
                </li>
              </ul>
            </section>

            <hr className="border-t border-white/[0.08] my-8" />

            {/* Section 09: Spotify Premium */}
            <section id="policy-spotify" className="scroll-mt-24 mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-lg bg-[#1b1c24] border border-white/[0.08] flex items-center justify-center font-mono text-sm font-bold text-[#838896]">
                  09
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Chính Sách Spotify Premium
                </h2>
              </div>
              <ul className="space-y-2 text-sm text-[#d1d5db]">
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Bảo hành toàn bộ thời gian theo đúng gói dịch vụ bạn đã mua.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Khi bị lỗi, yêu cầu cung cấp: <strong>Bill từ bot và hình ảnh chụp màn hình bị mất Premium</strong> để shop bảo hành nhanh chóng.</span>
                </li>
              </ul>
            </section>

            <hr className="border-t border-white/[0.08] my-8" />

            {/* Section 10: Netflix Premium */}
            <section id="policy-netflix" className="scroll-mt-24 mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-lg bg-[#1b1c24] border border-white/[0.08] flex items-center justify-center font-mono text-sm font-bold text-[#838896]">
                  10
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Chính Sách Netflix Premium
                </h2>
              </div>
              <ul className="space-y-2 text-sm text-[#d1d5db]">
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Tài khoản được <strong>bảo hành đúng số tháng (số ngày)</strong> bạn mua kể từ ngày giao dịch.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5c606e] font-bold">•</span>
                  <span>Cam kết bảo hành full time cho tài khoản của bạn trong suốt quá trình đăng ký gói.</span>
                </li>
              </ul>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
