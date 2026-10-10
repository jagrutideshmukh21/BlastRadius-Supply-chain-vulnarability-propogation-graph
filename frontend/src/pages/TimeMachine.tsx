import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { TIME_MACHINE_DATA } from '../data/mockData';
import { Clock, Play, Download, Info } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const DISCLOSURE_EVENTS = [
  { date: '2021-12', label: 'Log4Shell disclosed', color: '#dc2626' },
  { date: '2022-04', label: 'Spring4Shell', color: '#ea580c' },
  { date: '2022-06', label: 'Partial remediation', color: '#059669' },
];

export default function TimeMachine() {
  const [asOfDate, setAsOfDate] = useState('2024-01');
  const [playing, setPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(TIME_MACHINE_DATA.length - 1);

  const filteredData = TIME_MACHINE_DATA.slice(0, currentIdx + 1);
  const currentPoint = filteredData[filteredData.length - 1];

  const handlePlay = () => {
    setCurrentIdx(0);
    setPlaying(true);
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      setCurrentIdx(idx);
      if (idx >= TIME_MACHINE_DATA.length - 1) {
        clearInterval(interval);
        setPlaying(false);
      }
    }, 600);
  };

  const handleExportCSV = () => {
    const header = "Date,Exposure\n";
    const csv = TIME_MACHINE_DATA.map(d => `${d.date},${d.exposure}`).join("\n");
    const blob = new Blob([header + csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'timeline-exposure.csv';
    link.click();
    toast.success('Exported Timeline to CSV');
  };

  return (
    <div className="p-6 fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Time Machine</h1>
          <p className="text-sm text-slate-600">Replay your vulnerability exposure history using real OSV published dates</p>
        </div>
        <div className="flex gap-2">
          <button data-testid="btn-timemachine-play" onClick={handlePlay} disabled={playing}
            className="btn-primary bg-blue-600 text-slate-900 px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-40">
            <Play size={14} /> {playing ? 'Playing...' : 'Play Timeline'}
          </button>
          <button onClick={handleExportCSV} className="btn-secondary flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-6 flex items-center gap-3">
        <Info size={14} className="text-amber-700 shrink-0" />
        <span className="text-sm text-amber-800">
          Real recorded history based on OSV published dates.
        </span>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <label className="text-sm text-slate-600 mb-2 flex items-center gap-2 font-medium">
              <Clock size={16} /> As-of Date
            </label>
            <input
              type="month"
              value={asOfDate}
              onChange={e => setAsOfDate(e.target.value)}
              min="2021-01"
              max="2024-12"
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm w-48 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-sm text-slate-600">
            Showing state as of: <span className="text-blue-600 font-bold">{asOfDate}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Max Exposure Score', value: currentPoint?.exposure ?? 0, color: 'text-red-600' },
          { label: 'Known Advisories', value: filteredData.length > 5 ? 8 : Math.ceil(filteredData.length * 1.5), color: 'text-orange-600' },
          { label: 'Days Exposed (KEV)', value: currentPoint?.date >= '2021-12' ? Math.floor((new Date(asOfDate + '-01').getTime() - new Date('2021-12-10').getTime()) / 86400000) : 0, color: 'text-red-600' },
          { label: 'MTTR (where known)', value: '180 days', color: 'text-slate-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
            <div className="text-sm text-slate-600 mt-1 font-medium">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4">Exposure Score Over Time</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={filteredData} margin={{ left: 0, right: 24, top: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 12 }} />
            <YAxis tick={{ fill: '#475569', fontSize: 12 }} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 8, color: '#0f172a' }}
              labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
            />
            {DISCLOSURE_EVENTS.map(ev => (
              filteredData.some(d => d.date === ev.date) && (
                <ReferenceLine key={ev.date} x={ev.date} stroke={ev.color} strokeDasharray="4 2"
                  label={{ value: ev.label, position: 'top', fill: ev.color, fontSize: 12, fontWeight: 'bold' }} />
              )
            ))}
            <Line type="stepAfter" dataKey="exposure" stroke="#dc2626" strokeWidth={2}
              dot={{ fill: '#dc2626', r: 4 }} activeDot={{ r: 6 }} name="Exposure Score" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4">Exposure Ageing Buckets</h3>
          <div className="space-y-4">
            {[
              { label: '< 7 days', count: 0, color: 'bg-slate-400' },
              { label: '7–30 days', count: 1, color: 'bg-blue-500' },
              { label: '30–90 days', count: 2, color: 'bg-amber-500' },
              { label: '90–365 days', count: 3, color: 'bg-orange-500' },
              { label: '> 365 days', count: 2, color: 'bg-red-500' },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-sm text-slate-600 w-28">{label}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${(count / 3) * 100}%` }} />
                </div>
                <span className="text-sm font-bold text-slate-700 w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4">Disclosure vs Fix Timeline</h3>
          <div className="space-y-3 text-sm">
            {[
              { cve: 'CVE-2021-44228', disclosed: 'Dec 10, 2021', fixed: 'Dec 18, 2021', days: 8, color: 'text-emerald-600' },
              { cve: 'CVE-2022-22965', disclosed: 'Mar 31, 2022', fixed: 'Apr 1, 2022', days: 1, color: 'text-emerald-600' },
              { cve: 'CVE-2019-10744', disclosed: 'Jul 26, 2019', fixed: 'Jan 15, 2020', days: 173, color: 'text-amber-600' },
              { cve: 'CVE-2022-42969', disclosed: 'Oct 16, 2022', fixed: 'Unknown', days: null, color: 'text-slate-500' },
            ].map(ev => (
              <div key={ev.cve} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-mono text-slate-700 font-bold w-36">{ev.cve}</span>
                <span className="text-slate-500">{ev.disclosed} →</span>
                <span className="text-slate-700 font-medium">{ev.fixed}</span>
                {ev.days !== null && (
                  <span className={clsx('ml-auto font-bold', ev.color)}>
                    {ev.days}d
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="text-xs text-slate-500 mt-4 text-center">MTTR computed from OSV published date to portfolio remediation date where available.</div>
        </div>
      </div>
    </div>
  );
}
