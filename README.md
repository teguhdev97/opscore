# OpsCore

Industrial knowledge & operations workspace. Frontend-only interactive prototype in Indonesian.

**Live:** https://opscore-eight.vercel.app · **Dashboard:** https://opscore-eight.vercel.app/app

## Frontend

React + TypeScript + Vite + TanStack Query + React Router. The frontend lives independently in `frontend/`, ready for a separate backend service later. No Supabase dependency.

```sh
cd frontend
npm ci
npm run dev
npm run build
```

Node.js 22.12+ or 24 recommended.

## Pages

- `/` landing page
- `/app` overview dashboard
- `/app/knowledge` searchable/filterable documents and simulated PDF upload
- `/app/assistant` simulated Q&A and illustrative source references
- `/app/checklists` interactive checklist with local persistence
- `/app/compliance` review queue
- `/app/activity` example audit timeline
- `/app/settings` local workspace preferences

## Demo boundaries

All metrics, organizations, documents, quotations and AI answers are illustrative. Upload saves the filename only; PDF content never leaves the browser. No real authentication, ingestion, AI model, database, cloud storage or compliance assessment is connected. Checklist completion and added document metadata are stored in localStorage; clearing site data resets them.

TanStack Query handles mock document queries, upload mutation/cache invalidation and simulated assistant mutations. Replace the mock adapter with a backend API when ready. Never put Aiven credentials or model API secrets in frontend environment variables.

## Deployment

Vercel: root directory `frontend`, framework Vite, install `npm ci`, build `npm run build`, output `dist`. `vercel.json` includes SPA history fallback for direct route access.

Planned backend: separate service, Aiven PostgreSQL, document storage and WorkBuddy MCP integration. No paid backend resources provisioned by this prototype.
