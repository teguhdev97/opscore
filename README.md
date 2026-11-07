# OpsCore

Industrial knowledge & operations workspace. Interactive frontend prototype in Indonesian, with an optional separate product-chat backend.

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

All metrics, organizations, documents, quotations and AI answers are illustrative. Upload saves the filename only; PDF content never leaves the browser. No real authentication, ingestion, document AI, database, cloud storage or compliance assessment is connected. The floating product helper can separately connect to the optional backend when configured. Checklist completion and added document metadata are stored in localStorage; clearing site data resets them.

TanStack Query handles mock document queries, upload mutation/cache invalidation and simulated assistant mutations. Replace the mock adapter with a backend API when ready. Never put Aiven credentials or model API secrets in frontend environment variables.

## Deployment

Vercel: root directory `frontend`, framework Vite, install `npm ci`, build `npm run build`, output `dist`. `vercel.json` includes SPA history fallback for direct route access.

Planned backend: separate service, Aiven PostgreSQL, document storage and WorkBuddy MCP integration. No paid backend resources provisioned by this prototype.

## Product help panel

The global `ProductAssistant` lives outside route elements so navigation never unmounts it. A fixed launcher and panel appear on every route. Open/closed state, the current draft, and the latest 60 messages persist in localStorage (`opscore-product-assistant-v1`). If storage is unavailable, in-memory navigation still works. Escape closes the panel; the trash button resets its conversation. The panel is non-modal, so other page links remain usable.

With no backend configured, answers come from a small local product FAQ and no messages are sent to an AI provider. With `VITE_CHAT_API_URL` and a configured backend, the floating panel sends limited history to the product-chat API and labels AI replies. Provider errors allow retry or a clearly labeled FAQ fallback. ChatGPT Go does not include API usage; eligible ChatGPT-plan integrations require separate official support that OpsCore does not currently have. Do not put subscription session tokens or API keys in this frontend.

The landing footer uses real app routes and existing landing anchors. There are no placeholder legal links or invented business contact details.

## Product chatbot backend

See [backend setup and deployment](backend/README.md). Source lives in `backend/`, uses Node.js 22+ and a server-side 9router adapter. Curated product facts are in `backend/src/product-knowledge.md`. AI is disabled by default; no secrets or paid infrastructure are provisioned. The existing `/app/assistant` SOP simulator is unchanged.
