---
name: pade-menu-ui
description: Design tokens, typography, brand glyphs, money formatting, responsive grid, and accessibility standards for Pade Store.
---

# Pade Menu UI & Design System

## 1. Visual Aesthetics & Design Tokens
- **Color Palette:** CSS variables defined in [apps/menu/app/globals.css](file:///c:/Users/ADMIN/.gemini/antigravity-ide/scratch/sora/apps/menu/app/globals.css).
  - Base: Void `#060607`, Ink `#0d0d0f`, Graphite `#151518`, Steel `#1e1e22`.
  - Borders: CardBorder `#2b2b30`.
  - Accents: Silver `#c9ccd2`, Silver-dim `#9a9da5`.
- **Prohibited Aesthetics:** No purple SaaS gradients, no neon/RGB lighting, no bright blue dashboard templates.
- **Backdrop Filters:** Restricted to small surfaces (Navbar, Dialogs), never applied full-page.

## 2. Vietnamese Typography & Glyphs (§7, §S4, §S11b)
- Fonts: `Plus_Jakarta_Sans` (Sans) with `["latin", "vietnamese"]` and `Outfit` (Display) with `["latin", "latin-ext"]`.
- Decorative Glyphs: `𓆩 𓆪 𐙚 𖦹 ⟡ ༒ 𓍼 ⋆ ✧ 〰 ⌒ ﹏ ♡ ❝ ❜ ′ ｡ ､ ﹒ ⏜ ╰ »` and combining marks `ִ ࣪`.
- Strict Decorative Budget: Maximum 1 ornamental line and at most 3 decorative glyphs per text block. Never place ornaments inside buttons, select labels, or inputs.

## 3. Brand Money Formatter (§S3)
- Brand format: `₫99.000` (symbol first, '.' as thousands separator).
- Always use `formatBrandMoney` from [apps/menu/lib/domain/money.ts](file:///c:/Users/ADMIN/.gemini/antigravity-ide/scratch/sora/apps/menu/lib/domain/money.ts).
- Never use default `Intl.NumberFormat('vi-VN')` (which places `₫` at the end).

## 4. Key File Pointers
- Styles: [apps/menu/app/globals.css](file:///c:/Users/ADMIN/.gemini/antigravity-ide/scratch/sora/apps/menu/app/globals.css)
- Card Component: [apps/menu/components/ProductCard.tsx](file:///c:/Users/ADMIN/.gemini/antigravity-ide/scratch/sora/apps/menu/components/ProductCard.tsx)
- Quick Preview Modal: [apps/menu/components/QuickPreviewModal.tsx](file:///c:/Users/ADMIN/.gemini/antigravity-ide/scratch/sora/apps/menu/components/QuickPreviewModal.tsx)
- Money Formatter: [apps/menu/lib/domain/money.ts](file:///c:/Users/ADMIN/.gemini/antigravity-ide/scratch/sora/apps/menu/lib/domain/money.ts)
