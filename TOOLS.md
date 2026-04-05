# Tools Reference -- ch-vet-medicines-mcp

10 tools providing Swiss veterinary medicine data. All tool responses include a `_meta` object with disclaimer, data age, and source attribution.

---

## about

Get server metadata: name, version, coverage, data sources, and links.

**Parameters:** None

**Returns:**
```json
{
  "name": "Switzerland Veterinary Medicines MCP",
  "description": "...",
  "version": "0.1.0",
  "jurisdiction": ["CH"],
  "data_sources": ["Tierarzneimittel-Kompendium (Swissmedic)", "..."],
  "tools_count": 10,
  "links": { "homepage": "...", "repository": "...", "mcp_network": "..." },
  "_meta": { "disclaimer": "...", "data_age": "...", "source_url": "...", "copyright": "...", "server": "ch-vet-medicines-mcp", "version": "0.1.0" }
}
```

---

## list_sources

List all data sources with authority, URL, license, and freshness info.

**Parameters:** None

**Returns:** Array of source objects, each with `name`, `authority`, `official_url`, `retrieval_method`, `update_frequency`, `license`, `coverage`, and `last_retrieved`.

---

## check_data_freshness

Check when data was last ingested, staleness status, and how to trigger a refresh.

**Parameters:** None

**Returns:**
- `status` -- `fresh` (under 90 days), `stale` (over 90 days), or `unknown` (no ingest date)
- `last_ingest` -- ISO date of last ingestion or `null`
- `build_date` -- ISO date of last database build or `null`
- `schema_version` -- Database schema version
- `days_since_ingest` -- Number of days since last ingestion
- `staleness_threshold_days` -- 90
- `refresh_command` -- GitHub Actions command to trigger refresh

---

## search_medicines

Search Swiss veterinary medicines (Tierarzneimittel). Uses tiered FTS5 search with automatic fallback (phrase > AND > prefix > stemmed > OR > LIKE).

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | Yes | Search term (medicine name, active substance, or species) |
| `species` | string | No | Filter by species (e.g. Rind, Schwein, Gefluegel, Pferd) |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: CH) |
| `limit` | number | No | Max results (default: 20, max: 50) |

**Returns:** `results_count` and array of matching medicines with `title`/`name`, `active_substance`, `species`, `swissmedic_number`, `category`.

**Limitations:** FTS search covers indexed data only. If no FTS results are found, falls back to LIKE matching on `name` and `active_substance` columns. German search terms perform best.

---

## get_medicine_details

Get full profile for a veterinary medicine: active substance, target species, withdrawal times, Swissmedic number, dispensing category.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `medicine_id` | string | Yes | Medicine ID or name (e.g. amoxicillin-rind, cobactan) |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: CH) |

**Returns:** Full medicine profile including `withdrawal_times` array (species, produce_type, days, notes). Returns `medicine_not_found` error if no match.

**Behaviour:** Tries exact ID match first, then partial name match.

---

## get_withdrawal_times

Get withdrawal periods (Absetzfristen) for veterinary medicines. Filter by medicine, species, or produce type.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `medicine_id` | string | No | Medicine ID or name |
| `species` | string | No | Species (e.g. Rind, Schwein, Gefluegel) |
| `produce_type` | string | No | Produce type (Milch, Fleisch, Eier, Honig) |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: CH) |

**Returns:** Array of withdrawal time records with `medicine_id`, `medicine_name`, `active_substance`, `species`, `produce_type`, `withdrawal_days`, `notes`.

**Note:** For off-label use (Umwidmung), TAMV Art. 5-6 mandates double withdrawal times. This server reports standard times -- the doubling rule must be applied by the practitioner.

---

## get_antibiotic_categories

Get the Swiss Ampelsystem classification of antibiotics (gruen/gelb/rot) with restrictions and usage rules.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: CH) |

**Returns:** Grouped by Ampel colour:
- **gruen** -- First-line antibiotics. Empirical use without antibiogram permitted.
- **gelb** -- Second-line. Antibiogram recommended.
- **rot** -- Critically important antibiotics (WHO Highest Priority CIA). Antibiogram mandatory. Restricted under StAR.

Each class entry includes `antibiotic_class`, `restrictions`, and `notes`.

---

## search_resistance_data

Search ARCH-Vet antibiotic resistance monitoring data. Filter by bacterium, antibiotic class, or animal species.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | Yes | Search term (bacterium, antibiotic, species) |
| `bacterium` | string | No | Filter by bacterium (e.g. E. coli, MRSA, Campylobacter) |
| `antibiotic_class` | string | No | Filter by antibiotic class (e.g. Fluoroquinolone) |
| `species` | string | No | Filter by species |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: CH) |
| `limit` | number | No | Max results (default: 20, max: 50) |

**Returns:** Array of resistance data entries with `bacterium`, `antibiotic_class`, `resistance_pct`, `trend`, `species`, `year`, `source`. Ordered by year descending.

**Limitations:** Data reflects the most recent ARCH-Vet report ingested. Resistance rates may vary depending on sample origin and methodology.

---

## get_prescription_rules

Get Swiss veterinary medicine dispensing rules: Abgabekategorien (A, B, D, E), Selbstdispensation, TAM-Vereinbarung, Behandlungsjournal.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `medicine_category` | string | No | Filter by category (e.g. A, B, D, E, Selbstdispensation, Behandlungsjournal, Umwidmung) |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: CH) |

**Returns:** Array of rules with `category`, `description`, `requirements`.

---

## get_star_targets

Get StAR strategy (Strategie Antibiotikaresistenzen) reduction targets and progress for Swiss veterinary antibiotic use.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `species` | string | No | Filter by species (e.g. Schwein, Rind, Gefluegel) |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: CH) |

**Returns:** Array of target objects with `species`, `target_description`, `baseline_year`, `target_year`, `reduction_pct`, `status`, `notes`.
