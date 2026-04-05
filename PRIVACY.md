# Privacy Statement

## Data Processing

This MCP server processes **no personal data**. It serves publicly available Swiss veterinary medicine reference data sourced from government and professional bodies.

## What This Server Does NOT Do

- Does not collect, store, or transmit user queries
- Does not log IP addresses or user identifiers
- Does not use cookies or tracking mechanisms
- Does not store any client-submitted data
- Does not connect to external services at runtime (all data is pre-ingested into a local SQLite database)

## Data Sources

All data served by this MCP is sourced from publicly accessible Swiss federal and professional sources:

- Swissmedic (Swiss Agency for Therapeutic Products)
- BLV (Federal Food Safety and Veterinary Office)
- ARCH-Vet (Antibiotic Resistance Monitoring)
- GST (Swiss Veterinary Association)

No personal, proprietary, or confidential data is included.

## Hosting

When accessed via `mcp.ansvar.eu`, standard web server access logs (IP address, timestamp, request path) are retained for operational and security purposes. These logs are retained for 30 days and are not shared with third parties.

For the npm/stdio distribution (`npx @ansvar/ch-vet-medicines-mcp`), the server runs entirely on the user's local machine with no network calls.

## Contact

For privacy-related questions: privacy@ansvar.eu
