# OpsCore product-chat backend

Small Node.js 22+ HTTP service with no third-party dependencies. Calls an OpenAI-compatible Chat Completions endpoint provided by 9router. The router's actual API path, model identifier and authentication must be verified against the running VPS1 installation before enabling AI. No agent installation, Aiven database or local model is required for this stage.

## Local setup

```sh
cd backend
cp .env.example .env
npm start
```

Defaults bind to loopback and disable AI. `/health` checks the process; `/api/chat/status` reports whether configuration is complete, **not provider reachability**. Configure the following privately in `.env` on the server:

- `NINEROUTER_BASE_URL`: API base ending in `/v1` if that is the path your router exposes; never `/dashboard`.
- `NINEROUTER_API_KEY`: a dedicated, limited router key. Never use a ChatGPT session cookie or place it in frontend variables.
- `NINEROUTER_MODEL`: exact model ID from your router.
- `ALLOWED_ORIGINS`: exact frontend origins, comma separated. Add the actual current Vercel domain before deployment.
- `CHAT_ENABLED=true`: enable only after reviewing provider billing/quota and configuration.

Set `VITE_CHAT_API_URL=http://127.0.0.1:8080` in `frontend/.env.local` for local development, or your HTTPS backend origin in Vercel, then rebuild the frontend. An empty variable retains local FAQ mode. The public panel displays whether it is using FAQ or configured AI, and labels each reply. Provider errors offer retry or an explicitly selected FAQ fallback. Closing or navigating does not cancel a pending response; deleting the conversation does cancel the frontend request and prevents late responses from restoring it.

## API

`POST /api/chat` accepts `{"messages":[{"role":"user","content":"Apa itu OpsCore?"}]}` and returns `{"reply":"...","source":"ai"}`. Send `Content-Type: application/json` and an allowed browser Origin. The browser sends at most six recent user/AI messages; local FAQ replies are excluded. A system instruction and `src/product-knowledge.md` are always inserted by the server. Clients cannot choose the model, provider URL, API key or system role.

Errors: 400 invalid messages/JSON; 403 disallowed or missing Origin; 413 body limit; 415 wrong content type; 429 demo quota; 502 provider failure; 503 unconfigured/disabled; 504 provider timeout. Raw provider errors and credentials are never returned. Text is rendered as text in React, not HTML.

## Product knowledge

Edit `src/product-knowledge.md` when product behavior changes and restart/redeploy the backend. It distinguishes the public product helper from the separate, still simulated SOP assistant. This is curated prompt context, **not document RAG, training, or a hallucination guarantee**. The model has no tools or authority to execute actions.

## Container on an existing server

No cloud resources are created by these files. After an existing host is approved and ready:

```sh
podman build -t opscore-backend ./backend
podman run -d --name opscore-backend --restart=unless-stopped \
  --env-file ./backend/.env -e HOST=0.0.0.0 \
  -p 127.0.0.1:8080:8080 opscore-backend
```

Use an HTTPS reverse proxy or existing tunnel to the loopback port. Do not publish the router key or router dashboard through this service. The image runs as an unprivileged user; `.env` files are excluded from the image and Git. Vercel hosts only the frontend. The Dockerfile is provided but has not been built against a remote host in this session.

## Demo limits and production boundary

This is an anonymous, single-instance demo endpoint. CORS and Origin checks are not authentication: scripted callers can spoof Origin. It limits each socket IP to 10 attempts/minute, the process to 30 attempts/minute, 3 concurrent requests and 300 attempts per UTC day. Counts include invalid attempts and failures. Behind a reverse proxy, clients intentionally share its socket-IP limit; forwarded IP headers are not trusted. Limits reset on process restart and do not synchronize across replicas. Also configure provider-side hard quota; these in-memory caps are not billing guarantees. Before wider production use, add authenticated usage or anti-abuse verification and shared persistent quotas.

Backend does not store conversations or log their content; upstream providers may retain requests. Browser-local deletion does not delete provider records. Provider requests time out after 25 seconds; browser requests after 30 seconds. Frontend abort does not guarantee cancellation of provider billing.

## Validation

```sh
npm test --prefix backend
npm run build --prefix frontend
```

Tests use a fake provider: role injection rejection, server-owned context/model, missing config, sanitized errors, timeout mapping, CORS, HTTP contract and rate limits. Live 9router inference and Tencent deployment still require private server configuration and an actual provider check.
