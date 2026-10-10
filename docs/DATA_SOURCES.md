# BlastRadius Data Sources Specification & Verification

This document records official documentation, endpoints, real response shapes, limits, and quirks for the 4 core vulnerability & dependency feeds consumed by BlastRadius.

---

## 1. OSV.dev (Open Source Vulnerabilities)
- **Base URL**: `https://api.osv.dev/v1`
- **Endpoints**:
  - `POST /v1/querybatch`: Batch query by package name and ecosystem. Note: batch endpoint returns summary objects containing `vulns` list with advisory IDs. Full vulnerability details must be fetched via GET by ID.
  - `GET /v1/vulns/{id}`: Returns full OSV schema v1.6 including `summary`, `details`, `severity` (CVSS v2/v3 vectors), `affected` ranges (`events`: `introduced`, `fixed`, `last_affected`), `references`, `database_specific`, and `published`/`modified` timestamps.
  - `GET /v1/query`: Single query by commit, version, or package name + ecosystem.
- **Ecosystem Names**:
  - `Maven`, `PyPI`, `npm`, `Go`, `NuGet`, `RubyGems`, `Crates.io`, etc.
- **Quirks & Range Matching**:
  - `events` array contains version bounds: `{"introduced": "0"}`, `{"fixed": "2.17.1"}`.
  - Ecosystem-specific ranges (e.g. `ECOSYSTEM` vs `SEMVER`) must be parsed using ecosystem version comparators (npm semver, PEP 440, Maven ComparableVersion).
  - Multiple ranges may exist for a single advisory.
  - Fixed version evidence must be extracted from the first `fixed` event after the current version.

---

## 2. CISA KEV (Known Exploited Vulnerabilities)
- **Feed URL**: `https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json`
- **Format**: Single JSON feed updated regularly by CISA.
- **Root Fields**:
  - `title`: "CISA Known Exploited Vulnerabilities Catalog"
  - `count`: Number of vulnerabilities
  - `vulnerabilities`: Array of KEV records
- **Record Schema**:
  - `cveID`: string (e.g. `"CVE-2021-44228"`)
  - `vendorProject`: string (e.g. `"Apache"`)
  - `product`: string (e.g. `"Log4j"`)
  - `vulnerabilityName`: string (e.g. `"Apache Log4j2 Remote Code Execution Vulnerability"`)
  - `dateAdded`: string (`YYYY-MM-DD`)
  - `shortDescription`: string
  - `requiredAction`: string
  - `dueDate`: string (`YYYY-MM-DD`)
  - `knownRansomwareCampaignUse`: string (`"Known"` / `"Unknown"`)
- **Quirks**:
  - Indexed primarily by `cveID`. Primary key mapping links CVE IDs to OSV advisories via aliases.

---

## 3. FIRST EPSS (Exploit Prediction Scoring System)
- **Base URL**: `https://api.first.org/data/v1/epss`
- **Parameters**:
  - `cve`: Comma-separated list of CVE IDs (up to 100 per GET request).
  - `date`: Optional YYYY-MM-DD snapshot date.
- **Response Schema**:
  ```json
  {
    "status": "OK",
    "status-code": 200,
    "type": "epss",
    "total": 1,
    "data": [
      {
        "cve": "CVE-2021-44228",
        "epss": "0.975140000",
        "percentile": "0.999800000",
        "date": "2024-01-15"
      }
    ]
  }
  ```
- **Quirks**:
  - EPSS value is returned as a string representing a probability in $[0, 1]$. Parse to float.
  - Non-existent CVEs return empty data array.
  - Rates: Up to 100 CVEs per HTTP request.

---

## 4. deps.dev (Google Open Source Insights)
- **Base URL**: `https://api.deps.dev/v3`
- **Endpoints**:
  - `GET /v3/systems/{system}/packages/{package}/versions/{version}`: Version info.
  - `GET /v3/systems/{system}/packages/{package}/versions/{version}:dependencies`: Resolved dependency graph.
- **System Names**: `npm`, `pypi`, `maven`, `go`, `cargo`.
- **Response Schema**:
  Returns direct and transitive dependencies with resolution graph, licenses, and advisories.
- **Quirks**:
  - Maven packages require URL encoding of `:` or `/` (e.g. `org.apache.logging.log4j:log4j-core`).

---

## Data Freshness & Cache Strategy
- **Snapshot-First**: All application operations can run 100% offline using committed snapshots in `data/snapshots/`.
- **Metadata Tagging**: Every response object tagged with:
  - `source`: `"OSV"` | `"CISA_KEV"` | `"FIRST_EPSS"` | `"DEPS_DEV"`
  - `status`: `"Live"` | `"Cached"` | `"Snapshot"`
  - `fetched_at`: ISO 8601 UTC timestamp
  - `sha256`: SHA-256 hash of raw JSON response
