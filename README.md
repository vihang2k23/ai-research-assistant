# AI Research Assistant

Production-style research app: React UI, Express API, LangGraph-ready agent pipeline, MongoDB memory, Langfuse tracing.

## Quick start

```bash
npm install
npm run db:up
cp .env.example .env          # add API keys
npm run dev:server            # :3001
npm run dev:web               # :5173
```

Frontend: set `VITE_USE_MOCK=false` in `apps/web/.env` to use the API.

## Monorepo

| Path | Description |
|------|-------------|
| `apps/web` | React + custom directives (`AiStream`, `AiLoading`, `AiRetry`) |
| `apps/server` | Express + agent pipeline |
| `packages/shared-types` | Shared SSE / agent types |
| `docs/BACKEND.md` | API & agent details |

## Agent modes

- **Stub** — no API keys; fast mock SSE (dev/demo)
- **Live** — Tavily + Google Gemini (report + embeddings) + MongoDB

## Deploy on Render (GitHub)

This repo includes [`render.yaml`](render.yaml) for a **Blueprint** with two services:

| Render resource | What it runs |
|-----------------|--------------|
| `ai-research-api` (Web Service, Node) | Express API (`apps/server`) |
| `ai-research-web` (Static Site) | React UI (`apps/web/dist`) |

After the first deploy, run MongoDB indexes once (Render shell or locally with production `MONGODB_URI`):

```bash
npm run db:init --workspace=server
```

**MongoDB is not on Render.** Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier), then set `MONGODB_URI` on the API service.

### Steps

1. Push this repo to GitHub.
2. In [Render](https://dashboard.render.com) → **New** → **Blueprint** → connect the repo.
3. Render reads `render.yaml` and creates both services.
4. When prompted, set secrets on **ai-research-api**:
   - `MONGODB_URI` — Atlas connection string
   - `TAVILY_API_KEY`, `GEMINI_API_KEY` (optional `GEMINI_API_KEY_2`)
5. Wait for both deploys to finish.
6. Open **ai-research-web** URL. API health: `https://ai-research-api.onrender.com/api/health`

If you rename the static site in Render, update `CORS_ORIGIN` on the API to match its `https://…onrender.com` URL.

**Note:** Free Web Services sleep after inactivity; the first request may take ~30s to wake up. SSE research requests need the API awake for the full stream.
