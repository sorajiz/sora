---
name: pade-menu-oauth
description: Discord OAuth2 PKCE flow, server-side session management, virtual OWNER tier derivation, and snowflake string precision rules.
---

# Pade Menu OAuth2 & RBAC

## 1. Discord OAuth2 Flow (§5.1)
- Scope: `identify` only.
- Authorization Code Flow with PKCE S256 (`code_verifier` and `code_challenge`).
- `state`: Cryptographically random, single-use, bound to HttpOnly cookie.
- Open Redirect Prevention: `validateReturnTo` strictly allows same-origin relative paths starting with `/`, rejecting `//` or backslashes.
- Token Disposal: Discord access tokens are used once to fetch user identity and immediately discarded. Never stored in DB or browser.

## 2. Server-side Session Management (§5.2)
- Stored in database table `menu_web_sessions`.
- Cookie: `__Host-pade_menu_session` in production (`pade_menu_session` in dev), `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`.
- Expiry: 24-hour idle expiry, 7-day absolute expiry. Session ID rotated at login.

## 3. Snowflake Precision & Virtual OWNER (§S3, §S11)
- **Snowflakes are strings.** The owner ID `386528085681635328` exceeds `Number.MAX_SAFE_INTEGER`. Never cast snowflakes to `Number()`.
- **Virtual OWNER:** Derived dynamically per request via string equality `user.discordId === env.PADE_OWNER_DISCORD_ID`.
- Owner cannot be demoted, cannot lose access via role changes, and has zero revocable rows in DB.
- Regular members and guests receive 403 Forbidden on all `/admin` routes and server actions.

## 4. Key File Pointers
- OAuth: [apps/menu/lib/auth/oauth.ts](file:///c:/Users/ADMIN/.gemini/antigravity-ide/scratch/sora/apps/menu/lib/auth/oauth.ts)
- Session: [apps/menu/lib/auth/session.ts](file:///c:/Users/ADMIN/.gemini/antigravity-ide/scratch/sora/apps/menu/lib/auth/session.ts)
- RBAC: [apps/menu/lib/auth/rbac.ts](file:///c:/Users/ADMIN/.gemini/antigravity-ide/scratch/sora/apps/menu/lib/auth/rbac.ts)
- Middleware: [apps/menu/middleware.ts](file:///c:/Users/ADMIN/.gemini/antigravity-ide/scratch/sora/apps/menu/middleware.ts)
