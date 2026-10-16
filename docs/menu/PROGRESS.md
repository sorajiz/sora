# Pade Store Menu Website V2 — Progress & Checkpoints

Last Updated: 2026-10-16
Status: COMPLETE (All Core Items Verified, C-D Manual Steps Documented)
Branch: feature/pade-menu-v2

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

