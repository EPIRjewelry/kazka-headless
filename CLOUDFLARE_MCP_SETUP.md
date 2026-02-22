# Konfiguracja Cloudflare MCP – zarządzanie domenami

Instrukcja krok po kroku, aby Cursor (Composer) mógł zarządzać domenami i DNS w Cloudflare.

---

## CZĘŚĆ 1: Aktualizacja tokena API Cloudflare

### Krok 1.1: Wejdź do ustawień tokenów

1. Otwórz: **https://dash.cloudflare.com/profile/api-tokens**
2. Zaloguj się na konto Cloudflare (jeśli trzeba)

### Krok 1.2: Znajdź token używany przez MCP

- Na liście tokenów znajdź ten, którego używasz w Cursor (np. ten z `CLOUDFLARE_API_TOKEN` w `mcp.json`)
- Kliknij **Edit** (ikona ołówka) przy tym tokenie

### Krok 1.3: Dodaj uprawnienia

W sekcji **Permissions** upewnij się, że token ma:

| Sekcja | Uprawnienie | Zakres |
|--------|-------------|--------|
| **Account** | **Cloudflare Pages** → **Edit** | Całe konto |
| **Zone** | **Zone** → **Read** | Wszystkie strefy LUB wybierz `epirbizuteria.pl` |
| **Zone** | **DNS** → **Edit** | Wszystkie strefy LUB wybierz `epirbizuteria.pl` |

**Jak dodać:**
1. Kliknij **Add more**
2. Wybierz **Account** → **Cloudflare Pages** → **Edit**
3. Wybierz **Zone** → **Zone** → **Read**
4. Wybierz **Zone** → **DNS** → **Edit**
5. Dla Zone: wybierz **Specific zone** → `epirbizuteria.pl` (jeśli domena jest w Cloudflare)

### Krok 1.4: Zapisz

1. Kliknij **Continue to summary**
2. Kliknij **Update Token**

---

## CZĘŚĆ 2: Dodanie Cloudflare DNS MCP do Cursora

### Krok 2.1: Otwórz plik konfiguracji MCP

1. W Cursor: **File** → **Preferences** → **Cursor Settings** (lub `Ctrl+,`)
2. Wyszukaj: **MCP**
3. Kliknij **Edit in settings.json** przy MCP – otworzy się plik z konfiguracją

**LUB** otwórz ręcznie plik:
- **Windows:** `C:\Users\user\.cursor\mcp.json`
- **Mac/Linux:** `~/.cursor/mcp.json`

### Krok 2.2: Dodaj nowy serwer MCP

W pliku `mcp.json` znajdź sekcję `"mcpServers"`. Dodaj nowy wpis **przed** zamykającym `}`:

```json
"cloudflare-dns": {
  "command": "npx",
  "args": ["-y", "@thelord/mcp-cloudflare"],
  "env": {
    "CLOUDFLARE_API_TOKEN": "XbAUy7Y9r46H06GqAlNs8cACzZDdHvQxYx0t6-LJ",
    "CLOUDFLARE_ZONE_ID": "TWOJ_ZONE_ID"
  }
}
```

**Gdzie wziąć Zone ID:**
1. Wejdź na https://dash.cloudflare.com
2. Wybierz domenę **epirbizuteria.pl**
3. W prawym panelu (Overview) znajdź **Zone ID** – skopiuj (np. `abc123def456...`)

**Uwaga:** Zastąp `CLOUDFLARE_API_TOKEN` swoim tokenem (tym samym co w cloudflare-observability), jeśli jest inny. Zastąp `TWOJ_ZONE_ID` Zone ID domeny epirbizuteria.pl.

### Krok 2.3: Pełny przykład `mcp.json`

Po dodaniu sekcja `mcpServers` może wyglądać tak:

```json
{
  "mcpServers": {
    "github": { ... },
    "shopify-dev-mcp": { ... },
    "shopify-admin-mcp": { ... },
    "cloudflare-bindings": { ... },
    "cloudflare-observability": { ... },
    "cloudflare-builds": { ... },
    "cloudflare-dns": {
      "command": "npx",
      "args": ["-y", "@thelord/mcp-cloudflare"],
      "env": {
        "CLOUDFLARE_API_TOKEN": "XbAUy7Y9r46H06GqAlNs8cACzZDdHvQxYx0t6-LJ",
        "CLOUDFLARE_ZONE_ID": "TWOJ_ZONE_ID"
      }
    }
  }
}
```

### Krok 2.4: Zapisz i zrestartuj Cursor

1. Zapisz plik `mcp.json`
2. Zamknij Cursor całkowicie
3. Uruchom Cursor ponownie

---

## CZĘŚĆ 3: Weryfikacja

### Sprawdzenie MCP

1. Otwórz nowy czat w Cursor
2. Napisz: „Wylistuj strefy DNS w Cloudflare” lub „Pokaż rekordy DNS dla epirbizuteria.pl”
3. Jeśli MCP działa, Composer użyje narzędzi Cloudflare DNS

### Sprawdzenie tokena

1. Wejdź na: https://dash.cloudflare.com/profile/api-tokens
2. Kliknij **Verify** przy swoim tokenie
3. Powinno być: „This API Token is valid and active”

---

## Troubleshooting

| Problem | Rozwiązanie |
|---------|-------------|
| MCP się nie ładuje | Sprawdź składnię JSON w `mcp.json` (przecinki, nawiasy) |
| Brak uprawnień | Upewnij się, że token ma Zone DNS Edit i Pages Edit |
| Domena nie w Cloudflare | Najpierw dodaj `epirbizuteria.pl` do Cloudflare (Websites → Add site) |
| `@thelord/mcp-cloudflare` nie działa | Sprawdź, czy `npx` działa w terminalu: `npx -y @thelord/mcp-cloudflare` |

---

## Dodanie subdomeny zareczyny.epirbizuteria.pl (po konfiguracji MCP)

Gdy MCP będzie działać, możesz poprosić Composera:

1. **„Dodaj rekord CNAME: zareczyny → zareczyny-hydrogen-pages.pages.dev”** – utworzy rekord DNS
2. **„Dodaj custom domain zareczyny.epirbizuteria.pl do projektu Pages zareczyny-hydrogen-pages”** – wymaga Pages API (może nie być w tym MCP)

**Ręcznie (jeśli MCP nie obsługuje Pages):** Cloudflare Dashboard → Workers & Pages → zareczyny-hydrogen-pages → Custom domains → Set up a domain → wpisz `zareczyny.epirbizuteria.pl`

---

## Bezpieczeństwo

- Nie commituj `mcp.json` z tokenem do repozytorium
- Token w `mcp.json` jest lokalny – tylko na Twoim komputerze
- Możesz użyć osobnego tokena tylko dla DNS (z ograniczonymi uprawnieniami)
