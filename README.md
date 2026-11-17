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

