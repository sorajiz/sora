---
name: pade-menu-sync
description: Outbox pattern, publication state machine, micro-version polling endpoint, ETag 304 caching, and bot offline resilience.
---

# Pade Menu Sync & Realtime Synchronization

## 1. Outbox & Publication Pipeline (§12, §S8, §S9)
- Event producers insert rows into `menu_outbox_events` and consumer-specific `menu_outbox_deliveries` (`discord_publisher`, `website_revalidate`).
- Bot pulls pending outbox events using `FOR UPDATE SKIP LOCKED`.
- Publication states: `SYNCED | UPDATING | PENDING | OUT_OF_SYNC | FAILED(reason) | MESSAGE_MISSING`.
- Bot Heartbeat: Stored in `menu_runtime_heartbeats` every <= 15s. If heartbeat > 45s stale, admin status reflects "Pending Sync (bot offline)".

## 2. Micro-Version Endpoint & LiveSync (§12.3)
- Endpoint: `GET /api/menu/version`.
- Response: `{"version": 53}` only.
- Strong ETag header `ETag: "menu-v53"`; returns `304 Not Modified` when `If-None-Match` matches.
- Client `LiveSync` component polls this tiny endpoint (admin ≈ 1.5s, public ≈ 3s with ±30% jitter).
- **Tab Visibility Pause:** Automatically pauses polling when browser tab is hidden; checks immediately on focus.
- Triggers `router.refresh()` only when version changes, preserving client search state and open modal drawers.

## 3. Signed Internal Revalidation (§12.2, §S10)
- Endpoint: `POST /api/internal/menu/revalidate`.
- Header: `X-Pade-Signature: t=<unix>,v1=<hex>`.
- Verified in constant time; rejects clock skew > 300s; 10-minute replay cache; supports secret rotation via `MENU_INTERNAL_API_SECRET_PREVIOUS`.

## 4. Key File Pointers
- Version Route: [apps/menu/app/api/menu/version/route.ts](file:///c:/Users/ADMIN/.gemini/antigravity-ide/scratch/sora/apps/menu/app/api/menu/version/route.ts)
- Revalidate Route: [apps/menu/app/api/internal/menu/revalidate/route.ts](file:///c:/Users/ADMIN/.gemini/antigravity-ide/scratch/sora/apps/menu/app/api/internal/menu/revalidate/route.ts)
- Signature Logic: [apps/menu/lib/auth/signature.ts](file:///c:/Users/ADMIN/.gemini/antigravity-ide/scratch/sora/apps/menu/lib/auth/signature.ts)
- Client Poller: [apps/menu/components/LiveSync.tsx](file:///c:/Users/ADMIN/.gemini/antigravity-ide/scratch/sora/apps/menu/components/LiveSync.tsx)
- Sync Service: [apps/menu/lib/admin/sync.ts](file:///c:/Users/ADMIN/.gemini/antigravity-ide/scratch/sora/apps/menu/lib/admin/sync.ts)
