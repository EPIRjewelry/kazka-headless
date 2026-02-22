# Deploy Kazka & Zareczyny (Hydrogen na Cloudflare Pages)

## Projekty

| Storefront | Projekt Cloudflare | URL |
|------------|-------------------|-----|
| **Kazka** | kazka-hydrogen-pages | https://kazka-hydrogen-pages.pages.dev |
| **Zareczyny** | zareczyny-hydrogen-pages | https://zareczyny-hydrogen-pages.pages.dev |

---

## 1. GitHub Actions – Secrets (do deployu)

W **Settings → Secrets and variables → Actions** dodaj:

| Secret | Opis |
|--------|------|
| `CLOUDFLARE_ACCOUNT_ID` | ID konta (73283c24dc79f92edef30dcdbc98f230 – z wrangler.toml) |
| `CLOUDFLARE_API_TOKEN` | Token do deployu (patrz niżej) |

### Jak utworzyć CLOUDFLARE_API_TOKEN

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) → **My Profile** → **API Tokens**
2. **Create Token** → szablon **Edit Cloudflare Workers**
3. Uprawnienia: Account → Cloudflare Workers Scripts → Edit, Account Settings → Read
4. **Create Token** → skopiuj (pokazany tylko raz)
5. GitHub → Repo → Settings → Secrets and variables → Actions → **New repository secret** → `CLOUDFLARE_API_TOKEN`

---

## 2. Sekrety i zmienne w Cloudflare (każdy projekt osobno)

Dla **kazka-hydrogen-pages** i **zareczyny-hydrogen-pages** ustaw w Cloudflare:

**Workers & Pages** → [nazwa projektu] → **Settings** → **Variables and Secrets**

### Zmienne (Variables) – Production

| Nazwa | Kazka | Zareczyny |
|-------|-------|-----------|
| `BRAND` | kazka | zareczyny |
| `COLLECTION_FILTER` | **kazka** (tylko ta kolekcja w nav) | pierscionki-zareczynowe |
| `NODE_ENV` | production | production |
| `PUBLIC_STORE_DOMAIN` | epir-art-silver-jewellery.myshopify.com | epir-art-silver-jewellery.myshopify.com |
| `PUBLIC_CHECKOUT_DOMAIN` | checkout.shopify.com | checkout.shopify.com |
| `PUBLIC_STOREFRONT_ID` | 1000013955 | 1000013955 |
| `SHOP_ID` | 55145660472 | 55145660472 |

### Sekrety (Secrets) – Production

| Secret | Skąd wziąć |
|--------|------------|
| `SESSION_SECRET` | `openssl rand -hex 32` (losowy ciąg) |
| `PUBLIC_STOREFRONT_API_TOKEN` | Shopify Admin → Apps → Develop apps → Storefront API token |
| `PRIVATE_STOREFRONT_API_TOKEN` | Shopify Admin → Apps → Develop apps → Storefront API token (private) |
| `PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID` | Shopify Admin → Customer accounts → Headless (jeśli używane) |

**Uwaga:** Sekrety ustaw jako **Encrypted** (Secret), nie jako zwykłe zmienne.

---

## 3. Deploy

### Z GitHub (automatycznie)

Push na `main` uruchamia workflow – deploy obu storefrontów.

### Ręcznie (lokalnie)

```bash
# Oba storefronty
npm run deploy

# Tylko Kazka
npm run deploy:kazka

# Tylko Zareczyny
npm run deploy:zareczyny
```

Wymaga: `wrangler login` oraz ustawionych `CLOUDFLARE_API_TOKEN` i `CLOUDFLARE_ACCOUNT_ID` (lub zalogowanego wranglera).

---

## 4. Ustawianie sekretów przez CLI (opcjonalnie)

```bash
# Kazka
cd apps/kazka
npx wrangler pages secret put SESSION_SECRET --project-name=kazka-hydrogen-pages
npx wrangler pages secret put PUBLIC_STOREFRONT_API_TOKEN --project-name=kazka-hydrogen-pages
npx wrangler pages secret put PRIVATE_STOREFRONT_API_TOKEN --project-name=kazka-hydrogen-pages
npx wrangler pages secret put PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID --project-name=kazka-hydrogen-pages

# Zareczyny (z root repo)
cd apps/zareczyny
npx wrangler pages secret put SESSION_SECRET --project-name=zareczyny-hydrogen-pages
npx wrangler pages secret put PUBLIC_STOREFRONT_API_TOKEN --project-name=zareczyny-hydrogen-pages
npx wrangler pages secret put PRIVATE_STOREFRONT_API_TOKEN --project-name=zareczyny-hydrogen-pages
npx wrangler pages secret put PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID --project-name=zareczyny-hydrogen-pages
```

