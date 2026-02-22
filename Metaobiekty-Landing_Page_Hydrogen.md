# Metaobiekty w tworzeniu i utrzymaniu landing page'ów – rozpoznanie

## 1. Czym są metaobiekty

**Metaobiekty** to struktury danych w Shopify, które pozwalają tworzyć własne typy treści (np. sekcje, trasy, profile). Każdy metaobiekt ma:
- **Definicję** (schemat pól: tekst, obraz, referencje do produktów/kolekcji)
- **Wpisy** (konkretne instancje z danymi)
- **Dostęp przez Storefront API** (po włączeniu „Storefront access”)

---

## 2. Proces tworzenia landing page'a z metaobiektami

### Krok 1: Definicje metaobiektów (Shopify Admin)

**Settings → Custom data → Metaobjects**

1. Utworzenie definicji typu `route` (strona/landing):
   - Pola: `title`, `sections` (referencje do innych metaobiektów)
   - Opcja: **Publish entries as web pages**
   - Opcja: **Storefront API access**

2. Definicje sekcji (np. Hero, Featured Products, Featured Collections):
   - `section_hero`: `heading`, `subheading`, `image`, `link`
   - `section_featured_products`: `heading`, `products`, `with_product_prices`
   - `section_featured_collections`: `heading`, `collections`

### Krok 2: Wpisy metaobiektów

**Content → [nazwa definicji]**

- Tworzenie wpisów dla każdej strony
- Uzupełnianie pól (tekst, obrazy, linki do produktów/kolekcji)
- Każdy wpis może mieć własny URL (handle)

### Krok 3: Integracja w Hydrogen/Headless

- Zapytania GraphQL: `metaobject(handle: {type: "route", handle: "route-home"})`
- Komponenty React renderujące sekcje na podstawie typu
- Mapowanie: `type` metaobiektu → komponent (np. `SectionHero`, `SectionFeaturedProducts`)

---

## 3. Architektura (Hydrogen Cookbook)

```
Route (metaobject)
 └── sections (referencje)
     ├── SectionHero
     ├── SectionFeaturedProducts
     ├── SectionFeaturedCollections
     ├── SectionStoreProfile
     └── SectionStores
```

**Przykładowe zapytanie:**

```graphql
query RouteContent($handle: String!) {
  route: metaobject(handle: {type: "route", handle: $handle}) {
    type
    id
    title: field(key: "title") { key value }
    sections: field(key: "sections") {
      references(first: 20) {
        nodes {
          ... on Metaobject {
            type
            field(key: "heading") { value }
            field(key: "image") { reference { ... on MediaImage { image { url } } } }
            # ...
          }
        }
      }
    }
  }
}
```

---

## 4. Utrzymanie (edytowanie)

| Gdzie | Co |
|------|-----|
| **Shopify Admin → Content** | Edycja treści wpisów (teksty, obrazy, linki) |
| **Theme Editor** (Online Store) | Szablony dla metaobiektów, jeśli używasz motywu |
| **Hydrogen** | Przycisk „Edit Route” w dev/preview – link do Admin |
| **Kod** | Nowe typy sekcji: definicja metaobiektu + komponent React + fragment GraphQL |

---

## 5. Storefront API

- **Query:** `metaobject(handle: {type: "route", handle: "route-home"})`
- **Query:** `metaobjects(type: "section_hero", first: 10)`
- **Scope:** `unauthenticated_read_metaobjects`
- **Pola:** `id`, `type`, `handle`, `fields`, `field(key: "x")`, `seo`, `onlineStoreUrl`

---

## 6. Stan w aplikacji `apps/zareczyny`

W `apps/zareczyny` **nie ma użycia metaobiektów**. Strona główna i kolekcje są renderowane na podstawie zapytań GraphQL do `collections` i `products`, bez metaobiektów.

---

## 7. Co trzeba zrobić, żeby dodać landing page'e oparte o metaobiekty

1. **Shopify Admin** – definicje metaobiektów (route, sekcje) z dostępem Storefront
2. **Hydrogen** – komponenty sekcji (`SectionHero`, `SectionFeaturedProducts` itd.)
3. **Route** – np. `app/routes/landing.$handle.tsx` z zapytaniem `metaobject(type, handle)`
4. **Komponent renderujący** – `RouteContent` → renderowanie sekcji na podstawie `type`
5. **Uprawnienia** – token Storefront API z scope `unauthenticated_read_metaobjects`

---

## 8. Zasoby

- [Shopify: Dynamic content with metaobjects in Hydrogen](https://shopify.dev/docs/storefronts/headless/hydrogen/cookbook/metaobjects)
- [Shopify Help: Building web pages with metaobjects](https://help.shopify.com/en/manual/custom-data/metaobjects/connecting-to-your-online-store/webpages)
- [Storefront API: metaobject](https://shopify.dev/docs/api/storefront/latest/queries/metaobject)
- [Storefront API: metaobjects](https://shopify.dev/docs/api/storefront/latest/queries/metaobjects)
