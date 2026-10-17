# Pade Store Menu Website V2 — Progress & Checkpoints

Last Updated: 2026-10-17
Status: COMPLETE (All Core Items Verified, C-D Manual Steps Documented)
Branch: main

## Phase Status Summary

- [x] **Phase 0: Audit** — `docs/menu/AUDIT.md` (Workspace, DB, domains, auth, infra)
- [x] **Phase 1: Decisions** — `docs/menu/decisions.md` (ADR-001 through ADR-007)
- [x] **Phase 2: Foundations** — `contracts/menu/`, `apps/menu` Next.js skeleton, env schema, DB client, tokens, additive migration `00005_menu_contract_v2.sql`
- [x] **Phase 3: Auth & RBAC** — Discord OAuth (PKCE, state, safe returnTo), server sessions, virtual OWNER string equality, admin grants lookup
- [x] **Phase 4: Public Page** — `/` one-page catalog, accent-insensitive search, filter chips, quick-view drawer (`?product=` history pushState), brand theme
- [x] **Phase 5: Admin Workspace** — `/admin/menu`, optimistic concurrency (expected_version), field diffs, categories, settings, sync tab, audit logs
- [x] **Phase 6: Preview Engine** — Live Website / Discord / Mobile preview, Discord Components V2, emoji & characters palette, golden parity
- [x] **Phase 7: Sync & Realtime** — Micro-version endpoint `/api/menu/version` (ETag 304), LiveSync with visibility pause, outbox, signed revalidate, bot-offline tolerance
- [x] **Phase 8: Hardening** — CSP, XSS inertness, presigned direct R2 uploads with binary magic-byte sniffing (SVG rejected), scale benchmarks
- [x] **Phase 9: Build & Deployment** — `apps/menu/vercel.json`, `scripts/vercel-ignore-menu.js`, production `next build` (109 kB First Load JS), `MANUAL-STEPS.md`
- [x] **Phase 10: Skills, Verification & Report** — 7 agent skills in `.agents/skills/`, contract verification (0 drift), full evidence report
- [x] **Phase 11: Visual Refresh (Mono / Gradient / Waves)** — premium dark UI/UX pass over the public storefront

---

## Phase 11: Visual Refresh — Mono / Gradient / Waves

**Scope:** `apps/menu` public storefront only (navbar, hero, catalog, quick-view, footer, ambient
background). Admin workspace, contract, render engine, auth, sync and API surfaces are untouched.

**Palette discipline (unchanged intent, refreshed values):** void `#050506`, ink `#0b0b0e`,
graphite `#131317`, steel `#1c1c22`; hairlines `--line` / `--line-soft` / `--line-strong`; type
`--white` / `--off-white` / `--text-2` / `--ash`; silver accents `--silver-accent` `#d0d3d9`,
`--silver-dim` `#9a9da5`, `--silver-deep` `#6a6d75`. Still strictly monochrome: no neon, no RGB
cycles, no purple/blue SaaS gradients.

**New ambient background stack** (`components/AmbientBackgroundFX.tsx`, a server component so it
ships 0 kB of JS):

1. **Aurora** — three large drifting silver light pools, `transform`-only animation (34s/46s/56s
   alternating), `will-change: transform`.
2. **Waves** — seamless tiled inline SVG bands (3 layers: back fill, mid stroke, front fill) with
   `vector-effect: non-scaling-stroke`, drifting at 46s/32s/22s via a `-1440px` loop matching the
   1440-unit wave period, so the loop is visually seamless. A downward mask dissolves them into the
   void.
3. **Grid** — 64px engineer grid, radially masked so it only reads near the top.
4. **Grain** — ~4% static `feTurbulence` grain to defeat gradient banding (deliberately *without*
   `mix-blend-mode`, which would force full-page repaint on scroll).

**New component language in `globals.css`:**

- `.pade-card` — gradient-border surface (`padding-box` + `border-box`) with a **pointer-tracking
  spotlight** driven by CSS custom properties (`--mx` / `--my` set through CSSOM in `ProductCard`, no
  re-render) plus a lift + silver rim on hover.
- `.pade-dialog` — gradient-border dialog shell with deep shadow (no hover transform).
- `.pade-glass` — frosted hairline panel, restricted to small surfaces only (navbar, menu dropdown,
  live-sync toast) per the backdrop-filter rule.
- `.pade-btn` / `.pade-btn-primary` / `.pade-btn-ghost` / `.pade-btn-sheen` — silver→white gradient
  primary face, hairline ghost, and a transform-only sheen sweep on hover.
- `.pade-chip` / `.pade-chip--active`, `.pade-input`, `.pade-panel`, `.pade-panel--soft`,
  `.pade-divider`, `.pade-kicker`, `.pade-mono`, `.pade-badge-hot`, `.pade-badge-soft`,
  `.pade-dot-live`, `.scrollbar-none`, `.pade-mask-fade-x`.
- `.pade-shine-text` — animated silver sweep across the hero headline.

**Component changes:**

| File | Change |
| --- | --- |
| `app/globals.css` | Full design-system rewrite: tokens, surfaces, controls, keyframes, refined scrollbars, reduced-motion collapse |
| `app/layout.tsx` | Renders `AmbientBackgroundFX`; adds `viewport` export (`themeColor` `#050506`, `colorScheme: dark`) |
| `components/AmbientBackgroundFX.tsx` | **New** — aurora + waves + grid + grain, server-rendered |
| `components/Navbar.tsx` | Glass nav, gradient hairline base, logo mark, animated link underlines, sheened primary login CTA |
| `components/Hero.tsx` | Silver-sheen headline, live badge, sheened CTAs, 3-up feature strip, single ornamental divider |
| `components/ProductCard.tsx` | Pointer spotlight, gradient rim, image vignette, sticky quick-view pill, gradient primary CTA |
| `components/MenuExplorer.tsx` | Control-deck panel, focus-glow search, **Ctrl/Cmd+K** focus shortcut (makes the hint truthful), `aria-pressed` chips, result counter, reset-filters, redesigned empty state, 3-up feature strip |
| `components/QuickPreviewModal.tsx` | Gradient-border dialog, discount badge, soft price panel, sheened ticket CTA |
| `components/LiveSync.tsx` | Glass toast with gradient hairline + pulsing live dot |
| `app/page.tsx` | Section header, upgraded error state card, footer with logo mark, gradient hairline and bottom glow |

**Decorative budget (§S11b) honoured:** at most one ornamental line and ≤3 decorative glyphs per
text block; no ornaments inside buttons, inputs or select labels.

**Accessibility & performance:**

- All motion is `transform` / `opacity` only; no layout-affecting animations remain (the sheen was
  converted from animated `left` to `translateX`).
- `prefers-reduced-motion` disables every animation and the aurora/wave drift explicitly.
- Pointer spotlight writes CSS variables only; no React re-render, no `dangerouslySetInnerHTML`, no
  new external resource. Inline SVG waves are author-authored markup, not user content, so the CSP
  and XSS posture is unchanged.
- Grid items keep `content-visibility: auto`.

**Verification:** `npm run typecheck` clean · `vitest run` 27/27 passing (contract, money, rbac,
render parity, signature, text) · `next build` compiled successfully, `/` First Load JS **112 kB**
(7.91 kB route) · production server returns `200` with aurora, wave, grid, shine and spotlight
markup present in the HTML.


