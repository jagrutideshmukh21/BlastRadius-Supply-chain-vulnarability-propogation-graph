import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Play, Upload, FolderOpen, Network, ShieldAlert, ShieldCheck,
  Zap, Wrench, Clock, FileText, Bell, BookOpen, Settings, ChevronLeft,
  ChevronRight, Search, Wifi, WifiOff, AlertTriangle, Command, X,
  Radio
} from 'lucide-react';
import { NOTIFICATIONS } from '../data/mockData';
import clsx from 'clsx';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/ingest', label: 'Ingest', icon: Upload },
  { path: '/projects', label: 'Projects', icon: FolderOpen },
  { path: '/graph', label: 'Graph Explorer', icon: Network },
  { path: '/trust', label: 'Trust Center', icon: ShieldCheck },
  { path: '/policy', label: 'CI/CD Policy Gate', icon: ShieldAlert },
  { path: '/advisories', label: 'Advisories', icon: AlertTriangle },
  { path: '/risk', label: 'Risk Ranking', icon: Zap },
  { path: '/patch', label: 'Patch Planner', icon: Wrench },
  { path: '/impact/GHSA-jfh8-c2jp-hdph', label: 'Impact & Reachability', icon: Radio },
  { path: '/timemachine', label: 'Time Machine', icon: Clock },
  { path: '/reports', label: 'Reports & SBOM', icon: FileText },
  { path: '/alerts', label: 'Alerts', icon: Bell },
  { path: '/audit', label: 'Audit Log', icon: BookOpen },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const SEARCH_ITEMS = [
  { label: 'api-gateway', path: '/projects/proj-001', type: 'Project' },
  { label: 'auth-service', path: '/projects/proj-002', type: 'Project' },
  { label: 'CVE-2021-44228 (Log4Shell)', path: '/advisories/GHSA-jfh8-c2jp-hdph', type: 'Advisory' },
  { label: 'CVE-2022-22965 (Spring4Shell)', path: '/advisories/GHSA-36p3-wjmg-h94x', type: 'Advisory' },
  { label: 'log4j-core@2.14.1', path: '/graph?package=log4j-core@2.14.1', type: 'Package' },
  { label: 'lodash@4.17.15', path: '/graph?package=lodash@4.17.15', type: 'Package' },
  { label: 'Dashboard', path: '/dashboard', type: 'Page' },
  { label: 'Risk Ranking', path: '/risk', type: 'Page' },
  { label: 'Patch Planner', path: '/patch', type: 'Page' },
];

interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLInputElement>(null);

  const unread = NOTIFICATIONS.filter(n => !n.read).length;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const filteredSearch = SEARCH_ITEMS.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentPage = NAV_ITEMS.find(n => location.pathname.startsWith(n.path));

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar */}
      <div className={clsx(
        'flex flex-col bg-white border-r border-slate-200 transition-all duration-300 shrink-0 rounded-none shadow-none z-20',
        collapsed ? 'w-16' : 'w-56'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20 blast-pulse">
            <Radio size={18} className="text-slate-900" />
          </div>
          {!collapsed && (
            <div>
              <div className="text-sm font-black text-slate-900 leading-tight tracking-wide font-mono">BlastRadius</div>
              <div className="text-xs text-blue-600 font-semibold leading-tight">CISA CSB-03 Graph</div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const active = location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                title={collapsed ? label : undefined}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium',
                  active
                    ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                )}
              >
                <Icon size={16} className={clsx('shrink-0', active ? 'text-blue-600' : 'text-slate-500')} />
                {!collapsed && <span className="truncate">{label}</span>}
                {!collapsed && path === '/alerts' && unread > 0 && (
                  <span className="ml-auto bg-red-600 text-slate-900 text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                    {unread}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center gap-4 px-6 shrink-0 shadow-xs z-10">
          {/* Breadcrumb */}
          <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <span className="text-slate-400 font-normal">BlastRadius /</span>
            <span>{currentPage?.label || 'Dashboard'}</span>
          </div>

          {/* Search */}
          <button
            onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 50); }}
            className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-1.5 text-sm text-slate-500 hover:border-blue-500 hover:bg-white transition-all ml-4 flex-1 max-w-md shadow-xs"
          >
            <Search size={14} className="text-slate-400" />
            <span>Search projects, packages, advisories...</span>
            <span className="ml-auto text-xs bg-slate-200/80 px-1.5 py-0.5 rounded text-slate-600 font-mono flex items-center gap-0.5">
              <Command size={10} />K
            </span>
          </button>

          <div className="ml-auto flex items-center gap-3">
            {/* Data freshness chip */}
            <div className="flex items-center gap-1.5 text-xs bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 rounded-full font-medium shadow-2xs">
              <WifiOff size={11} className="text-amber-600" />
              <span>Snapshot Mode</span>
            </div>

            {/* KEV countdown */}
            <div className="flex items-center gap-1.5 text-xs bg-red-50 border border-red-200 text-red-700 px-2.5 py-1 rounded-full font-bold shadow-2xs">
              <AlertTriangle size={11} className="text-red-600" />
              <span>4 KEV Active</span>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
              >
                <Bell size={18} />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full" />
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-10 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
                    <span className="text-sm font-bold text-slate-900">Notifications</span>
                    <span className="text-xs font-semibold text-blue-600">{unread} unread</span>
                  </div>
                  {NOTIFICATIONS.map(n => (
                    <div key={n.id} className={clsx('p-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors', !n.read && 'bg-blue-50/50')}>
                      <div className="flex items-start gap-2">
                        {!n.read && <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />}
                        <div>
                          <div className="text-xs font-bold text-slate-800">{n.title}</div>
                          <div className="text-xs text-slate-600 mt-0.5">{n.message}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="p-3 bg-slate-50 text-center">
                    <Link to="/alerts" onClick={() => setNotifOpen(false)} className="text-xs font-bold text-blue-600 hover:underline">
                      View all notifications →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Policy Gate Button */}
            <Link
              to="/policy"
              data-testid="btn-topbar-policy-gate"
              className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm active:scale-95"
            >
              <ShieldAlert size={13} />
              Policy Gate
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {children}
        </main>
      </div>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-start justify-center pt-24" onClick={() => setSearchOpen(false)}>
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 p-4 border-b border-slate-100 bg-slate-50">
              <Search size={16} className="text-slate-400" />
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search projects, packages, advisories, CVEs..."
                className="flex-1 bg-transparent text-slate-900 placeholder-slate-400 outline-none text-sm font-medium"
              />
              <button onClick={() => setSearchOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {filteredSearch.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">No results found</div>
              ) : (
                filteredSearch.map(item => (
                  <div
                    key={item.path}
                    onClick={() => { navigate(item.path); setSearchOpen(false); setSearchQuery(''); }}
                    className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors"
                  >
                    <span className={clsx(
                      'text-xs px-2 py-0.5 rounded font-semibold',
                      item.type === 'Advisory' && 'bg-red-100 text-red-700 border border-red-200',
                      item.type === 'Project' && 'bg-blue-100 text-blue-700 border border-blue-200',
                      item.type === 'Package' && 'bg-amber-100 text-amber-700 border border-amber-200',
                      item.type === 'Page' && 'bg-slate-100 text-slate-700 border border-slate-200',
                    )}>
                      {item.type}
                    </span>
                    <span className="text-sm font-medium text-slate-800">{item.label}</span>
                  </div>
                ))
              )}
            </div>
            <div className="p-3 border-t border-slate-100 bg-slate-50 flex gap-4 text-xs text-slate-500 font-mono">
              <span>↑↓ navigate</span>
              <span>↵ select</span>
              <span>Esc close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
