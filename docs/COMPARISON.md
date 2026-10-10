# Industry Tool Comparison: BlastRadius vs Existing Solutions

| Capability | BlastRadius | Dependency-Track | osv-scanner | Dependabot |
|---|---|---|---|---|
| **Transitive Blast Radius Graph** | ✅ Full bidirectional reverse index | ⚠️ Direct component tracking | ❌ Flat list per lockfile | ❌ Individual PR focus |
| **Exploit-Aware Composite Score** | ✅ KEV + EPSS + CVSS vector | ⚠️ CVSS-only with EPSS metrics | ❌ Vulnerability ID only | ❌ CVSS severity only |
| **Fix-Once Set-Cover Planner** | ✅ Waves 0–3 + Parent/Override | ❌ Manual remediation | ❌ Advisory list only | ⚠️ Single package PRs |
| **What-If Risk Simulation** | ✅ Pure function without DB mutation | ❌ No simulation | ❌ No simulation | ❌ No simulation |
| **Confidence Level Tagging** | ✅ Confirmed / Probable / Unverified | ⚠️ Component provenance | ⚠️ Exact match only | ⚠️ Lockfile only |
| **Time Machine As-Of Analysis** | ✅ Replays real historical OSV dates | ❌ Current snapshot only | ❌ Current snapshot only | ❌ Current snapshot only |
| **Pre-Disclosure Choke Points** | ✅ Betweenness centrality ranking | ❌ No centrality metrics | ❌ No graph analysis | ❌ No graph analysis |
| **CISA-Native Due Date & VEX** | ✅ KEV countdown & CycloneDX VEX | ⚠️ VEX support | ❌ No KEV countdown | ❌ No KEV countdown |
