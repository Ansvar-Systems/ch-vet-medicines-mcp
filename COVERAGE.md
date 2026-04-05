# Coverage Manifest -- ch-vet-medicines-mcp

**Jurisdiction:** Switzerland (CH)
**Last updated:** 2026-04-05
**Schema:** Based on `data/coverage.json`

## Data Summary

| Dataset | Records | Source |
|---------|---------|--------|
| Medicines | 45 | Tierarzneimittel-Kompendium (Swissmedic) |
| Withdrawal times | 60 | TAMV / Swissmedic Fachinformation |
| Antibiotic categories | 11 | GST/BLV Ampelsystem |
| Resistance data entries | 35 | ARCH-Vet Report |
| Prescription rules | 10 | TAMV (SR 812.212.27) |
| StAR targets | 10 | BLV Antibiotikastrategie |

## What Is Covered

### Medicines Database
- Swiss-approved veterinary medicines (Tierarzneimittel) with Swissmedic registration numbers
- Active substances, target species, administration routes, dispensing categories
- Full-text search with tiered FTS5 fallback

### Withdrawal Times (Absetzfristen)
- Species-specific withdrawal periods for meat (Fleisch), milk (Milch), eggs (Eier), and honey (Honig)
- Linked to individual medicines
- Standard withdrawal times only -- off-label doubling rule (TAMV Art. 5-6) is not pre-calculated

### Ampelsystem (Antibiotic Classification)
- Three-tier classification: gruen (first-line), gelb (antibiogram recommended), rot (antibiogram mandatory)
- 11 antibiotic classes classified per GST/BLV recommendations
- Restriction descriptions and usage notes per class

### Resistance Monitoring (ARCH-Vet)
- Resistance percentages by bacterium, antibiotic class, and species
- Year-over-year trend data
- Data from the annual ARCH-Vet report

### Prescription Rules (TAMV)
- Dispensing categories A, B, D, E
- Selbstdispensation rules
- TAM-Vereinbarung requirements
- Behandlungsjournal obligations
- Umwidmung (off-label) regulations

### StAR Strategy Targets
- Species-specific reduction targets for antibiotic use
- Baseline and target years with percentage goals
- Current status and progress notes

## What Is NOT Covered

| Gap | Reason |
|-----|--------|
| Individual farm IS ABV usage reports | Confidential per-farm data, not publicly available |
| Real-time Swissmedic approval changes | Batch ingestion, not live feed |
| International EMA/FDA veterinary data | This server covers CH only |
| Detailed pharmacokinetics/pharmacodynamics | Not included in source datasets |
| Historical price data | Not tracked by source authorities |
| Companion animal medicines (pets only) | Focus is on food-producing animals and Absetzfristen |
| French/Italian language medicine names | Primarily German-language data |

## Data Freshness

- Staleness threshold: 90 days
- Refresh command: `gh workflow run ingest.yml -R ansvar-systems/ch-vet-medicines-mcp`
- Automated freshness check: daily via `check-freshness.yml`

## Sources

See `data/sources.yml` for full provenance of each data source including authority, URL, license, and retrieval method.
