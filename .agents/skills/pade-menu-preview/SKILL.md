---
name: pade-menu-preview
description: Live preview engine, Discord Components V2 rendering parity, golden fixtures verification, and brand character insertion.
---

# Pade Menu Live Preview & Discord Parity

## 1. Golden Parity Engine (§9, §S12)
- Pure function `renderDiscordMenuPayload(vm)` in [apps/menu/lib/render/discord-payload.ts](file:///c:/Users/ADMIN/.gemini/antigravity-ide/scratch/sora/apps/menu/lib/render/discord-payload.ts).
- Produces byte-identical Discord Components V2 JSON payloads compared to the Go Discord bot.
- Verified by unit tests against `contracts/menu/fixtures/render/golden.json`.

## 2. Multi-Surface Live Preview Tabs
- **Website Preview:** Instant render of `ProductCard` and quick-view drawer.
- **Discord Preview:** Rendered via `<DiscordComponents>` matching Discord's dark UI skin, container accent bar, and select menu states.
- **Mobile Preview:** 390px viewport container query simulation without using iframe overhead.

## 3. Emoji & Brand Characters (§10, §S5)
- Custom Discord emojis `<:name:id>` and `<a:name:id>` resolved against `menu_emoji_catalog`.
- Discord CDN preview URLs: `https://cdn.discordapp.com/emojis/<id>.<webp|gif>?size=48`.
- Characters palette component [apps/menu/components/CharacterPalette.tsx](file:///c:/Users/ADMIN/.gemini/antigravity-ide/scratch/sora/apps/menu/components/CharacterPalette.tsx) allows one-click insertion of verified renderable glyphs at cursor position.

## 4. Key File Pointers
- Payload Builder: [apps/menu/lib/render/discord-payload.ts](file:///c:/Users/ADMIN/.gemini/antigravity-ide/scratch/sora/apps/menu/lib/render/discord-payload.ts)
- Discord Components: [apps/menu/components/DiscordComponents.tsx](file:///c:/Users/ADMIN/.gemini/antigravity-ide/scratch/sora/apps/menu/components/DiscordComponents.tsx)
- Character Palette: [apps/menu/components/CharacterPalette.tsx](file:///c:/Users/ADMIN/.gemini/antigravity-ide/scratch/sora/apps/menu/components/CharacterPalette.tsx)
- Golden Fixtures: [contracts/menu/fixtures/render/golden.json](file:///c:/Users/ADMIN/.gemini/antigravity-ide/scratch/sora/contracts/menu/fixtures/render/golden.json)
