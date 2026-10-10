import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ADVISORIES, tierColor, confidenceBadge, exportAsCSV, MISSING_DATA_POLICY } from '../data/mockData';
import { Info, Download, RotateCcw, Network, AlertTriangle, ShieldAlert } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const PRESETS = [
  { name: 'Balanced', weights: { e: 0.40, i: 0.25, x: 0.35 } },
  { name: 'KEV-first', weights: { e: 0.60, i: 0.20, x: 0.20 } },
  { name: 'Business-critical', weights: { e: 0.25, i: 0.30, x: 0.45 } },
];

const RANKED_FINDINGS = [
  { rank: 1, project: 'api-gateway', advisory: 'CVE-2021-44228', pkg: 'log4j-core@2.14.1', depth: 1, scope: 'runtime', e: 0.98, i: 1.0, x: 0.98, score: 97.2, tier: 'P0', confidence: 'Confirmed', cvssRank: 1, epssSource: 'live', cvssSource: 'live' },
  { rank: 2, project: 'auth-service', advisory: 'CVE-2021-44228', pkg: 'log4j-core@2.14.1', depth: 2, scope: 'runtime', e: 0.98, i: 1.0, x: 0.93, score: 94.1, tier: 'P0', confidence: 'Confirmed', cvssRank: 1, epssSource: 'live', cvssSource: 'live' },
  { rank: 3, project: 'reporting-lib', advisory: 'CVE-2021-44228', pkg: 'log4j-core@2.14.1', depth: 1, scope: 'runtime', e: 0.98, i: 1.0, x: 0.88, score: 91.5, tier: 'P0', confidence: 'Confirmed', cvssRank: 1, epssSource: 'live', cvssSource: 'live' },
  { rank: 4, project: 'batch-processor', advisory: 'CVE-2022-22965', pkg: 'spring-webmvc@5.3.15', depth: 1, scope: 'runtime', e: 0.89, i: 0.98, x: 0.65, score: 78.3, tier: 'P1', confidence: 'Confirmed', cvssRank: 2, epssSource: 'live', cvssSource: 'live' },
  { rank: 5, project: 'frontend-app', advisory: 'CVE-2019-10744', pkg: 'lodash@4.17.15', depth: 3, scope: 'runtime', e: 0.73, i: 0.91, x: 0.72, score: 71.4, tier: 'P1', confidence: 'Confirmed', cvssRank: 3, epssSource: 'live', cvssSource: 'live' },
  { rank: 6, project: 'admin-dashboard', advisory: 'CVE-2019-10744', pkg: 'lodash@4.17.15', depth: 3, scope: 'runtime', e: 0.73, i: 0.91, x: 0.68, score: 68.2, tier: 'P1', confidence: 'Confirmed', cvssRank: 3, epssSource: 'live', cvssSource: 'live' },
  { rank: 7, project: 'ml-pipeline', advisory: 'CVE-2022-42969', pkg: 'py@1.10.0', depth: 2, scope: 'runtime', e: 0.43, i: 0.75, x: 0.58, score: 54.2, tier: 'P2', confidence: 'Probable', cvssRank: 5, epssSource: 'estimated', cvssSource: 'live' },
  { rank: 8, project: 'data-ingestion', advisory: 'CVE-2022-42969', pkg: 'py@1.10.0', depth: 2, scope: 'runtime', e: 0.43, i: 0.75, x: 0.51, score: 49.8, tier: 'P2', confidence: 'Probable', cvssRank: 5, epssSource: 'estimated', cvssSource: 'live' },
  { rank: 9, project: 'cli-tooling', advisory: 'CVE-2020-28469', pkg: 'glob-parent@4.3.0', depth: 4, scope: 'runtime', e: 0.12, i: 0.75, x: 0.42, score: 38.1, tier: 'P3', confidence: 'Confirmed', cvssRank: 4, epssSource: 'live', cvssSource: 'estimated' },
];

