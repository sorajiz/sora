---
name: pade-menu-website
description: Architecture rules, independence constraints, environment schema, and commands for the Pade Store Menu Website at menu.sorae.tokyo.
---

# Pade Menu Website Architecture & Operations

## 1. Prime Isolation Directives
- **Dedicated Application:** Lives in `apps/menu` as an independent Vercel deployable (`menu.sorae.tokyo`).
- **Zero Transcript Collision:** Never import transcript landing, transcript routes, or transcript error modules.
- **Independent Vercel Builds:** Configured via `apps/menu/vercel.json` and guarded by `scripts/vercel-ignore-menu.js`. Changes to `apps/menu` trigger deployments; changes elsewhere in the monorepo do not redeploy the menu.

## 2. Shared Database Contract (§S)
- PostgreSQL is the sole catalog authority. No client JSON or hardcoded catalog cards.
- The shared database contract is strictly defined in `contracts/menu/`.
- CI contract verification: Run `node scripts/verify-menu-contract.js` to assert zero drift against companion bot repo.
- The web application **never** executes DDL migrations at runtime.

## 3. Core Commands
- **Install:** `npm install` (in `apps/menu`)
- **Typecheck:** `npm run typecheck` (`tsc --noEmit`)
- **Test:** `npm test` (`vitest run`)
- **Build:** `npm run build` (`next build`)
- **Contract Verify:** `node scripts/verify-menu-contract.js`

## 4. Key File Pointers
- App Root: [apps/menu/app/page.tsx](file:///c:/Users/ADMIN/.gemini/antigravity-ide/scratch/sora/apps/menu/app/page.tsx)
- Contract: [contracts/menu/CONTRACT_VERSION](file:///c:/Users/ADMIN/.gemini/antigravity-ide/scratch/sora/contracts/menu/CONTRACT_VERSION)
- Vercel Config: [apps/menu/vercel.json](file:///c:/Users/ADMIN/.gemini/antigravity-ide/scratch/sora/apps/menu/vercel.json)
- Environment Schema: [apps/menu/lib/env.ts](file:///c:/Users/ADMIN/.gemini/antigravity-ide/scratch/sora/apps/menu/lib/env.ts)
