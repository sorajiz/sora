# Pade Store Menu Website V2 — Progress & Checkpoints

Last Updated: 2026-10-18
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
- [x] **Phase 11: Visual Refresh (Mono / Gradient / Waves)** — premium dark UI/UX pass over the `apps/menu` storefront
- [x] **Phase 12: Live Menu FX Refresh** — same mono/gradient/wave language applied to the **actually deployed** page
- [x] **Phase 13: Gradient Waves + Mobile / Morph-Menu Cleanup** — waves rebuilt to scale with the viewport, chip bar removed ≤959px, morph header + Discord row dropped

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

---

## Phase 12: Live Menu FX Refresh (deployment-topology correction)

**Finding (important):** the publicly served `menu.sorae.tokyo` page is **not** `apps/menu`. The live
document is produced by the **root Vercel deployment**:

```
views/menu.ejs  ──(scripts/build.js)──▶  dist/menu.html
vercel.json: host menu.sorae.tokyo ──rewrite──▶ /menu.html     (+ /api/menu → dist/api/menu.js)
```

Evidence: the live HTML has no `/_next/static/*` chunks, and it does contain the inline
`PADE STORE PREMIUM DESIGN SYSTEM` `<style>` plus `btn-morph-menu` / `ambient-bloom` markup, i.e. the
EJS template. `apps/menu` (Phase 2–11) remains a parallel, not-yet-served migration target and was
left untouched by Phase 12.

**Scope:** `views/menu.ejs` only (self-contained page: inline `<style>` at `:34`, body at `:1471`,
inline `<script>` at the end). EJS templates are rendered **as-is** into `dist/`; the root
`minifyCss` pipeline only applies to `style.css`, so the inline FX layer is not minified — which is
why the wave `url("data:image/svg+xml,…")` payloads survive intact.

**Premium FX layer appended to the existing system** (nothing was rewritten; the new block is last,
so it refines the base rules without breaking the markup contract):

- **Ambient FX** — `.pade-fx` stage (`position: fixed`, `z-index: 0`, `pointer-events: none`):
  `.fx-aurora` light pool, **3 seamless wave bands**, `.fx-grid` (68px, radially masked), `.fx-grain`
  (5% `feTurbulence`).
- **Seamless waves** — each band is `width: calc(100% + 1440px)` with a `repeat-x` 1440px tile and
  loops by exactly one period (`@keyframes fx-wave { to { transform: translateX(-1440px) } }`).
  Because the shift is a whole period, the loop cannot seam at any viewport width — no
  percentage/tile mismatch and no empty strip on ultra-wide screens. Durations 31s / 21s / 15s give
  parallax; each tile is a gradient-filled sine band whose trailing edge fades to transparent.
- **Aurora** — `.ambient-bloom` / `.ambient-accent` re-tuned to silver-only radial pools with
  `transform`-only drift (28s / 34s alternate).
- **Gradient borders** — product cards and dialogs switch to the
  `padding-box` + `border-box` double-background trick, brightening on hover.
- **Pointer spotlight** — `--mx` / `--my` written from a single delegated, rAF-throttled
  `pointermove` listener on `#productGrid` (survives every re-render, no per-card listener).
- **Gradient-metal type** — navbar wordmark, `#activeCategoryTitle`, card price and modal price use
  `background-clip: text` over the silver→white gradient.
- **Glass surfaces** — navbar, sidebar, morph dropdown and toast only (backdrop-filter rule kept).
- **Hairlines** — `--grad-hair` (centre-bright) under the navbar, sidebar header, main header,
  modal price bar and card pricing row.
- **Scroll progress hairline** — 2px `scaleX()` bar driven by one passive scroll listener.
- **Strict monochrome pass** — every remaining hue was removed or overridden: badges
  (sale = solid white, tag = silver, draft = dashed, sold-out = dim), role chips, `.btn-admin-create`,
  `.btn-admin-preview.active`, `.btn-discord` + its morph-menu entry (Discord blue → silver), the
  delete-confirm red → white outline, and both `accent-color: #ec4899` checkboxes. `--pink-soft` /
  `--pink-dim` are re-pointed to silver.

**Accessibility & performance:** all animation is `transform` / `opacity`; bands carry
`will-change: transform` + `backface-visibility: hidden` to stay on the compositor; a single
`@media (prefers-reduced-motion: reduce)` block disables aurora drift, waves, card rise, sheen and
toast pulse and also neutralises the nav CTA lift. The spotlight writes CSS variables only.

**Verification:** `npm run build` → `dist/menu.html` rebuilt (0 unrendered EJS markers; inline
`<style>` braces balanced 315/315; 6 keyframe blocks; both `<script>` tags present); all four
`data:image/svg+xml` payloads decode and are well-formed; `npm test` → 41 + 7 passing.

