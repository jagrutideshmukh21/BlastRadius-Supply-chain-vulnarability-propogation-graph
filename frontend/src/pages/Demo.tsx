import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, CheckCircle, ArrowRight, RefreshCw, ExternalLink } from 'lucide-react';
import clsx from 'clsx';

const STEPS = [
  {
    id: 1, title: 'Load Sample Portfolio',
    description: 'Load 12 projects including api-gateway with log4j-core 2.14.1 (direct) and auth-service with log4j-core 2.14.1 (transitive via spring-security).',
    action: 'Loading sample portfolio...',
    result: '12 projects loaded across Maven, npm, and PyPI ecosystems. Manifest snapshots with lockfiles available for 8 projects.',
    api: 'POST /api/demo/log4shell',
    link: '/projects',
    linkLabel: 'View Projects',
  },
  {
    id: 2, title: 'Scan All Projects',
    description: 'Run vulnerability scan against OSV.dev, CISA KEV, and FIRST EPSS.',
    action: 'Scanning all projects...',
    result: '22 findings discovered. 4 KEV advisories active. Confidence: Confirmed (18), Probable (3), Unverified (1).',
    api: 'POST /api/projects/scan-all',
    link: '/risk',
    linkLabel: 'View Risk Ranking',
  },
  {
    id: 3, title: 'See Blast Radius',
    description: 'CVE-2021-44228 (Log4Shell) affects log4j-core 2.14.1. Watch it propagate across the dependency graph.',
    action: 'Computing blast radius...',
    result: '6 projects directly or transitively affected. Shortest path: auth-service → spring-security → log4j-core@2.14.1.',
    api: 'GET /api/impact/GHSA-jfh8-c2jp-hdph',
    link: '/impact/GHSA-jfh8-c2jp-hdph',
    linkLabel: 'Open Impact & Propagation',
  },
  {
    id: 4, title: 'Explain Risk Score',
    description: 'BlastRadius computes a composite score: E (Exploitability) + I (Impact) + X (Exposure).',
    action: 'Computing risk scores...',
    result: 'api-gateway: Risk 97.2 = 100*(0.40×0.98 + 0.25×1.0 + 0.35×0.98).',
    api: 'GET /api/risk?project=proj-001',
    link: '/risk',
    linkLabel: 'View Risk Ranking',
  },
  {
    id: 5, title: 'Plan the Fix',
    description: 'Fix-Once Planner finds the minimal upgrade set that clears all P0/P1 findings across all 9 affected projects.',
    action: 'Computing patch plan...',
    result: 'Wave 0 (KEV P0): Update reporting-lib → log4j-core 2.17.1. Minimum 5 actions clear all P0/P1.',
    api: 'GET /api/patch-plan',
    link: '/patch',
    linkLabel: 'Open Patch Planner',
  },
  {
    id: 6, title: 'Simulate Impact',
    description: 'Before applying any changes, simulate the before/after risk profile. No writes to the database.',
    action: 'Running simulation...',
    result: 'Before: 3 P0, 4 P1, risk total 97.2. After simulation: 0 P0, 1 P1, risk total 31.4 (-67.4%).',
    api: 'POST /api/patch/simulate',
    link: '/patch',
    linkLabel: 'View Simulation',
  },
  {
    id: 7, title: 'Apply Patch Action',
    description: 'Mark patch-002 (api-gateway log4j bump) as accepted and applied. Provide a justification reason.',
    action: 'Applying patch action...',
    result: 'Patch action patch-002 applied. Audit event recorded: actor=demo, action=PATCH_APPLY, reason="Log4Shell KEV remediation".',
    api: 'POST /api/patch/apply',
    link: '/audit',
    linkLabel: 'View Audit Log',
  },
  {
    id: 8, title: 'Rescan & Verify',
    description: 'Rescan api-gateway after the simulated patch. The fixed version (2.17.1) should not be flagged by any advisory.',
    action: 'Rescanning api-gateway...',
    result: 'log4j-core 2.17.1 is NOT affected by CVE-2021-44228 (fix confirmed). 0 P0 findings remain for api-gateway.',
    api: 'POST /api/projects/proj-001/scan',
    link: '/projects/proj-001',
    linkLabel: 'View Project Detail',
  },
  {
    id: 9, title: 'Export & Report',
    description: 'Generate a CycloneDX 1.5 SBOM with embedded VEX data and an executive summary report.',
    action: 'Generating reports...',
    result: 'CycloneDX 1.5 SBOM generated (schema validated). VEX export with 1 Not Affected justification.',
    api: 'GET /api/reports/sbom',
    link: '/reports',
    linkLabel: 'Open Reports',
  },
];

