# DokuresAI Frontend

Frontend web application for **DokuresAI**, built for the hackathon.

- **Live app:** https://opscore-xi.vercel.app/ (deployment URL retained)
- **Stack:** React 19, TypeScript, Vite, and Vercel
- **Backend API:** maintained separately at https://gitlab.com/teguhdev/backend-opscore
- **Database:** Aiven PostgreSQL (accessed only through the backend)

## Local development

```bash
npm ci
npm run dev
```

Copy `.env.example` to `.env.local`. For the deployed backend, use:

```env
VITE_API_BASE_URL=https://server-opscore.teguhharits.com/api/v1
```

For local backend development, use:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

Set the same `VITE_API_BASE_URL` in the Vercel project under
**Settings > Environment Variables**, then redeploy. Only public URLs belong
in frontend environment variables; never add database credentials or tokens.

## Deploy to Vercel

This repository is intentionally frontend-only. Import it in Vercel with:

- Framework preset: **Vite**
- Build command: `npm run build`
- Output directory: `dist`
- Root directory: repository root

Every push to `main` can trigger the production deployment.
