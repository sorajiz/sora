---
name: pade-menu-security
description: Security model, strict CSP headers, XSS prevention, presigned direct R2 uploads, and binary image format sniffing.
---

# Pade Menu Security & Media Hardening

## 1. Content Security Policy & Headers (§13)
- Strict CSP configured in [apps/menu/next.config.mjs](file:///c:/Users/ADMIN/.gemini/antigravity-ide/scratch/sora/apps/menu/next.config.mjs).
- `default-src 'self'`.
- `img-src 'self' data: https://cdn.discordapp.com https://*.r2.cloudflarestorage.com https://*.r2.dev`.
- `frame-ancestors 'none'`.
- `X-Content-Type-Options: nosniff`.
- `Referrer-Policy: strict-origin-when-cross-origin`.

## 2. XSS & Untrusted Content Rules (§13, §S4)
- Product names, descriptions, and category copy are untrusted.
- No unsanitized `dangerouslySetInnerHTML`.
- Safe Markdown AST parser rejects `javascript:` and `data:` URIs.
- Decorative brand text strips NUL `\u0000`, C0/C1 control characters, and bidi override controls (`\u202a`–`\u202e`, `\u2066`–`\u2069`).

## 3. Media Upload Pipeline & Binary Sniffing (§11)
- Direct upload to Cloudflare R2 using presigned PUT URLs (`/api/admin/menu/media/presign`).
- Browser uploads directly via XHR without routing megabytes through Vercel Functions.
- Strict binary magic byte sniffing via `sniffImageFormat`:
  - Allowed: PNG (`89 50 4E 47`), JPEG (`FF D8 FF`), WebP (`RIFF...WEBP`), GIF (`GIF87a`/`GIF89a`), AVIF (`ftypavif`).
  - **SVG is rejected** (prevents stored XSS/script execution).
  - Maximum upload size: 10MB.

## 4. Key File Pointers
- Media Service: [apps/menu/lib/media/r2.ts](file:///c:/Users/ADMIN/.gemini/antigravity-ide/scratch/sora/apps/menu/lib/media/r2.ts)
- Presign Route: [apps/menu/app/api/admin/menu/media/presign/route.ts](file:///c:/Users/ADMIN/.gemini/antigravity-ide/scratch/sora/apps/menu/app/api/admin/menu/media/presign/route.ts)
- Next.js Headers: [apps/menu/next.config.mjs](file:///c:/Users/ADMIN/.gemini/antigravity-ide/scratch/sora/apps/menu/next.config.mjs)
- Text Sanitizer: [apps/menu/lib/domain/text.ts](file:///c:/Users/ADMIN/.gemini/antigravity-ide/scratch/sora/apps/menu/lib/domain/text.ts)
