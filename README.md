# ONPHARNO Server API (Backend)

Premium B2B Pharmaceutical & Nutraceutical Manufacturing Platform API for onpharno.com.

## Architecture & Features
- **Runtime**: Node.js + Express (ES Modules)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (Access Token + Refresh Token via secure HTTP-only cookies)
- **File Uploads**: Local server storage (`/uploads`) via Multer (No external cloud lock-in)
- **Security**: Helmet, CORS origin restriction, Express Rate Limiting, Input Validation
- **Seed Data**: Comprehensive initial database seeder for admin, banners, categories, products, team, CMS sections, blogs, and settings.

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env` and configure your credentials.

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
