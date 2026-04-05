# Switzerland Veterinary Medicines MCP

Swiss veterinary medicine data via the Model Context Protocol (MCP). Covers the Tierarzneimittel-Kompendium (Swissmedic), IS ABV antibiotic monitoring, the Ampelsystem classification, TAMV prescription rules, ARCH-Vet resistance data, and StAR strategy targets.

**Jurisdiction:** Switzerland (CH)
**Data sources:** Swissmedic, BLV, IS ABV, ARCH-Vet, GST Therapierichtlinien
**Tools:** 10
**License:** Apache-2.0

## Quick Start

### npx (stdio — recommended for Claude Desktop, Cursor, Windsurf)

```bash
npx -y @ansvar/ch-vet-medicines-mcp
```

Claude Desktop configuration (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "ch-vet-medicines": {
      "command": "npx",
      "args": ["-y", "@ansvar/ch-vet-medicines-mcp"]
    }
  }
}
```

### Streamable HTTP (remote — no install needed)

```
https://mcp.ansvar.eu/ch-vet-medicines/mcp
```

Connect from any MCP-compatible client using Streamable HTTP transport.

### Docker

```bash
docker run -p 3000:3000 ghcr.io/ansvar-systems/ch-vet-medicines-mcp:latest
```

The server exposes `/mcp` (Streamable HTTP) and `/health` (HTTP GET).

## What This Server Covers

- **Medicines database** -- Swiss-approved veterinary medicines with active substances, target species, Swissmedic numbers, and dispensing categories
- **Withdrawal times** (Absetzfristen) -- species-specific withdrawal periods for meat, milk, eggs, honey per TAMV
- **Ampelsystem** -- Traffic-light classification of antibiotics (gruen/gelb/rot) per GST/BLV guidelines
- **Prescription rules** -- Dispensing categories (A/B/D/E), Selbstdispensation, TAM-Vereinbarung, Behandlungsjournal, Umwidmung rules
- **Resistance data** -- ARCH-Vet antibiotic resistance monitoring (bacterium, antibiotic class, species, trends)
- **StAR targets** -- Strategie Antibiotikaresistenzen reduction targets and progress by species

## Tools

| Tool | Description |
|------|-------------|
| `about` | Server metadata, version, data sources, links |
| `list_sources` | All data sources with authority, URL, license, freshness |
| `check_data_freshness` | Staleness status, last ingest date, refresh command |
| `search_medicines` | Full-text search across medicines, active substances, species |
| `get_medicine_details` | Full profile for a single medicine with withdrawal times |
| `get_withdrawal_times` | Filter withdrawal periods by medicine, species, produce type |
| `get_antibiotic_categories` | Ampelsystem classification with restrictions |
| `search_resistance_data` | ARCH-Vet resistance rates by bacterium, antibiotic, species |
| `get_prescription_rules` | TAMV dispensing rules and categories |
| `get_star_targets` | StAR strategy reduction targets and progress |

See [TOOLS.md](TOOLS.md) for full parameter and response documentation.

## Data Sources

| Source | Authority | Update Frequency |
|--------|-----------|-----------------|
| Tierarzneimittel-Kompendium | Swissmedic | Continuous (on approval changes) |
| TAMV (SR 812.212.27) | Schweizerischer Bundesrat | Periodic (on revision) |
| IS ABV | BLV | Continuous (mandatory reporting since 2019) |
| StAR Strategie | BLV | Periodic (strategy updates) |
| ARCH-Vet Report | BLV / Uni Bern (ZOBA) | Annual |
| GST Therapierichtlinien | GST | Periodic |

## Development

```bash
npm install
npm run build
npm test
npm run dev          # stdio with watch
npm run start:http   # HTTP server on port 3000
```

## Legal

See [DISCLAIMER.md](DISCLAIMER.md) for important legal information regarding the use of this data.

All tool responses include a `_meta` object with disclaimer, data age, and source attribution.

## Links

- [Ansvar MCP Network](https://ansvar.ai/mcp)
- [Full tool documentation](TOOLS.md)
- [Coverage manifest](COVERAGE.md)
- [Security policy](SECURITY.md)
- [Privacy statement](PRIVACY.md)
