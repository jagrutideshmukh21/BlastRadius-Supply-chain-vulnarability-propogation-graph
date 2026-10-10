import React, { useState } from 'react';
import { NOTIFICATIONS, ADVISORIES } from '../data/mockData';
import { Bell, Check, CheckCircle, Plus, RefreshCw, Trash2, AlertTriangle, Download } from 'lucide-react';
import clsx from 'clsx';

export default function Alerts() {
  const [notifs, setNotifs] = useState(NOTIFICATIONS);
  const [watchlist, setWatchlist] = useState(['CVE-2021-44228', 'log4j-core', 'spring-webmvc']);
  const [addItem, setAddItem] = useState('');

  const markRead = (id: string) =>
    setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x));

  const markAllRead = () => setNotifs(n => n.map(x => ({ ...x, read: true })));

  const removeWatchlist = (item: string) => setWatchlist(w => w.filter(x => x !== item));

  const addWatchlist = () => {
    if (addItem.trim()) {
      setWatchlist(w => [...w, addItem.trim()]);
      setAddItem('');
    }
  };

  const exportAlerts = () => {
    const headers = ['Type', 'Severity', 'Title', 'Message', 'Time', 'Read'];
    const rows = notifs.map(n => [
      n.type,
      n.severity,
      `"${n.title.replace(/"/g, '""')}"`,
      `"${n.message.replace(/"/g, '""')}"`,
      n.time,
      n.read ? 'Yes' : 'No'
    ].join(','));
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'alerts_export.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Alerts & Watchlist</h1>
          <p className="text-sm text-slate-600">{notifs.filter(n => !n.read).length} unread notifications</p>
        </div>
        <div className="flex gap-2">
          <button data-testid="btn-alerts-export" onClick={exportAlerts} className="btn-secondary bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-md text-xs flex items-center gap-2">
            <Download size={14} /> Export Alerts
          </button>
          <button data-testid="btn-alerts-mark-all-read" onClick={markAllRead} className="btn-secondary bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-md text-xs flex items-center gap-2">
            <CheckCircle size={14} /> Mark All Read
          </button>
          <button data-testid="btn-alerts-check-now" className="btn-secondary bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-md text-xs flex items-center gap-2">
            <RefreshCw size={14} /> Check Now
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications Feed */}
        <div className="col-span-1 lg:col-span-2 space-y-3">
          <h2 className="text-sm font-semibold text-slate-800">Notification Feed</h2>
          {notifs.map(n => (
            <div key={n.id} className={clsx(
              'bg-white rounded-xl p-4 border transition-colors shadow-sm',
              !n.read ? 'border-blue-300 bg-blue-50/30' : 'border-slate-200 opacity-70',
            )}>
              <div className="flex items-start gap-3">
                <div className={clsx('w-2 h-2 rounded-full mt-2 shrink-0',
                  !n.read ? 'bg-blue-600' : 'bg-slate-400'
                )} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={clsx(
                      'text-xs px-2 py-0.5 rounded-md font-medium',
                      n.type === 'NEW_KEV' && 'bg-red-100 text-red-700',
                      n.type === 'NEW_ADVISORY' && 'bg-orange-100 text-orange-700',
                      n.type === 'SCAN_DONE' && 'bg-blue-100 text-blue-700',
                    )}>
                      {n.type === 'NEW_KEV' ? 'CISA KEV Update' : n.type === 'NEW_ADVISORY' ? 'Advisory Update' : n.type === 'SCAN_DONE' ? 'Scan Complete' : n.type}
                    </span>
                    <span className={clsx('text-xs px-2 py-0.5 rounded-md font-semibold border',
                      n.severity === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-200' :
                      n.severity === 'HIGH' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      'bg-slate-50 text-slate-700 border-slate-200'
                    )}>{n.severity}</span>
                  </div>
                  <div className="text-sm font-medium text-slate-900 mt-2">{n.title}</div>
                  <div className="text-xs text-slate-600 mt-1">{n.message}</div>
                  <div className="text-xs text-slate-500 mt-2">
                    {new Date(n.time).toLocaleString()}
                  </div>
                </div>
                {!n.read && (
                  <button
                    data-testid={`btn-alerts-mark-read-${n.id}`}
                    onClick={() => markRead(n.id)}
                    className="p-1.5 shrink-0 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                    title="Mark as read"
                  >
                    <Check size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Watchlist */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Watchlist</h2>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <input
                value={addItem}
                onChange={e => setAddItem(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addWatchlist()}
                placeholder="CVE ID, package name..."
                className="bg-white border border-slate-300 text-slate-900 text-sm rounded-md px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                data-testid="btn-alerts-add-watchlist"
                onClick={addWatchlist}
                className="bg-blue-600 text-slate-900 hover:bg-blue-700 rounded-md px-3 py-2 flex items-center justify-center transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="space-y-2">
              {watchlist.map(item => (
                <div key={item} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Bell size={14} className="text-blue-500" />
                    <span className="text-sm font-mono text-slate-700">{item}</span>
                  </div>
                  <button
                    data-testid={`btn-alerts-remove-watch-${item}`}
                    onClick={() => removeWatchlist(item)}
                    className="text-slate-400 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            {watchlist.length === 0 && (
              <div className="text-center text-sm text-slate-500 py-4">No items watched</div>
            )}
          </div>

          {/* Alert when KEV additions */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-red-700 mb-2">
              <AlertTriangle size={16} /> KEV Alert Active
            </div>
            <div className="text-sm text-red-600 mb-3">
              2 packages in your watchlist match active CISA KEV entries:
            </div>
            <div className="space-y-1.5 font-mono text-sm text-red-700 bg-white p-3 rounded-md border border-red-100">
              <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> CVE-2021-44228 (log4j-core)</div>
              <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> CVE-2022-22965 (spring-webmvc)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
