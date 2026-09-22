# Luminous Flow Effect & Mobile Dock Navbar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade Sora portfolio with an uninterrupted Luminous Flow Effect background (#666666 & white/silver), enlarged desktop header navigation items, an ultra-sleek floating bottom capsule navbar (Dock) on mobile, zero-flicker SPA page transitions, and turnkey Vercel & Cloudflare Pages deployment readiness.

**Architecture:** Single-Page App Shell architecture in `index.html` where background layers, header, and mobile dock persist without unmounting. Page sections (`home`, `intro`, `skills`, `contact`) cross-fade in-place with zero network latency, while `history.pushState` manages clean URLs. Native fallback routing and rewrites configured for Express (`server.js`), Vercel (`vercel.json`), and Cloudflare Pages (`_redirects`).

**Tech Stack:** HTML5, Modern Vanilla CSS3 (GPU-accelerated transforms, mesh gradients, glassmorphism), Vanilla JavaScript (Clean Virtual Router, Pointer spotlight, Haptic feedback), Express 5, EJS templating.

---

## Global Constraints

- Background animation must run uninterrupted at 60 FPS across all page transitions (no page reloads, no canvas restarts, no background flickers).
- Palette must feature slate grey `#666666` combined with silver-platinum `#b0b8c4`, `#d8e0e8`, and luminous white highlights `#ffffff`.
- Desktop navigation links in `header` must be enlarged slightly in both font size and SVG icon dimensions.
- Mobile viewport ($\le 768\text{px}$) must display a floating bottom glass capsule navbar (Dock) with spring micro-interactions and safe bottom-padding.
- 100% compatible with Local Express (`server.js`), Vercel (`vercel.json`), and Cloudflare Pages (`_redirects` / `_routes.json`).
- Maintain stealth security: zero console spam, silent shortcut interception, no intrusive blocking screens.

---

## Tasks & Step-by-Step Implementation

### Task 1: Background Upgrade - Luminous Flow Engine in #666666 & Silver White
- [ ] **Step 1: Update color tokens and GPU keyframes in `style.css`**
  Add `--accent-slate: #666666`, `--bg-slate-dark: #4b525d`, `--luminous-silver: #e2e8f0` and multi-layer luminous flow animations `@keyframes luminousWavePulse` and `@keyframes metallicFlowRibbon`.
- [ ] **Step 2: Update `views/partials/background.ejs` with luminous flow elements**
  Layer the luminous waves, mesh ambient light, and interactive cursor spotlight.
- [ ] **Step 3: Verify GPU acceleration and fluid 60fps motion**

### Task 2: Header Enlargement & Mobile Floating Dock Navbar
- [ ] **Step 1: Enlarge desktop header nav items in `style.css`**
  Increase font-size of `.nav-minimal-link` to `1.22rem` and `.nav-icon` to `19px`.
- [ ] **Step 2: Implement floating bottom glass navbar for mobile ($\le 768\text{px}$)**
  Convert top header on mobile to a bottom floating capsule dock: `bottom: 22px; margin: 0 auto; backdrop-filter: blur(28px); border-radius: 9999px`.
- [ ] **Step 3: Add active luminous pill indicator and haptic bounce**
  Ensure thumb-friendly touch targets and safe bottom padding on `.main-content`.

### Task 3: Zero-Flicker In-Memory SPA Router
- [ ] **Step 1: Update `.src/script.js` with instant in-memory section router**
  Eliminate network fetch on tab click; toggle active state on in-memory page sections with luxury cross-fade (`opacity 0.22s` + subtle slide).
- [ ] **Step 2: Add `history.pushState` and `popstate` synchronization**
  Keep URLs clean (`/`, `/intro`, `/skills`, `/contact`) while background animation continues with zero jerk/flicker.
- [ ] **Step 3: Handle direct URL navigation on initial load**

### Task 4: Template Integration & Cloud Deployment Config
- [ ] **Step 1: Embed all 4 page sections into `views/pages/index.ejs`**
  Home, Intro, Skills, Contact sections with clean semantic markup.
- [ ] **Step 2: Configure `vercel.json` with SPA rewrite rule**
  `"rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]`.
- [ ] **Step 3: Create Cloudflare Pages `_redirects` and `_routes.json`**
  `/* /index.html 200` for 100% SPA compatibility on Cloudflare Pages.
- [ ] **Step 4: Update `server.js` route handlers**

### Task 5: Build, Test & Verification
- [ ] **Step 1: Run `npm run build` to compile the stealth bundle**
- [ ] **Step 2: Run `npm test` to verify all endpoints return 200 with gzip**
- [ ] **Step 3: Run `npm run security:scan` to verify zero secret leaks**
