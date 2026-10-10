# BlastRadius Function & Control Matrix

Every actionable control in BlastRadius has a unique `data-testid` attribute, mapped API endpoint / state mutation, and verified behavior.

| Page | Control / Action | Test ID (`data-testid`) | API Endpoint / Action | Expected Result |
|---|---|---|---|---|
| Top Bar | Global Search Modal | `btn-topbar-search` | UI State / Keyboard `Ctrl+K` | Opens global search modal with fuzzy project/CVE lookup |
| Top Bar | Log4Shell Demo Shortcut | `btn-topbar-demo` | Navigate `/demo` | Jumps to guided Log4Shell story stepper |
| Dashboard | Run Guided Demo | `btn-dashboard-run-demo` | `POST /api/demo/log4shell` | Triggers Log4Shell scan job, updates KPIs & feeds |
| Dashboard | Rescan All Projects | `btn-dashboard-rescan-all` | `POST /api/projects/scan-all` | Initiates portfolio re-scan across all 12 projects |
| Dashboard | Sync Threat Feeds | `btn-dashboard-sync-feeds` | `POST /api/sync` | Refreshes OSV, KEV & EPSS intelligence caches |
| Dashboard | Export KPI Summary | `btn-dashboard-export-summary` | Download CSV | Downloads CSV report of current KPI metrics |
| Guided Demo | Run Current Step | `btn-demo-run-step` | `POST /api/demo/step` | Executes current phase action and transitions state |
| Guided Demo | Next Step | `btn-demo-next` | UI Stepper State | Advances to next stage in the Log4Shell remediation narrative |
| Guided Demo | Previous Step | `btn-demo-back` | UI Stepper State | Returns to previous stage in the demo narrative |
| Guided Demo | Reset Guided Demo | `btn-demo-reset` | `POST /api/demo/reset` | Resets demo progress to step 1 |
| Ingest | Parse Uploaded Manifest | `btn-ingest-parse` | `POST /api/ingest` | Parses dependency tree with confidence indicators |
| Ingest | Save Ingested Project | `btn-ingest-save` | `POST /api/projects` | Persists new project record to database |
| Ingest | Scan Now | `btn-ingest-scan-now` | `POST /api/projects/{id}/scan` | Immediately scans ingested project dependencies |
| Ingest | Clear Form | `btn-ingest-clear` | UI State Reset | Clears file picker and input fields |
| Projects | Rescan Project | `btn-projects-rescan-{id}` | `POST /api/projects/{id}/scan` | Rescans specific project dependencies |
| Projects | Export Project SBOM | `btn-projects-sbom-{id}` | `GET /api/reports/sbom` | Downloads CycloneDX 1.5 JSON SBOM for project |
| Projects | Delete Project | `btn-projects-delete-{id}` | `DELETE /api/projects/{id}` | Removes project record following user confirmation |
| Graph | Blast Radius Toggle | `btn-graph-blast-radius` | UI Graph Filter | Highlights downstream affected projects & paths |
| Graph | Layout: Dagre | `btn-graph-layout-dagre` | UI Cytoscape Layout | Re-renders graph in hierarchical DAG structure |
| Graph | Layout: fCoSE | `btn-graph-layout-fcose` | UI Cytoscape Layout | Re-renders graph using physics force-directed model |
| Graph | Layout: Concentric | `btn-graph-layout-concentric` | UI Cytoscape Layout | Re-renders graph in concentric vulnerability rings |
| Graph | Export PNG | `btn-graph-export-png` | Canvas Export | Downloads high-resolution PNG snapshot of graph |
| Advisories | Sync from OSV | `btn-advisories-sync` | `POST /api/sync` | Fetches latest OSV advisories |
| Advisories | Fetch Advisory by ID | `btn-advisories-fetch-id` | `GET /api/advisories/{id}` | Retrieves advisory by CVE or GHSA ID |
| Advisories | Analyze Impact | `btn-advisories-impact-{id}` | Navigate `/impact/{id}` | Opens Impact & Propagation view for advisory |
| Advisories | Add to Watchlist | `btn-advisories-watchlist-{id}` | `POST /api/alerts/watchlist` | Adds package or CVE to user alert watchlist |
| Impact | Export CSV | `btn-impact-export-csv` | `GET /api/reports/findings-csv` | Exports propagation paths to CSV |
| Impact | Play Propagation | `btn-impact-play` | UI Animation Timer | Animates step-by-step layer propagation from root |
| Impact | Step Animation | `btn-impact-step` | UI Animation Frame | Increments propagation animation by one layer |
| Impact | Mark Not Affected | `btn-impact-mark-not-affected-{id}` | `POST /api/reports/vex` | Opens VEX dialog requiring justification |
| Risk | Reset Weights | `btn-risk-reset-weights` | UI Preset State | Restores default weights (40% E, 25% I, 35% X) |
| Risk | Save Custom Weights | `btn-risk-save-weights` | `POST /api/settings/scoring/weights` | Persists user score weighting preferences |
| Risk | Explain Score | `btn-risk-explain-{rank}` | UI Drawer State | Displays mathematical formula with exact parameters |
| Patch | Auto-Select Minimal Set | `btn-patch-auto-select` | Greedy Set-Cover | Automatically selects minimal actions clearing all P0/P1 |
| Patch | Simulate Patch Plan | `btn-patch-simulate` | `POST /api/patch/simulate` | Computes before/after risk score without writing to DB |
| Patch | Accept Patch Action | `btn-patch-accept-{id}` | State Transition | Moves action from proposed to accepted |
| Patch | Apply Patch Action | `btn-patch-apply-{id}` | `POST /api/patch/apply` | Executes state transition and logs audit trail record |
| Patch | Undo Patch Action | `btn-patch-undo-{id}` | `POST /api/patch/undo` | Rolls back action state to proposed |
| Time Machine | Play Timeline | `btn-timemachine-play` | UI Slider Animation | Replays exposure history from 2021 to 2024 |
| Reports | Generate Report | `btn-reports-generate-{id}` | `GET /api/reports/{type}` | Generates executive summary, CSV, SBOM or VEX |
| Reports | Preview Report | `btn-reports-preview-{id}` | UI Modal Preview | Displays formatted preview of generated report |
| Reports | Download Report | `btn-reports-download-{id}` | File Download | Downloads report file in target format |
| Reports | Validate Schema | `btn-reports-validate-{id}` | `POST /api/reports/{type}/validate` | Validates generated SBOM or VEX against schema |
| Alerts | Mark All Read | `btn-alerts-mark-all-read` | `POST /api/alerts/notifications/mark-all-read` | Clears unread status on all notifications |
| Settings | Test Source Connection | `btn-settings-test-{id}` | `POST /api/settings/sources/{id}/test` | Performs live connection health check |
| Settings | Clear Cache | `btn-settings-clear-cache` | `POST /api/settings/cache/clear` | Flushes local response cache |
| Settings | Run Benchmark | `btn-settings-benchmark-{n}` | `POST /api/settings/benchmark` | Executes pipeline scale benchmark (100-10,000 nodes) |
| Settings | Reset Database | `btn-settings-reset-db` | `POST /api/settings/reset-db` | Deletes portfolio data upon typing confirmation |
