import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  DASHBOARD_KPIs, SEVERITY_BREAKDOWN, ECOSYSTEM_BREAKDOWN,
  TOP_RISKY_PROJECTS, TOP_CHOKE_POINTS, DEPTH_HISTOGRAM, tierColor
} from '../data/mockData';
import {
  ShieldAlert, GitFork, RefreshCw, Download, ArrowRight, Activity, Play
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function Dashboard() {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [countdown, setCountdown] = useState({ days: 14, hours: 8, minutes: 22, seconds: 45 });

  // Live countdown ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { ...prev, days: Math.max(0, prev.days - 1), hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRescanAll = () => {
    setIsScanning(true);
    const t = toast.loading('Rescanning 12 projects across Maven, npm, and PyPI ecosystems...');
    setTimeout(() => {
      setIsScanning(false);
      toast.success('Portfolio scan complete! 23 vulnerable package instances verified.', { id: t });
    }, 1200);
  };

  const handleSyncFeeds = () => {
    setIsSyncing(true);
    const t = toast.loading('Querying OSV.dev, CISA KEV catalog, and FIRST EPSS API...');
    setTimeout(() => {
      setIsSyncing(false);
      toast.success('Threat intelligence feeds successfully synchronized with OSV.dev and CISA KEV.', { id: t });
    }, 1200);
  };

  const handleExportSummary = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "Metric,Value\n" +
      "Total Projects,12\n" +
      "Total Packages,2847\n" +
      "Vulnerable Packages,23\n" +
      "Affected Projects,9\n" +
      "Active KEV Findings,4\n" +
      "P0 Critical Findings,3\n" +
      "Generated,2024-01-15T11:30:00Z\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "BlastRadius_Executive_KPI_Summary.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloaded Executive KPI Summary CSV!');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* CISA KEV Alert Banner with Live Countdown */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-xl p-4 shadow-md text-slate-900 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-white/20 rounded-lg text-slate-900 animate-pulse">
            <ShieldAlert size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="badge-kev bg-white text-red-700">CISA KEV MANDATE</span>
              <span className="text-xs font-mono font-bold text-red-100">BOD 22-01 Active Directive</span>
            </div>
            <p className="text-xs text-red-100 mt-0.5">
              <strong className="text-slate-900 font-bold">4 active KEV vulnerabilities</strong> in production require remediation. Earliest deadline: <strong className="text-slate-900 underline">CVE-2021-44228 (Log4Shell)</strong>.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 font-mono text-center">
            <div className="bg-black/20 px-2.5 py-1 rounded-md border border-white/20">
              <div className="text-sm font-black text-slate-900">{countdown.days}d</div>
            </div>
            <span className="text-slate-900 font-bold">:</span>
            <div className="bg-black/20 px-2.5 py-1 rounded-md border border-white/20">
              <div className="text-sm font-black text-slate-900">{String(countdown.hours).padStart(2, '0')}h</div>
            </div>
            <span className="text-slate-900 font-bold">:</span>
            <div className="bg-black/20 px-2.5 py-1 rounded-md border border-white/20">
              <div className="text-sm font-black text-slate-900">{String(countdown.minutes).padStart(2, '0')}m</div>
            </div>
            <span className="text-slate-900 font-bold">:</span>
            <div className="bg-black/20 px-2.5 py-1 rounded-md border border-white/20">
              <div className="text-sm font-black text-slate-900">{String(countdown.seconds).padStart(2, '0')}s</div>
            </div>
          </div>
          <button
            data-testid="btn-dashboard-policy-gate"
            onClick={() => navigate('/policy')}
            className="px-3.5 py-2 bg-white text-red-700 font-bold rounded-lg text-xs hover:bg-red-50 transition-all shadow-sm flex items-center gap-1.5"
          >
            <ShieldAlert size={14} className="text-red-700" /> Policy Gate
          </button>
        </div>
      </div>

      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase font-mono tracking-wide flex items-center gap-2">
            <Activity className="text-blue-600" size={24} /> SOC Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time supply chain vulnerability propagation graph, exploitability ranking & Fix-Once orchestration.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            data-testid="btn-dashboard-rescan-all"
            onClick={handleRescanAll}
            disabled={isScanning}
            className="btn-secondary text-xs"
          >
            <RefreshCw size={13} className={clsx(isScanning && 'animate-spin text-blue-600')} />
            {isScanning ? 'Scanning Portfolio...' : 'Rescan All'}
          </button>
          <button
            data-testid="btn-dashboard-sync-feeds"
            onClick={handleSyncFeeds}
            disabled={isSyncing}
            className="btn-secondary text-xs"
          >
            <RefreshCw size={13} className={clsx(isSyncing && 'animate-spin text-blue-600')} />
            {isSyncing ? 'Syncing...' : 'Sync Threat Feeds'}
          </button>
          <button
            data-testid="btn-dashboard-export-summary"
            onClick={handleExportSummary}
            className="btn-primary text-xs"
          >
            <Download size={13} /> Export KPI Summary
          </button>
        </div>
      </div>

      {/* 7 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div onClick={() => navigate('/projects')} className="card p-3.5 cursor-pointer hover:border-blue-500 transition-all bg-white">
          <div className="text-xs text-slate-500 font-mono font-medium">Projects</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{DASHBOARD_KPIs.totalProjects}</div>
          <div className="text-[10px] text-blue-600 font-bold mt-0.5">12 Monitored</div>
        </div>
        <div onClick={() => navigate('/graph')} className="card p-3.5 cursor-pointer hover:border-blue-500 transition-all bg-white">
          <div className="text-xs text-slate-500 font-mono font-medium">Total Pkgs</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{DASHBOARD_KPIs.totalPackages}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Dependency Nodes</div>
        </div>
        <div onClick={() => navigate('/advisories')} className="card p-3.5 cursor-pointer hover:border-red-500 transition-all bg-white">
          <div className="text-xs text-red-600 font-mono font-bold">Vuln Pkgs</div>
          <div className="text-2xl font-black text-red-600 mt-1">{DASHBOARD_KPIs.vulnerablePackages}</div>
          <div className="text-[10px] text-red-600/80 mt-0.5">Identified via OSV</div>
        </div>
        <div onClick={() => navigate('/projects')} className="card p-3.5 cursor-pointer hover:border-orange-500 transition-all bg-white">
          <div className="text-xs text-orange-600 font-mono font-bold">Affected Projs</div>
          <div className="text-2xl font-black text-orange-600 mt-1">{DASHBOARD_KPIs.affectedProjects}</div>
          <div className="text-[10px] text-orange-600/80 mt-0.5">75% Portfolio Reach</div>
        </div>
        <div onClick={() => navigate('/risk')} className="card p-3.5 cursor-pointer hover:border-blue-500 transition-all bg-white">
          <div className="text-xs text-slate-500 font-mono font-medium">Direct / Trans</div>
          <div className="text-lg font-black text-slate-800 mt-1.5">{DASHBOARD_KPIs.directFindings} / {DASHBOARD_KPIs.transitiveFindings}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">75% Hidden Risk</div>
        </div>
        <div onClick={() => navigate('/advisories')} className="card p-3.5 cursor-pointer border-red-200 bg-red-50/50 hover:border-red-500 transition-all">
          <div className="text-xs text-red-700 font-mono font-bold">KEV Active</div>
          <div className="text-2xl font-black text-red-700 mt-1">{DASHBOARD_KPIs.kevFindings}</div>
          <div className="text-[10px] text-red-700 font-bold mt-0.5">Action Required</div>
        </div>
        <div onClick={() => navigate('/risk')} className="card p-3.5 cursor-pointer border-red-200 bg-red-50/50 hover:border-red-500 transition-all">
          <div className="text-xs text-red-700 font-mono font-bold">P0 Tier</div>
          <div className="text-2xl font-black text-red-700 mt-1">{DASHBOARD_KPIs.p0Count}</div>
          <div className="text-[10px] text-red-700 font-bold mt-0.5">Critical Priority</div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Severity Breakdown Donut Chart */}
        <div className="card bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-slate-800 uppercase">Severity Breakdown</span>
            <span className="text-xs text-slate-500 font-mono">22 Total</span>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={SEVERITY_BREAKDOWN} dataKey="value" nameKey="name" innerRadius={42} outerRadius={65} paddingAngle={4}>
                  {SEVERITY_BREAKDOWN.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', fontSize: '11px', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono mt-1">
            {SEVERITY_BREAKDOWN.map(s => (
              <div key={s.name} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.name}
                </span>
                <span className="font-bold text-slate-900">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ecosystem Breakdown Bar Chart */}
        <div className="card bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-slate-800 uppercase">Findings by Ecosystem</span>
            <span className="text-xs text-blue-600 font-mono">Multi-Language</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ECOSYSTEM_BREAKDOWN}>
                <XAxis dataKey="ecosystem" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', fontSize: '11px', borderRadius: '8px' }} />
                <Bar dataKey="findings" name="Findings" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transitive Depth Histogram */}
        <div className="card bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-slate-800 uppercase">Dependency Depth Histogram</span>
            <span className="text-xs text-orange-600 font-mono font-bold">Max Depth: 5</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEPTH_HISTOGRAM}>
                <XAxis dataKey="depth" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', fontSize: '11px', borderRadius: '8px' }} />
                <Bar dataKey="count" name="Findings" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 text-center font-mono">
            Direct (d=1): 30% | Transitive (d=2–5): 70%
          </p>
        </div>
      </div>

      {/* Top Risky Projects & Choke Points */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Risky Projects */}
        <div className="card bg-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-800 uppercase flex items-center gap-2">
              <ShieldAlert size={14} className="text-red-600" /> Top Risky Projects
            </span>
            <Link to="/risk" className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1">
              View All <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-2.5">
            {TOP_RISKY_PROJECTS.slice(0, 4).map((proj, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between hover:border-blue-400 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <Link to={`/projects`} className="text-xs font-bold text-slate-900 hover:text-blue-600">
                      {proj.name}
                    </Link>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Top Vulnerability: Log4Shell (CVE-2021-44228)</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-red-600">{proj.score.toFixed(1)}</div>
                  <span className={clsx('text-[10px] font-bold', tierColor(proj.tier as any))}>{proj.tier}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Choke Points */}
        <div className="card bg-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-800 uppercase flex items-center gap-2">
              <GitFork size={14} className="text-blue-600" /> Pre-Disclosure Choke Points
            </span>
            <Link to="/patch" className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1">
              Patch Planner <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-2.5">
            {TOP_CHOKE_POINTS.map(cp => (
              <div key={cp.package} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between hover:border-blue-400 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-700">{cp.package}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Centrality: <span className="text-slate-800 font-mono font-bold">{(cp.centrality * 100).toFixed(0)}%</span> · Downstream: <span className="text-orange-600 font-bold">{cp.dependents} services</span>
                  </div>
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-100 text-red-700 border border-red-200">
                    CRITICAL
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