Każda komenda poprosi o wartość (wpisz lub wklej).

---

## 5. Tworzenie projektu (jeśli nie istnieje)

1. **Workers & Pages** → **Create** → **Pages** → **Connect to Git** (opcjonalnie) lub **Direct Upload**
2. Dla Direct Upload: pierwszy deploy z `npm run deploy:kazka` / `npm run deploy:zareczyny` utworzy projekt przy pierwszym deployu.
3. Po utworzeniu projektu ustaw **Variables and Secrets** (punkt 2).

---

## 6. Troubleshooting: Application Error / dwie domeny, różna strona

### Application Error na kazka-hydrogen-pages.pages.dev

1. **Workers & Pages** → **kazka-hydrogen-pages** → **Logs** (lub **Real-time logs**)
2. Odśwież stronę https://kazka-hydrogen-pages.pages.dev
3. Szukaj w logach: `[kazka] getLoadContext env:` lub `[kazka] Missing env:`
4. Jeśli widzisz **Missing env** – dodaj brakujące sekrety (punkt 2 i 4 powyżej)
5. Sekrety można ustawić przez CLI: `cd apps/kazka && npx wrangler pages secret put SESSION_SECRET --project-name=kazka-hydrogen-pages` (i analogicznie dla pozostałych)

### Dwie domeny pokazują różną treść

W jednym projekcie Pages obie domeny (.pages.dev i custom) serwują ten sam deployment. Jeśli `kazka-hydrogen-pages.pages.dev` i `kazka.epirbizuteria.pl` pokazują coś innego:

- **kazka.epirbizuteria.pl** może być przypisana do **zareczyny-hydrogen-pages** (wtedy pokazuje Zareczyny)
- Sprawdź: **zareczyny-hydrogen-pages** → **Custom domains** – usuń `kazka.epirbizuteria.pl`, jeśli jest
- Sprawdź: **kazka-hydrogen-pages** → **Custom domains** – dodaj `kazka.epirbizuteria.pl`, jeśli jej nie ma
- **kazka.epirbizuteria.pl** musi być tylko w projekcie **kazka-hydrogen-pages**

### Dwa projekty Pages o nazwie Kazka (duplikat)

Jeśli masz dwa projekty związane z Kazka (jeden zwraca błąd, drugi starą stronę):

1. **Lista projektów** (wymaga `CLOUDFLARE_API_TOKEN`):
   ```bash
   curl -s "https://api.cloudflare.com/client/v4/accounts/73283c24dc79f92edef30dcdbc98f230/pages/projects" \
     -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" | jq .
   ```
2. **Workers & Pages** → znajdź oba projekty zawierające „kazka”
3. **Usuń zbędny** – ten ze starą stroną lub duplikat
4. **kazka.epirbizuteria.pl** – tylko w projekcie **kazka-hydrogen-pages** (Custom domains)

**Skrypt do listy projektów:** `CLOUDFLARE_API_TOKEN=xxx node scripts/cloudflare-list-pages-projects.mjs`

### kazka.epirbizuteria.pl wskazuje na usunięty worker (404)

Po usunięciu starego projektu Pages, subdomena może nadal wskazywać na nieistniejący worker.

**Rozwiązanie:**

1. **Dodaj custom domain do kazka-hydrogen-pages:**
   - **Workers & Pages** → **kazka-hydrogen-pages** → **Custom domains** → **Set up a custom domain**
   - Wpisz: `kazka.epirbizuteria.pl`
   - Cloudflare doda CNAME automatycznie (jeśli epirbizuteria.pl jest w tym samym koncie)

2. **Lub przez skrypt** (wymaga `CLOUDFLARE_API_TOKEN`):
   ```bash
   node scripts/cloudflare-add-kazka-domain.mjs
   ```
   Z `CLOUDFLARE_ZONE_ID` (Zone ID domeny epirbizuteria.pl) skrypt doda też rekord CNAME.

3. **Ręcznie DNS** (jeśli domena poza Cloudflare): dodaj CNAME `kazka` → `kazka-hydrogen-pages.pages.dev`

### Application Error – brak sekretów

Worker się wywala, gdy brakuje SESSION_SECRET, PUBLIC_STOREFRONT_API_TOKEN lub PRIVATE_STOREFRONT_API_TOKEN. Ustaw je w **kazka-hydrogen-pages** → **Settings** → **Variables and Secrets** (punkt 4 powyżej).
