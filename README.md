# squish

**Squish your files. Not your pixels.**

Squish is a web app that compresses images and videos into smaller, web-friendly files — WebP, AVIF, JPEG, PNG and H.264 MP4 — and lets you drag a before/after slider to check the quality before you download.

🔗 **Live:** [squish-me.vercel.app](https://squish-me.vercel.app)

---

## Features

**Compression**
- **Images** → WebP, AVIF, JPEG (MozJPEG) or PNG, with a quality slider, presets (Tiny / Balanced / Crisp) and optional max-width resizing. EXIF metadata is stripped and orientation is baked in.
- **Videos** → H.264 MP4 with Small / Balanced / High presets, 1080p / 720p / 480p downscaling, optional audio removal and fast-start playback. Encoding runs in the background with live progress.
- Supports JPG, PNG, WebP, AVIF, GIF, MP4, MOV, WebM and MKV.

**Studio & library**
- Drag-and-drop upload with progress, then a before/after compare slider for images and videos.
- Library with search, type/status filters, sorting, multi-select and bulk delete.
- Stats for space saved and average reduction.
- Downloads keep the original name — `holiday.jpg` → `holiday-squished.webp`.

**Accounts**
- Sign up, log in with email or username, JWT access + refresh tokens in HTTP-only cookies.
- Edit profile, change password, clear your library, delete your account (removes every file).
- Rate-limited failed logins; users can only ever see their own files.

**Interface**
- Playful-minimal design system: paper + ink with a single lime accent, Bricolage Grotesque + Inter Tight.
- Light and dark themes (light by default), collapsible sidebar, springy micro-interactions that respect *reduced motion*.
- Landing page with a live before/after video demo encoded at real quality levels.

---

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 19, React Router 7, Tailwind CSS 4, Vite 7, lucide-react |
| Backend | Node.js, Express 5, Mongoose 9 |
| Media | [sharp](https://sharp.pixelplumbing.com/) (images), [FFmpeg](https://ffmpeg.org/) via fluent-ffmpeg (video) |
| Auth | JWT (jsonwebtoken), bcrypt, cookie-parser, express-rate-limit |
| Uploads | multer (disk storage) |
| Database | MongoDB (Atlas) |
| Hosting | Vercel (frontend) + Render (backend) |

---

## Project structure

```
MediaForge/
├── backend/
│   ├── src/
│   │   ├── app.js              # Express app, CORS, rate limiting, routes
│   │   ├── server.js           # Loads env, connects MongoDB, starts server
│   │   ├── constants.js        # Formats, presets, upload folders
│   │   ├── controllers/        # user, upload, compression, file, health
│   │   ├── services/           # image.service (sharp), video.service (FFmpeg)
│   │   ├── models/             # User, MediaFile
│   │   ├── middlewares/        # auth (JWT), multer, error handler
│   │   ├── routes/
│   │   └── utils/
│   └── uploads/                # originals/ and processed/ (gitignored)
└── frontend/
    ├── public/demo/            # landing-page demo videos
    ├── src/
    │   ├── components/         # ui/, layout/, landing/, media/
    │   ├── context/            # Auth, Theme, Toast
    │   ├── pages/              # Landing, Login, Register, Welcome, Legal, NotFound, app/*
    │   ├── lib/                # API client, formatting helpers
    │   └── index.css           # design tokens (light + dark)
    ├── vercel.json             # /api proxy to Render + SPA fallback
    └── vite.config.js          # /api proxy to the local backend in dev
```

---

## Getting started (local)

### Prerequisites
- **Node.js 20+**
- **FFmpeg** installed and on your `PATH` (`ffmpeg -version` should work) — needed for video compression
- A **MongoDB** connection string (a free [Atlas](https://www.mongodb.com/atlas) cluster works)

### 1. Backend

```bash
cd backend
npm install
cp .env.sample .env      # then fill in the values (see below)
npm run dev              # http://localhost:5000 (or your PORT)
```

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev              # http://localhost:5173
```

The Vite dev server proxies `/api` to the backend, so the frontend and API share one origin and auth cookies just work. If your backend isn't on `http://localhost:5000`, set `VITE_API_TARGET` when starting Vite.

### Environment variables (`backend/.env`)

| Variable | Example | Purpose |
|---|---|---|
| `PORT` | `5000` | Port the API listens on |
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net` | MongoDB connection (database name `mediaforge` is appended) |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed frontend origin(s), comma-separated, no trailing slash |
| `ACCESS_TOKEN_SECRET` | long random string | Signs access tokens |
| `ACCESS_TOKEN_EXPIRY` | `1d` | Access token lifetime |
| `REFRESH_TOKEN_SECRET` | different long random string | Signs refresh tokens |
| `REFRESH_TOKEN_EXPIRY` | `10d` | Refresh token lifetime |
| `NODE_ENV` | `development` / `production` | Enables secure cookies and proxy trust in production |

Generate secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> Never commit `.env` — it's already gitignored.

---

## API overview

All routes are under `/api`. Routes marked 🔒 need a logged-in user (cookie or `Authorization: Bearer <token>`).

| Method | Route | Description |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/users/register` | Create an account |
| POST | `/users/login` | Log in with email or username |
| POST | `/users/refresh-token` | Rotate tokens |
| POST | `/users/logout` 🔒 | Log out |
| GET / PATCH / DELETE | `/users/me` 🔒 | Get, update or delete the current account |
| POST | `/users/change-password` 🔒 | Change password |
| POST | `/files/upload` 🔒 | Upload a file (multipart field `media`, max 500 MB) |
| POST | `/compress/image` 🔒 | `{ fileId, format, quality, maxWidth }` |
| POST | `/compress/video` 🔒 | `{ fileId, preset, resolution, mute }` — returns `202`, poll the file for progress |
| GET | `/files/history` 🔒 | Paginated list — `page`, `limit`, `type`, `status`, `search`, `sort` |
| GET | `/files/stats` 🔒 | Totals, space saved, average reduction |
| GET | `/files/:id` 🔒 | One file's details and progress |
| GET | `/files/:id/preview?variant=original\|compressed` 🔒 | Stream the file inline |
| GET | `/files/download/:id` 🔒 | Download the compressed file |
| DELETE | `/files/:id` 🔒 | Delete a file |
| POST | `/files/bulk-delete` 🔒 | `{ ids: [...] }` or `{ all: true }` |

Errors always come back as `{ success: false, message, errors, data: null }` with a matching HTTP status.

---

## Deployment

Squish runs as **frontend on Vercel + backend on Render**, with Vercel proxying `/api` so everything stays on one domain (cookies work in every browser, no CORS issues).

**Backend → Render**
1. New **Web Service** from this repo, root directory `backend`, start command `npm start`.
2. The runtime needs **FFmpeg** for video compression.
3. Add the environment variables above with `NODE_ENV=production` and `CORS_ORIGIN=https://<your-app>.vercel.app`.
4. In MongoDB Atlas → Network Access, allow `0.0.0.0/0`.

**Frontend → Vercel**
1. New project from this repo, root directory `frontend` (Vite is auto-detected).
2. Point the `/api` rewrite in `frontend/vercel.json` at your Render URL.

> **Free-tier notes:** Render's free instances sleep when idle (the first request can take ~a minute) and have ephemeral disks, so uploaded files don't survive restarts or redeploys — attach a persistent disk or move uploads to object storage for long-term storage.

---

## Author

Made by **Kadambari Yewale** — [GitHub @kads9905](https://github.com/kads9905) · [kadambari9905@gmail.com](mailto:kadambari9905@gmail.com)
