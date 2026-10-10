import React, { useState } from 'react';
import { AUDIT_EVENTS, formatDateTime } from '../data/mockData';
import { Search, Download, Filter } from 'lucide-react';

const ALL_EVENTS = [
  ...AUDIT_EVENTS,
  { id: 'audit-004', actor: 'system', action: 'SCAN_COMPLETE', entity: 'proj-002', entityName: 'auth-service', time: '2024-01-15T10:35:00Z', reason: 'Scheduled scan', before: null, after: '2 findings' },
  { id: 'audit-005', actor: 'system', action: 'SYNC_EPSS', entity: 'data-source', entityName: 'FIRST EPSS', time: '2024-01-15T09:00:00Z', reason: 'Scheduled daily sync', before: '387 records', after: '389 records (+2)' },
  { id: 'audit-006', actor: 'demo', action: 'PATCH_SIMULATE', entity: 'patch-002', entityName: 'log4j-core bump', time: '2024-01-15T10:05:00Z', reason: 'Demo simulation run', before: null, after: 'Simulation only — no DB write' },
  { id: 'audit-007', actor: 'demo', action: 'PATCH_APPLY', entity: 'patch-002', entityName: 'log4j-core@2.14.1→2.17.1', time: '2024-01-15T10:10:00Z', reason: 'Log4Shell KEV remediation', before: 'state=accepted', after: 'state=applied' },
];

const ACTION_COLORS: Record<string, string> = {
  SCAN_COMPLETE: 'text-blue-700 bg-blue-100',
  DEMO_RUN: 'text-cyan-700 bg-cyan-100',
  SYNC_KEV: 'text-purple-700 bg-purple-100',
  SYNC_EPSS: 'text-purple-700 bg-purple-100',
  PATCH_SIMULATE: 'text-amber-700 bg-amber-100',
  PATCH_APPLY: 'text-emerald-700 bg-emerald-100',
};

export default function Audit() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  const filtered = ALL_EVENTS.filter(e => {
    const q = search.toLowerCase();
    return (
      (e.actor.includes(q) || e.action.includes(q) || e.entityName.toLowerCase().includes(q)) &&
      (actionFilter === 'All' || e.action === actionFilter)
    );
  }).sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  const handleExportCSV = () => {
    const headers = ['Time', 'Actor', 'Action', 'Entity Name', 'Reason', 'Before', 'After'];
    const rows = filtered.map(e => [
      formatDateTime(e.time),
      e.actor,
      e.action,
      `"${e.entityName.replace(/"/g, '""')}"`,
      `"${e.reason.replace(/"/g, '""')}"`,
      `"${(e.before || '').replace(/"/g, '""')}"`,
      `"${(e.after || '').replace(/"/g, '""')}"`
    ].join(','));
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'audit_log_export.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Audit Log</h1>
          <p className="text-sm text-slate-600">{ALL_EVENTS.length} events recorded</p>
        </div>
        <button data-testid="btn-audit-export-csv" onClick={handleExportCSV} className="btn-secondary bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-md text-sm flex items-center gap-2 shadow-sm transition-colors">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search actor, action, entity..." className="bg-white border border-slate-300 text-slate-900 text-sm rounded-md pl-9 pr-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
        </div>
        <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} className="bg-white border border-slate-300 text-slate-900 text-sm rounded-md px-3 py-2 w-44 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer">
          <option>All</option>
          <option>SCAN_COMPLETE</option>
          <option>PATCH_APPLY</option>
          <option>PATCH_SIMULATE</option>
          <option>SYNC_KEV</option>
          <option>SYNC_EPSS</option>
          <option>DEMO_RUN</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Time</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Action</th>
                <th className="p-4">Entity</th>
                <th className="p-4">Reason</th>
                <th className="p-4">Before</th>
                <th className="p-4">After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map(event => (
                <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-xs text-slate-600 whitespace-nowrap">{formatDateTime(event.time)}</td>
                  <td className="p-4 text-xs font-mono font-medium text-slate-800">{event.actor}</td>
                  <td className="p-4">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${ACTION_COLORS[event.action] ?? 'text-slate-700 bg-slate-100'}`}>
                      {event.action.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-medium text-slate-900">{event.entityName}</td>
                  <td className="p-4 text-sm text-slate-600">{event.reason}</td>
                  <td className="p-4 text-xs font-mono text-slate-500">{event.before ?? '—'}</td>
                  <td className="p-4 text-sm text-slate-800">{event.after}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No events found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
