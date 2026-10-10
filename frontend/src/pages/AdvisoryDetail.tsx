import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ADVISORIES, PROJECTS, FINDINGS, formatDate } from '../data/mockData';
import { ArrowLeft, Network, Wrench, Eye, Bell, ExternalLink, AlertTriangle, Download } from 'lucide-react';
import clsx from 'clsx';

export default function AdvisoryDetail() {
  const { id } = useParams<{ id: string }>();
  const [watched, setWatched] = useState(false);

  const adv = ADVISORIES.find(a => a.id === id) ?? ADVISORIES[0];
  const affectedFindings = FINDINGS.filter(f => f.advisoryId === adv.id);
  const affectedProjects = PROJECTS.filter(p => affectedFindings.some(f => f.projectId === p.id));

  // Parse CVSS vector components
  const cvssComponents = adv.cvssVector
    ? adv.cvssVector.replace('CVSS:3.1/', '').split('/').map(part => {
        const [k, v] = part.split(':');
        const labels: Record<string, Record<string, string>> = {
          AV: { N: 'Network', A: 'Adjacent', L: 'Local', P: 'Physical' },
          AC: { L: 'Low', H: 'High' },
          PR: { N: 'None', L: 'Low', H: 'High' },
          UI: { N: 'None', R: 'Required' },
          S: { U: 'Unchanged', C: 'Changed' },
          C: { N: 'None', L: 'Low', H: 'High' },
          I: { N: 'None', L: 'Low', H: 'High' },
          A: { N: 'None', L: 'Low', H: 'High' },
        };
        const names: Record<string, string> = {
          AV: 'Attack Vector', AC: 'Attack Complexity', PR: 'Privileges Required',
          UI: 'User Interaction', S: 'Scope', C: 'Confidentiality', I: 'Integrity', A: 'Availability',
        };
        return { key: k, value: v, label: names[k] ?? k, readable: labels[k]?.[v] ?? v };
      })
    : [];

  const exportAdvisoryDetail = () => {
    const data = JSON.stringify(adv, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `advisory-${adv.id}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-slate-50 min-h-screen text-slate-700">
      <Link to="/advisories" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-4">
        <ArrowLeft size={16} /> Advisories
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-slate-900">{adv.id}</h1>
            {adv.kev && <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-semibold">KEV</span>}
            <span className={clsx('text-sm font-bold', adv.severity === 'CRITICAL' ? 'text-red-700' : adv.severity === 'HIGH' ? 'text-orange-700' : 'text-amber-700')}>{adv.severity}</span>
          </div>
          <div className="flex gap-2 flex-wrap mb-2">
            {adv.aliases.map(alias => (
              <span key={alias} className="text-xs bg-white border border-slate-300 px-2 py-0.5 rounded text-slate-600">
                {alias}
              </span>
            ))}
          </div>
          <p className="text-slate-600 text-base max-w-2xl">{adv.summary}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={exportAdvisoryDetail} className="btn-secondary flex items-center gap-2">
            <Download size={14} /> Export JSON
          </button>
          <button
            onClick={() => setWatched(!watched)}
            className={clsx('flex items-center gap-2 text-sm px-3 py-2 rounded-lg border transition-colors',
              watched ? 'bg-blue-50 border-blue-200 text-blue-700' : 'btn-secondary')}
          >
            <Bell size={14} /> {watched ? 'Watching' : 'Watch'}
          </button>
          <Link to={`/impact/${adv.id}`} className="btn-secondary flex items-center gap-2 text-sm">
            <Network size={14} /> Open Impact
          </Link>
          <Link to="/patch" className="btn-primary flex items-center gap-2 text-sm">
            <Wrench size={14} /> Generate Patch Plan
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          {/* Score Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
              <div className={clsx('text-3xl font-bold', adv.severity === 'CRITICAL' ? 'text-red-700' : adv.severity === 'HIGH' ? 'text-orange-700' : 'text-amber-700')}>{adv.cvss.toFixed(1)}</div>
              <div className="text-sm text-slate-500 mt-1">CVSS v3.1 Base</div>
              <div className="text-xs font-semibold mt-1 text-slate-600">{adv.severity}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
              <div className={clsx('text-3xl font-bold', adv.epss > 0.5 ? 'text-red-600' : 'text-orange-600')}>
                {(adv.epss * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-slate-500 mt-1">EPSS Score</div>
              <div className="text-xs text-slate-400 mt-1">Exploit prob. (30d)</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
              <div className={clsx('text-3xl font-bold', adv.kev ? 'text-red-600' : 'text-slate-400')}>
                {adv.kev ? '✓' : '✗'}
              </div>
              <div className="text-sm text-slate-500 mt-1">CISA KEV</div>
              {adv.kevDueDate && <div className="text-xs text-red-600 mt-1">Due: {adv.kevDueDate}</div>}
            </div>
          </div>

          {/* CVSS Vector Breakdown */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">CVSS Vector Breakdown</h3>
            <div className="text-sm bg-slate-50 border border-slate-200 rounded px-3 py-2 text-blue-700 mb-4 break-all">
              {adv.cvssVector}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {cvssComponents.map(({ key, value, label, readable }) => {
                const isHigh = ['N', 'C', 'H'].includes(value) && ['AV', 'C', 'I', 'A'].includes(key);
                return (
                  <div key={key} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded">
                    <span className="text-slate-600 text-sm">{label}</span>
                    <span className={clsx('text-sm font-semibold', isHigh ? 'text-red-600' : 'text-slate-900')}>
                      {readable}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Affected Ranges */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Affected Versions</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{adv.package}</div>
                  <div className="text-sm text-red-700 mt-1">Affected: {adv.affectedRange}</div>
                </div>
                {adv.fixedVersion && (
                  <div className="text-right">
                    <div className="text-sm text-slate-500">Fixed in</div>
                    <div className="text-base font-bold text-emerald-600">v{adv.fixedVersion}</div>
                    <div className="text-xs text-slate-400">OSV confirmed</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Affected Projects */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Affected Projects ({affectedProjects.length})</h3>
              <Link to={`/impact/${adv.id}`} className="text-sm text-blue-600 hover:underline">
                Full Impact Analysis →
              </Link>
            </div>
            <div className="space-y-3">
              {affectedProjects.length === 0 ? (
                <div className="text-sm text-emerald-600 py-4 text-center">No affected projects in portfolio</div>
              ) : affectedProjects.map(proj => {
                const finding = affectedFindings.find(f => f.projectId === proj.id);
                return (
                  <div key={proj.id} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <div className="flex-1">
                      <Link to={`/projects/${proj.id}`} className="text-sm font-semibold text-blue-600 hover:underline">
                        {proj.name}
                      </Link>
                      <div className="text-sm text-slate-500 mt-1">{proj.ecosystem} · depth {finding?.depth} · {finding?.scope}</div>
                    </div>
                    <span className={clsx('text-xs px-2 py-1 rounded border',
                      finding?.isDirect ? 'text-red-700 border-red-200 bg-red-100' : 'text-orange-700 border-orange-200 bg-orange-100')}>
                      {finding?.isDirect ? 'Direct' : 'Transitive'}
                    </span>
                    <span className="text-sm font-bold text-orange-600">{finding?.riskScore.toFixed(1)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Details</h3>
            <div className="space-y-3 text-sm">
              {[
                ['Package', adv.package],
                ['Ecosystem', adv.ecosystem],
                ['Published', formatDate(adv.published)],
                ['Modified', formatDate(adv.modified)],
                ['Source', adv.source],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2">
                  <span className="text-slate-500">{k}</span>
                  <span className="text-slate-900 text-right font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {adv.kev && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2 text-sm font-bold text-red-700 mb-2">
                <AlertTriangle size={16} /> CISA Known Exploited
              </div>
              <div className="text-sm text-red-600">This vulnerability has been exploited in the wild. CISA mandates federal agencies remediate by the due date.</div>
              {adv.kevDueDate && (
                <div className="mt-3 text-sm">
                  <span className="text-red-700 font-bold">Due: {adv.kevDueDate}</span>
                  <span className="text-red-600 block mt-1">⚠ Past due — immediate action required</span>
                </div>
              )}
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">References</h3>
            <div className="space-y-3">
              {adv.references.map(ref => (
                <a key={ref} href="#" className="flex items-center gap-2 text-sm text-blue-600 hover:underline break-all"
                  onClick={e => e.preventDefault()}>
                  <ExternalLink size={14} className="shrink-0" />
                  {ref.replace('https://', '').substring(0, 40)}...
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
