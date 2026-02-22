# Plan: Dwa storefronty – Kazka i Zareczyny

## Cel

Dwa osobne storefronty Hydrogen w jednym repo:
- **kazka** → kazka-hydrogen-pages.pages.dev (np. kazka.epirbizuteria.pl)
- **zareczyny** → zareczyny-hydrogen-pages.pages.dev (np. zareczyny.epirbizuteria.pl)

---

## Obecny stan repo

```
epir-headless/
├── app/                    # jeden storefront (obecnie skonfigurowany pod zareczyny)
├── server.ts
├── wrangler.toml           # name=zareczyny-hydrogen-pages
├── package.json            # deploy → zareczyny-hydrogen-pages
├── .github/workflows/      # deploy tylko do zareczyny
└── .dev.vars               # env Epir (jeden zestaw)
```

**Cloudflare:**
- kazka-hydrogen-pages – istnieje, ostatni deploy z wcześniejszej wersji
- zareczyny-hydrogen-pages – nie istnieje (tylko zmiana w configu, brak deployu)

---

## Opcje realizacji

### Opcja A: Jeden kod, dwa deployy (najprostsza)

Ta sama aplikacja, dwa projekty Pages z różnymi env w Cloudflare.

| Aspekt | Kazka | Zareczyny |
|--------|-------|-----------|
| **Kod** | Wspólny | Wspólny |
| **Projekt Pages** | kazka-hydrogen-pages | zareczyny-hydrogen-pages |
| **Env (Cloudflare)** | Ustawione w Dashboard | Ustawione w Dashboard |
| **Domena** | kazka.epirbizuteria.pl | zareczyny.epirbizuteria.pl |

**Różnice między storefrontami:** tylko zmienne środowiskowe (np. `STOREFRONT_NAME`, `PUBLIC_STORE_DOMAIN` jeśli różne sklepy).

**Zmiany w repo:**
1. Dwa skrypty deploy: `deploy:kazka`, `deploy:zareczyny`
2. GitHub Actions: deploy do obu projektów (lub osobne workflow)
3. W Cloudflare: env per projekt (np. różne `PUBLIC_STORE_DOMAIN` jeśli różne sklepy)

---

### Opcja B: Monorepo – dwa osobne appy

Osobne aplikacje w `apps/kazka` i `apps/zareczyny`, współdzielone komponenty.

```
epir-headless/
├── apps/
│   ├── kazka/
│   │   ├── app/
│   │   ├── server.ts
│   │   ├── wrangler.toml
│   │   └── .dev.vars
│   └── zareczyny/
│       ├── app/
│       ├── server.ts
│       ├── wrangler.toml
│       └── .dev.vars
├── packages/
│   └── shared/           # komponenty, utils
├── package.json          # workspace root
└── turbo.json
```

**Zalety:** różny layout, branding, routing.  
**Wady:** duplikacja, więcej utrzymania.

---

### Opcja C: Multi-tenant (jeden deploy, routing po domenie)

Jedna aplikacja, wybór storefrontu po `request.url` (np. hostname).

```ts
// server.ts – pseudokod
const host = new URL(request.url).hostname;
const config = host.includes('zareczyny') ? ZARECZYNY_CONFIG : KAZKA_CONFIG;
```

**Zalety:** jeden deploy, jeden projekt Pages.  
**Wady:** bardziej złożona logika, trudniejsze debugowanie.

---

## Rekomendacja: Opcja A

Dla Epir (prawdopodobnie ten sam sklep, różne „marki”/kolekcje) wystarczy:

1. Jeden kod
2. Dwa projekty Pages z różnymi env
3. Dwa skrypty deploy i workflow

---

## Plan realizacji (Opcja A)

### Krok 1: Skrypty deploy

W `package.json`:
```json
"deploy:kazka": "npm run build && wrangler pages deploy public --project-name=kazka-hydrogen-pages",
"deploy:zareczyny": "npm run build && wrangler pages deploy public --project-name=zareczyny-hydrogen-pages",
"deploy": "npm run deploy:kazka && npm run deploy:zareczyny"
```

### Krok 2: GitHub Actions

Deploy do obu projektów przy pushu na `main`:
```yaml
- name: Deploy Kazka
  run: npx wrangler pages deploy public --project-name=kazka-hydrogen-pages
- name: Deploy Zareczyny
  run: npx wrangler pages deploy public --project-name=zareczyny-hydrogen-pages
```

### Krok 3: Wrangler

`wrangler.toml` – `name` może zostać np. `zareczyny-hydrogen-pages` (używane przy `wrangler pages dev`). Deploy i tak idzie przez `--project-name`.

### Krok 4: Env w Cloudflare

W każdym projekcie Pages ustawić:
- kazka-hydrogen-pages: env Epir (np. ten sam sklep)
- zareczyny-hydrogen-pages: env Epir (ten sam lub inny sklep)

Opcjonalnie dodać `STOREFRONT_NAME` / `BRAND` do różnicowania w UI.

### Krok 5: Custom domains

- kazka-hydrogen-pages → kazka.epirbizuteria.pl
- zareczyny-hydrogen-pages → zareczyny.epirbizuteria.pl

W Cloudflare Dashboard → Custom domains dla każdego projektu.

---

## Pytania do doprecyzowania

1. **Ten sam sklep Shopify** (epir-art-silver-jewellery) czy dwa różne?
2. **Różny wygląd** (np. kolory, logo) – czy potrzebne zmienne typu `BRAND` / `STOREFRONT_NAME`?
3. **Różne kolekcje** – czy każdy storefront ma pokazywać inne kolekcje (np. po tagach)?

---

## Kolejność wdrożenia

1. Dodać `deploy:kazka` i `deploy:zareczyny`
2. Zaktualizować GitHub Actions (deploy do obu)
3. Zdeployować oba projekty
4. Podpiąć custom domains w Cloudflare
5. (Opcjonalnie) Dodać branding przez env
