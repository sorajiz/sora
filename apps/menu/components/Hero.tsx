'use client';

import React from 'react';
import { ArrowDown, MessageSquare, RefreshCw, ShieldCheck, Ticket } from 'lucide-react';

interface HeroProps {
  storeName?: string;
  tagline?: string;
  subtitle?: string;
  discordUrl?: string;
}

const HERO_FEATURES = [
  { icon: RefreshCw, title: 'Live menu', copy: 'đồng bộ trực tiếp' },
  { icon: Ticket, title: 'Discord ticket', copy: 'mở ngay trong server' },
  { icon: ShieldCheck, title: 'Hỗ trợ 24/7', copy: 'bảo hành uy tín' },
] as const;

export function Hero({
  storeName = 'PADE STORE',
  tagline = 'a little menu / for things you love 𐙚',
  subtitle = 'products & services, kept simple.',
  discordUrl = 'https://discord.gg/pade',
}: HeroProps) {
  const scrollToMenu = () => {
    const element = document.getElementById('catalog-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative pt-20 pb-14 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto overflow-visible">
      {/* Soft silver halo behind the headline */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-10 h-80"
        style={{
          background:
            'radial-gradient(ellipse 55% 100% at 50% 0%, rgba(208,211,217,0.13), transparent 72%)',
        }}
        aria-hidden="true"
      />

      <div className="relative">
        {/* Single ornamental badge (1 glyph, within decorative budget) */}
        <div className="pade-badge-soft inline-flex items-center gap-2.5 rounded-full px-3.5 py-1.5 text-[11px] mb-7 animate-rise-in">
          <span className="pade-dot-live" />
          <span className="text-[var(--text-2)] tracking-wide">ghé một chút, chọn điều bạn thích</span>
          <span className="text-[var(--silver-accent)]">♡</span>
        </div>

        {/* Main headline with animated silver sheen */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-5 font-display animate-rise-in">
          <span className="pade-shine-text">{storeName}</span>
        </h1>

        <p className="text-lg sm:text-xl text-[var(--off-white)] font-normal max-w-xl mx-auto mb-2">
          {tagline}
        </p>

        <p className="text-xs sm:text-sm text-[var(--ash)] max-w-md mx-auto mb-9 font-light tracking-[0.14em] uppercase">
          {subtitle}
        </p>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3.5">
          <button
            onClick={scrollToMenu}
            className="pade-btn pade-btn-primary pade-btn-sheen px-6 py-3 text-sm"
          >
            <span>Browse Menu</span>
            <ArrowDown className="w-4 h-4" />
          </button>

          <a
            href={discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pade-btn pade-btn-ghost px-5 py-3 text-sm"
          >
            <MessageSquare className="w-4 h-4 text-[var(--silver-dim)]" />
            <span>Join Discord</span>
          </a>
        </div>

        {/* Feature strip */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-2xl mx-auto">
          {HERO_FEATURES.map(({ icon: Icon, title, copy }) => (
            <div
              key={title}
              className="pade-panel--soft rounded-xl px-3.5 py-3 flex items-center gap-3 text-left transition-colors hover:border-[var(--line-strong)]"
            >
              <span className="w-8 h-8 shrink-0 rounded-lg bg-[var(--graphite)] border border-[var(--line)] flex items-center justify-center">
                <Icon className="w-3.5 h-3.5 text-[var(--silver-accent)]" />
              </span>
              <span className="flex flex-col leading-tight min-w-0">
                <span className="text-xs font-semibold text-[var(--white)] truncate">{title}</span>
                <span className="text-[11px] text-[var(--ash)] font-light truncate">{copy}</span>
              </span>
            </div>
          ))}
        </div>

        {/* Single ornamental divider line */}
        <div className="mt-12 flex items-center gap-4 select-none max-w-md mx-auto">
          <span className="pade-divider flex-1" />
          <span className="pade-kicker text-[var(--silver-dim)] whitespace-nowrap">
            Pade Store ｡ products
          </span>
          <span className="pade-divider flex-1" />
        </div>
      </div>
    </section>
  );
}
