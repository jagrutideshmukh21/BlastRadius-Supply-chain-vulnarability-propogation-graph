# BlastRadius — Hackathon Presentation & Judge Q&A Guide

## 1. Executive Summary & Pitch (30 Seconds)
"BlastRadius is a Supply-Chain Vulnerability Propagation Graph built for CISA CSB-03. Instead of treating open-source vulnerabilities as isolated CVE alerts, BlastRadius maps how vulnerabilities propagate transitively across an entire enterprise software portfolio, performs static reachability analysis to verify call-site risk, evaluates upstream repository trust with OpenSSF Scorecard, and enforces automated CI/CD policy gates with SARIF export."

---

## 2. Top 10 Anticipated Judge Questions & Technical Answers

### Q1: How does BlastRadius differ from traditional SBOM scanners like Trivy, Grype, or Snyk?
**Answer**: Scanners detect vulnerabilities in isolated repositories. BlastRadius computes the **propagation graph across portfolio dependencies**, identifying multi-tier transitive blast radiuses and choke points (e.g. `reporting-lib` affecting 3 downstream projects). Additionally, BlastRadius introduces **Supply Chain Trust Intelligence** via OpenSSF Scorecard and static **Reachability Evidence** to distinguish imported packages from reachable call sites.

### Q2: What is your Missing Data Policy when EPSS or CVSS scores are unavailable?
**Answer**: BlastRadius enforces a strict non-zero-trust model:
1. **Missing EPSS**: Uses a neutral prior of `0.1` (10th percentile baseline) and flags the value as `estimated`.
2. **Missing CVSS**: Maps qualitative severity labels (Critical=9.0, High=7.0, Medium=4.0, Low=1.0) and flags as `estimated`.
3. **Core Axiom**: *No advisory found is NOT proof of safety. A failed data source never produces a "clean" result.*

### Q3: How do you determine reachability without executing untrusted code?
**Answer**: We use safe, static AST inspection (`blastradius.intelligence.reachability`). We classify evidence into 5 distinct tiers: `DEPENDENCY_DETECTED`, `SOURCE_REFERENCE_OBSERVED`, `VULNERABLE_SYMBOL_MATCHED`, `UNKNOWN`, and `ANALYSIS_INCOMPLETE`. We explicitly state limitations: static imports do not guarantee execution, and missing imports do not prove safety due to reflection and dynamic framework loading.

### Q4: How is OpenSSF Scorecard data integrated, and how do you handle package-to-repo mapping?
**Answer**: Package names are resolved using verified repository metadata (`VERIFIED_REPOS`). Unverified packages return status `Unknown` rather than fabricating arbitrary scores. We fetch Scorecard scores and 10+ individual checks live via API, with cached TTL storage and offline snapshot fallback for reliable presentation environments.

### Q5: Can BlastRadius be integrated into automated DevSecOps pipelines?
**Answer**: Yes! BlastRadius features a dedicated **CI/CD Policy Gate** (`PolicyGate.tsx` and `python -m blastradius.cli gate`). It supports configurable policy profiles (`strict-production`, `balanced`, `permissive-dev`), exports standard SARIF 2.1.0 for GitHub Code Scanning / GitLab Security, and returns standard exit codes (`0` for PASS, `1` for FAIL).

### Q6: How does the Patch Planner optimize remediation efforts?
**Answer**: The Patch Planner groups updates into wave-based remediation plans. It prioritizes **choke points**—internal libraries or shared dependencies whose single upgrade resolves multiple downstream vulnerability paths simultaneously, minimizing developer friction and deployment risk.

### Q7: What happens when a patch is applied? Does the risk score actually drop to 0?
**Answer**: Yes! We built precise semver version comparison (`version.ts` and `osv_matcher.py`). When a package is upgraded to a version at or above the advisory's `fixedVersion`, the vulnerability resolver identifies it as `CLEAN`, driving the risk score directly to `0.0`.

### Q8: How does the Time Machine feature work?
**Answer**: BlastRadius snapshot management records portfolio states over time. Security teams can rewind to any historical timestamp (e.g. pre-Log4Shell disclosure date) to evaluate zero-day exposure and track remediation velocity over time.

### Q9: How does BlastRadius scale to large enterprise graph topologies?
**Answer**: BlastRadius leverages NetworkX and SQLite reverse indexing (`pkg -> dependents`). Instead of traversing full trees top-down, BFS propagation runs in reverse from vulnerable nodes upward, achieving sub-second path traversal even across complex multi-tier project portfolios.

### Q10: What tech stack is used in BlastRadius?
**Answer**: 
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite, Lucide icons, Canvas SVG export.
- **Backend**: Python 3.11, FastAPI, SQLAlchemy 2, SQLite, NetworkX, Defusedxml, Pytest (67 unit tests passing).
- **Standards**: CycloneDX 1.5 SBOM, VEX, OpenSSF Scorecard, OASIS SARIF 2.1.0, FIRST EPSS, CISA KEV.

---

## 3. Recommended Presentation Flow (3-Minute Hackathon Demo)
1. **Dashboard & Project Ingest**: Show overall portfolio risk score, active advisories, and ingest page with persistent sessions and live file uploads.
2. **Graph Explorer & Impact Propagation**: Demonstrate transitive vulnerability propagation from `log4j-core` through `reporting-lib` down to downstream microservices.
3. **Reachability Analysis**: Show evidence tabs distinguishing raw dependencies from matched call-site symbols (`JndiLookup`).
4. **Supply Chain Trust Center**: Display OpenSSF Scorecard trust scores for upstream repositories.
5. **Patch Planner**: Highlight choke-point remediation; demonstrate applying the recommended fix and dropping risk score to 0.0.
6. **CI/CD Policy Gate & SARIF Export**: Run the CLI gate command live, showing policy evaluation banner and SARIF download.
