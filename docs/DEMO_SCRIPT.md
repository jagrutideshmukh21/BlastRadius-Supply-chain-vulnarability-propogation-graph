# 3-Minute Judge Demo Script

### 1. Problem Statement (0:00 - 0:20)
"Current SCA tools alert on thousands of CVEs with CVSS scores that ignore real-world exploitability, producing alert fatigue without actionable remediation paths. When a critical zero-day like Log4Shell hits, security teams don't know the true blast radius through transitive dependencies."

### 2. Live Demo through Guided Stepper (0:20 - 2:20)
- **Step 1-2**: Load sample portfolio (12 multi-ecosystem Maven/npm/PyPI services) and trigger scan.
- **Step 3**: View **Blast Radius** on the Graph Explorer (`/graph`) showing direct and transitive propagation down to 3 levels.
- **Step 4**: Open **Risk Ranking** (`/risk`) and demonstrate the **Explain Score Drawer** with the exact formula ($0.40E + 0.25I + 0.35X$) hand-calculated.
- **Step 5-6**: Open **Patch Planner** (`/patch`), click **Auto-Select Minimal Set**, and run **Simulate** to prove risk drops from $97.2 \rightarrow 31.4$ without database changes.
- **Step 7-8**: Click **Apply** with audit reasoning, then **Rescan & Verify** to show verified fixes.
- **Step 9**: Export **CycloneDX 1.5 SBOM & VEX** (`/reports`).

### 3. Innovation & Value Proposition (2:20 - 3:00)
- **Fix-Once Paradigm**: Upgrading the single shared internal library (`reporting-lib`) clears 3 downstream critical projects.
- **Explainable Trust**: Every finding has clear confidence ratings and formula breakdowns.
