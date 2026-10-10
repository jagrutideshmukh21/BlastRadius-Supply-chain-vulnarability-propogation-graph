# Security Architecture & Threat Model

## 1. Threat Model & Mitigations
- **Malicious Uploads / Code Execution**: BlastRadius NEVER executes uploaded manifests or package lifecycle scripts.
- **XML Entity Expansion Attacks (Billion Laughs / XXE)**: All XML parsing in Maven `pom.xml` and CycloneDX XML uses `defusedxml.ElementTree` to prevent entity expansion.
- **Cross-Site Scripting (XSS)**: Advisory summaries and CVE details are rendered via strict React text escapes; headers include `X-XSS-Protection`, `X-Content-Type-Options: nosniff`, and `X-Frame-Options: DENY`.
- **Parameter Tampering / SQL Injection**: All database operations use parameterized queries via SQLAlchemy 2 ORM.
- **Audit Logging**: Every state-changing patch application records an immutable `AuditEvent` with actor, timestamp, and justification reason.
