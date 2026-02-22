# Struktura metaobiektów sklepu z biżuterią premium – research

## Źródła

- Shopify Admin API (MCP) – sklep EPIR Art Silver Jewellery
- [Shopify Product Taxonomy](https://github.com/Shopify/product-taxonomy) – atrybuty produktowe
- [Shopify Metaobjects Docs](https://shopify.dev/docs/apps/build/custom-data/metaobjects)
- [Shopify Help: Metaobjects](https://help.shopify.com/en/manual/custom-data/metaobjects)

---

## 1. Metaobiekty Shopify (Product Taxonomy)

Shopify udostępnia standardowe definicje metaobiektów powiązane z Product Taxonomy. Dla biżuterii są to m.in.:

| Typ | Nazwa | Opis | Pola kluczowe |
|-----|-------|------|----------------|
| `shopify--color-pattern` | Color | Kolor/wzór | label, color, image, color_taxonomy_reference, pattern_taxonomy_reference |
| `shopify--jewelry-type` | Jewelry type | Typ biżuterii (fine/imitation) | label, taxonomy_reference |
| `shopify--ring-size` | Ring size | Rozmiar pierścionka (L, 6.5, EU 52…) | label, taxonomy_reference |
| `shopify--ring-design` | Ring design | Styl pierścionka (band, solitaire) | label, taxonomy_reference |
| `shopify--jewelry-material` | Jewelry material | Materiał (gold, silver, enamel) | label, taxonomy_reference |
| `shopify--target-gender` | Target gender | Płeć docelowa | label, taxonomy_reference |
| `shopify--age-group` | Age group | Grupa wiekowa | label, taxonomy_reference |
| `shopify--earring-design` | Earring design | Styl kolczyków (hoop, stud) | label, taxonomy_reference |
| `shopify--bracelet-design` | Bracelet design | Styl bransoletki (charm, cuff) | label, taxonomy_reference |
| `shopify--necklace-design` | Necklace design | Styl naszyjnika (pendant, choker) | label, taxonomy_reference |

---

## 2. Atrybuty Product Taxonomy dla biżuterii

Z pliku `data/attributes.yml` (Shopify product-taxonomy):

| ID | Atrybut | Opis | Przykładowe wartości |
|----|---------|------|----------------------|
| 1 | Color | Kolor | gold, silver, rose_gold, multicolor |
| 3 | Pattern | Wzór | floral, geometric, hearts, diamond |
| 4 | Material | Materiał | gold, silver, brass, stone |
| 60 | Jewelry type | Typ biżuterii | fine_jewelry, imitation_jewelry |
| 73 | Shape | Kształt | round, oval, heart, diamond |
| 98 | Chain link type | Typ ogniwa łańcucha | rope, cable, herringbone, snake |
| 105 | Ring size | Rozmiar pierścionka | 5, 5.5, 6… (US), 52, 54… (EU), L, M… (alfabetyczny) |
| 108 | Clasp type | Typ zapięcia | buckle, butterfly, deployment |
| 837 | Target gender | Płeć | female, male, unisex |

---

## 3. Metaobiekty niestandardowe (EPIR – sklep premium)

Z listy MCP dla epir-art-silver-jewellery.myshopify.com:

| Typ | Nazwa | Opis | Pola |
|-----|-------|------|------|
| `nazwa_wyrobu` | Nazwa wyrobu | Nazwa produktu | tekst_wymagany_w_tym_mejscu (single_line_text_field) |
| `opis_kamienia` | Opis kamienia | Rodzaj/nazwa kamienia | nazwa_kamiena, opis_kamienia (multi_line_text_field) |
| `tabela_rozmiarow` | Tabela rozmiarów | Tabela rozmiarów pierścionków | table_content (rich_text_field) |
| `stone_profile` | Stone Profile | Profil kamienia edukacyjny | stone_name, hardness, mythology, care_instructions, chakra, birthstone_month, historia_kamienia, paleta_kolorow_kamienia, refractive_index, epir_technique, design_challenge |
| `collection_enhanced` | Collection Enhanced | Rozszerzona kolekcja | name, hero_video, texture_overlay, philosophy, accent_color, lookbook_images |

---

## 4. Rekomendowana struktura dla sklepu premium

### 4.1 Produkty

**Metaobiekty produktowe (referencje z metafields):**

- **Tabela rozmiarów** – `tabela_rozmiarow` (reusable per produkt/kategoria)
- **Opis kamienia** – `opis_kamienia` (dla produktów z kamieniami)
- **Profil kamienia** – `stone_profile` (treści edukacyjne, linkowane z produktów)
- **Taxonomy** – `shopify--ring-size`, `shopify--jewelry-material`, `shopify--ring-design` (filtrowanie, wyszukiwanie)

### 4.2 Kolekcje

- **Collection Enhanced** – hero video, texture overlay, filozofia, lookbook – dla landingów kolekcji

### 4.3 Landing pages (Hydrogen)

- **Route** – metaobject `route` z polami `title`, `sections`
- **Sekcje** – `section_hero`, `section_featured_products`, `section_featured_collections`

---

## 5. Mapowanie: Taxonomy → Metaobjects

Product Taxonomy używa atrybutów; Shopify tworzy z nich metaobject definitions z prefiksem `shopify--`:

| Taxonomy attribute | Metaobject type |
|--------------------|-----------------|
| color + pattern | shopify--color-pattern |
| jewelry_type | shopify--jewelry-type |
| ring_size | shopify--ring-size |
| ring_design | shopify--ring-design |
| jewelry_material | shopify--jewelry-material |
| target_gender | shopify--target-gender |
| age_group | shopify--age-group |
| earring_design | shopify--earring-design |
| bracelet_design | shopify--bracelet-design |
| necklace_design | shopify--necklace-design |

---

## 6. Storefront API

- **Scope:** `unauthenticated_read_metaobjects`
- **Query:** `metaobject(handle: {type: "stone_profile", handle: "rubin"})`
- **Query:** `metaobjects(type: "tabela_rozmiarow", first: 10)`

Definicje muszą mieć włączony **Storefront API access** (Settings → Custom data → Metaobjects → [definicja] → Options).

---

## 7. Zasoby

- [Shopify Product Taxonomy Explorer](https://shopify.github.io/product-taxonomy/releases/latest/?categoryId=sg-4-17-2-17)
- [Shopify Metaobjects – About](https://shopify.dev/docs/apps/build/custom-data/metaobjects)
- [Standard metaobject definitions](https://shopify.dev/docs/apps/build/metaobjects/list-of-standard-definitions)
- [Hydrogen: Dynamic content with metaobjects](https://shopify.dev/docs/storefronts/headless/hydrogen/cookbook/metaobjects)