**Commit:** `2469cdb` on `main` (1 file, +729 / −7).

---

## Phase 13: Gradient Waves + Mobile / Morph-Menu Cleanup

**Scope:** the live page only — `views/menu.ejs` (the root Vercel deployment served at
`menu.sorae.tokyo`). `apps/menu` remains untouched. Follow-up to five screenshots from the user.

**1. Background rebuilt as a real "Gradient Waves" stack.** The Phase 12 waves read as one dark
hill on a phone because a single 1440px period is wider than the viewport, the fills faded
*downward* (bright crest → transparent bottom, which inverts the classic look), and a bottom-left
ambient pool competed with the bands. The replacement is a four-layer stack:

- `--wp` (wave period) is now a token: `1100px` desktop, `860px` ≤959px, `620px` ≤640px, with
  `height: calc(var(--wp) / 4)` and `background-size: var(--wp) auto` — the waves scale with the
  screen instead of being cropped by it, so a phone sees crests rather than a 1/3-period sweep.
- Every layer is phase-shifted (`background-position-x: -170px / -340px / -510px`), so the four
  crests sit at different heights and horizontal offsets and read as stacked waves.
- Each tile is a silver/white gradient fill with stops `bright edge → body → base`
  (e.g. `.22 → .10 → .05`): the crest keeps a lit leading edge and the overlapping fills accumulate
  downward into a genuine vertical gradient (#141414 → #2d2d2d over the void #060607).
- Seamlessness is still exact (one whole period per loop). Because a custom property inside
  `@keyframes` is resolved once per animation instance — and would seam if `--wp` changed on resize —
  the `fx-wave` distance is declared explicitly per breakpoint and must stay in sync with `--wp`.
- `.ambient-accent` moved from the bottom-left to the top-left so the bottom of the page belongs to
  the waves; `fx-grid` overlay opacity lowered `0.035 → 0.024`.

**2. Mobile fit (image 2).** Verified with headless Chrome + CDP at 360 / 390 / 820 / 1440 px:
`scrollWidth === clientWidth`, empty overflow-offender list, `2 × 180px` grid at 390px. The visible
clipping in the screenshot was the oversized wave mass, not layout overflow.

**3. Category chip row removed on small screens (image 3).** `.mobile-category-bar` is now
`display: none !important` at ≤959px. The morph menu lists every category with its product count and
the morph button is visible from 959px down (`.btn-morph-menu` only hides at `min-width: 960px`), so
category navigation is unaffected.

**4. Discord row removed from the morph menu (image 4).** The divider + "Discord Pade Store" community
link block was deleted from the dropdown renderer.

**5. Morph-menu header removed (image 5).** The "Pade Store" brand row and its ✕ button are gone from
the markup; the dropdown is now just the list (padding tightened to `0.6rem`). Closing still works via
the backdrop, and the morph button itself morphs into an ✕ while open.

**Verification:** `npm run build` → `dist/menu.html` (0 unrendered EJS markers; inline `<style>`
braces balanced 325/325; 5 `data:image/svg+xml` payloads; `--wp` declared 3×; `fx-waveband-4` present;
0 occurrences of "Discord Pade Store"; no `morph-menu-header` markup left). CDP runs at
360/390/820/1440 px confirm no horizontal overflow, the hidden chip bar, the headerless 11-row morph
list, and the per-breakpoint wave geometry (155 / 215 / 275px tall deltas for 620 / 860 / 1100px
periods). Mobile, desktop and morph-open screenshots were visually reviewed.

**Audit-vocabulary note (resolved):** `scripts/test-menu-api.js` step 7 originally asserted
`PRODUCT_CREATE` / `PRODUCT_EDIT` / `PRODUCT_ARCHIVE`, while the Express admin API writes the bare
`CREATE` / `EDIT` / `ARCHIVE` (`lib/menu/admin.js`) and the Next admin app writes yet another dialect
(`CREATE_PRODUCT` / `UPDATE_PRODUCT` / `ARCHIVE_CATEGORY`). Commit `f57ea95` aligned the test with what
the API and store actually record (the entity is implied by `product_id` / `category_id` on the same
row), so `npm test` is green again. The remaining three-dialect drift in `menu_audit_logs` is
historical and left as-is (audit rows are immutable); new write paths should pick one vocabulary.

**Uncommitted but untouched:** `scripts/catalog.json` and `scripts/seed-catalog.js` have pending
working-tree changes (a database catalog export, v30 → v67) that predate this work and are unrelated
to the UI; they were left as found and excluded from the commit.

**Commit:** `040573b` on `main` (1 file, +62 / −66).


