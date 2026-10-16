'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { DiscordPayload, DiscordSelectOption } from '../lib/render/discord-payload';
import { getEmojiCdnUrl } from '../lib/domain/emoji';
import { ChevronDown, AlertCircle } from 'lucide-react';

interface DiscordComponentsProps {
  payload: DiscordPayload;
}

export function DiscordComponents({ payload }: DiscordComponentsProps) {
  const [selectOpen, setSelectOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<DiscordSelectOption | null>(null);

  const embed = payload.embeds[0];
  const selectComponent = payload.components[0]?.components?.find((c: any) => c.type === 3);
  const options: DiscordSelectOption[] = selectComponent?.options || [];

  return (
    <div className="w-full rounded-xl bg-[#313338] text-[#dbdee1] p-4 text-sm font-sans shadow-lg border border-[#3f4147]">
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#3f4147] text-[11px] text-[#949ba4]">
        <span>#menu</span>
        <span className="text-[10px] italic">Discord Preview — approximation, Discord is the final authority</span>
      </div>

      {/* Embed Container */}
      {embed && (
        <div className="rounded-lg bg-[#2b2d31] border-l-4 border-[#5865f2] p-4 mb-3 space-y-3">
          {embed.title && (
            <h3 className="text-base font-bold text-white tracking-tight">
              {embed.title}
            </h3>
          )}

          {embed.description && (
            <div className="text-xs text-[#dbdee1] whitespace-pre-wrap leading-relaxed font-light">
              {embed.description}
            </div>
          )}

          {embed.thumbnail && (
            <div className="mt-2 w-16 h-16 relative rounded overflow-hidden">
              <Image src={embed.thumbnail.url} alt="thumbnail" fill className="object-cover" />
            </div>
          )}
        </div>
      )}

      {/* Select Menu Component */}
      {selectComponent && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setSelectOpen(!selectOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded bg-[#1e1f22] hover:bg-[#232428] border border-[#232428] text-xs text-white transition-colors"
          >
            <div className="flex items-center space-x-2 truncate">
              {selectedOption?.emoji && (
                selectedOption.emoji.id ? (
                  <img
                    src={getEmojiCdnUrl(selectedOption.emoji.id, selectedOption.emoji.animated)}
                    alt={selectedOption.emoji.name}
                    className="w-4 h-4 object-contain inline-block"
                  />
                ) : (
                  <span>{selectedOption.emoji.name}</span>
                )
              )}
              <span className={selectedOption ? 'text-white' : 'text-[#949ba4]'}>
                {selectedOption ? selectedOption.label : selectComponent.placeholder || 'Chọn sản phẩm...'}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-[#949ba4] shrink-0" />
          </button>

          {/* Expanded Options Menu */}
          {selectOpen && (
            <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded bg-[#2b2d31] border border-[#1e1f22] shadow-2xl z-50 py-1">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setSelectedOption(opt);
                    setSelectOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-[#35373c] text-xs flex flex-col space-y-0.5 border-b border-[#35373c]/40 last:border-0"
                >
                  <div className="flex items-center space-x-2 font-medium text-white">
                    {opt.emoji && (
                      opt.emoji.id ? (
                        <img
                          src={getEmojiCdnUrl(opt.emoji.id, opt.emoji.animated)}
                          alt={opt.emoji.name}
                          className="w-4 h-4 object-contain"
                        />
                      ) : (
                        <span>{opt.emoji.name}</span>
                      )
                    )}
                    <span>{opt.label}</span>
                  </div>
                  {opt.description && (
                    <span className="text-[11px] text-[#949ba4] font-light pl-6 truncate">
                      {opt.description}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
