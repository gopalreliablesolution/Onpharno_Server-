# ONPHARNO Server API (Backend)

Premium B2B Pharmaceutical & Nutraceutical Manufacturing Platform API for onpharno.com.

## Architecture & Features
- **Runtime**: Node.js + Express (ES Modules)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (Access Token + Refresh Token via secure HTTP-only cookies, cookie-only session; no browser token storage)
- **File Uploads**: Local server storage (`/uploads`) via Multer (No external cloud lock-in)
- **Security**: Helmet, CORS origin restriction, CSRF protection for cookie-authenticated state-changing requests, rate limiting
- **Seed Data**: Database seeder for admin/content (see seed safety notes)

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env` and configure credentials (do not commit secrets).

Key auth/cookie/env vars:
- `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET` (required at boot)
- `CLIENT_URL` (allowed client origin for CORS/CSRF checks)
- `COOKIE_DOMAIN` (optional; set for shared registrable domain, e.g. `.onpharno.com`)
- `COOKIE_SAMESITE` (`lax` recommended for same-site; `none` required for cross-site cookies and forces `Secure`)
- `UPLOAD_DIR` (default `./uploads`), `API_PUBLIC_URL` (public base URL for uploaded file links)

### 3. Seed Database
```bash
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```
Server runs at `http://localhost:5000`. API endpoints available under `/api/v1`.
Static uploads served at `http://localhost:5000/uploads`.

### 5. API Tests (auth/CSRF smoke)
```bash
npm run test:api
```
Set `API_BASE_URL`, and optionally `TEST_EMAIL`/`TEST_PASSWORD` (do not print or commit credentials) to run the credentialed login/refresh/logout flow.

## Auth, Cookies & CSRF
- Sessions use **httpOnly cookies** (`token`, `refreshToken`) with `withCredentials` on the client. **No access/refresh tokens are stored in `localStorage`/`sessionStorage`.**
- Cookie behavior is env-driven: `COOKIE_DOMAIN`, `COOKIE_SAMESITE`, and `Secure` in production (or when `SameSite=None`).
- **CSRF protection:** all state-changing `/api/v1` requests (`POST/PUT/PATCH/DELETE`) require `X-Requested-With` header and a valid `Origin`/`Referer` when present (checked against allowed client origins). The web client sends `X-Requested-With: XMLHttpRequest`.
- **Recommended production setup:** serve frontend and API on the same registrable domain (e.g. `https://onpharno.com` and `https://api.onpharno.com`) with `COOKIE_SAMESITE=lax` (and `COOKIE_DOMAIN` as appropriate). This is the most reliable option.
- **Cross-site limitation:** the current split setup (`https://onpharno.netlify.app` + `https://onpharno-server.onrender.com`) requires cross-site cookies (`SameSite=None; Secure`). **Safari/iOS and other browsers that block third-party cookies may prevent admin login/sessions in this configuration.** Prefer the single-domain setup above or a same-site proxy. This scenario should be verified on Safari/iOS or treated as blocked by the cross-site setup.

## Upload Storage, Security & Backup Runbook

### Local-Only Durable Storage
- Zero third-party cloud storage lock-in (no Cloudinary, AWS S3, or GCS). All files are processed and stored on the local server filesystem.
- Uploads directory resolved dynamically via `UPLOAD_DIR` environment variable (defaults to `./uploads`).
- Validation & Processing Pipeline:
  - Whitelist: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.pdf`, `.mp4`
  - SVG blocked (prevents XSS/XML-entity attacks).
  - Magic byte binary signature validation using `file-type` (blocks spoofed extensions like `backdoor.php` renamed to `.jpg`).
  - Double extension detection (blocks `shell.php.jpg`, etc.).
  - Size limits: Images <= 5MB, PDF <= 10MB, Video <= 50MB.
  - Automatic WebP conversion and max 1920px resizing via `sharp`.
  - 400x400 WebP thumbnail generation (`_thumb.webp`).
  - Static serving with immutable cache headers and `X-Content-Type-Options: nosniff`.
  - Media delete cleanly removes both master file and thumbnail.

### ⚠️ Ephemeral Disk Notice (Render Hosting)
- Standard Web Services on Render have **ephemeral filesystems**. When the service sleeps, restarts, or redeploys, any files uploaded to `./uploads` are erased unless backed by a durable volume.
- **Ops Requirement (HIGH Priority):**
  1. Attach a **Render Persistent Disk** mounted at `/uploads` (available on Render Paid plans), OR
  2. Deploy API to a VPS / dedicated VM with a persistent block storage volume.

### Backup & Restore Commands
- **Check File Integrity**:
  ```bash
  npm run uploads:check
  ```
- **Create Backup Archive**:
  ```bash
  tar -czf uploads_backup_$(date +%F).tar.gz uploads/
  ```
- **Restore Archive**:
  ```bash
  tar -xzf uploads_backup_*.tar.gz -C ./
  ```


