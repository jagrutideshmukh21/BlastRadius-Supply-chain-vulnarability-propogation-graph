import React, { useState } from 'react';
import { PATCH_ACTIONS } from '../data/mockData';
import {
  Wrench, CheckCircle, Play, Copy, ShieldCheck,
  Download, RotateCcw, Check, ArrowRight, ShieldAlert, Sparkles, FileCode
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function Patch() {
  const [actions, setActions] = useState(PATCH_ACTIONS);
  const [selectedIds, setSelectedIds] = useState<string[]>(['patch-001', 'patch-002', 'patch-003', 'patch-004', 'patch-005']);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedResult, setSimulatedResult] = useState<{
    beforeRisk: number;
    afterRisk: number;
    reduction: number;
    clearedFindings: number;
    remainingVulns: number;
  } | null>(null);

  const [applyModalAction, setApplyModalAction] = useState<any | null>(null);
  const [applyReason, setApplyReason] = useState('Log4Shell, Spring4Shell & CISA KEV Complete Remediation');
  const [isApplying, setIsApplying] = useState(false);

  const appliedCount = actions.filter(a => a.state === 'applied').length;
  const isFullyPatched = appliedCount === actions.length;

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleAutoSelectAll = () => {
    setSelectedIds(actions.map(a => a.id));
    toast.success('Selected all 5 patch actions for 100% risk reduction!');
  };

  const handleSimulate = () => {
    setIsSimulating(true);
    const t = toast.loading('Simulating portfolio risk clearance graph...');
    setTimeout(() => {
      setIsSimulating(false);
      const isAllSelected = selectedIds.length === actions.length;
      const beforeRisk = 97.2;
      // If all selected, risk drops to 0.0 with 0 vulnerabilities!
      const afterRisk = isAllSelected ? 0.0 : Math.max(0.0, Math.round((beforeRisk - (selectedIds.length / actions.length) * 97.2) * 10) / 10);
      const reduction = isAllSelected ? 100 : Math.round(((beforeRisk - afterRisk) / beforeRisk) * 100);
      const remainingVulns = isAllSelected ? 0 : Math.max(0, 5 - selectedIds.length);

      setSimulatedResult({
        beforeRisk,
        afterRisk,
        reduction,
        clearedFindings: selectedIds.length * 4,
        remainingVulns
      });
      toast.success(isAllSelected ? 'Simulation: 100% Risk Eliminated (0 Vulnerabilities Remaining)!' : 'Simulation complete!', { id: t });
    }, 800);
  };

  const handleApplyAll = () => {
    setIsApplying(true);
    const t = toast.loading('Applying all patches to codebase manifests...');
    setTimeout(() => {
      setActions(prev => prev.map(a => ({ ...a, state: 'applied' })));
      setIsApplying(false);
      setSimulatedResult({
        beforeRisk: 97.2,
        afterRisk: 0.0,
        reduction: 100,
        clearedFindings: 23,
        remainingVulns: 0
      });
      toast.success('🎉 All patches applied! Risk Score is now 0.0 with 0 vulnerabilities!', { id: t });
    }, 900);
  };

  const handleConfirmApply = async () => {
    if (!applyModalAction) return;
    setIsApplying(true);
    setTimeout(() => {
      const updated = actions.map(a => (a.id === applyModalAction.id ? { ...a, state: 'applied' } : a));
      setActions(updated as any);
      setIsApplying(false);
      setApplyModalAction(null);
      
      const newAppliedCount = updated.filter(a => a.state === 'applied').length;
      if (newAppliedCount === updated.length) {
        setSimulatedResult({
          beforeRisk: 97.2,
          afterRisk: 0.0,
          reduction: 100,
          clearedFindings: 23,
          remainingVulns: 0
        });
      }
      toast.success(`Applied patch action ${applyModalAction.id} (${applyModalAction.package})!`);
    }, 600);
  };

  const handleUndoAll = () => {
    setActions(prev => prev.map(a => ({ ...a, state: 'proposed' })));
    setSimulatedResult(null);
    toast.success('Reset all patch states to proposed.');
  };

  const handleUndo = (id: string) => {
    setActions(prev => prev.map(a => (a.id === id ? { ...a, state: 'proposed' } : a)));
    toast.success(`Reset patch action ${id}.`);
  };

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    toast.success('Copied patch snippet to clipboard!');
  };

  const handleExportCSV = () => {
    const header = "ID,Package,From,To,Type,Wave,RiskCleared,State,ProjectsTouched\n";
    const csv = actions.map(a => 
      `${a.id},${a.package},${a.fromVersion},${a.toVersion},${a.type},${a.wave},${a.riskCleared},${a.state},"${a.projectsTouched.join(';')}"`
    ).join("\n");
    const blob = new Blob([header + csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'BlastRadius_Patch_Plan.csv';
    link.click();
    toast.success('Exported Patch Plan to CSV');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fix-Once Patch Planner & Simulator</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Calculates the minimal set of version upgrades to clear all critical vulnerabilities and drop portfolio risk to 0.0.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleAutoSelectAll} className="btn-secondary text-xs">
            <ShieldCheck size={14} className="text-blue-600" /> Select All (5)
          </button>
          <button onClick={handleSimulate} disabled={isSimulating} className="btn-secondary text-xs">
            <Play size={13} className={clsx(isSimulating && 'animate-spin text-blue-600')} />
            {isSimulating ? 'Simulating...' : 'Simulate What-If'}
          </button>
          <button onClick={handleApplyAll} disabled={isApplying} className="btn-primary text-xs shadow-md">
            <CheckCircle size={14} /> Apply All Patches (Zero Risk)
          </button>
          <button onClick={handleExportCSV} className="btn-secondary text-xs">
            <Download size={13} /> Export Plan
          </button>
          {appliedCount > 0 && (
            <button onClick={handleUndoAll} className="btn-secondary text-xs text-amber-700">
              <RotateCcw size={13} /> Reset All
            </button>
          )}
        </div>
      </div>

      {/* Zero Vulnerability Celebration Banner (When Fully Patched) */}
      {(isFullyPatched || (simulatedResult && simulatedResult.afterRisk === 0.0)) && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 fade-in-up">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center font-mono shrink-0 shadow-inner">
              <Sparkles size={32} className="text-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-white text-emerald-800 uppercase tracking-wider">
                  0 VULNERABILITIES REMAINING
                </span>
                <span className="text-xs font-mono text-emerald-100">CISA KEV Fully Remediated</span>
              </div>
              <h2 className="text-2xl font-black text-white mt-1">
                Portfolio Risk Score: 0.0 / 100 (100% Clean)
              </h2>
              <p className="text-xs text-emerald-100 mt-0.5">
                All 5 high-impact patch actions have been applied. Log4Shell, Spring4Shell, and Lodash vulnerabilities cleared across all services.
              </p>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center shrink-0 min-w-[200px]">
            <div className="text-xs uppercase text-emerald-200 font-bold">Risk Reduction</div>
            <div className="text-3xl font-black text-white mt-0.5">-100%</div>
            <div className="text-[11px] text-emerald-200 mt-0.5 font-mono">97.2 (P0) → 0.0 (Clean)</div>
          </div>
        </div>
      )}

      {/* Simulation Result Box (If not 0 yet) */}
      {simulatedResult && simulatedResult.afterRisk > 0 && (
        <div className="bg-white border border-blue-200 p-5 rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 fade-in-up">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600 border border-blue-200">
              <ShieldCheck size={26} />
            </div>
            <div>
              <div className="text-xs text-blue-700 font-bold uppercase tracking-wide">Simulation Results</div>
              <div className="text-xl font-bold text-slate-900 mt-0.5">
                Portfolio Risk: <span className="text-red-600 font-mono">{simulatedResult.beforeRisk}</span>
                <span className="text-slate-400 mx-2">→</span>
                <span className="text-emerald-600 font-mono font-black">{simulatedResult.afterRisk.toFixed(1)}</span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {simulatedResult.remainingVulns} vulnerabilities remaining · {simulatedResult.clearedFindings} instances cleared
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6 text-center">
            <div>
              <div className="text-xs text-slate-500 uppercase font-semibold">Risk Cleared</div>
              <div className="text-2xl font-black text-emerald-600">-{simulatedResult.reduction}%</div>
            </div>
            <button onClick={handleApplyAll} className="btn-primary text-xs">
              Apply All & Drop to 0.0 <ArrowRight size={13} />
            </button>
            <button onClick={() => setSimulatedResult(null)} className="text-xs text-slate-400 hover:text-slate-600">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Patch Actions List */}
      <div className="space-y-4">
        {actions.map((act) => {
          const isSelected = selectedIds.includes(act.id);
          const isApplied = act.state === 'applied';

          return (
            <div key={act.id} className={clsx(
              'bg-white p-5 rounded-xl border shadow-sm transition-all',
              isApplied ? 'border-emerald-300 bg-emerald-50/40' : (isSelected ? 'border-blue-300' : 'border-slate-200')
            )}>
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(act.id)}
                    className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 accent-blue-600"
                  />
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap text-base">
                      <span className="font-bold text-slate-900 font-mono">{act.package}</span>
                      <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                        v{act.fromVersion} <span className="text-slate-400">→</span> <strong className="text-emerald-700">v{act.toVersion}</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {act.type}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        Wave {act.wave}
                      </span>
                      {isApplied && (
                        <span className="px-2.5 py-0.5 rounded text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                          <Check size={12} /> Applied (0 Risk)
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-600 mt-2 flex flex-wrap gap-4">
                      <span>Services Secured: <strong className="text-slate-900 font-mono">{act.projectsTouched.join(', ')}</strong></span>
                      <span>Risk Cleared: <strong className="text-emerald-600 font-bold">-{act.riskCleared.toFixed(1)} pts</strong></span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => copyCommand(act.command)} className="btn-secondary text-xs px-2.5 py-1.5">
                    <Copy size={13} /> Copy Code
                  </button>
                  {isApplied ? (
                    <button onClick={() => handleUndo(act.id)} className="btn-secondary text-xs px-2.5 py-1.5 text-amber-700">
                      <RotateCcw size={13} /> Undo
                    </button>
                  ) : (
                    <button onClick={() => setApplyModalAction(act)} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                      <CheckCircle size={13} /> Apply Patch
                    </button>
                  )}
                </div>
              </div>

              {/* Code Snippet Box */}
              <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 overflow-x-auto">
                <pre>{act.command}</pre>
              </div>
            </div>
          );
        })}
      </div>

      {/* Apply Single Patch Modal */}
      {applyModalAction && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Apply Remediation Patch</h2>
            <p className="text-xs text-slate-500 mb-4">
              Action <strong>{applyModalAction.id}</strong> ({applyModalAction.package} v{applyModalAction.fromVersion} → v{applyModalAction.toVersion})
            </p>
            <div className="space-y-3 mb-4">
              <label className="text-xs font-medium text-slate-700 block">Audit Log Justification Reason:</label>
              <textarea
                value={applyReason}
                onChange={e => setApplyReason(e.target.value)}
                className="input text-xs h-20"
                placeholder="Remediation reason..."
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setApplyModalAction(null)} className="btn-secondary text-xs flex-1">
                Cancel
              </button>
              <button onClick={handleConfirmApply} disabled={isApplying} className="btn-primary text-xs flex-1">
                {isApplying ? 'Applying...' : 'Confirm & Apply'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
