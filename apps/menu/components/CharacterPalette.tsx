'use client';

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface CharacterPaletteProps {
  onInsert: (char: string) => void;
}

const BRAND_CHARACTERS = [
  { char: '𐙚', label: 'bow' },
  { char: '⋆', label: 'star' },
  { char: '✧', label: 'sparkle' },
  { char: '﹏', label: 'soft wave' },
  { char: '〰', label: 'wave' },
  { char: '⟡', label: 'diamond' },
  { char: '𖦹', label: 'spiral' },
  { char: '♡', label: 'heart' },
  { char: '❝', label: 'quote left' },
  { char: '❜', label: 'quote right' },
  { char: '⌒⌒', label: 'double arc' },
  { char: '𓆩', label: 'wing left' },
  { char: '𓆪', label: 'wing right' },
  { char: '𓍼', label: 'curl' },
  { char: '⏜', label: 'arc top' },
  { char: '╰', label: 'corner' },
  { char: '»', label: 'arrow' },
];

export function CharacterPalette({ onInsert }: CharacterPaletteProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[var(--graphite)] hover:bg-[var(--steel)] border border-[var(--line)] text-xs text-[var(--silver-accent)] transition-colors"
        title="Bảng ký tự đặc biệt Pade Store"
      >
        <Sparkles className="w-3.5 h-3.5 text-[var(--silver-dim)]" />
        <span>Characters</span>
      </button>

      {open && (
        <div className="absolute left-0 mt-1.5 p-3 w-64 rounded-xl bg-[var(--ink)] border border-[var(--line)] shadow-2xl z-50 animate-scale-in">
          <div className="text-[11px] font-semibold text-[var(--ash)] mb-2 uppercase tracking-wider flex items-center justify-between">
            <span>Ký tự Pade</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[10px] text-[var(--silver-dim)] hover:text-white"
            >
              Đóng
            </button>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {BRAND_CHARACTERS.map(({ char, label }) => (
              <button
                key={char}
                type="button"
                onClick={() => {
                  onInsert(char);
                  setOpen(false);
                }}
                className="h-8 rounded-lg bg-[var(--graphite)] hover:bg-[var(--steel)] border border-[var(--line)] flex items-center justify-center text-sm text-[var(--white)] hover:scale-105 active:scale-95 transition-all"
                title={label}
              >
                {char}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
