# BlastRadius — Supply-Chain Vulnerability Propagation Graph
## Technical Architecture & Design Specification

### 1. System Overview Architecture

```
+-----------------------------------------------------------------------------------------+
|                                BlastRadius UI (React 18 + TS)                           |
|  Dashboard · Graph Explorer · Trust Center · Policy Gate · Risk · Patch · Time Machine  |
+-------------------------------------------+---------------------------------------------+
                                            | REST / HTTP API
+-------------------------------------------v---------------------------------------------+
|                             FastAPI Backend (Python 3.11)                               |
|                                                                                         |
|  +---------------------+   +-----------------------+   +------------------------------+ |
|  | Multi-Format Parsers|   | Lockfile Resolver     |   | Dynamic Risk Scoring         | |
|  | pom.xml, pkg.json,  |   | Pinning verification  |   | Base Risk x Exposure x Scope | |
|  | req.txt, CycloneDX  |   | deps.dev mapping      |   | KEV / Neutral EPSS rules     | |
|  +---------------------+   +-----------------------+   +------------------------------+ |
|                                                                                         |
|  +---------------------+   +-----------------------+   +------------------------------+ |
|  | OpenSSF Scorecard   |   | Static Reachability   |   | CI/CD Policy Gate Engine     | |
|  | Trust Intelligence  |   | AST symbol matcher    |   | Strict/Balanced/Permissive   | |
|  | Verified Repo Map   |   | 5-level evidence map  |   | SARIF 2.1.0 exporter         | |
|  +---------------------+   +-----------------------+   +------------------------------+ |
|                                                                                         |
|  +------------------------------------------------------------------------------------+ |
|  |                         Graph Engine & NetworkX BFS Solver                         | |
|  |                 Reverse-Index Transitive Propagation + Choke-Point Analysis        | |
|  +------------------------------------------------------------------------------------+ |
|                                                                                         |
|  +------------------------------------------------------------------------------------+ |
|  |                      Persistence Layer (SQLAlchemy 2 + SQLite)                      | |
|  |                  Projects, Findings, Advisories, Audit Logs, Snapshots             | |
|  +------------------------------------------------------------------------------------+ |
+-----------------------------------------------------------------------------------------+
```

### 2. Micro-Architecture of New International Hackathon Upgrades

#### Feature A: Supply Chain Trust Intelligence (`blastradius.intelligence.trust`)
- **Verified Repository Resolution**: Package names are mapped strictly to verified upstream repositories (e.g. `log4j-core` -> `github.com/apache/logging-log4j2`). Unverified packages return status `Unknown` rather than fabricating arbitrary scores.
- **OpenSSF Scorecard Data**: Queries official Scorecard API endpoints with offline snapshot fallback for reliable demo performance.
- **Security Check Granularity**: Evaluates 10+ Scorecard checks including Binary-Artifacts, Branch-Protection, CI-Tests, Code-Review, Maintained, Pinned-Dependencies, SAST, Security-Policy, Signed-Releases, and Vulnerabilities.

#### Feature B: Evidence-Based Reachability Analysis (`blastradius.intelligence.reachability`)
- **Safe Static AST Inspection**: Parses source text statically without executing untrusted code or package build scripts.
- **5 Evidence Classifications**:
  1. `DEPENDENCY_DETECTED`: Package is present in manifest/lockfile.
  2. `SOURCE_REFERENCE_OBSERVED`: AST import or namespace reference found in source code.
  3. `VULNERABLE_SYMBOL_MATCHED`: Direct call site detected invoking known vulnerable symbol/method (e.g., `JndiLookup`, `class.module.classLoader`, `defaultsDeep`).
  4. `UNKNOWN`: No source code submitted for analysis.
  5. `ANALYSIS_INCOMPLETE`: Execution path requires runtime telemetry.
- **Explicit Disclaimers**: Static imports do not prove production execution; missing imports do not prove safety (reflection / indirect calls).

#### Feature C: CI/CD Policy Gate (`blastradius.intelligence.policy`)
- **Policy Profiles**:
  - `strict-production`: Fails on KEV presence, Critical/High findings, or CVSS >= 7.0.
  - `balanced`: Fails on KEV or Critical findings (CVSS >= 9.0); warns on High.
  - `permissive-dev`: Fails only on active KEV exploits; warns on Critical.
- **SARIF 2.1.0 Export**: Full support for OASIS SARIF standard, seamlessly integrating with GitHub Code Scanning, GitLab Security Center, and SonarQube.
- **CLI Subcommand**: Exposes `python -m blastradius.cli gate --project <id> --policy <profile> --format sarif|json|text` with standard exit codes (0 = PASS, 1 = FAIL, 2 = ERROR).

### 3. Missing Data Policy Enforcement
- **Missing EPSS**: Uses neutral prior of `0.1` (10th percentile), explicitly flagged as `estimated`.
- **Missing CVSS**: Uses severity label mapping (Critical=9.0, High=7.0, Medium=4.0, Low=1.0), flagged as `estimated`.
- **Safety Principle**: "No advisory found is NOT proof of safety. A failed data source never produces a 'clean' result."

### 4. Build & Deployment Architecture
- **Backend**: FastAPI with async uvicorn worker running on `http://localhost:8000`.
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite client bundle running on `http://localhost:5173`.
- **Offline / Standalone Mode**: Fully self-contained with offline dataset fallbacks for seamless hackathon presentations without external network dependencies.
