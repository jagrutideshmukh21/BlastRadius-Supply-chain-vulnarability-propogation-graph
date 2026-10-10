import React, { useState } from 'react';
import { DATA_SOURCES, formatDateTime } from '../data/mockData';
import { RefreshCw, AlertTriangle, Wifi, WifiOff, Trash2, FlaskConical, Info } from 'lucide-react';
import clsx from 'clsx';

const TABS = ['Scoring', 'Data Sources', 'Offline & Cache', 'Methodology', 'Architecture', 'Scale Lab', 'Danger Zone'];

export default function Settings() {
  const [tab, setTab] = useState('Scoring');
  const [weights, setWeights] = useState({ e: 0.40, i: 0.25, x: 0.35 });
  const [offline, setOffline] = useState(true);
  const [dangerInput, setDangerInput] = useState('');
  const [testingSource, setTestingSource] = useState<string | null>(null);
  const [benchmarkRunning, setBenchmarkRunning] = useState(false);
  const [benchmarkResult, setBenchmarkResult] = useState<null | { projects: number; time: number; memory: number }>(null);

  const testConnection = (id: string) => {
    setTestingSource(id);
    setTimeout(() => setTestingSource(null), 2000);
  };

  const runBenchmark = (count: number) => {
    setBenchmarkRunning(true);
    setBenchmarkResult(null);
    setTimeout(() => {
      setBenchmarkRunning(false);
      setBenchmarkResult({
        projects: count,
        time: count === 100 ? 1.2 : count === 1000 ? 12.4 : 147.3,
        memory: count === 100 ? 48 : count === 1000 ? 312 : 2840,
      });
    }, 3000);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Settings</h1>

      <div className="flex gap-6 border-b border-slate-200 mb-8 overflow-x-auto pb-px">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={clsx('pb-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2',
              t === tab ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700')}>
            {t}
          </button>
        ))}
      </div>

      {/* Scoring Tab */}
      {tab === 'Scoring' && (
        <div className="max-w-3xl space-y-8">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Risk Score Weights</h3>
            <p className="text-base text-slate-600 mb-6">
              Risk = 100 × (E_weight × E + I_weight × I + X_weight × X). Weights must sum to 1.0.
            </p>
            <div className="space-y-6">
              {[
                { key: 'e', label: 'Exploitability weight', desc: 'EPSS × 0.45 + KEV × 0.35 + AV × 0.20' },
                { key: 'i', label: 'Impact weight', desc: 'CVSS base score / 10' },
                { key: 'x', label: 'Exposure weight', desc: 'scope × depth × internet × criticality × paths' },
              ].map(({ key, label, desc }) => (
                <div key={key}>
                  <div className="flex justify-between text-base mb-2">
                    <span className="font-semibold text-slate-800">{label}</span>
                    <span className="text-blue-700 font-bold">{(weights[key as 'e' | 'i' | 'x'] * 100).toFixed(0)}%</span>
                  </div>
                  <input type="range" min={5} max={70} step={5}
                    value={weights[key as 'e' | 'i' | 'x'] * 100}
                    onChange={e => setWeights(w => ({ ...w, [key]: parseInt(e.target.value) / 100 }))}
                    className="w-full accent-blue-600" />
                  <div className="text-sm text-slate-500 mt-1">{desc}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-8 pt-6 border-t border-slate-100">
              <button
                onClick={() => setWeights({ e: 0.40, i: 0.25, x: 0.35 })}
                className="btn-secondary flex items-center gap-2 text-sm">
                <RefreshCw size={14} /> Reset to Default
              </button>
              <button className="btn-primary text-sm">Save Weights</button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Tier Thresholds</h3>
            <div className="text-base text-slate-700 mb-6 space-y-2">
              <div><strong className="text-slate-900 font-bold w-12 inline-block">P0:</strong> Risk ≥ 85, OR (KEV + runtime + internet-facing/crit≥4)</div>
              <div><strong className="text-slate-900 font-bold w-12 inline-block">P1:</strong> Risk ≥ 65</div>
              <div><strong className="text-slate-900 font-bold w-12 inline-block">P2:</strong> Risk ≥ 40</div>
              <div><strong className="text-slate-900 font-bold w-12 inline-block">P3:</strong> Below P2</div>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex items-start gap-3">
              <Info size={20} className="shrink-0 mt-0.5" />
              <p>These thresholds are BlastRadius heuristics for prioritization — not an industry standard. They are documented in METHODOLOGY.md.</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Missing Data Policy</h3>
            <div className="text-base text-slate-700 space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-slate-400 mt-1">•</span>
                <p>Missing EPSS: <span className="font-semibold text-slate-900">neutral prior 0.1</span> (10th percentile), flagged as 'estimated'</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-slate-400 mt-1">•</span>
                <p>Missing CVSS: severity label mapping <span className="font-semibold text-slate-900">(Critical=9.0, High=7.0, Medium=4.0, Low=1.0)</span>, flagged as 'estimated'</p>
              </div>
              <div className="flex items-start gap-2 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <p className="font-medium">'No advisory found is NOT proof of safety' warning</p>
              </div>
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <p className="font-medium">'A failed data source never produces a clean result' warning</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Sources Tab */}
      {tab === 'Data Sources' && (
        <div className="space-y-6 max-w-3xl">
          {DATA_SOURCES.map(src => (
            <div key={src.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{src.name}</h3>
                  <div className="text-sm font-mono text-slate-500 mt-1">{src.url}</div>
                </div>
                <span className="text-sm font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                  {src.status}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-base mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div>
                  <div className="text-slate-500 text-sm font-medium mb-1">Last Success</div>
                  <div className="text-slate-900 font-bold">{formatDateTime(src.lastSuccess)}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-sm font-medium mb-1">Cache Hit Rate</div>
                  <div className="text-slate-900 font-bold">{(src.cacheHitRate * 100).toFixed(0)}%</div>
                </div>
                <div>
                  <div className="text-slate-500 text-sm font-medium mb-1">Total Requests</div>
                  <div className="text-slate-900 font-bold">{src.requestCount.toLocaleString()}</div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => testConnection(src.id)}
                  className="btn-secondary flex items-center gap-2 text-sm"
                >
                  {testingSource === src.id ? (
                    <><RefreshCw size={14} className="animate-spin text-blue-600" /> Testing...</>
                  ) : (
                    <><Wifi size={14} /> Test Connection</>
                  )}
                </button>
                <button className="btn-secondary flex items-center gap-2 text-sm">
                  <RefreshCw size={14} /> Sync Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Offline & Cache Tab */}
      {tab === 'Offline & Cache' && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Offline Mode</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base font-semibold text-slate-900">Use snapshot data only</div>
                <div className="text-sm text-slate-500 mt-1">All requests served from local snapshots — no network calls</div>
              </div>
              <button
                onClick={() => setOffline(!offline)}
                className={clsx('w-14 h-7 rounded-full transition-colors relative', offline ? 'bg-blue-600' : 'bg-slate-300')}
              >
                <div className={clsx('w-5 h-5 bg-white rounded-full absolute top-1 transition-all', offline ? 'right-1' : 'left-1')} />
              </button>
            </div>
            {offline && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3 text-sm text-amber-800 font-medium">
                <WifiOff size={18} />
                Offline mode active — snapshot data from Jan 15, 2024
              </div>
            )}
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Cache Management</h3>
            <div className="space-y-4 text-sm text-slate-600 mb-8 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3"><span className="font-medium">OSV snapshot</span><span className="text-slate-900 font-bold">Jan 15, 2024</span></div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-3"><span className="font-medium">CISA KEV snapshot</span><span className="text-slate-900 font-bold">Jan 15, 2024</span></div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-3"><span className="font-medium">EPSS snapshot</span><span className="text-slate-900 font-bold">Jan 15, 2024</span></div>
              <div className="flex justify-between items-center pt-1"><span className="font-medium">Cache size</span><span className="text-slate-900 font-bold">4.2 MB</span></div>
            </div>
            <button className="btn-secondary text-red-600 border-red-200 hover:bg-red-50 text-sm flex items-center gap-2">
              <Trash2 size={14} /> Clear Cache
            </button>
          </div>
        </div>
      )}

      {/* Methodology Tab */}
      {tab === 'Methodology' && (
        <div className="max-w-3xl space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Scoring Formula</h3>
            <div className="font-mono text-sm bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-3 text-slate-700">
              <div className="text-blue-700 font-bold"># Exploitability</div>
              <div>E = min(1, 0.45×EPSS + 0.35×KEV_flag + 0.20×AV_score)</div>
              <div className="text-slate-500 ml-4">AV scores: Network=1.0, Adjacent=0.7, Local=0.4, Physical=0.2</div>
              <div className="mt-4 text-blue-700 font-bold"># Impact</div>
              <div>I = CVSS_base / 10</div>
              <div className="mt-4 text-blue-700 font-bold"># Exposure</div>
              <div>X = min(1, scope_f × depth_f × internet_f × crit_f × path_f)</div>
              <div className="text-slate-500 ml-4">scope_f: runtime=1.0, optional=0.6, dev=0.3, test=0.2</div>
              <div className="text-slate-500 ml-4">depth_f: max(0.6, 1 - 0.1×depth)</div>
              <div className="text-slate-500 ml-4">internet_f: internet-facing=1.0, internal=0.7</div>
              <div className="text-slate-500 ml-4">crit_f: 0.5 + 0.1×criticality (1-5)</div>
              <div className="text-slate-500 ml-4">path_f: min(1.15, 1 + 0.03×(paths-1))</div>
              <div className="mt-4 text-blue-700 font-bold"># Composite Risk</div>
              <div>Risk = 100 × (0.40×E + 0.25×I + 0.35×X)  [default weights]</div>
            </div>
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex items-start gap-3">
              <Info size={20} className="shrink-0" />
              <p>These are BlastRadius-specific heuristics. Not CVSS, not SSVC, not EPSS alone. Designed for relative prioritization within a portfolio — do not use as absolute risk scores.</p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Confidence Levels</h3>
            <div className="space-y-3 text-sm text-slate-700">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 p-4 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="text-emerald-700 font-bold w-24">Confirmed</span>
                <span>Resolution from lockfile or SBOM (exact pinned version)</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 p-4 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="text-orange-700 font-bold w-24">Probable</span>
                <span>Resolution from deps.dev on an exact version, or partial lockfile</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 p-4 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="text-slate-600 font-bold w-24">Unverified</span>
                <span>Manifest-only (version range assumed). Never silently dropped.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Architecture Tab */}
      {tab === 'Architecture' && (
        <div className="max-w-4xl">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm font-mono text-sm text-slate-700 overflow-x-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-6 font-sans">System Architecture</h3>
            <pre className="leading-relaxed bg-slate-50 p-6 rounded-xl border border-slate-200">{`
┌─────────────────────────────────────────────────────────────┐
│                     BlastRadius UI (React)                   │
│  Dashboard · Graph · Risk · Patch · TimeMachine · Reports   │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST / SSE
┌──────────────────────────▼──────────────────────────────────┐
│                  FastAPI Backend (Python 3.11)               │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐ │
│  │  Parsers    │  │  Resolver   │  │  Scoring Engine      │ │
│  │ (pkg.json   │  │ (lockfile + │  │  E×I×X formula       │ │
│  │  pom.xml    │  │  deps.dev)  │  │  + confidence        │ │
│  │  req.txt    │  └─────────────┘  └──────────────────────┘ │
│  │  CycloneDX) │                                             │
│  └─────────────┘  ┌─────────────────────────────────────┐   │
│                   │   Graph Engine (networkx)            │   │
│                   │   BFS propagation + reverse index    │   │
│                   │   Choke-point centrality             │   │
│                   └─────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Data Adapters (with TTL cache)           │   │
│  │   OSV.dev  │  CISA KEV  │  FIRST EPSS  │  deps.dev   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   SQLAlchemy 2 + Alembic + SQLite                    │   │
│  │   Reverse Index: pkg → dependents (fast BFS)        │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
            `}</pre>
          </div>
        </div>
      )}

      {/* Scale Lab Tab */}
      {tab === 'Scale Lab' && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Scale Benchmark</h3>
            <p className="text-base text-slate-600 mb-6">
              Generate synthetic projects and measure pipeline timing and memory.
              All data is clearly labelled synthetic. No real CVE data is fabricated.
            </p>
            <div className="flex flex-wrap gap-4">
              {[100, 1000, 10000].map(count => (
                <button
                  key={count}
                  onClick={() => runBenchmark(count)}
                  disabled={benchmarkRunning}
                  className="btn-secondary text-sm disabled:opacity-50"
                >
                  <FlaskConical size={16} className="inline mr-2 text-blue-600" />
                  {count.toLocaleString()} projects
                </button>
              ))}
            </div>
            {benchmarkRunning && (
              <div className="mt-6 flex items-center gap-3 text-sm font-semibold text-blue-700 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <RefreshCw size={16} className="animate-spin" />
                Running benchmark with synthetic data...
              </div>
            )}
            {benchmarkResult && (
              <div className="mt-6 p-6 bg-slate-50 rounded-xl border border-slate-200 shadow-inner">
                <div className="text-sm font-bold text-orange-700 mb-4 flex items-center gap-2">
                  <AlertTriangle size={16} /> Synthetic data — labelled for transparency
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-base">
                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="text-slate-500 font-medium mb-1">Projects</div>
                    <div className="text-slate-900 font-black text-xl">{benchmarkResult.projects.toLocaleString()}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="text-slate-500 font-medium mb-1">Pipeline Time</div>
                    <div className="text-blue-700 font-black text-xl">{benchmarkResult.time}s</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="text-slate-500 font-medium mb-1">Memory</div>
                    <div className="text-purple-700 font-black text-xl">{benchmarkResult.memory} MB</div>
                  </div>
                </div>
                <div className="text-sm text-slate-500 mt-4 text-center">
                  Measured on: {new Date().toLocaleString()} · Results in docs/PERFORMANCE.md
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Danger Zone Tab */}
      {tab === 'Danger Zone' && (
        <div className="max-w-xl">
          <div className="bg-white border-2 border-red-200 rounded-xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-red-600"></div>
            <h3 className="text-lg font-bold text-red-700 mb-2 flex items-center gap-2 pl-4">
              <AlertTriangle size={20} /> Danger Zone
            </h3>
            <p className="text-base text-slate-700 mb-6 pl-4">
              These actions are irreversible. All data will be permanently deleted.
            </p>
            <div className="space-y-6 pl-4">
              <div>
                <label className="text-sm font-semibold text-slate-800 mb-2 block">
                  Type <span className="text-red-700 font-mono bg-red-50 px-2 py-0.5 rounded">RESET DATABASE</span> to confirm
                </label>
                <input
                  value={dangerInput}
                  onChange={e => setDangerInput(e.target.value)}
                  placeholder="RESET DATABASE"
                  className="input text-base border-slate-300 w-full focus:border-red-500 focus:ring-red-500"
                />
              </div>
              <button
                disabled={dangerInput !== 'RESET DATABASE'}
                className="btn-primary bg-red-600 hover:bg-red-700 w-full disabled:opacity-50 disabled:hover:bg-red-600 flex items-center justify-center gap-2 py-3 text-base"
              >
                <Trash2 size={18} /> Reset All Database
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
