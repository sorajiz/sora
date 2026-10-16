# Architecture Decision Records (ADRs) — Pade Store Menu V2

Date: 2026-10-16  
Status: Approved  

---

## ADR-001: Web Framework & Monorepo Location
- **Context:** `menu.sorae.tokyo` must be completely isolated from `sorae.tokyo`, `transcript.sorae.tokyo`, and other existing apps. It must deploy to its own Vercel project with independent build steps.
- **Decision:** Place the application at `apps/menu` using Next.js 14 App Router with React Server Components, TypeScript strict mode, and Tailwind CSS.
- **Consequences:** Clean separation of concerns. `apps/menu` maintains its own `package.json`, `tsconfig.json`, and `vercel.json`. Zero route collisions with `sora`.

---

## ADR-002: Authentication Architecture (Discord OAuth2 + PKCE)
- **Context:** The application needs a secure, minimal authentication flow requiring only the `identify` scope. The Discord access token must be discarded immediately after fetching user profile, and session management must be strictly server-side.
- **Decision:** Implement a dedicated lightweight OAuth2 client utilizing Node's built-in `crypto` for PKCE S256 (`code_verifier`, `code_challenge`), cryptographically random state cookies, and direct exchange with `https://discord.com/api/oauth2/token` and `/users/@me`.
- **Rationale:** Avoids heavyweight dependencies and session abstraction mismatch. Enables strict adherence to cookie security (`__Host-` prefix, `HttpOnly`, `SameSite=Lax`, `Secure`), single-use state verification, and immediate token disposal.

---

## ADR-003: Session Management & Per-Request Role Derivation
- **Context:** Roles cannot be stored as mutable claims in client cookies or JWTs. The OWNER role must be immutable and derived at runtime from `PADE_OWNER_DISCORD_ID` (`386528085681635328`).
- **Decision:** Store session identifiers in the database table `menu_web_sessions` (hashed session tokens with idle and absolute expiry). Upon request, `resolveActor(session)` derives the role dynamically:
  1. If `discordId === process.env.PADE_OWNER_DISCORD_ID` (string comparison), assign `OWNER`.
  2. Otherwise, check `menu_admin_grants`.
  3. Otherwise, assign `MEMBER`.
- **Consequences:** Impossible to spoof roles via client tampering; Owner can never be demoted or locked out.

---

## ADR-004: Purchase & Ticket Flow Integration
- **Context:** The menu website should allow customers to browse and initiate purchases without requiring complex payment gateways on day one.
- **Decision:** The Quick View drawer CTA "Mua hàng / Mở Ticket" links directly to the Pade Discord server purchase channel or ticket creation entrypoint (`https://discord.gg/pade`), pre-filling the selected product SKU/Name in the URL anchor or clipboard where applicable.

---

## ADR-005: Search & Filter Performance at Scale
- **Context:** The catalog must scale smoothly from 25 to 1,000 products.
- **Decision:**
  - Active products ≤ 150: Use in-memory client-side search with pre-computed accent-folded search vectors (e.g. "ca phe" matches "cà phê"). Zero network round-trips for instant typing response.
  - Active products > 150: Seamlessly fallback to server-side debounced search queries with `pg_trgm` or accent-insensitive SQL filters.
  - Off-screen products render with `content-visibility: auto` to preserve 60fps scrolling.

---

## ADR-006: Typography & Rare Character Rendering
- **Context:** Pade Store brand text relies heavily on Vietnamese diacritics and rare decorative glyphs (`𐙚 𓆩 𖦹 𓍼 ⋆ ✧ 〰 ⌒ ﹏ ♡ ❝ ❜`). Browser tofu boxes destroy brand feel.
- **Decision:**
  - Load Google Fonts with full Vietnamese character subsets (`Plus Jakarta Sans` for UI, `Outfit` for headings).
  - Provide inline SVG renderers or fallbacks for rare decorative glyphs.
  - The admin Characters palette will only offer glyphs proven to render cleanly across modern platforms.

---

## ADR-007: Realtime Synchronization & Version Polling Cost Control
- **Context:** Open browser tabs must reflect updates made in Discord or Admin without fetching entire catalog JSON payloads on intervals.
- **Decision:**
  - Implement a micro-endpoint `GET /api/menu/version` returning only `{"version": 53}` with `ETag: "menu-v53"` and `Cache-Control: s-maxage=1, stale-while-revalidate=2`.
  - Client `LiveSync` component checks this endpoint: 1.5s interval for active admin sessions, 3s interval (with ±30% jitter) for public sessions.
  - Tab visibility listener (`document.visibilityState`) automatically pauses polling when hidden and fires an immediate check upon becoming active.
  - Catalog data is only re-fetched via Next.js Server Action / `router.refresh()` when the version integer actually changes.
