# squish

**Squish your files. Not your pixels.**

Squish is a web app that compresses images and videos into smaller, web-friendly files — WebP, AVIF, JPEG, PNG and H.264 MP4 — and lets you drag a before/after slider to check the quality before you download.

🔗 **Live:** [squish-me.vercel.app](https://squish-me.vercel.app)

## Features

- Compress images to **WebP, AVIF, JPEG or PNG** with quality presets and optional resizing
- Compress videos to **H.264 MP4** with presets, 1080p–480p downscaling and background encoding
- **Before/after compare** slider for images and videos
- **Library** with search, filters, sorting, stats and bulk delete
- **Secure accounts** with JWT cookies, profile and password settings
- **Light and dark themes** with a playful, minimal interface

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 19, React Router 7, Tailwind CSS 4, Vite 7 |
| Backend | Node.js, Express 5, Mongoose 9 |
| Media | sharp (images), FFmpeg via fluent-ffmpeg (video) |
| Auth | JWT, bcrypt, express-rate-limit |
| Database | MongoDB (Atlas) |
| Hosting | Vercel (frontend) + Render (backend) |

## Project structure

```
MediaForge/
├── backend/
│   ├── src/
│   │   ├── app.js            
│   │   ├── server.js           
│   │   ├── controllers/       
│   │   ├── services/          
│   │   ├── models/            
│   │   ├── middlewares/        
│   │   └── routes/
│   └── uploads/                
└── frontend/
    ├── public/demo/            
    ├── src/
    │   ├── components/         
    │   ├── context/           
    │   ├── pages/              
    │   └── lib/                
    └── vercel.json            
```

## Getting started

**Prerequisites:** Node.js 20+, [FFmpeg](https://ffmpeg.org/download.html) on your `PATH`, and a MongoDB connection string.

```bash
# Backend
cd backend
npm install
cp .env.sample .env      # fill in your values
npm run dev              # http://localhost:5000

# Frontend (in a second terminal)
cd frontend
npm install
npm run dev              # http://localhost:5173
```

The Vite dev server proxies `/api` to the backend, so auth cookies work locally.

## API overview

All routes are under `/api`;  routes need a logged-in user.

| Route | Description |
|---|---|
| `POST /users/register`, `/users/login`, `/users/logout`  | Sign up, log in, log out |
| `GET · PATCH · DELETE /users/me`  | View, update or delete your account |
| `POST /files/upload`  | Upload an image or video (max 500 MB) |
| `POST /compress/image`, `/compress/video`  | Compress a file (video runs in the background) |
| `GET /files/history`, `/files/stats`  | Library list and savings stats |
| `GET /files/download/:id`  | Download the compressed file |
| `DELETE /files/:id`, `POST /files/bulk-delete`  | Delete files |

## Deployment

The frontend is hosted on **Vercel** and the backend on **Render** (with FFmpeg installed). Vercel proxies `/api` to Render via `frontend/vercel.json`, so the whole app runs on one domain.

## Author

Made by **Kadambari Yewale** — [GitHub repo](https://github.com/kads9905/Squish)

