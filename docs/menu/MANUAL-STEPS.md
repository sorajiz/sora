# Pade Store Menu Website V2 — Manual Operational Steps (C/D Items)

> Per §17 of the spec, safe operations require that production promotions, DNS records, and Discord Developer Portal registrations are performed with explicit operator oversight. Use the exact copy-pasteable instructions below.

---

## 1. Discord Developer Portal Registration (C-1)

Log in to the [Discord Developer Portal](https://discord.com/developers/applications) and navigate to your OAuth2 Application (`DISCORD_CLIENT_ID: 1398918239333027870`).

1. Select **OAuth2** → **General**.
2. Under **Redirects**, click **Add Redirect** and register the exact callback URLs:
   - **Production:** `https://menu.sorae.tokyo/api/auth/discord/callback`
   - **Local Development:** `http://localhost:3000/api/auth/discord/callback`
3. Click **Save Changes**.

---

## 2. Cloudflare R2 Bucket & CORS Configuration (C-2)

In the [Cloudflare Dashboard](https://dash.cloudflare.com/) → **R2** → Select Bucket (`R2_BUCKET`):

### A. CORS Policy Configuration
Under **Settings** → **CORS Policy**, paste the following JSON:

```json
[
  {
    "AllowedOrigins": [
      "https://menu.sorae.tokyo",
      "http://localhost:3000"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "HEAD"
    ],
    "AllowedHeaders": [
      "Content-Type",
      "Content-Length",
      "Cache-Control"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

### B. Lifecycle Rule for Pending Uploads
Under **Settings** → **Lifecycle Rules**, add an object expiration rule:
- **Prefix:** `menu/pending/`
- **Action:** Delete objects older than **1 day (24 hours)**.

---

## 3. Vercel Independent Project & Domain Link (C-3)

The Menu application is an isolated deployable in `apps/menu` with its own `apps/menu/vercel.json`.

### A. Create and Link Vercel Project
In your terminal from the workspace root or `apps/menu`:

```bash
cd apps/menu
vercel link
# Select Project Name: pade-menu
# Root Directory: apps/menu
```

### B. Configure Environment Variables in Vercel
Set the following environment variables in the `pade-menu` project settings (Production & Preview):

| Variable | Scope | Description |
|---|---|---|
| `DATABASE_URL` | Production, Preview | Pooled Neon PostgreSQL connection string |
| `DIRECT_DATABASE_URL` | Production, Preview | Direct unpooled PostgreSQL connection string |
| `PADE_OWNER_DISCORD_ID` | Production, Preview | `386528085681635328` |
| `DISCORD_CLIENT_ID` | Production, Preview | `1398918239333027870` |
| `DISCORD_CLIENT_SECRET` | Production, Preview | Discord OAuth2 Client Secret |
| `DISCORD_OAUTH_REDIRECT_URI` | Production | `https://menu.sorae.tokyo/api/auth/discord/callback` |
| `SESSION_SECRET` | Production, Preview | 32+ character random hex string (generate with `openssl rand -hex 32`) |
| `MENU_INTERNAL_API_SECRET` | Production, Preview | Shared HMAC secret for bot revalidation |
| `NEXT_PUBLIC_MENU_BASE_URL` | Production | `https://menu.sorae.tokyo` |
| `R2_ACCOUNT_ID` | Production, Preview | Cloudflare R2 Account ID |
| `R2_ACCESS_KEY_ID` | Production, Preview | Cloudflare R2 Access Key ID |
| `R2_SECRET_ACCESS_KEY` | Production, Preview | Cloudflare R2 Secret Access Key |
| `R2_BUCKET` | Production, Preview | R2 bucket name |
| `R2_PUBLIC_BASE_URL` | Production, Preview | Public CDN domain attached to R2 bucket |
| `MENU_LIVE_SYNC` | Production, Preview | `poll` |

### C. Domain Configuration (DNS)
In Vercel Settings → **Domains**, add `menu.sorae.tokyo`.
In Cloudflare DNS for `sorae.tokyo`:
- **Type:** `CNAME`
- **Name:** `menu`
- **Target:** `cname.vercel-dns.com` (or the project-specific Vercel CNAME)
- **Proxy Status:** DNS Only (or Proxied with Full SSL)

---

## 4. First-Login Owner Verification Checklist

1. Open `https://menu.sorae.tokyo`.
2. Click **Login with Discord** in the navbar.
3. Authorize with the owner account (Discord Snowflake `386528085681635328`).
4. Verify the navbar displays the owner avatar and username, with the **Manage Menu** link visible.
5. Navigate to `https://menu.sorae.tokyo/admin/menu`:
   - Verify all 5 tabs (Products, Categories, Settings, Sync & Status, Audit Logs) load.
   - Test creating a test product with brand glyphs: `𓆩 Test Nitro 𓆪`, price `₫90.000`.
   - Verify live Website, Discord, and 390px Mobile previews render accurately.

---

## 5. Rollback Procedures

### Instant Version Rollback in Vercel
If an issue occurs in production:
```bash
# In Vercel Dashboard -> Deployments -> Select Previous Stable Deployment -> Click "Promote to Production"
```

### Feature Flag Kill Switch
To immediately disable client-side polling load on the version endpoint:
Set `MENU_LIVE_SYNC=off` in Vercel project environment variables and redeploy.
