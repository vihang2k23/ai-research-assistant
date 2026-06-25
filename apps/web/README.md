# AI Research Assistant — Web

React 18 + Vite frontend with custom AI directives (`AiStream`, `AiLoading`, `AiRetry`).

## Run locally

```bash
cd apps/web
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:8001. API requests proxy to `http://localhost:3001` (backend required for live research).

## Structure

- `src/directives/` — streaming, loading skeletons, retry UX
- `src/components/` — form, progress, report, sources, trace panel
- `src/hooks/` — SSE stream, agent steps, retry backoff
- `src/store/` — Zustand research state
