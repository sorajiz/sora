# Pade Store Menu Website V2 — Operational Runbook

## 1. System Overview
- **Production URL:** `https://menu.sorae.tokyo`
- **Architecture:** Next.js 14 App Router, Server Components + minimal client islands, PostgreSQL (Neon), Cloudflare R2, Discord OAuth2.
- **Contract Version:** 2.1.0 (`contracts/menu/CONTRACT_VERSION`).

---

## 2. Diagnostics & Incident Response

### Reference ID Resolution (§S13)
When users report error references formatted as `PM-XXXXX` (e.g., `PM-9B2F1`):
1. The 5-character suffix is Crockford base-32 encoded from the first 4 bytes of `trace_id`.
2. Search server logs / Vercel Runtime Logs for `trace_id` or `PM-`:
   ```bash
   vercel logs menu.sorae.tokyo --search "PM-"
   ```
3. Correlate with database `menu_audit_logs` where `operation_id = trace_id`.

---

## 3. Failure Scenarios & Degraded States (§12.4)

| Failure | Symptoms | Automatic Recovery / Fallback Behavior |
|---|---|---|
| **Discord Bot Offline** | Sync tab shows `Pending Sync (bot offline)`; Discord `#menu` not updated | Website catalog and admin edits continue functioning normally. Outbox deliveries remain queued. When bot returns, it claims events via `FOR UPDATE SKIP LOCKED` and reconciles. |
| **Database Pool Exhaustion** | 500 error on mutations; public page degrades | Public catalog renders fallback error card with `PM-XXXXX` reference ID. Neon connection pooling isolates spike. |
| **Cloudflare R2 Unavailable** | Presigned upload returns error; image finalize fails | Existing cached images continue serving from CDN. Form returns safe retry error without saving broken media references. |
| **Signed Revalidate Webhook Failure** | Discord edits do not immediately purge Next.js tag | Micro-version endpoint `/api/menu/version` continues returning latest DB version. Open clients poll version and reload catalog within 1.5–3 seconds. |

---

## 4. Contract Drift & Verification
Before merging any change to catalog schema, Discord render models, or copy:
```bash
node scripts/verify-menu-contract.js
```
Expected output:
```
== Pade Store Menu Contract Verification ==
Companion repository contract is byte-identical (0 drift).
SUCCESS: Menu contract verification passed without errors.
```

---

## 5. Routine Maintenance
- **Purge Done Deliveries:** Retain `menu_outbox_deliveries` with status `DONE` for at least 14 days. Purge older records via periodic cron:
  ```sql
  DELETE FROM menu_outbox_deliveries WHERE status = 'DONE' AND created_at < NOW() - INTERVAL '14 days';
  ```
- **Session Pruning:** Expired sessions are ignored at query time; clean expired rows monthly:
  ```sql
  DELETE FROM menu_web_sessions WHERE expires_at < NOW();
  ```
