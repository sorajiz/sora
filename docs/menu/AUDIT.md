# Phase 0 Audit: Pade Store Menu Platform & Infrastructure

Date: 2026-10-16  
Auditor: Antigravity AI Engine (Advanced Agentic Pair Programmer)  
Repository: `sorajiz/sora` (Branch: `feature/pade-menu-v2`)  
Companion Repository: `src bomsito` (`c:\Users\ADMIN\Downloads\src bomsito`)

---

## 1. Workspace Shape & Existing Codebase

- **Architecture:** The current workspace (`c:\Users\ADMIN\.gemini\antigravity-ide\scratch\sora`) houses the primary Express/Vercel application serving `sorae.tokyo`, `discord.sorae.tokyo`, `timework.sorae.tokyo`, and the ticket transcripts service (`transcript.sorae.tokyo`).
- **Target Application:** `menu.sorae.tokyo` will live in `apps/menu` as a completely isolated application.
- **Package Manager:** `npm` (v11.13.0). Node.js runtime: v24.17.0.
- **Companion Bot Workspace:** `c:\Users\ADMIN\Downloads\src bomsito` contains the Go Discord bot, the canonical database migrations (`migrations/00001_...` through `00004_menu_platform_v1.sql`), and an early Next.js prototype in `apps/menu`.
- **Runtime Coupling:** None. Zero imports from root transcript or Express handlers will be present in `apps/menu`. Shared schemas and fixtures are maintained via the contract directory `contracts/menu/`.

---

## 2. Vercel Configuration & Independent Deployment

- **Root `vercel.json`:** Currently routes traffic for `sorae.tokyo`, `discord.sorae.tokyo`, and rewrites `/t/:id` ticket transcripts. It does **not** handle `menu.sorae.tokyo`.
- **Target Vercel Project:** `apps/menu` must have its own dedicated `apps/menu/vercel.json`, configured for its own independent Vercel project (`pade-menu`).
- **Independent Build Step:**
  - Vercel Root Directory: `apps/menu`
  - Vercel Ignored Build Step script: Checks git diff against HEAD^ for `apps/menu` and `contracts/menu`. If no changes in these paths, the build exits with code 0 (skip build), ensuring transcript changes never trigger menu rebuilds and menu deploys cannot affect transcript services.
- **Domain Binding:** `menu.sorae.tokyo` is mapped exclusively to the `pade-menu` Vercel project.

---

## 3. Database & Storage Architecture

- **PostgreSQL Provider:** Neon Serverless PostgreSQL (`ep-broad-resonance-b5zw62id-pooler.c-7.us-east-2.aws.neon.tech`).
  - Pooler: PgBouncer transaction-mode connection pooler on port 5432.
  - Critical Constraints: PgBouncer transaction mode disables prepared statements (`prepared: false`) and long-lived `LISTEN/NOTIFY`. The application will use direct client queries without named prepared statements and will use Redis/polling for outbox synchronization.
  - Existing Tables: `menu_categories`, `menu_products`, `menu_product_media`, `menu_settings`, `menu_state`, `menu_publications`, `menu_audit_logs`, `menu_outbox_events`.
  - Schema Ownership: DDL is owned by the Go bot repository in `migrations/`. The website never executes DDL against the shared production database.
- **Redis Provider:** Upstash Redis (or in-memory mock for local/tests). The version cache key `menu:public_version` allows rapid edge validation and 304 Not Modified collapses.
- **Object Storage (Cloudflare R2):**
  - S3-compatible API via `@aws-sdk/client-s3`.
  - Existing bucket used by transcripts. The menu app uses a strictly partitioned prefix: `menu/pending/<uuid>` for presigned uploads and `menu/products/<productId>/<sha256>/<variant>.<ext>` for verified media.
  - Security: Real format sniffing (PNG, JPEG, WebP, GIF, AVIF). SVG uploads and polyglots are strictly rejected.

---

## 4. Authentication, Sessions & RBAC

- **Discord Application Client ID:** `1559780431161729166` (extracted from companion bot environment).
- **Owner Discord ID:** `386528085681635328` (immutable, virtual OWNER tier; evaluated strictly as a string).
- **OAuth Flow:** Authorization Code with PKCE (S256) and cryptographically random `state` cookie. Scope: `identify` only.
- **Token Hygiene:** The Discord access token is consumed once to fetch `/users/@me` and immediately discarded. Never stored in DB or browser cookies.
- **Session Store:** Database-backed sessions in `menu_web_sessions` with hashed session IDs, `__Host-` prefixed secure cookies, and per-request role resolution via `resolveActor()`.

---

## 5. Docker & Environment Status

- **Docker:** Not detected on the host system PATH.
  - In accordance with the execution protocol (§3 ladder & §15): Integration tests requiring external Docker daemon fall back to safe in-memory / mock providers and direct tests against the designated test database schema.
  - All CORE criteria will be verified automatically via unit tests, Playwright tests with local mock OAuth/services, and end-to-end component builds.