export default function Risk() {
  const [weights, setWeights] = useState({ e: 0.40, i: 0.25, x: 0.35 });
  const [preset, setPreset] = useState('Balanced');
  const [showRankShift, setShowRankShift] = useState(false);
  const [explainRow, setExplainRow] = useState<number | null>(null);

  const applyPreset = (name: string) => {
    const p = PRESETS.find(p => p.name === name)!;
    setWeights(p.weights);
    setPreset(name);
  };

  const recomputedScore = (f: typeof RANKED_FINDINGS[0]) =>
    (100 * (weights.e * f.e + weights.i * f.i + weights.x * f.x)).toFixed(1);

  const handleExportCSV = () => {
    exportAsCSV(
      ['Rank', 'Project', 'Advisory', 'Package', 'Depth', 'Scope', 'Exploitability', 'Impact', 'Exposure', 'Score', 'Tier', 'Confidence', 'EPSS Source', 'CVSS Source'],
      RANKED_FINDINGS.map(f => [
        String(f.rank), f.project, f.advisory, f.pkg, String(f.depth), f.scope,
        f.e.toFixed(2), f.i.toFixed(2), f.x.toFixed(2), recomputedScore(f),
        f.tier, f.confidence, f.epssSource, f.cvssSource,
      ]),
      'BlastRadius_Risk_Rankings.csv'
    );
    toast.success('Risk rankings exported to CSV!');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Missing Data Policy Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-600 mt-0.5 shrink-0" />
          <div className="space-y-1.5">
            <div className="text-sm font-bold text-amber-900">Missing Data Policy</div>
            <div className="text-xs text-amber-800 space-y-1">
              <div>• <strong>Missing EPSS:</strong> {MISSING_DATA_POLICY.epss.label} — flagged with ⚠ in table</div>
              <div>• <strong>Missing CVSS:</strong> {MISSING_DATA_POLICY.cvss.label} — flagged with ⚠ in table</div>
              <div>• <strong className="text-red-700">{MISSING_DATA_POLICY.noAdvisory}</strong></div>
              <div>• {MISSING_DATA_POLICY.failedSource}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Risk Ranking</h1>
          <p className="text-sm text-slate-500">{RANKED_FINDINGS.length} findings · sorted by BlastRadius composite score</p>
        </div>
        <button onClick={handleExportCSV} className="btn-primary flex items-center gap-2">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Controls Row */}
      <div className="grid grid-cols-12 gap-4">
        {/* Weights Panel */}
        <div className="col-span-5 card bg-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800">Score Weights</h3>
            <div className="flex gap-1">
              {PRESETS.map(p => (
                <button key={p.name} onClick={() => applyPreset(p.name)}
                  className={clsx('text-xs px-2.5 py-1 rounded-md font-medium', preset === p.name ? 'bg-blue-600 text-slate-900' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
                  {p.name}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {[
              { key: 'e', label: 'Exploitability (E)', hint: 'EPSS × 0.45 + KEV × 0.35 + AV × 0.20' },
              { key: 'i', label: 'Impact (I)', hint: 'CVSS base / 10' },
              { key: 'x', label: 'Exposure (X)', hint: 'scope × depth × internet × criticality × paths' },
            ].map(({ key, label, hint }) => (
              <div key={key}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">{label}</span>
                  <span className="text-blue-700 font-mono font-bold">{(weights[key as 'e' | 'i' | 'x'] * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range" min={5} max={70} step={5}
                  value={weights[key as 'e' | 'i' | 'x'] * 100}
                  onChange={e => {
                    const v = parseInt(e.target.value) / 100;
                    setWeights(w => ({ ...w, [key]: v }));
                    setPreset('Custom');
                  }}
                  className="w-full accent-blue-600"
                />
                <div className="text-xs text-slate-400 mt-0.5">{hint}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => applyPreset('Balanced')} className="btn-secondary text-xs flex items-center gap-1">
              <RotateCcw size={11} /> Reset
            </button>
          </div>
        </div>

        {/* View Options */}
        <div className="col-span-4 card bg-white">
          <h3 className="text-sm font-bold text-slate-800 mb-3">View Options</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showRankShift} onChange={e => setShowRankShift(e.target.checked)} className="accent-blue-600 rounded" />
              <span className="text-sm text-slate-700">Show CVSS-only rank shift</span>
            </label>
            <div className="text-xs text-slate-600 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-amber-700 font-bold mb-1 flex items-center gap-1"><AlertTriangle size={12} /> Missing Data Notice</div>
              <div className="text-slate-600">2 findings use estimated EPSS (neutral prior 0.1). 1 finding uses estimated CVSS (severity mapping). All flagged with ⚠.</div>
            </div>
          </div>
        </div>

        {/* Score Formula */}
        <div className="col-span-3 card bg-white">
          <h3 className="text-sm font-bold text-slate-800 mb-3">Score Formula</h3>
          <div className="text-xs text-slate-600 font-mono bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
            <div>Risk = 100 × (wE×E + wI×I + wX×X)</div>
            <div className="text-blue-700 font-bold mt-2">Current:</div>
            <div>= 100 × ({weights.e.toFixed(2)}×E + {weights.i.toFixed(2)}×I + {weights.x.toFixed(2)}×X)</div>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            <ShieldAlert size={12} className="inline text-amber-600 mr-1" />
            These are <strong>BlastRadius heuristics</strong> for prioritization, not industry-standard risk scores.
          </div>
        </div>
      </div>

      {/* Rankings Table */}
      <div className="card bg-white p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr className="text-xs text-slate-500 uppercase tracking-wider">
              <th className="p-3 text-left">Rank</th>
              {showRankShift && <th className="p-3 text-left">CVSS Rank</th>}
              <th className="p-3 text-left">Project</th>
              <th className="p-3 text-left">Advisory</th>
              <th className="p-3 text-left">Package</th>
              <th className="p-3 text-left">Depth</th>
              <th className="p-3 text-left">E</th>
              <th className="p-3 text-left">I</th>
              <th className="p-3 text-left">X</th>
              <th className="p-3 text-left">Score</th>
              <th className="p-3 text-left">Tier</th>
              <th className="p-3 text-left">Confidence</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {RANKED_FINDINGS.map(f => (
              <React.Fragment key={f.rank}>
                <tr className="hover:bg-blue-50/50 transition-colors">
                  <td className="p-3 text-slate-500 font-mono text-xs font-bold">#{f.rank}</td>
                  {showRankShift && (
                    <td className="p-3 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500 font-mono">#{f.cvssRank}</span>
                        {f.rank !== f.cvssRank && (
                          <span className={clsx('text-xs font-bold', f.rank < f.cvssRank ? 'text-red-600' : 'text-emerald-600')}>
                            {f.rank < f.cvssRank ? `▲${f.cvssRank - f.rank}` : `▼${f.rank - f.cvssRank}`}
                          </span>
                        )}
                      </div>
                    </td>
                  )}
                  <td className="p-3">
                    <Link to={`/projects`} className="text-blue-600 hover:underline text-xs font-medium">{f.project}</Link>
                  </td>
                  <td className="p-3">
                    <Link to={`/advisories/${ADVISORIES.find(a => a.aliases.includes(f.advisory))?.id ?? f.advisory}`} className="text-xs font-mono text-slate-700 hover:text-blue-600">{f.advisory}</Link>
                  </td>
                  <td className="p-3 font-mono text-xs text-slate-800 font-medium">{f.pkg}</td>
                  <td className="p-3 text-xs text-slate-500">{f.depth}</td>
                  <td className="p-3 text-xs font-mono">
                    <span className="text-orange-700 font-bold">{f.e.toFixed(2)}</span>
                    {f.epssSource === 'estimated' && <span className="text-amber-600 ml-0.5" title="Estimated EPSS (neutral prior 0.1)">⚠</span>}
                  </td>
                  <td className="p-3 text-xs font-mono">
                    <span className="text-red-700 font-bold">{f.i.toFixed(2)}</span>
                    {f.cvssSource === 'estimated' && <span className="text-amber-600 ml-0.5" title="Estimated CVSS (severity mapping)">⚠</span>}
                  </td>
                  <td className="p-3 text-xs font-mono text-amber-700 font-bold">{f.x.toFixed(2)}</td>
                  <td className="p-3">
                    <span className="text-sm font-black text-slate-900">{recomputedScore(f)}</span>
                  </td>
                  <td className="p-3">
                    <span className={tierColor(f.tier as any)}>{f.tier}</span>
                  </td>
                  <td className="p-3">
                    <span className={clsx('text-xs px-2 py-0.5 rounded font-medium', confidenceBadge(f.confidence as any))}>
                      {f.confidence}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => setExplainRow(explainRow === f.rank ? null : f.rank)}
                        className="p-1.5 hover:bg-blue-50 rounded text-slate-500 hover:text-blue-600" title="Explain Score"
                      >
                        <Info size={14} />
                      </button>
                      <Link to={`/impact/${ADVISORIES.find(a => a.aliases.includes(f.advisory))?.id ?? f.advisory}`}
                        className="p-1.5 hover:bg-blue-50 rounded text-slate-500 hover:text-blue-600" title="Open Impact">
                        <Network size={14} />
                      </Link>
                    </div>
                  </td>
                </tr>
                {explainRow === f.rank && (
                  <tr className="bg-blue-50/50">
                    <td colSpan={showRankShift ? 14 : 13} className="px-8 py-4">
                      <div className="text-xs space-y-3">
                        <div className="font-bold text-slate-900">Score Explanation: {f.project} / {f.advisory}</div>
                        <div className="font-mono bg-white p-3 rounded-lg border border-slate-200 text-slate-700">
                          Risk = 100 × ({weights.e.toFixed(2)}×E + {weights.i.toFixed(2)}×I + {weights.x.toFixed(2)}×X)<br/>
                          = 100 × ({weights.e.toFixed(2)}×{f.e.toFixed(2)} + {weights.i.toFixed(2)}×{f.i.toFixed(2)} + {weights.x.toFixed(2)}×{f.x.toFixed(2)})<br/>
                          = <span className="text-blue-700 font-black">{recomputedScore(f)}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="p-3 bg-white rounded-lg border border-slate-200">
                            <div className="text-orange-700 font-bold">E = {f.e.toFixed(2)} {f.epssSource === 'estimated' && <span className="text-amber-600">⚠ Estimated</span>}</div>
                            <div className="text-slate-500 mt-1 space-y-0.5">
                              <div>EPSS: {f.epssSource === 'estimated' ? `${MISSING_DATA_POLICY.epss.neutralPrior} (neutral prior)` : '97.5%'}</div>
                              <div>KEV: {f.e > 0.9 ? 'Active' : 'Not listed'}</div>
                              <div>Attack Vector: Network</div>
                            </div>
                          </div>
                          <div className="p-3 bg-white rounded-lg border border-slate-200">
                            <div className="text-red-700 font-bold">I = {f.i.toFixed(2)} {f.cvssSource === 'estimated' && <span className="text-amber-600">⚠ Estimated</span>}</div>
                            <div className="text-slate-500 mt-1 space-y-0.5">
                              <div>CVSS base: {f.cvssSource === 'estimated' ? `${MISSING_DATA_POLICY.cvss.severityMapping['HIGH']} (severity mapping)` : (f.i * 10).toFixed(1)}</div>
                              <div>I = CVSS / 10</div>
                            </div>
                          </div>
                          <div className="p-3 bg-white rounded-lg border border-slate-200">
                            <div className="text-amber-700 font-bold">X = {f.x.toFixed(2)}</div>
                            <div className="text-slate-500 mt-1 space-y-0.5">
                              <div>Scope: {f.scope} (1.0)</div>
                              <div>Depth: {f.depth} (factor {Math.max(0.6, 1 - 0.1 * f.depth).toFixed(1)})</div>
                              <div>Internet-facing: Yes</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
