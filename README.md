# Sora — Personal Profile & Editorial Portfolio ✨

An editorial, high-performance portfolio website for **Sora** (`@ixzplr` / `@ixplr`), featuring a real-time **WebGL GLSL Luminous Flow** background engine, zero-flicker Single Page Architecture (SPA), an ergonomic mobile glass dock, and hardened production security.

---

## 🌟 Key Highlights

- **Luminous Flow WebGL GLSL Engine**:
  - Full-screen procedural fluid ribbons running on WebGL1 GLSL shaders.
  - Deep graphite base (`#1a1d20` to `#666666`) accented with silver-white luminous flow ribbons.
  - Eco-adaptive throttling for mobile devices (capped DPR, frame pacing, tab-visibility sleep).
- **Zero-Flicker Virtual SPA Router**:
  - Seamless in-memory route cross-fading across `/`, `/intro`, `/skills`, and `/contact`.
  - Background WebGL context never unmounts or stutters during navigation.
  - Full HTML5 `history.pushState` integration with deep-linking support on all entry URLs.
- **Ergonomic Responsive Navigation**:
  - **Desktop**: Refined header with enlarged typography and icons.
  - **Mobile**: Ergonomic floating glass pill navbar (Dock) pinned at the bottom viewport with haptic micro-interactions.
- **Enterprise-Grade Security Architecture**:
  - **Dist Isolation**: All public files compile into `dist/`. The Express server and Vercel strictly serve `dist/`, completely shielding server code (`server.js`, `package.json`, `.env`, internal scripts).
  - **Hardened CSP (No `'unsafe-eval'`)**: Frontend JavaScript executes via pure AST structures without dynamic `new Function()` or `eval()`, enabling a strict Content Security Policy against XSS.
  - **Sora DevTools Guard v2.0**: Silent client-side deterrent against inspection shortcuts and devtools dock detection.
  - **Sora Performance Engine X2**: Adaptive 60 FPS governor that trades non-critical visual overhead for silky smoothness on lower-end devices.
  - **Stale-While-Revalidate Asset Caching**: High-speed edge caching (`max-age=86400, stale-while-revalidate=604800`) preventing stale asset locks.

---

## 🏗️ Architecture & Directory Layout

```text
sora/
├── .github/
│   └── workflows/
│       └── security-scan.yml    # CI: Node 20/22 build, test, TruffleHog & audit
├── .src/                        # Single source of truth for client scripts
│   ├── script.js                # Frontend app, SPA router, interactions
│   ├── security-shield.js       # Silent protection layer
│   ├── sora-devtools-guard.js   # DevTools deterrent
│   └── sora-performance-x2.js   # 60 FPS adaptive governor
├── assets/                      # Consolidated images & icons (no root clutter)
│   ├── favicon.ico
│   ├── favicon.png
│   └── luminous-flow.png
├── dist/                        # Compiled production distribution (served by server/Vercel)
│   ├── assets/
│   ├── js/
│   ├── music/
│   └── *.html
├── js/                          # Public script copies (mirrored from .src/)
├── music/                       # Audio assets (crush.mp3)
├── scripts/
│   ├── build.js                 # Production compiler & dist bundler
│   ├── obfuscate.js             # Eval-free AST minification & protection
│   ├── security-check.js        # Secret & token pattern scanner
│   ├── test-server.js           # 19-point integration & security test suite
│   └── watch.js                 # Development watcher
├── views/
│   ├── pages/                   # Modular EJS templates (index, intro, skills, contact)
│   └── partials/                # Partials (head, header, background, etc.)
├── server.js                    # Express 5 production server with Helmet & Gzip
├── vercel.json                  # Vercel deployment config (outputDirectory: "dist")
├── _redirects                   # Cloudflare Pages SPA rewrite rules
├── _routes.json                 # Cloudflare Pages route include/exclude
└── package.json                 # Node dependencies (Node >=20.0.0)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v20.0.0` or higher
- **npm**: `v9.0.0` or higher

### Installation

```bash
git clone https://github.com/sorajiz/sora.git
cd sora
npm install
```

### Build & Run Locally

```bash
# 1. Compile all templates and assets into dist/
npm run build

# 2. Run the 19-point automated test suite
npm test

# 3. Start the production Express server
npm start
```

Access the application in your browser:
👉 **`http://localhost:3000`**

### Development Mode

To watch file changes in `views/`, `style.css`, and `.src/` with automatic recompilation:

```bash
npm run dev
```

---

## 🧪 Testing & Verification

The project includes an automated test runner (`scripts/test-server.js`) testing:
1. **Core SPA Routes**: `/`, `/intro`, `/skills`, `/contact`, `/health`.
2. **CSP Header Security**: Confirms Content Security Policy is strictly enforced and contains **NO `'unsafe-eval'`**.
3. **Sensitive Path Shielding**: Confirms `/server.js`, `/package.json`, `/vercel.json`, `/.env`, and `/README.md` return `403` or `404` and never expose source code.
4. **Cache Header Integrity**: Verifies HTML revalidation and asset `stale-while-revalidate` directives.
5. **Asset & Script MIME Types**: Confirms valid headers for icons, WebGL textures, and JavaScript modules.

Run the test suite with:

```bash
npm test
```

Scan for any leaked credentials:

```bash
npm run security:scan
```

---

## 🌐 Cloud Deployment

### Vercel
Configuration is pre-set in `vercel.json`:
- `buildCommand`: `npm run build`
- `outputDirectory`: `dist`
- Security headers and SPA rewrites are handled natively.

### Cloudflare Pages
- Root directory: `./`
- Build command: `npm run build`
- Output directory: `dist`
- Handled automatically via `_redirects` and `_routes.json`.

---

## 📄 License & Credits

- Created and maintained by **Sora** (`@ixzplr`).
- License: [MIT](LICENSE).
