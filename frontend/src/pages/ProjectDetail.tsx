import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  PROJECTS, FINDINGS, ADVISORIES, formatDateTime, tierColor,
  confidenceBadge, severityColor
} from '../data/mockData';
import {
  RefreshCw, Network, Wrench, Download, Trash2, Edit, ArrowLeft,
  Globe, Lock, Library, CheckCircle, AlertTriangle
} from 'lucide-react';
import clsx from 'clsx';

const TABS = ['Overview', 'Manifests', 'Dependencies', 'Findings', 'History', 'Settings'];

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState('Overview');

  const project = PROJECTS.find(p => p.id === id) ?? PROJECTS[0];
  const findings = FINDINGS.filter(f => f.projectId === project.id);

  const exportProjectDetail = () => {
    const data = JSON.stringify({ project, findings }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `project-${project.id}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Breadcrumb */}
      <Link to="/projects" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-4">
        <ArrowLeft size={16} /> Projects
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
            <span className={clsx('font-bold', project.worstTier === 'P0' ? 'text-red-700' : 'text-orange-700')}>{project.worstTier}</span>
            <span className={clsx('text-xs px-2 py-1 rounded font-medium', 
              project.confidence === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>
              {project.confidence}
            </span>
          </div>
          <p className="text-base text-slate-600 mt-2">{project.description}</p>
          <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              {project.internetFacing ? <Globe size={14} className="text-blue-600" /> : <Lock size={14} />}
              {project.internetFacing ? 'Internet-facing' : 'Internal only'}
            </span>
            <span>Owner: {project.owner}</span>
            <span>v{project.version}</span>
            <span>Criticality: {'★'.repeat(project.criticality)}{'☆'.repeat(5 - project.criticality)}</span>
            {project.isInternalLib && (
              <span className="flex items-center gap-1 text-purple-600">
                <Library size={14} /> Internal Library
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={exportProjectDetail} className="btn-secondary flex items-center gap-2">
            <Download size={16} /> Export JSON
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <RefreshCw size={16} /> Rescan
          </button>
          <Link to={`/graph?project=${project.id}`} className="btn-secondary flex items-center gap-2">
            <Network size={16} /> Open in Graph
          </Link>
          <Link to="/patch" className="btn-primary flex items-center gap-2">
            <Wrench size={16} /> Generate Patch Plan
          </Link>
        </div>
      </div>

      {/* Risk Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Direct Findings', value: findings.filter(f => f.isDirect).length, color: 'text-red-600' },
          { label: 'Transitive', value: findings.filter(f => !f.isDirect).length, color: 'text-orange-600' },
          { label: 'Direct Deps', value: project.directDeps, color: 'text-slate-900' },
          { label: 'Transitive Deps', value: project.transitiveDeps, color: 'text-slate-900' },
          { label: 'Worst Risk Score', value: findings.length > 0 ? Math.max(...findings.map(f => f.riskScore)).toFixed(1) : 'N/A', color: 'text-red-700' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
            <div className="text-sm font-medium text-slate-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-slate-200 mb-6">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={clsx('pb-3 text-sm font-semibold transition-colors border-b-2', 
              t === tab ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700')}>
            {t}
            {t === 'Findings' && findings.length > 0 && (
              <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                {findings.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Metadata */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Project Metadata</h3>
            <div className="space-y-4 text-base">
              {[
                ['Name', project.name],
                ['Owner', project.owner],
                ['Version', project.version],
                ['Ecosystem', project.ecosystem],
                ['Internet Facing', project.internetFacing ? 'Yes' : 'No'],
                ['Criticality', `${project.criticality}/5`],
                ['Internal Library', project.isInternalLib ? 'Yes' : 'No'],
                ['Last Scan', formatDateTime(project.lastScan)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between items-center border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <span className="text-slate-500">{k}</span>
                  <span className="font-semibold text-slate-900">{v}</span>
                </div>
              ))}
            </div>
            <button className="btn-secondary w-full mt-6 flex items-center justify-center gap-2">
              <Edit size={16} /> Edit Metadata
            </button>
          </div>

          {/* Top Findings */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Top Findings</h3>
              <Link to="/risk" className="text-sm font-semibold text-blue-600 hover:underline">View all →</Link>
            </div>
            {findings.length === 0 ? (
              <div className="flex flex-col items-center gap-2 text-emerald-600 py-12 justify-center">
                <CheckCircle size={32} />
                <span className="font-medium text-base">No findings — verified clean</span>
              </div>
            ) : (
              <div className="space-y-4">
                {findings.slice(0, 5).map(f => {
                  const adv = ADVISORIES.find(a => a.id === f.advisoryId);
                  return (
                    <div key={f.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <Link to={`/advisories/${f.advisoryId}`} className="text-base font-bold text-blue-700 hover:underline">
                          {f.advisoryId}
                        </Link>
                        <span className={clsx('font-bold', f.tier === 'P0' ? 'text-red-700' : 'text-orange-700')}>{f.tier}</span>
                      </div>
                      <div className="text-sm text-slate-700 mb-3">{adv?.summary}</div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-3">
                        <span className="font-medium bg-white px-2 py-0.5 rounded border border-slate-200">{f.package}@{f.version}</span>
                        <span>depth {f.depth}</span>
                        <span>{f.scope}</span>
                        {!f.isDirect && <span className="text-orange-600 font-medium">transitive</span>}
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                        <span className="text-sm font-bold text-orange-700">Risk: {f.riskScore.toFixed(1)}</span>
                        {f.fixedVersion && (
                          <span className="text-sm font-bold text-emerald-600">Fix: v{f.fixedVersion}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'Dependencies' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Dependency Tree</h3>
            <button className="btn-secondary flex items-center gap-2">
              <Download size={16} /> Export CSV
            </button>
          </div>
          <div className="space-y-2 font-mono text-sm bg-slate-50 p-4 rounded-lg border border-slate-200 overflow-auto">
            {['log4j-core@2.14.1 [runtime, depth 1, VULNERABLE ⚠]',
              '  → log4j-api@2.14.1 [runtime, depth 2]',
              '    → log4j-to-slf4j@2.14.1 [runtime, depth 3]',
              'spring-boot-starter@2.6.3 [runtime, depth 1]',
              '  → spring-context@5.3.15 [runtime, depth 2]',
              '    → spring-core@5.3.15 [runtime, depth 3]',
              'jackson-databind@2.13.1 [runtime, depth 1]',
              '  → jackson-core@2.13.1 [runtime, depth 2]',
              'junit@5.8.2 [test, depth 1]',
            ].map((line, i) => (
              <div key={i} className={clsx(
                'py-1 px-2 rounded',
                line.includes('VULNERABLE') ? 'text-red-700 bg-red-100 font-bold' : 'text-slate-700',
              )}>
                {line}
              </div>
            ))}
          </div>
          <div className="mt-6 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200 flex items-center gap-2 font-medium">
            <AlertTriangle size={16} />
            Resolution method: lockfile (high confidence). 1 vulnerable package flagged.
          </div>
        </div>
      )}

      {tab === 'Findings' && (
        <div className="space-y-4">
          {findings.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center py-20 shadow-sm">
              <CheckCircle size={48} className="text-emerald-700 mb-4" />
              <div className="text-xl font-bold text-slate-900 mb-2">No findings</div>
              <div className="text-base text-slate-500">This project uses fixed versions — verified clean</div>
            </div>
          ) : findings.map(f => {
            const adv = ADVISORIES.find(a => a.id === f.advisoryId);
            return (
              <div key={f.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link to={`/advisories/${f.advisoryId}`} className="text-lg font-bold text-blue-700 hover:underline">
                        {f.advisoryId}
                      </Link>
                      <span className={clsx('font-bold', f.tier === 'P0' ? 'text-red-700' : 'text-orange-700')}>{f.tier}</span>
                      <span className={clsx('text-xs px-2 py-1 rounded font-medium', 
                        f.confidence === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>
                        {f.confidence}
                      </span>
                    </div>
                    <div className="text-base text-slate-700 mb-4">{adv?.summary}</div>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <span>Package: <span className="font-semibold text-slate-900">{f.package}@{f.version}</span></span>
                      <span>Depth: <span className="font-medium text-slate-900">{f.depth}</span></span>
                      <span>Scope: <span className="font-medium text-slate-900">{f.scope}</span></span>
                      {f.fixedVersion && <span className="text-emerald-700 font-bold">Fix: v{f.fixedVersion}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="text-3xl font-black text-orange-600 mb-1">{f.riskScore.toFixed(1)}</div>
                    <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Risk Score</div>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white border border-slate-200 rounded-lg p-4 flex justify-between items-center">
                    <div className="text-slate-600 font-medium">Exploitability (E)</div>
                    <div className="font-bold text-lg text-orange-600">{f.exploitability.toFixed(2)}</div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-4 flex justify-between items-center">
                    <div className="text-slate-600 font-medium">Impact (I)</div>
                    <div className="font-bold text-lg text-red-600">{f.impact.toFixed(2)}</div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-4 flex justify-between items-center">
                    <div className="text-slate-600 font-medium">Exposure (X)</div>
                    <div className="font-bold text-lg text-amber-600">{f.exposure.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manifests, History, Settings tabs omitted for brevity but they should also be converted if fully rewriting. I will rewrite them quickly too to match styling. */}
      {tab === 'Manifests' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Manifest Files</h3>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-base font-bold text-slate-900">pom.xml</span>
                <div className="flex gap-2">
                  <button className="btn-secondary text-sm">View</button>
                  <button className="btn-secondary text-sm">Replace</button>
                </div>
              </div>
              <div className="text-sm text-slate-500 mb-2">Source: uploaded · Jan 15, 2024 · sha256: a1b2c3...</div>
              <div className="text-sm font-medium text-emerald-600">Lockfile present — high confidence resolution</div>
            </div>
          </div>
        </div>
      )}

      {tab === 'History' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Scan History</h3>
          <div className="space-y-3">
            {[
              { time: 'Jan 15, 2024 10:30 AM', findings: 3, added: 1, removed: 0 },
              { time: 'Jan 10, 2024 09:15 AM', findings: 2, added: 0, removed: 1 },
              { time: 'Jan 05, 2024 08:00 AM', findings: 3, added: 2, removed: 0 },
            ].map((h, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl text-base">
                <div className="font-semibold text-slate-900">{h.time}</div>
                <div className="flex items-center gap-6 mt-2 sm:mt-0">
                  <div className="text-slate-600">{h.findings} total findings</div>
                  {h.added > 0 && <div className="text-red-600 font-bold">+{h.added} new</div>}
                  {h.removed > 0 && <div className="text-emerald-600 font-bold">-{h.removed} resolved</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'Settings' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-xl shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Project Settings</h3>
          <div className="space-y-6">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Project Name</label>
              <input defaultValue={project.name} className="input bg-white border-slate-300 w-full" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Owner</label>
              <input defaultValue={project.owner} className="input bg-white border-slate-300 w-full" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Criticality (1-5)</label>
              <input type="range" min={1} max={5} defaultValue={project.criticality} className="w-full accent-blue-600" />
            </div>
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button className="btn-primary flex-1">Save Settings</button>
              <button className="btn-secondary text-red-600 border-red-200 hover:bg-red-50 flex items-center justify-center gap-2 flex-1">
                <Trash2 size={16} /> Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
