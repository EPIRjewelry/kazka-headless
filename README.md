# EPIR Headless

Monorepo z dwoma storefrontami Hydrogen (Shopify) na Cloudflare Pages:
- **Kazka** – Kazka Jewelry (dropshipping)
- **Zareczyny** – EPIR Art Jewellery (pierścionki zaręczynowe)

## Architektura

- **Framework:** Shopify Hydrogen (Remix + Storefront API)
- **Hosting:** Cloudflare Pages
- **Struktura:** `apps/kazka/`, `apps/zareczyny/` – jeden folder = jedna strona

## Wymagania

- Node.js >= 18
- konto Shopify (Headless channel)
- konto Cloudflare

## Instalacja

```bash
npm install
```

## Rozwój

```bash
npm run dev:kazka      # apps/kazka
npm run dev:zareczyny  # apps/zareczyny
```

## Build i deploy

```bash
npm run deploy:kazka     # apps/kazka → kazka-hydrogen-pages
npm run deploy:zareczyny # apps/zareczyny → zareczyny-hydrogen-pages
npm run deploy           # oba
```

## Zmienne środowiskowe

W każdym appie (`apps/kazka/`, `apps/zareczyny/`): skopiuj `.dev.vars.example` do `.dev.vars` (gitignored) i uzupełnij:

- `SESSION_SECRET` – sekret (produkcyjnie w Cloudflare Secrets)
- `PUBLIC_STOREFRONT_API_TOKEN` / `PRIVATE_STOREFRONT_API_TOKEN` – klucze Storefront API (trzymamy w Cloudflare Secrets)
- `PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID` – Customer Account API (trzymamy w Cloudflare Secrets)
- `PUBLIC_STORE_DOMAIN`, `PUBLIC_CHECKOUT_DOMAIN`, `PUBLIC_STOREFRONT_ID`, `SHOP_ID` – zwykle mogą być zwykłymi Variables

W produkcji: **nie trzymamy sekretów w repo ani w `wrangler.toml`**. Ustaw je w Cloudflare Pages:
Workers & Pages → projekt → Settings → Variables and Secrets → Secrets (albo CLI: `npx wrangler@latest pages secret put ...`).

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

1. Utwórz repo `epir-headless` na GitHubie (np. https://github.com/EPIRjewelry/epir-headless)
2. `git remote add origin <url>` *(już ustawione: EPIRjewelry/epir-headless)*
3. `git add . && git commit -m "Initial: Hydrogen Kazka na Cloudflare Workers"` *(wykonane)*
4. `git push -u origin main` *(wykonaj po utworzeniu repo)*

**Sekrety GitHub Actions:** Settings → Secrets and variables → Actions → dodaj `CLOUDFLARE_API_TOKEN` i `CLOUDFLARE_ACCOUNT_ID`.
