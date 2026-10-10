import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PROJECTS, FINDINGS, tierColor, confidenceBadge } from '../data/mockData';
import { Search, RefreshCw, Download, Trash2, Eye, Network, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

type SortKey = 'name' | 'findings' | 'worstTier' | 'lastScan' | 'directDeps' | 'transitiveDeps';
type SortDir = 'asc' | 'desc';

const TIER_ORDER = { P0: 0, P1: 1, P2: 2, P3: 3 };

export default function Projects() {
  const [search, setSearch] = useState('');
  const [ecosFilter, setEcosFilter] = useState<string>('All');
  const [tierFilter, setTierFilter] = useState<string>('All');
  const [sortKey, setSortKey] = useState<SortKey>('worstTier');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [selected, setSelected] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = PROJECTS
    .filter(p => {
      const q = search.toLowerCase();
      return (
        (p.name.includes(q) || p.owner.includes(q) || p.ecosystem.toLowerCase().includes(q)) &&
        (ecosFilter === 'All' || p.ecosystem === ecosFilter) &&
        (tierFilter === 'All' || p.worstTier === tierFilter)
      );
    })
    .sort((a, b) => {
      let av: any, bv: any;
      if (sortKey === 'worstTier') { av = TIER_ORDER[a.worstTier as keyof typeof TIER_ORDER]; bv = TIER_ORDER[b.worstTier as keyof typeof TIER_ORDER]; }
      else if (sortKey === 'name') { av = a.name; bv = b.name; }
      else if (sortKey === 'findings') { av = a.findings; bv = b.findings; }
      else if (sortKey === 'lastScan') { av = a.lastScan; bv = b.lastScan; }
      else if (sortKey === 'directDeps') { av = a.directDeps; bv = b.directDeps; }
      else { av = a.transitiveDeps; bv = b.transitiveDeps; }
      return sortDir === 'asc' ? (av < bv ? -1 : 1) : (av > bv ? -1 : 1);
    });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => (
    sortKey === k
      ? (sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)
      : <span className="opacity-0"><ChevronUp size={14} /></span>
  );

  const toggleSelect = (id: string) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const toggleAll = () =>
    setSelected(selected.length === filtered.length ? [] : filtered.map(p => p.id));

  const exportCSV = () => {
    const header = ['Project', 'Owner', 'Ecosystem', 'Direct Deps', 'Transitive Deps', 'Findings', 'Worst Tier', 'Confidence'];
    const rows = filtered.map(p => [
      p.name, p.owner, p.ecosystem, p.directDeps, p.transitiveDeps, p.findings, p.worstTier, p.confidence
    ]);
    const csvContent = [header, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "projects.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-sm text-slate-500 mt-1">{PROJECTS.length} projects across 3 ecosystems</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-secondary flex items-center gap-2">
            <Download size={16} /> Export CSV
          </button>
          <Link to="/ingest" className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Project
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="input pl-10 bg-white border-slate-300 w-full"
          />
        </div>
        <select
          value={ecosFilter}
          onChange={e => setEcosFilter(e.target.value)}
          className="input bg-white border-slate-300 w-36"
        >
          <option>All</option>
          <option>Maven</option>
          <option>npm</option>
          <option>PyPI</option>
        </select>
        <select
          value={tierFilter}
          onChange={e => setTierFilter(e.target.value)}
          className="input bg-white border-slate-300 w-32"
        >
          <option>All</option>
          <option>P0</option>
          <option>P1</option>
          <option>P2</option>
          <option>P3</option>
        </select>
        {selected.length > 0 && (
          <div className="flex items-center gap-3 ml-4">
            <span className="text-sm text-slate-600 font-medium">{selected.length} selected</span>
            <button className="btn-secondary text-sm">Rescan Selected</button>
            <button className="btn-secondary text-red-600 border-red-200 hover:bg-red-50 text-sm">Delete Selected</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr className="text-sm text-slate-600 font-semibold">
              <th className="p-4 w-12 text-center">
                <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0}
                  onChange={toggleAll} className="rounded border-slate-300" />
              </th>
              <th className="p-4 text-left cursor-pointer hover:text-slate-900" onClick={() => toggleSort('name')}>
                <span className="flex items-center gap-1">Project <SortIcon k="name" /></span>
              </th>
              <th className="p-4 text-left">Ecosystem</th>
              <th className="p-4 text-left cursor-pointer hover:text-slate-900" onClick={() => toggleSort('directDeps')}>
                <span className="flex items-center gap-1">Direct <SortIcon k="directDeps" /></span>
              </th>
              <th className="p-4 text-left cursor-pointer hover:text-slate-900" onClick={() => toggleSort('transitiveDeps')}>
                <span className="flex items-center gap-1">Transitive <SortIcon k="transitiveDeps" /></span>
              </th>
              <th className="p-4 text-left cursor-pointer hover:text-slate-900" onClick={() => toggleSort('findings')}>
                <span className="flex items-center gap-1">Findings <SortIcon k="findings" /></span>
              </th>
              <th className="p-4 text-left cursor-pointer hover:text-slate-900" onClick={() => toggleSort('worstTier')}>
                <span className="flex items-center gap-1">Worst Tier <SortIcon k="worstTier" /></span>
              </th>
              <th className="p-4 text-left">Confidence</th>
              <th className="p-4 text-left cursor-pointer hover:text-slate-900" onClick={() => toggleSort('lastScan')}>
                <span className="flex items-center gap-1">Last Scan <SortIcon k="lastScan" /></span>
              </th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(project => (
              <tr key={project.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-4 text-center">
                  <input type="checkbox" checked={selected.includes(project.id)}
                    onChange={() => toggleSelect(project.id)} className="rounded border-slate-300" />
                </td>
                <td className="p-4">
                  <Link to={`/projects/${project.id}`} className="text-blue-600 font-bold hover:underline">
                    {project.name}
                  </Link>
                  <div className="text-sm text-slate-500 mt-1">{project.owner}</div>
                  <div className="flex gap-2 mt-2">
                    {project.internetFacing && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-medium">internet</span>
                    )}
                    {project.isInternalLib && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-medium">lib</span>
                    )}
                  </div>
                </td>
                <td className="p-4 font-medium text-slate-700">
                  {project.ecosystem}
                </td>
                <td className="p-4 text-slate-600">{project.directDeps}</td>
                <td className="p-4 text-slate-600">{project.transitiveDeps}</td>
                <td className="p-4 font-bold">
                  {project.findings > 0 ? (
                    <span className="text-orange-600">{project.findings}</span>
                  ) : (
                    <span className="text-emerald-600">✓ 0</span>
                  )}
                </td>
                <td className="p-4">
                  <span className={clsx('font-bold', project.worstTier === 'P0' ? 'text-red-700' : 'text-orange-700')}>
                    {project.worstTier}
                  </span>
                </td>
                <td className="p-4">
                  <span className={clsx('text-xs px-2 py-1 rounded font-medium', 
                    project.confidence === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>
                    {project.confidence}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-500">
                  {new Date(project.lastScan).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/projects/${project.id}`}
                      title="Open"
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Eye size={16} />
                    </Link>
                    <button
                      title="Rescan"
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <RefreshCw size={16} />
                    </button>
                    <button
                      title="Delete"
                      onClick={() => setDeleteConfirm(project.id)}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirm Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-slate-900 font-bold text-lg mb-2">Delete Project?</h3>
            <p className="text-sm text-slate-600 mb-6">
              This will remove all findings and history for "{PROJECTS.find(p => p.id === deleteConfirm)?.name}". This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary text-red-600 border-red-200 hover:bg-red-50 flex-1">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