export default function Demo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState<number[]>([]);

  const activeStep = STEPS[currentStep];

  const runStep = () => {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      setCompleted(prev => [...new Set([...prev, currentStep])]);
    }, 1200);
  };

  const next = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(s => s + 1);
  };

  const back = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  };

  const reset = () => {
    setCurrentStep(0);
    setCompleted([]);
    setRunning(false);
  };

  const isCurrentDone = completed.includes(currentStep);

  return (
    <div className="p-6 max-w-5xl mx-auto fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Guided Demo: Log4Shell Story</h1>
          <p className="text-sm text-slate-600 mt-0.5">
            CVE-2021-44228 · CVSS 10.0 · EPSS 97.5% · CISA KEV
          </p>
        </div>
        <div className="flex gap-2">
          <button
            data-testid="btn-demo-reset"
            onClick={reset}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw size={14} />
            Reset Demo
          </button>
        </div>
      </div>

      {/* Simplified Stepper */}
      <div className="flex flex-wrap gap-2 mb-8">
        {STEPS.map((step, i) => {
          const isDone = completed.includes(i);
          const isActive = i === currentStep;
          return (
            <button
              key={step.id}
              onClick={() => setCurrentStep(i)}
              className={clsx(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors border',
                isActive && 'bg-blue-50 border-blue-200 text-blue-700',
                !isActive && isDone && 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100',
                !isActive && !isDone && 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              )}
            >
              {isDone ? <CheckCircle size={14} /> : <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-xs">{i + 1}</span>}
              <span>{step.title}</span>
            </button>
          );
        })}
      </div>

      {/* Step Card */}
      <div className="card mb-6 bg-white border border-slate-200 shadow-sm rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className={clsx(
            'w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-lg font-bold',
            isCurrentDone ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700',
          )}>
            {isCurrentDone ? '✓' : activeStep.id}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-900">{activeStep.title}</h2>
            <p className="text-sm text-slate-700 mt-1">{activeStep.description}</p>

            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-mono bg-slate-50 border border-slate-200 px-2 py-1 rounded text-blue-600">
                {activeStep.api}
              </span>
              <span className="text-xs text-slate-500">→ using snapshot data</span>
            </div>
          </div>
        </div>

        {/* Result Panel */}
        {isCurrentDone && (
          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={14} className="text-emerald-700" />
              <span className="text-xs font-semibold text-emerald-700">Result</span>
            </div>
            <p className="text-sm text-slate-800">{activeStep.result}</p>
            <Link to={activeStep.link} className="mt-3 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
              {activeStep.linkLabel} <ExternalLink size={12} />
            </Link>
          </div>
        )}

        {/* Running animation */}
        {running && (
          <div className="mt-4 p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-blue-700">{activeStep.action}</span>
            </div>
            <div className="mt-2 bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          data-testid="btn-demo-back"
          onClick={back}
          disabled={currentStep === 0}
          className="btn-secondary disabled:opacity-40"
        >
          ← Back
        </button>

        <div className="flex gap-3">
          {!isCurrentDone && !running && (
            <button
              data-testid="btn-demo-run-step"
              onClick={runStep}
              className="btn-primary flex items-center gap-2 bg-blue-600 text-slate-900 hover:bg-blue-700 px-4 py-2 rounded-lg"
            >
              <Play size={14} />
              {currentStep === 0 ? 'Start Demo' : 'Run Step'}
            </button>
          )}
          {isCurrentDone && (
            <Link
              to={activeStep.link}
              className="btn-secondary flex items-center gap-2"
            >
              <ExternalLink size={14} />
              Jump to Full Page
            </Link>
          )}
          {isCurrentDone && currentStep < STEPS.length - 1 && (
            <button
              data-testid="btn-demo-next"
              onClick={next}
              className="btn-primary flex items-center gap-2 bg-blue-600 text-slate-900 hover:bg-blue-700 px-4 py-2 rounded-lg"
            >
              Next <ArrowRight size={14} />
            </button>
          )}
          {isCurrentDone && currentStep === STEPS.length - 1 && (
            <Link to="/dashboard" className="btn-primary flex items-center gap-2 bg-blue-600 text-slate-900 hover:bg-blue-700 px-4 py-2 rounded-lg">
              <CheckCircle size={14} />
              Demo Complete!
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
