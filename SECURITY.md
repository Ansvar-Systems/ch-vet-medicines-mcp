# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | Yes       |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, report it responsibly:

**Email:** security@ansvar.eu
**PGP key:** Available on request

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact assessment
- Suggested fix (if any)

We will acknowledge receipt within 48 hours and aim to provide an initial assessment within 5 business days.

Do not open a public GitHub issue for security vulnerabilities.

## Security Measures

This MCP server implements the following security controls:

- **Read-only data** -- SQLite database is mounted read-only in production containers
- **No client data storage** -- The server is stateless; no user input is persisted
- **Parameterised queries** -- All database queries use parameterised statements to prevent SQL injection
- **Input sanitisation** -- FTS5 search input is sanitised before query construction
- **Container hardening** -- Non-root user, no-new-privileges, capability drop
- **Automated scanning** -- CodeQL (SAST), Gitleaks (secrets), dependency audits via GitHub Actions
- **SBOM** -- Software Bill of Materials generated on each release

## Dependency Policy

- Dependencies are pinned via `package-lock.json`
- `npm audit` runs in CI on every push
- Critical/high vulnerabilities block merges
