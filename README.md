# Kazka Headless

Headless e-commerce marki Kazka – Hydrogen (Shopify) na Cloudflare Workers. Self-hosting bez Oxygen, zgodny z planem Shopify Professional.

## Architektura

- **Framework:** Shopify Hydrogen (Remix + Storefront API)
- **Hosting:** Cloudflare Workers + Static Assets
- **Adapter:** `@remix-run/cloudflare` (nie Oxygen)

## Wymagania

- Node.js >= 20
- konto Shopify (Headless channel)
- konto Cloudflare

## Instalacja

```bash
npm install --legacy-peer-deps
```

## Rozwój

```bash
npm run dev
```

## Build i deploy

```bash
npm run build
npm run deploy:cf
```

## Zmienne środowiskowe

Skopiuj `.dev.vars.example` do `.dev.vars` (gitignored) i uzupełnij:

- `SESSION_SECRET` – wymagany, użyj długiego losowego stringa w produkcji
- `PUBLIC_STOREFRONT_API_TOKEN` / `PRIVATE_STOREFRONT_API_TOKEN`
- `PUBLIC_STORE_DOMAIN`, `PUBLIC_STOREFRONT_ID`, `SHOP_ID`
- `PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID`

W produkcji: ustaw `SESSION_SECRET` w Cloudflare Dashboard (Workers → Settings → Variables) lub wrangler secrets.

## GitHub Actions

Workflow `.github/workflows/deploy-cloudflare.yml` deployuje na push do `main`.

Sekrety w repozytorium:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## Integracja z epir-ai-worker

Subdomena `kazka.epirbizuteria.pl` proxy do tego workera. epir-ai-worker jest skonfigurowany z:

```
HYDROGEN_PAGES_URL=https://hydrogen-kazka.krzysztofdzugaj.workers.dev
```

## Nowe repozytorium GitHub

1. Utwórz repo `kazka-headless` na GitHubie (np. https://github.com/EPIRjewelry/kazka-headless)
2. `git remote add origin <url>` *(już ustawione: EPIRjewelry/kazka-headless)*
3. `git add . && git commit -m "Initial: Hydrogen Kazka na Cloudflare Workers"` *(wykonane)*
4. `git push -u origin main` *(wykonaj po utworzeniu repo)*

**Sekrety GitHub Actions:** Settings → Secrets and variables → Actions → dodaj `CLOUDFLARE_API_TOKEN` i `CLOUDFLARE_ACCOUNT_ID`.
