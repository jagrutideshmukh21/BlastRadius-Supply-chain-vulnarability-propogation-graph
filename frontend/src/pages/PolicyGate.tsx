import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, ShieldCheck, AlertTriangle, FileCode, Download, Check, X,
  Terminal, ArrowRight, Play, Copy, RefreshCw, GitBranch, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { exportAsJSON, downloadFile } from '../data/mockData';

interface PolicyRule {
  id: string;
  name: string;
  description: string;
  status: 'PASSED' | 'FAILED' | 'WARNING';
  detail: string;
}

export default function PolicyGate() {
  const [profile, setProfile] = useState<'strict-production' | 'balanced-risk' | 'dev-environment'>('balanced-risk');
  const [projectState, setProjectState] = useState<'current' | 'patched'>('current');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'github' | 'gitlab' | 'cli'>('overview');

  // Pre-configured decision outcomes
  const isPatched = projectState === 'patched';
  const decision = isPatched ? 'PASS' : (profile === 'dev-environment' ? 'WARN' : 'FAIL');

  const rules: PolicyRule[] = [
    {
      id: 'BLASTRADIUS-RULE-KEV',
      name: 'CISA Known Exploited Vulnerability (KEV) Block',
      description: 'Zero tolerance for vulnerabilities actively weaponized in the wild (BOD 22-01).',
      status: isPatched ? 'PASSED' : (profile === 'dev-environment' ? 'WARNING' : 'FAILED'),
      detail: isPatched ? 'Zero KEV vulnerabilities present in project dependency tree.' : 'CVE-2021-44228 (Log4Shell) is actively weaponized on CISA KEV catalog.'
    },
    {
      id: 'BLASTRADIUS-RULE-TIER-P0',
      name: 'Risk Tier P0 Ceiling',
      description: 'Blocks release if composite Exploit-Aware risk score exceeds allowable limits (P0 threshold).',
      status: isPatched ? 'PASSED' : (profile === 'dev-environment' ? 'WARNING' : 'FAILED'),
      detail: isPatched ? 'Current project risk tier is P3 Clean (0.0 / 100).' : 'api-gateway has P0 Critical Risk Tier (Score: 97.2).'
    },
    {
      id: 'BLASTRADIUS-RULE-CVSS',
      name: 'CVSS Severity Ceiling',
      description: profile === 'strict-production' ? 'Max allowed CVSS is 7.0 for production releases.' : 'Max allowed CVSS is 8.5.',
      status: isPatched ? 'PASSED' : 'FAILED',
      detail: isPatched ? 'All components have CVSS 0.0.' : 'log4j-core has CVSS 10.0, spring-webmvc has CVSS 9.8.'
    },
    {
      id: 'BLASTRADIUS-RULE-TRUST',
      name: 'OpenSSF Scorecard Trust Floor',
      description: 'Requires upstream repositories to score >= 5.0 in repository security posture.',
      status: isPatched ? 'PASSED' : 'WARNING',
      detail: isPatched ? 'All repository dependencies meet OpenSSF trust floor.' : 'lodash repository has Scorecard rating 4.2 / 10 (Branch protection missing).'
    },
    {
      id: 'BLASTRADIUS-RULE-REACHABILITY',
      name: 'Evidence-Based Reachability Verification',
      description: 'Requires static evidence validation of call sites to vulnerable symbols.',
      status: isPatched ? 'PASSED' : (profile === 'strict-production' ? 'FAILED' : 'WARNING'),
      detail: isPatched ? 'No vulnerable symbols reachable in codebase.' : 'Vulnerable call site confirmed: GatewayFilter.java -> logger.error()'
    }
  ];

  const handleExportSARIF = () => {
    const sarifData = {
      "$schema": "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
      "version": "2.1.0",
      "runs": [
        {
          "tool": {
            "driver": {
              "name": "BlastRadius Policy Gate",
              "version": "1.0.0",
              "informationUri": "https://github.com/cisa/blastradius",
              "rules": rules.map(r => ({
                "id": r.id,
                "name": r.name,
                "shortDescription": { "text": r.description },
                "help": { "text": r.detail },
                "properties": { "tags": ["security", "supply-chain", "cisa-kev"] }
              }))
            }
          },
          "results": isPatched ? [] : rules.filter(r => r.status === 'FAILED').map(r => ({
            "ruleId": r.id,
            "level": "error",
            "message": { "text": r.detail },
            "locations": [
              {
                "physicalLocation": {
                  "artifactLocation": { "uri": "manifests/pom.xml" },
                  "region": { "startLine": 45, "startColumn": 5 }
                }
              }
            ]
          }))
        }
      ]
    };
    downloadFile(JSON.stringify(sarifData, null, 2), 'blastradius_policy_report.sarif', 'application/json');
    toast.success('Exported OASIS SARIF 2.1.0 report!');
  };

  const handleExportJSON = () => {
    exportAsJSON({
      decision,
      profile,
      project: "api-gateway",
      evaluated_at: new Date().toISOString(),
      violations_count: isPatched ? 0 : rules.filter(r => r.status === 'FAILED').length,
      rules
    }, 'blastradius_policy_decision.json');
    toast.success('Exported Policy Decision JSON!');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied CI/CD snippet to clipboard!');
  };

  const GITHUB_ACTIONS_SNIPPET = `name: BlastRadius Policy Gate
on: [push, pull_request]

jobs:
  supply-chain-gate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Run BlastRadius Gate
        run: |
          python -m blastradius.cli gate \\
            --project api-gateway \\
            --policy ${profile} \\
            --format sarif > blastradius-results.sarif

      - name: Upload SARIF to GitHub Security Tab
        uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: blastradius-results.sarif`;

  const GITLAB_CI_SNIPPET = `blastradius_security_gate:
  stage: test
  image: python:3.11-slim
  script:
    - pip install -r requirements.txt
    - python -m blastradius.cli gate --project api-gateway --policy ${profile} --format json
  artifacts:
    reports:
      sast: gl-sast-report.json
    when: always`;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900">CI/CD Security Policy Gate</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-100 text-blue-700 border border-blue-200">
              OASIS SARIF 2.1.0 Compliant
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Automated pre-deployment quality gate evaluating CISA KEV directives, Exploit-Aware risk tiers, and repository trust posture.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleExportSARIF} className="btn-primary text-xs flex items-center gap-1.5">
            <Download size={13} /> Export SARIF 2.1.0
          </button>
          <button onClick={handleExportJSON} className="btn-secondary text-xs flex items-center gap-1.5">
            <Download size={13} /> Export JSON
          </button>
        </div>
      </div>

      {/* Control Bar: Profiles & What-If Toggle */}
      <div className="card bg-white p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-slate-700 uppercase">Policy Profile:</span>
          {(['strict-production', 'balanced-risk', 'dev-environment'] as const).map(p => (
            <button
              key={p}
              onClick={() => setProfile(p)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                profile === p ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              )}
            >
              {p === 'strict-production' ? 'Strict Production' : p === 'balanced-risk' ? 'Balanced Enterprise' : 'Dev / Staging'}
            </button>
          ))}
        </div>

        {/* Toggle between Current Vulnerable State vs Patched Clean State */}
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-600 px-2">Simulate State:</span>
          <button
            onClick={() => setProjectState('current')}
            className={clsx(
              'px-3 py-1 rounded-lg text-xs font-bold transition-all',
              projectState === 'current' ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-slate-200'
            )}
          >
            Unpatched (Vulnerable)
          </button>
          <button
            onClick={() => setProjectState('patched')}
            className={clsx(
              'px-3 py-1 rounded-lg text-xs font-bold transition-all',
              projectState === 'patched' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-200'
            )}
          >
            Patched (0% Vuln)
          </button>
        </div>
      </div>

      {/* Decision Banner */}
      <div className={clsx(
        'rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 transition-all',
        decision === 'PASS' ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700' :
        decision === 'WARN' ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700' :
        'bg-gradient-to-r from-red-600 via-rose-600 to-red-700'
      )}>
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center font-mono shrink-0 shadow-inner">
            {decision === 'PASS' ? <ShieldCheck size={40} className="text-white" /> :
             decision === 'WARN' ? <AlertTriangle size={40} className="text-white" /> :
             <ShieldAlert size={40} className="text-white animate-pulse" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-black bg-white uppercase tracking-wider" style={{
                color: decision === 'PASS' ? '#065f46' : decision === 'WARN' ? '#92400e' : '#991b1b'
              }}>
                GATE STATUS: {decision}
              </span>
              <span className="text-xs font-mono text-white/80">Exit Code: {decision === 'PASS' || decision === 'WARN' ? '0' : '1'}</span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1">
              {decision === 'PASS' ? 'Release Approved — All Mandatory Policy Rules Satisfied' :
               decision === 'WARN' ? 'Release Allowed with Warnings — Non-Blocking Advisory Flags' :
               'Release Blocked — Critical Security Policy Violations Detected'}
            </h2>
            <p className="text-xs text-white/80 mt-1 max-w-xl">
              {decision === 'PASS' ? 'Project dependencies contain zero active CISA KEV directives and zero unverified P0 risks.' :
               'Pull request or deployment halted. Requires automated patch bump via Fix-Once planner before merge.'}
            </p>
          </div>
        </div>

        <div className="bg-black/20 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center shrink-0 min-w-[200px]">
          <div className="text-xs uppercase text-white/80 font-bold">Violations Count</div>
          <div className="text-3xl font-black text-white mt-0.5">
            {isPatched ? 0 : rules.filter(r => r.status === 'FAILED').length}
          </div>
          <div className="text-[11px] text-white/80 mt-0.5 font-mono">
            {rules.filter(r => r.status === 'PASSED').length} Rules Passed
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={clsx('pb-3 border-b-2 transition-all', activeTab === 'overview' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800')}
        >
          Rules Evaluation Checklist
        </button>
        <button
          onClick={() => setActiveTab('github')}
          className={clsx('pb-3 border-b-2 transition-all', activeTab === 'github' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800')}
        >
          GitHub Actions Workflow
        </button>
        <button
          onClick={() => setActiveTab('gitlab')}
          className={clsx('pb-3 border-b-2 transition-all', activeTab === 'gitlab' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800')}
        >
          GitLab CI Configuration
        </button>
        <button
          onClick={() => setActiveTab('cli')}
          className={clsx('pb-3 border-b-2 transition-all', activeTab === 'cli' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800')}
        >
          CLI Terminal Syntax & Exit Codes
        </button>
      </div>

      {/* Tab 1: Rules Checklist */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          {rules.map(rule => (
            <div key={rule.id} className="card bg-white p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className={clsx(
                  'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                  rule.status === 'PASSED' ? 'bg-emerald-100 text-emerald-700' :
                  rule.status === 'WARNING' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                )}>
                  {rule.status === 'PASSED' ? <Check size={18} /> :
                   rule.status === 'WARNING' ? <AlertTriangle size={18} /> :
                   <X size={18} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{rule.name}</span>
                    <span className="font-mono text-[10px] text-slate-400">({rule.id})</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{rule.description}</p>
                  <div className="text-xs text-slate-700 mt-1 font-mono bg-slate-50 px-2 py-1 rounded border border-slate-200 inline-block">
                    {rule.detail}
                  </div>
                </div>
              </div>

              <span className={clsx(
                'px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider shrink-0',
                rule.status === 'PASSED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                rule.status === 'WARNING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                'bg-red-50 text-red-700 border border-red-200'
              )}>
                {rule.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: GitHub Actions */}
      {activeTab === 'github' && (
        <div className="card bg-white p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">.github/workflows/blastradius-gate.yml</h3>
              <p className="text-xs text-slate-500">Injects automated gate check into pull requests and uploads findings to GitHub Security Tab.</p>
            </div>
            <button onClick={() => copyToClipboard(GITHUB_ACTIONS_SNIPPET)} className="btn-secondary text-xs">
              <Copy size={13} /> Copy YAML
            </button>
          </div>
          <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto">
            <pre>{GITHUB_ACTIONS_SNIPPET}</pre>
          </div>
        </div>
      )}

      {/* Tab 3: GitLab CI */}
      {activeTab === 'gitlab' && (
        <div className="card bg-white p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">.gitlab-ci.yml</h3>
              <p className="text-xs text-slate-500">Pipeline job enforcing BlastRadius exit code 0 before merge to production branch.</p>
            </div>
            <button onClick={() => copyToClipboard(GITLAB_CI_SNIPPET)} className="btn-secondary text-xs">
              <Copy size={13} /> Copy YAML
            </button>
          </div>
          <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto">
            <pre>{GITLAB_CI_SNIPPET}</pre>
          </div>
        </div>
      )}

      {/* Tab 4: CLI Syntax */}
      {activeTab === 'cli' && (
        <div className="card bg-white p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Direct CLI Command & Exit Code Specification</h3>
            <p className="text-xs text-slate-500 mt-0.5">Use in local terminal or shell scripts to evaluate gates without a web browser.</p>
          </div>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs space-y-2">
            <div className="text-slate-400"># Evaluate policy gate and export SARIF 2.1.0:</div>
            <div className="text-emerald-400">python -m blastradius.cli gate --project api-gateway --policy strict-production --format sarif</div>
            <div className="text-slate-400 pt-2"># Evaluate with JSON stdout:</div>
            <div className="text-emerald-400">python -m blastradius.cli gate --project api-gateway --policy balanced-risk --format json</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="font-bold text-emerald-800">Exit Code: 0 (PASS / WARN)</div>
              <div className="text-slate-600 mt-0.5">All mandatory blocking rules satisfied. CI/CD build continues.</div>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="font-bold text-red-800">Exit Code: 1 (FAIL)</div>
              <div className="text-slate-600 mt-0.5">Blocking rule violated (active KEV, CVSS ceiling, P0 score). Pipeline fails.</div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="font-bold text-blue-800">Exit Code: 2 (REVIEW)</div>
              <div className="text-slate-600 mt-0.5">Uncertainty or unverified reachability requires human sign-off.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
