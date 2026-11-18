# GetItResolved (JanSewa) — AI-Powered Citizen Grievance Portal

A unified fullstack civic grievance management application connecting citizens with municipal authorities for fast, transparent issue reporting, AI-based triaging, community upvoting, and real-time tracking.

---

## 🏛️ Features

- **Multi-Step Guided Grievance Reporting**:
  - Title, description, and location capture.
  - Image attachment support with size and MIME type validation.
  - Real-time client-side heuristic evaluation (Category, Department, Authority assignment, Priority, Duration, Urgency, Feasibility, and Core Score).
  - Generates official tracking IDs in the format `JS-2026-XXXX`.
- **Integrated Express + Supabase Backend**:
  - PostgreSQL database powered by Supabase PostgREST client.
  - Full CRUD & query operations with pagination, full-text search, status, and department filtering.
  - Community upvoting (`POST /api/complaints/:id/upvote`) with duplicate upvote prevention.
  - Complaint update and status progression (`PATCH /api/complaints/:id`).
  - Citizen feedback & support submission (`POST /api/feedback`).
  - Robust security headers via Helmet, JSON payload size limiter (10KB), and IP rate limiters.
- **Interactive Redressal Tracker**:
  - Real-time search across titles, descriptions, locations, and tracking IDs.
  - Department filtering (PWD, Water & Sanitation, Electricity, Municipal Services).
  - Status filters (Pending, In Progress, Resolved).
  - Colored priority star filters (Critical Impact, Long-standing Issue, Immediate Action, High Readiness).
  - Detailed modal inspection with metrics breakdown.
- **Localization & Themes**:
  - Full bilingual support in English and Hindi (`EN` / `HI`).
  - Dark mode and light mode with persistent user preferences.

---

## 🏗️ Architecture

```
getitresolved1/
├── src/                      # React 19 + TypeScript + Tailwind 4 Frontend
│   ├── App.tsx               # Main Portal UI & State Management
│   ├── main.tsx              # React DOM mounting
│   ├── i18n/                 # Translation dictionaries (EN / HI)
│   └── index.css             # Tailwind 4 theme styling
├── backend/                  # Node.js + Express 5 Backend
│   ├── server.js             # Express app, CORS, security, SPA fallback
│   ├── src/
│   │   ├── config/supabase.js      # Supabase client initialization
│   │   ├── controllers/complaintController.js # API Controllers & logic
│   │   ├── routes/complaintRoutes.js          # Complaint API endpoints
│   │   └── middlewares/rateLimiter.js        # Express rate limiting
│   ├── .env.example          # Backend environment template
│   └── package.json          # Backend dependencies
├── dist/                     # Production frontend build assets
├── vite.config.ts            # Vite config with /api reverse proxy
└── package.json              # Unified project scripts & concurrently runner
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm**: v9.0.0 or later

### 2. Install Dependencies
Install both frontend and backend dependencies in one step:
```bash
npm install
cd backend && npm install && cd ..
```

### 3. Environment Variables
Create your `.env` configuration in the project root or in `backend/.env`:
```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Ensure your `.env` contains valid Supabase credentials:
```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your-supabase-service-role-or-anon-key
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:5000
```

### 4. Run Development Servers (Fullstack)
Start both the Express backend (`http://localhost:5000`) and the Vite development server (`http://localhost:5173`) concurrently:
```bash
npm run dev
```

The Vite dev server automatically proxies all `/api` requests to `http://localhost:5000`, preventing any CORS issues.

### 5. Standalone Commands

| Command | Description |
|---|---|
| `npm run dev` | Runs backend server and Vite frontend concurrently |
| `npm run server` | Starts only the Express backend server (`http://localhost:5000`) |
| `npm run backend:dev` | Runs backend server with nodemon for auto-reload |
| `npm run frontend:dev` | Starts only the Vite frontend dev server |
| `npm run build` | Compiles TypeScript and builds the production frontend into `dist/` |
| `npm start` | Runs the unified Express server serving both `/api` and the built frontend |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check endpoint |
| `GET` | `/api/test-db` | Verifies active Supabase database connectivity |
| `GET` | `/api/complaints` | Fetch complaints (supports `search`, `department`, `category`, `status`, `page`, `limit`) |
| `GET` | `/api/complaints/:trackingId` | Fetch a single complaint by `tracking_id` or UUID `id` |
| `POST` | `/api/complaints` | Submit a new grievance (generates `JS-2026-XXXX`) |
| `POST` | `/api/complaints/:id/upvote` | Community upvote for a complaint |
| `PATCH` | `/api/complaints/:id` | Update status, department, or description of a complaint |
| `POST` | `/api/feedback` | Submit citizen feedback / suggestions / bug reports |

---

## 🔒 Security Measures

- **Helmet**: Disables MIME sniffing, clickjacking, and enforces HTTP security standards.
- **CORS**: Explicit origin allowlist with support for localhost development ports.
- **Body Limit**: 10KB JSON body constraint to prevent Denial-of-Service attacks.
- **Rate Limiting**:
  - General API: 300 requests per 15-minute window.
  - Complaint Submission: 30 requests per 15-minute window.
  - Tracking Lookups: 60 requests per 15-minute window.

---

## 📄 License
ISC
