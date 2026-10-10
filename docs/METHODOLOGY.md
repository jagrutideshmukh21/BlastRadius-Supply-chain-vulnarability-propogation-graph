# BlastRadius Scoring Methodology & Matching Rules

## 1. Mathematical Formulation

### A. Exploitability ($E$)
$$E = \min(1.0, 0.45 \times \text{EPSS} + 0.35 \times \text{KEV} + 0.20 \times \text{AV})$$
- $\text{EPSS}$: FIRST EPSS exploit probability in $[0, 1]$ (neutral prior of $0.10$ used when missing).
- $\text{KEV}$: Boolean indicator ($1.0$ if present in CISA KEV catalog, else $0.0$).
- $\text{AV}$: CVSS Attack Vector weight ($\text{Network} = 1.0, \text{Adjacent} = 0.7, \text{Local} = 0.4, \text{Physical} = 0.2$).

### B. Impact ($I$)
$$I = \frac{\text{CVSS Base Score}}{10.0}$$

### C. Exposure ($X$)
$$X = \min(1.0, \text{scope\_f} \times \text{depth\_f} \times \text{internet\_f} \times \text{crit\_f} \times \text{path\_f})$$
- $\text{scope\_f}$: $\text{runtime} = 1.0, \text{optional} = 0.6, \text{dev} = 0.3, \text{test} = 0.2$.
- $\text{depth\_f}$: $\max(0.6, 1.0 - 0.1 \times d)$.
- $\text{internet\_f}$: $1.0$ if internet-facing, else $0.7$.
- $\text{crit\_f}$: $0.5 + 0.1 \times \text{criticality}$ (1–5 scale).
- $\text{path\_f}$: $\min(1.15, 1.0 + 0.03 \times (\text{distinct\_paths} - 1))$.

### D. Composite Risk Score
$$\text{Risk} = 100 \times (w_e E + w_i I + w_x X)$$
Default weights: $w_e = 0.40, w_i = 0.25, w_x = 0.35$.

---

## 2. Confidence Engine Categorization
1. **Confirmed**: Pinned lockfile (`package-lock.json`), exact hash, or CycloneDX SBOM component.
2. **Probable**: deps.dev resolution for an exact pinned version.
3. **Unverified**: Manifest-only unpinned range (e.g. `jinja2>=2.11.0`). Labelled as "assumed" to prevent false clean reporting.
