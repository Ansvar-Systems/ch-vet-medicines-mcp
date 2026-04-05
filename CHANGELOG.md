# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-04-05

### Added
- Initial release with 10 tools covering Swiss veterinary medicines
- `search_medicines` -- tiered FTS5 search with automatic fallback
- `get_medicine_details` -- full medicine profile with withdrawal times
- `get_withdrawal_times` -- species and produce-type filtering
- `get_antibiotic_categories` -- Ampelsystem (gruen/gelb/rot) classification
- `search_resistance_data` -- ARCH-Vet resistance monitoring search
- `get_prescription_rules` -- TAMV dispensing rules and categories
- `get_star_targets` -- StAR strategy reduction targets
- `about`, `list_sources`, `check_data_freshness` meta-tools
- Dual transport: stdio (npm) and Streamable HTTP (Docker/remote)
- Automated ingestion pipeline with freshness monitoring
- CodeQL, Gitleaks, and CI workflows
- Full documentation: README, TOOLS.md, COVERAGE.md, DISCLAIMER.md
