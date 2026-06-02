# Backend guide

## Architecture

```
POST /api/research
    → routes/research.ts
    → agent/graph.ts
         ├─ (no API keys) runStubAgentStream.ts
         └─ (keys set)     runLiveAgent.ts
                ├─ webSearch      → Tavily
                ├─ vectorRetrieval → OpenAI embeddings + MongoDB
                ├─ rerank         → heuristic ranking
                └─ synthesis      → Claude stream + MongoDB save
```

LangGraph batch graph (no token streaming): `agent/graph.langgraph.ts`

## Setup

```bash
npm install
npm run db:up
cp .env.example .env   # fill keys below
npm run dev:server
npm run dev:web
```

### Required API keys (live agent)

| Variable | Service | Free? |
|----------|---------|-------|
| `TAVILY_API_KEY` | Web search | Free tier (limited) |
| `GEMINI_API_KEY` | Report + embeddings | **Free** — [Google AI Studio](https://aistudio.google.com/apikey) |

Without these, the server uses the **stub stream** (same SSE shape, mock content).

### Optional

| Variable | Service |
|----------|---------|
| `MONGODB_URI` | Semantic memory |
| `LANGFUSE_*` | Tracing |

## Endpoints

- `GET /api/health` — health + MongoDB status
- `POST /api/research` — SSE stream (`packages/shared-types`)

## MongoDB

Collection: `research_documents` — see `apps/server/src/db/schema.ts`

After reports are synthesized, they are saved with embeddings for future retrieval.

## Postman

```
POST http://localhost:3001/api/research
Content-Type: application/json

{ "question": "Your question here" }
```

Wait ~10–60s for live agent (depends on APIs). Expect many `data:` lines ending with `"type":"complete"`.
