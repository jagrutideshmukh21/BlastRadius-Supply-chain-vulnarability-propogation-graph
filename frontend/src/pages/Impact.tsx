import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ADVISORIES } from '../data/mockData';
import { Network, Download, Wrench, Play, Pause, SkipForward, ChevronDown, ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const PROPAGATION_LAYERS = [
  {
    layer: 0, label: 'Vulnerable Package',
    nodes: [{ name: 'log4j-core@2.14.1', type: 'pkg-vuln', desc: 'CVE-2021-44228 · CVSS 10.0' }],
  },
  {
    layer: 1, label: 'Direct Dependents',
    nodes: [
      { name: 'api-gateway', type: 'project-direct', desc: 'Direct dep · depth 1 · runtime' },
      { name: 'reporting-lib', type: 'project-direct', desc: 'Direct dep · depth 1 · runtime · internal lib' },
    ],
  },
  {
    layer: 2, label: 'Transitive via reporting-lib',
    nodes: [
      { name: 'auth-service', type: 'project-trans', desc: 'Transitive · depth 2 via spring-security' },
      { name: 'batch-processor', type: 'project-trans', desc: 'Transitive · depth 2 via spring-boot' },
    ],
  },
  {
    layer: 3, label: 'Consumer of reporting-lib',
    nodes: [
      { name: 'data-ingestion', type: 'project-trans', desc: 'Transitive · depth 3 via reporting-lib' },
      { name: 'ml-pipeline', type: 'project-trans', desc: 'Transitive · depth 3 via reporting-lib' },
    ],
  },
];

const PATHS = [
  { id: 1, project: 'api-gateway', depth: 1, path: ['api-gateway', 'log4j-core@2.14.1'], scope: 'runtime', risk: 97.2, direct: true },
  { id: 2, project: 'reporting-lib', depth: 1, path: ['reporting-lib', 'log4j-core@2.14.1'], scope: 'runtime', risk: 91.5, direct: true },
  { id: 3, project: 'auth-service', depth: 2, path: ['auth-service', 'spring-security@5.6.1', 'log4j-core@2.14.1'], scope: 'runtime', risk: 94.1, direct: false },
  { id: 4, project: 'batch-processor', depth: 3, path: ['batch-processor', 'spring-boot-starter@2.6.3', 'spring-core@5.3.15', 'log4j-core@2.14.1'], scope: 'runtime', risk: 78.3, direct: false },
  { id: 5, project: 'data-ingestion', depth: 3, path: ['data-ingestion', 'reporting-lib@1.5.3', 'log4j-core@2.14.1'], scope: 'runtime', risk: 54.2, direct: false },
  { id: 6, project: 'ml-pipeline', depth: 3, path: ['ml-pipeline', 'reporting-lib@1.5.3', 'log4j-core@2.14.1'], scope: 'runtime', risk: 51.8, direct: false },
];

export default function Impact() {
  const { advisoryId } = useParams<{ advisoryId: string }>();
  const [tab, setTab] = useState('Table');
  const [animLayer, setAnimLayer] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [expandedPaths, setExpandedPaths] = useState<number[]>([]);
  const [vexDialog, setVexDialog] = useState<number | null>(null);

  const adv = ADVISORIES.find(a => a.id === advisoryId) ?? ADVISORIES[0];

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (playing && animLayer < PROPAGATION_LAYERS.length - 1) {
      timer = setTimeout(() => setAnimLayer(l => l + 1), 1200 / speed);
    } else if (animLayer >= PROPAGATION_LAYERS.length - 1) {
      setPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [playing, animLayer, speed]);

  const togglePath = (id: number) => setExpandedPaths(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const handleExportCSV = () => {
    const header = "Project,Depth,Scope,Risk,Direct,Path\n";
    const csv = PATHS.map(p => `${p.project},${p.depth},${p.scope},${p.risk},${p.direct},"${p.path.join(' -> ')}"`).join("\n");
    const blob = new Blob([header + csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'impact-report.csv';
    link.click();
    toast.success('Exported Impact Report to CSV');
  };

  return (
    <div className="p-6 fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Impact & Propagation</h1>
          <div className="flex items-center gap-2 mt-1">
            <Link to={`/advisories/${adv.id}`} className="text-sm font-mono text-blue-600 hover:underline">
              {adv.id}
            </Link>
            <span className="text-slate-400">·</span>
            <span className="text-sm text-slate-600">{adv.summary}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleExportCSV} className="btn-secondary flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm hover:bg-slate-50">
            <Download size={14} /> Export CSV
          </button>
          <Link to={`/graph?advisory=${adv.id}`} className="btn-secondary flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm hover:bg-slate-50">
            <Network size={14} /> Open Graph
          </Link>
          <Link to="/patch" className="btn-primary flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-slate-900 rounded-lg text-sm hover:bg-blue-700">
            <Wrench size={14} /> Patch Plan
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total Affected', value: 6, color: 'text-red-600' },
          { label: 'Direct', value: 2, color: 'text-orange-600' },
          { label: 'Transitive', value: 4, color: 'text-amber-600' },
          { label: 'Max Depth', value: 3, color: 'text-slate-700' },
          { label: 'Distinct Paths', value: 6, color: 'text-slate-700' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
            <div className="text-sm text-slate-500 mt-1 font-medium">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-6 border-b border-slate-200 mb-6 overflow-x-auto">
        {['Table', 'Path Tree', 'Propagation Animation', 'Reachability Evidence'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={clsx('pb-2 text-sm font-medium transition-colors shrink-0', t === tab ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-700')}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Table' && (
        <div className="space-y-3">
          {PATHS.map(p => (
            <div key={p.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50" onClick={() => togglePath(p.id)}>
                <button className="text-slate-400">{expandedPaths.includes(p.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</button>
                <Link to={`/projects/${p.project}`} className="text-sm text-blue-600 hover:underline font-bold w-32">{p.project}</Link>
                <span className={clsx('text-xs px-2 py-1 rounded font-medium border', p.direct ? 'text-red-700 border-red-200 bg-red-50' : 'text-orange-700 border-orange-200 bg-orange-50')}>
                  {p.direct ? 'Direct' : 'Transitive'}
                </span>
                <span className="text-sm text-slate-500">depth {p.depth}</span>
                <span className="text-sm text-slate-500">{p.scope}</span>
                <div className="ml-auto flex items-center gap-4">
                  <span className="text-base font-bold text-orange-600">{p.risk.toFixed(1)}</span>
                  <button onClick={e => { e.stopPropagation(); setVexDialog(p.id); }} className="text-sm text-slate-500 hover:text-slate-700 px-2 py-1 rounded hover:bg-slate-200">Mark VEX</button>
                </div>
              </div>
              {expandedPaths.includes(p.id) && (
                <div className="px-8 pb-4 bg-slate-50 border-t border-slate-100">
                  <div className="text-sm text-slate-600 mb-2 mt-3 font-medium">Propagation Path:</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {p.path.map((node, i) => (
                      <React.Fragment key={i}>
                        <span className={clsx('text-sm font-mono px-2 py-1 rounded border', node.includes('log4j') ? 'bg-red-50 text-red-700 border-red-200' : i === 0 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-700 border-slate-300')}>
                          {node}
                        </span>
                        {i < p.path.length - 1 && <span className="text-slate-400">→</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'Path Tree' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 font-mono text-sm shadow-sm">
          <div className="text-red-600 font-bold mb-3">log4j-core@2.14.1 [CVE-2021-44228]</div>
          <div className="space-y-2 pl-4 border-l-2 border-slate-200">
            <div className="text-orange-600">├── api-gateway [direct, depth 1, risk 97.2]</div>
            <div className="text-orange-600">├── reporting-lib [direct, depth 1, risk 91.5, internal-lib]</div>
            <div className="pl-4 border-l-2 border-slate-200 space-y-2 my-2">
              <div className="text-amber-600">│   ├── data-ingestion [transitive, depth 3, risk 54.2]</div>
              <div className="text-amber-600">│   └── ml-pipeline [transitive, depth 3, risk 51.8]</div>
            </div>
            <div className="text-orange-600">├── auth-service [transitive via spring-security, depth 2, risk 94.1]</div>
            <div className="pl-4 border-l-2 border-slate-200 my-2">
              <div className="text-slate-500">│   └── spring-security@5.6.1 [safe package, carries dep]</div>
            </div>
            <div className="text-amber-600">└── batch-processor [transitive via spring-boot, depth 3, risk 78.3]</div>
          </div>
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
            <AlertTriangle size={16} className="text-amber-600" />
            <span className="text-sm font-medium text-amber-800">reporting-lib is a choke point: upgrading it clears 3 downstream projects</span>
          </div>
        </div>
      )}

      {tab === 'Propagation Animation' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <button onClick={() => { if (animLayer >= PROPAGATION_LAYERS.length - 1) setAnimLayer(-1); setPlaying(!playing); }} className="btn-primary flex items-center gap-2 bg-blue-600 text-slate-900 px-4 py-2 rounded-lg">
              {playing ? <Pause size={14} /> : <Play size={14} />} {playing ? 'Pause' : animLayer >= PROPAGATION_LAYERS.length - 1 ? 'Replay' : 'Play'}
            </button>
            <button onClick={() => setAnimLayer(l => Math.min(l + 1, PROPAGATION_LAYERS.length - 1))} disabled={animLayer >= PROPAGATION_LAYERS.length - 1} className="btn-secondary flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg disabled:opacity-50">
              <SkipForward size={14} /> Step
            </button>
            <div className="flex items-center gap-2 ml-4">
              <span className="text-sm text-slate-600 font-medium">Speed:</span>
              {[0.5, 1, 2].map(s => (
                <button key={s} onClick={() => setSpeed(s)} className={clsx('text-sm px-3 py-1 rounded-lg font-medium transition-colors', speed === s ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
                  {s}x
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {PROPAGATION_LAYERS.map((layer, li) => {
              const visible = li <= animLayer;
              return (
                <div key={layer.layer} className={clsx('transition-all duration-500 bg-white border border-slate-200 rounded-xl p-4 shadow-sm', visible ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-2')}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold', visible ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500')}>
                      {layer.layer}
                    </div>
                    <span className={clsx('text-base font-bold', visible ? 'text-slate-900' : 'text-slate-500')}>{layer.label}</span>
                    {li === animLayer && playing && (
                      <div className="ml-2 flex items-center gap-2 text-sm text-red-600 font-medium">
                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" /> Propagating...
                      </div>
                    )}
                  </div>
                  <div className="ml-11 flex gap-3 flex-wrap">
                    {layer.nodes.map(node => (
                      <div key={node.name} className={clsx('px-4 py-3 rounded-lg border text-sm transition-all duration-300', visible && node.type === 'pkg-vuln' ? 'bg-red-50 border-red-200 text-red-800' : visible && node.type === 'project-direct' ? 'bg-orange-50 border-orange-200 text-orange-800' : visible && node.type === 'project-trans' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-500')}>
                        <div className="font-mono font-bold">{node.name}</div>
                        <div className="mt-1 opacity-80 text-xs">{node.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {animLayer >= PROPAGATION_LAYERS.length - 1 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-4 mt-6 shadow-sm">
              <AlertTriangle size={24} className="text-red-600 shrink-0" />
              <div>
                <div className="text-base font-bold text-red-700">Full blast radius revealed</div>
                <div className="text-sm text-red-600 mt-1">6 projects affected across 4 propagation layers. reporting-lib is the critical choke point.</div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'Reachability Evidence' && (
        <div className="space-y-6">
          {/* Classification Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="text-xs text-slate-500 font-semibold uppercase">Dependency Detected</div>
              <div className="text-2xl font-black text-slate-700 mt-1">6 Projects</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Present in manifest lockfiles</div>
            </div>
            <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-sm">
              <div className="text-xs text-blue-700 font-semibold uppercase">Source Reference Observed</div>
              <div className="text-2xl font-black text-blue-600 mt-1">4 Projects</div>
              <div className="text-[11px] text-slate-400 mt-0.5">AST import / class declaration found</div>
            </div>
            <div className="bg-white border border-red-200 rounded-xl p-4 shadow-sm">
              <div className="text-xs text-red-700 font-semibold uppercase">Vulnerable Symbol Matched</div>
              <div className="text-2xl font-black text-red-600 mt-1">2 Projects</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Active call site to vulnerable method</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="text-xs text-slate-500 font-semibold uppercase">Reachability Unknown</div>
              <div className="text-2xl font-black text-slate-500 mt-1">0 Projects</div>
              <div className="text-[11px] text-slate-400 mt-0.5">All projects statically evaluated</div>
            </div>
          </div>

          {/* Evidence Explanation Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-amber-700" />
              Scientific Evidence Disclaimers & Uncertainty Limits
            </div>
            <div>
              • <strong>Source Reference ≠ Exploitability:</strong> An import or class reference does not guarantee user input flows into the vulnerable method.
            </div>
            <div>
              • <strong>Missing Import ≠ Safety:</strong> Dynamic classloading, Java reflection, Spring Bean dependency injection, or RPC proxies can invoke libraries transitively.
            </div>
          </div>

          {/* Reachability Matrix Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Portfolio Reachability Evidence Matrix</h3>
              <p className="text-xs text-slate-500 mt-0.5">Verified static call sites and evidence classifications for {adv.id}</p>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="p-3.5">Project</th>
                  <th className="p-3.5">Evidence Classification</th>
                  <th className="p-3.5">Observed Call Site / Method Reference</th>
                  <th className="p-3.5">Symbols Matched</th>
                  <th className="p-3.5">Action Guidance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="p-3.5 font-bold font-mono text-slate-900">api-gateway</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">
                      Vulnerable Symbol Matched
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-700">GatewayFilter.java:42 → logger.error("Req failed: " + headerVal)</td>
                  <td className="p-3.5 font-mono text-red-600 font-bold">logger.error, JndiLookup</td>
                  <td className="p-3.5 text-red-700 font-bold">Immediate P0 Patch Required</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3.5 font-bold font-mono text-slate-900">reporting-lib</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">
                      Vulnerable Symbol Matched
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-700">ReportExporter.java:88 → LogManager.getLogger()</td>
                  <td className="p-3.5 font-mono text-red-600 font-bold">LogManager.getLogger</td>
                  <td className="p-3.5 text-orange-700 font-bold">Fix-Once Choke Point Upgrade</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3.5 font-bold font-mono text-slate-900">auth-service</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                      Source Reference Observed
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-700">SecurityConfig.java:18 → import org.apache.logging.log4j.Logger</td>
                  <td className="p-3.5 font-mono text-blue-600">org.apache.logging.log4j</td>
                  <td className="p-3.5 text-slate-600">Upgrade via Parent POM</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3.5 font-bold font-mono text-slate-900">batch-processor</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                      Source Reference Observed
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-700">BatchController.java:23 → @InitBinder setup</td>
                  <td className="p-3.5 font-mono text-blue-600">@InitBinder</td>
                  <td className="p-3.5 text-slate-600">Scheduled Wave 2 Upgrade</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3.5 font-bold font-mono text-slate-900">data-ingestion</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      Dependency Detected
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-500">Transitive depth 3 via reporting-lib (no direct source imports)</td>
                  <td className="p-3.5 text-slate-400">—</td>
                  <td className="p-3.5 text-slate-500">Clears when reporting-lib bumps</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3.5 font-bold font-mono text-slate-900">ml-pipeline</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      Dependency Detected
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-500">Transitive depth 3 via reporting-lib (no direct source imports)</td>
                  <td className="p-3.5 text-slate-400">—</td>
                  <td className="p-3.5 text-slate-500">Clears when reporting-lib bumps</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {vexDialog && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Mark as Not Affected</h3>
            <p className="text-sm text-slate-500 mb-4">Provide justification for VEX record</p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">VEX Status</label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900">
                  <option>not_affected</option>
                  <option>fixed</option>
                  <option>under_investigation</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Justification</label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900">
                  <option>component_not_present</option>
                  <option>vulnerable_code_not_present</option>
                  <option>inline_mitigations_already_exist</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Detail (required)</label>
                <textarea className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 h-24" placeholder="Explain why this finding does not apply..." />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setVexDialog(null)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium">Cancel</button>
              <button onClick={() => { setVexDialog(null); toast.success('VEX Record Submitted'); }} className="flex-1 px-4 py-2 bg-blue-600 text-slate-900 rounded-lg hover:bg-blue-700 font-medium">Submit VEX</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
