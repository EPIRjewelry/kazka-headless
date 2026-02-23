# EPIR Chat Worker – HTTP API + Cloudflare Agents

Backend czatu dla Hydrogen (Kazka/Zareczyny). Architektura 2B: Worker jako niezależny backend, Hydrogen wywołuje go przez `fetch()` – bez Agents SDK w bundlu Hydrogenu.

## Endpointy

| Ścieżka | Metoda | Opis |
|---------|--------|------|
| `/api/chat` | POST | Prosty JSON API dla Hydrogen – przyjmuje `{ message, anonymousId?, cartId? }`, zwraca `{ reply, suggestedProducts? }` |
| `/agents/*` | WebSocket | routeAgentRequest – dla klientów Agents SDK |

## Deploy

```bash
cd workers/chat
npm install
npx wrangler deploy
```

Po deployu ustaw `PUBLIC_CHAT_API_URL` w Hydrogen (Kazka/Zareczyny):

```
PUBLIC_CHAT_API_URL=https://epir-chat-worker.<account>.workers.dev/api/chat
```

W Cloudflare Pages → Settings → Variables dla kazka-hydrogen-pages i zareczyny-hydrogen-pages.

## Lokalny dev

```bash
npx wrangler dev
```

Worker będzie na `http://localhost:8787`. Dla lokalnego testu Hydrogenu ustaw:

```
PUBLIC_CHAT_API_URL=http://localhost:8787/api/chat
```

## Architektura

- **POST /api/chat** – Workers AI (GLM-4.7-Flash), `generateText`, zwraca JSON
- **routeAgentRequest** – routing `/agents/chat-agent/:name` (WebSocket)
- **AIChatAgent** – persystencja SQLite, streaming, reconnect
