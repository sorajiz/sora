'use client';

import React from 'react';
import { ArrowDown, MessageSquare } from 'lucide-react';

interface HeroProps {
  storeName?: string;
  tagline?: string;
  subtitle?: string;
  discordUrl?: string;
}

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
    <section className="relative pt-16 pb-12 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto">
      {/* Decorative subtle badge - 1 ornamental element with <= 3 glyphs (§S11b) */}
      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[var(--ink)] border border-[var(--line)] text-xs text-[var(--ash)] mb-6 shadow-sm">
        <span>ghé một chút, chọn điều bạn thích</span>
        <span className="text-[var(--silver-accent)]">♡</span>
      </div>

      {/* Main Hero Heading */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--white)] mb-4 font-display">
        {storeName}
      </h1>

      <p className="text-lg sm:text-xl text-[var(--off-white)] font-normal max-w-xl mx-auto mb-2">
        {tagline}
      </p>

      <p className="text-sm text-[var(--text-2)] max-w-md mx-auto mb-8 font-light">
        {subtitle}
      </p>

      {/* Hero Buttons (clean text without inner decoration per §S11b) */}
      <div className="flex flex-wrap items-center justify-center gap-3.5">
        <button
          onClick={scrollToMenu}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[var(--off-white)] text-[var(--void)] font-semibold text-sm hover:bg-[var(--white)] transition-all shadow-md active:scale-95"
        >
          <span>Browse Menu</span>
          <ArrowDown className="w-4 h-4" />
        </button>

        <a
          href={discordUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[var(--ink)] hover:bg-[var(--graphite)] text-[var(--white)] font-medium text-sm border border-[var(--line)] transition-all active:scale-95"
        >
          <MessageSquare className="w-4 h-4 text-[var(--silver-dim)]" />
          <span>Join Discord</span>
        </a>
      </div>

      {/* Decorative brand wave line (§S14) */}
      <div className="mt-10 flex items-center justify-center space-x-2 text-[var(--ash)] text-xs select-none">
        <span>〰〰〰〰〰〰</span>
        <span className="text-[var(--silver-dim)]">′ 〰 ❜ ､ Pade Store ､ ❛ //</span>
        <span>〰〰〰〰〰〰</span>
      </div>
    </section>
  );
}
