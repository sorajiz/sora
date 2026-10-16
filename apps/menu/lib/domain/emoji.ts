/**
 * Pade Store Emoji Handling & Parsing (§S5)
 * Static: <:name:id>
 * Animated: <a:name:id>
 * Native: Unicode emoji glyphs
 */

export interface ParsedDiscordEmoji {
  raw: string;
  name: string;
  id: string | null;
  animated: boolean;
  isCustom: boolean;
  cdnUrl?: string;
}

const CUSTOM_EMOJI_REGEX = /^<(a)?:([A-Za-z0-9_]{2,32}):(\d{17,20})>$/;

export function parseEmojiInput(input: string | null | undefined): ParsedDiscordEmoji | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  const match = trimmed.match(CUSTOM_EMOJI_REGEX);
  if (match) {
    const animated = Boolean(match[1]);
    const name = match[2];
    const id = match[3];
    const ext = animated ? "gif" : "webp";
    return {
      raw: trimmed,
      name,
      id,
      animated,
      isCustom: true,
      cdnUrl: `https://cdn.discordapp.com/emojis/${id}.${ext}?size=48&quality=lossless`,
    };
  }

  // Native Unicode emoji
  return {
    raw: trimmed,
    name: trimmed,
    id: null,
    animated: false,
    isCustom: false,
  };
}

export function formatEmojiTag(emoji: { name: string; id?: string | null; animated?: boolean }): string {
  if (!emoji.id) {
    return emoji.name;
  }
  const prefix = emoji.animated ? "a" : "";
  return `<${prefix}:${emoji.name}:${emoji.id}>`;
}

export function getEmojiCdnUrl(id: string, animated = false, size = 48): string {
  const ext = animated ? "gif" : "webp";
  return `https://cdn.discordapp.com/emojis/${id}.${ext}?size=${size}&quality=lossless`;
}
