# Opscore Frontend

Frontend web application for **Opscore**, built for the hackathon.

- **Live app:** https://opscore-xi.vercel.app/
- **Stack:** React 19, TypeScript, Vite, and Vercel
- **Backend API:** maintained separately at https://gitlab.com/teguhdev/backend-opscore
- **Database:** Aiven PostgreSQL (accessed only through the backend)

## Local development

```bash
npm ci
npm run dev
```

Copy `.env.example` to `.env.local` and set the public API URL when the backend is ready.

## Deploy to Vercel

This repository is intentionally frontend-only. Import it in Vercel with:

- Framework preset: **Vite**
- Build command: `npm run build`
- Output directory: `dist`
- Root directory: repository root

Every push to `main` can trigger the production deployment.
