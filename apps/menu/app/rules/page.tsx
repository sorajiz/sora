import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '../../components/Navbar';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Server Rules · Pade Community',
  description: 'Nội quy và quy chuẩn cộng đồng chính thức tại máy chủ Pade Discord · discord.gg/pade',
};

export default function RulesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0c0d12] text-[#f1f2f6]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        {/* Subdomain Header Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-1 p-1 bg-white/[0.035] border border-white/[0.08] rounded-full">
            <Link
              href="/rules"
              className="px-4 py-1.5 rounded-full text-xs font-bold text-white bg-[#21232d] shadow-sm"
            >
              Server Rules
            </Link>
            <Link
              href="/tos"
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#838896] hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/tutorial"
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#838896] hover:text-white transition-colors"
            >
              Tutorial
            </Link>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Left Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0 lg:sticky lg:top-24">
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
          <main className="flex-1 max-w-3xl">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#838896] block mb-2">
              NỘI QUY MÁY CHỦ
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
                  <span>Các đơn hàng sẽ hoàn thành trong vòng <strong>48h</strong>.</span>
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
                  <h3 className="text-sm font-bold text-white mb-2">📌 Khi Tạo Ticket:</h3>
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
                  <h3 className="text-sm font-bold text-white mb-2">🔒 Khi Close Ticket:</h3>
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
                  <h3 className="text-sm font-bold text-white mb-2">⚖️ Luật Ticket:</h3>
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
                  <h3 className="text-sm font-bold text-white mb-2">🎯 Giveaway Có Yêu Cầu (Req):</h3>
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
                  <h3 className="text-sm font-bold text-white mb-2">✨ Giveaway Không Req:</h3>
                  <p className="text-sm text-[#d1d5db]">
                    Nếu giveaway không có yêu cầu nào, các bạn chỉ cần tham gia (join) như bình thường.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#13141a] border border-white/[0.08]">
                  <h3 className="text-sm font-bold text-white mb-2">📋 Quy Chế Nhận Giải Giveaway:</h3>
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
