# BlastRadius 💥

> **CISA CSB-03 Hackathon: Supply-Chain Vulnerability Propagation Graph & Fix-Once Remediation Engine**

[![CI Status](https://img.shields.io/badge/tests-57%20passed-brightgreen.svg)](tests/)
[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](backend/)
[![React](https://img.shields.io/badge/React-18-cyan.svg)](frontend/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

---

## 🌟 Executive Overview
**BlastRadius** ingests software manifests (`package.json`, `package-lock.json`, `requirements.txt`, `pom.xml`, and CycloneDX SBOMs), cross-references dependencies against real vulnerability feeds (**OSV.dev**, **CISA KEV**, **FIRST EPSS**, and **deps.dev**), computes a complete bidirectional dependency propagation graph, and calculates explainable exploit-aware risk scores.

### 🎯 Key Signature Capabilities
1. **Exploit-Aware Composite Ranking**: Combines CISA KEV active exploitation flags, FIRST EPSS 30-day probabilities, and CVSS vector components into an explainable score:
   $$Risk = 100 \times (0.40E + 0.25I + 0.35X)$$
2. **Fix-Once Patch Planner**: Identifies the minimal set of strategic package upgrades (parent POM bump, internal shared lib upgrade, dependency overrides) that eliminates the largest amount of portfolio risk, grouped into Waves 0–3.
3. **Pure What-If Simulation**: Simulates risk reduction and downstream effects without mutating persistent database state.
4. **Confidence Engine**: Classifies findings into *Confirmed* (lockfile/SBOM), *Probable* (deps.dev exact pin), and *Unverified* (manifest-only assumed range). Missing data never produces a false "clean" verdict.
5. **Time Machine**: Replays vulnerability exposure across calendar dates using real historical OSV published dates.
6. **Pre-Disclosure Choke-Point Analysis**: Ranks packages by betweenness centrality to isolate single-point-of-failure shared libraries before zero-day disclosures.

---

## ⚡ Quick Start

### 1. Requirements
- Python 3.11+
- Node.js 18+

### 2. Launching the Application (3 commands)
```bash
# 1. Install dependencies
make setup

# 2. Run test suite (57 tests)
make test

# 3. Start BlastRadius (API on :8000, Web UI on :5173)
make demo
```

Visit **`http://localhost:5173`** in your browser.

---

## 📁 Repository Structure
```
├── backend/                  # FastAPI + SQLAlchemy 2 + NetworkX engine
│   └── blastradius/
│       ├── api/              # REST routes & endpoints
│       ├── comparators/      # Maven ComparableVersion, npm Semver, PEP 440
│       ├── parsers/          # defusedxml pom.xml, requirements.txt, package-lock
│       ├── intelligence/     # Scoring, Fix-Once planner, adapters, zero-day
│       └── persistence/      # SQLite models & database
├── frontend/                 # React + Vite + TypeScript + Tailwind UI
│   ├── src/pages/            # 14 interconnected application views
│   └── src/services/         # API integration client
├── data/
│   ├── sample/               # 12 sample projects with realistic CVEs
│   └── snapshots/            # Committed intelligence snapshots with SHA-256
├── docs/                     # Full technical documentation & evaluation guides
├── tests/                    # 57 automated pytest tests
├── Makefile                  # Simple project lifecycle commands
└── docker-compose.yml        # Containerized multi-service deployment
```

---

## 🧪 Verified Integrations & Feeds
- **OSV.dev**: Real advisories (`GHSA-jfh8-c2jp-hdph`, `GHSA-36p3-wjmg-h94x`, `GHSA-jvfv-7rvx-43m5`, `PYSEC-2022-42969`).
- **CISA KEV**: Automated catalog parsing with due-date tracking.
- **FIRST EPSS**: Multi-CVE batch querying and percentile mapping.
- **CycloneDX 1.5**: Strict JSON SBOM & VEX generation and validation.
