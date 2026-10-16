---
name: pade-menu-admin
description: Admin workspace rules, product/category editor, optimistic concurrency conflict handling, and audit log generation.
---

# Pade Menu Admin Workspace & Mutations

## 1. Workspace Layout (§8)
- Located at `/admin/menu`.
- Multi-tab administration: Products, Categories, Settings, Sync & Status, Audit Logs.
- Restricted to OWNER and users with explicit `menu_admin_grants`.

## 2. Editor & Optimistic Concurrency (§8, §S7)
- Form inputs update local state and live previews immediately without writing to the database on keystroke.
- Mutations require `expected_version`.
- If database version > `expected_version`, an `OptimisticConcurrencyError` (HTTP 409) is returned.
- Admin UI surfaces a field-by-field diff banner allowing staff to review remote updates without overwriting.

## 3. Database Mutation Invariants (§S7)
Every logical mutation executed in a single transaction:
1. Increments row `version`.
2. Inserts an immutable row into `menu_audit_logs` (operation, before/after JSONB, actor_id, trace_id).
3. Increments `public_version` in `menu_state` if public catalog projection changed.
4. Enqueues outbox events and deliveries in `menu_outbox_events` and `menu_outbox_deliveries`.

## 4. Key File Pointers
- Admin Page: [apps/menu/app/admin/menu/page.tsx](file:///c:/Users/ADMIN/.gemini/antigravity-ide/scratch/sora/apps/menu/app/admin/menu/page.tsx)
- Product Editor: [apps/menu/components/ProductEditorWithLivePreview.tsx](file:///c:/Users/ADMIN/.gemini/antigravity-ide/scratch/sora/apps/menu/components/ProductEditorWithLivePreview.tsx)
- Product Mutations: [apps/menu/lib/admin/mutations.ts](file:///c:/Users/ADMIN/.gemini/antigravity-ide/scratch/sora/apps/menu/lib/admin/mutations.ts)
- Category Mutations: [apps/menu/lib/admin/category-mutations.ts](file:///c:/Users/ADMIN/.gemini/antigravity-ide/scratch/sora/apps/menu/lib/admin/category-mutations.ts)
- Settings Mutations: [apps/menu/lib/admin/settings-mutations.ts](file:///c:/Users/ADMIN/.gemini/antigravity-ide/scratch/sora/apps/menu/lib/admin/settings-mutations.ts)
