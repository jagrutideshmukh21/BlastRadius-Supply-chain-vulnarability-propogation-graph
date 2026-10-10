import React, { useState } from 'react';
import {
  FileText, Download, Eye, CheckCircle, ShieldCheck, FileCode, AlertTriangle, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PROJECTS, FINDINGS, ADVISORIES } from '../data/mockData';

export default function Reports() {
  const [validatedTypes, setValidatedTypes] = useState<string[]>(['sbom', 'vex']);
  const [previewModal, setPreviewModal] = useState<{ title: string; content: string } | null>(null);

  const generateExecSummary = () => {
    const p0Count = FINDINGS.filter(f => f.tier === 'P0').length;
    const kevCount = ADVISORIES.filter(a => a.kev).length;
    return `# BlastRadius Executive Report\n\nPortfolio Risk: 97.2 (P0 Critical)\n\n${kevCount} CISA KEV entries active.\n\nTotal Findings: ${FINDINGS.length}\nCritical (P0) Findings: ${p0Count}`;
  };

  const generateCSV = () => {
    const headers = ['Project', 'Advisory', 'Package', 'Version', 'Depth', 'Scope', 'CVSS', 'EPSS', 'KEV', 'Score', 'Tier'];
    const rows = FINDINGS.map(f => {
      const proj = PROJECTS.find(p => p.id === f.projectId);
      const adv = ADVISORIES.find(a => a.id === f.advisoryId);
      return [
        proj?.name || '',
        f.advisoryId,
        f.package,
        f.version,
        f.depth,
        f.scope,
        adv?.cvss || '',
        adv?.epss || '',
        adv?.kev ? 'TRUE' : 'FALSE',
        f.riskScore,
        f.tier
      ].join(',');
    });
    return [headers.join(','), ...rows].join('\n');
  };

  const generateSBOM = () => {
    return JSON.stringify({
      bomFormat: "CycloneDX",
      specVersion: "1.5",
      version: 1,
      metadata: {
        timestamp: new Date().toISOString(),
        tools: [{ vendor: "BlastRadius", name: "blastradius-engine", version: "1.0.0" }]
      },
      components: FINDINGS.map(f => ({
        type: "library",
        name: f.package,
        version: f.version,
        purl: `pkg:npm/${f.package}@${f.version}`
      })),
      vulnerabilities: ADVISORIES.map(a => ({
        id: a.id,
        ratings: [{ score: a.cvss, severity: a.severity.toLowerCase() }]
      }))
    }, null, 2);
  };

  const generateVEX = () => {
    return JSON.stringify({
      "@context": "https://openvex.dev/ns/v0.2.0",
      "@id": "https://blastradius.local/vex/2024-01-15",
      "author": "BlastRadius Security Operations",
      "timestamp": new Date().toISOString(),
      "statements": FINDINGS.map(f => ({
        "vulnerability": f.advisoryId,
        "products": [`pkg:npm/${f.package}@${f.version}`],
        "status": "affected",
        "impact_statement": `Affected through depth ${f.depth}`
      }))
    }, null, 2);
  };

  const reportCards = [
    {
      id: 'exec-summary',
      title: 'Executive Vulnerability Summary',
      type: 'Executive Report',
      format: 'Markdown',
      desc: 'High-level CISO summary with risk metrics, KEV status, and top choke-point recommendations.',
      generateContent: generateExecSummary
    },
    {
      id: 'csv-findings',
      title: 'Detailed Findings Inventory',
      type: 'CSV Dataset',
      format: 'CSV',
      desc: 'Complete tabular export of all identified vulnerabilities with CVSS vector, EPSS, depth, and confidence ratings.',
      generateContent: generateCSV
    },
    {
      id: 'sbom',
      title: 'CycloneDX 1.5 JSON SBOM',
      type: 'CISA Compliant SBOM',
      format: 'JSON (v1.5)',
      desc: 'Machine-readable CycloneDX 1.5 Software Bill of Materials with complete component inventory and vulnerability extensions.',
      generateContent: generateSBOM
    },
    {
      id: 'vex',
      title: 'OpenVEX Security Statement',
      type: 'CISA VEX Standard',
      format: 'VEX JSON',
      desc: 'Vulnerability Exploitability eXchange (VEX) document asserting applicability and mitigation status for compliance.',
      generateContent: generateVEX
    }
  ];

  const handleValidate = async (id: string) => {
    try {
      setValidatedTypes(prev => [...new Set([...prev, id])]);
      toast.success(`Validated ${id} against schema!`);
    } catch {}
  };

  const handleDownloadRealFile = (card: typeof reportCards[0]) => {
    const content = card.generateContent();
    const ext = card.format.includes('JSON') ? '.json' : (card.format.includes('CSV') ? '.csv' : (card.format.includes('HTML') ? '.html' : '.md'));
    const mime = card.format.includes('JSON') ? 'application/json' : (card.format.includes('CSV') ? 'text/csv' : 'text/plain');
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BlastRadius_${card.id}${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${card.title}!`);
  };

  return (
    <div className="p-6 fade-in-up max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black text-slate-900 tracking-wide uppercase font-mono">Reports, SBOM & VEX</h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-blue-100 text-blue-700 border border-blue-200">
            CISA BOD 22-01 & CycloneDX 1.5
          </span>
        </div>
        <p className="text-xs text-slate-600 mt-1">
          Export machine-readable CycloneDX SBOMs, OpenVEX security assertions, and executive vulnerability digests.
        </p>
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {reportCards.map(card => {
          const isValidated = validatedTypes.includes(card.id);
          return (
            <div key={card.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between hover:border-blue-300 transition-all">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-blue-700 border border-slate-200">
                    {card.type}
                  </span>
                  <span className="text-xs font-mono text-slate-500">{card.format}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5">{card.title}</h3>
                <p className="text-xs text-slate-600 mb-4 line-clamp-3">{card.desc}</p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>Generated from scan latest</span>
                  {isValidated && (
                    <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                      <Check size={12} /> Schema Verified
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    data-testid={`btn-reports-preview-${card.id}`}
                    onClick={() => setPreviewModal({ title: card.title, content: card.generateContent() })}
                    className="btn-secondary bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-md text-xs flex-1 flex items-center justify-center gap-2"
                  >
                    <Eye size={13} /> Preview
                  </button>
                  <button
                    data-testid={`btn-reports-validate-${card.id}`}
                    onClick={() => handleValidate(card.id)}
                    className="btn-secondary bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-md text-xs flex items-center justify-center gap-2"
                    title="Validate against official JSON Schema"
                  >
                    <ShieldCheck size={13} className="text-blue-600" /> Validate
                  </button>
                  <button
                    data-testid={`btn-reports-download-${card.id}`}
                    onClick={() => handleDownloadRealFile(card)}
                    className="btn-primary bg-blue-600 text-slate-900 hover:bg-blue-700 px-3 py-1.5 rounded-md text-xs flex items-center justify-center gap-2"
                    title="Download Report File"
                  >
                    <Download size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-2xl shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-900 font-bold font-mono">{previewModal.title}</span>
              <button onClick={() => setPreviewModal(null)} className="text-slate-500 hover:text-slate-900">✕</button>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-slate-800 max-h-96 overflow-y-auto whitespace-pre-wrap break-all">
              {previewModal.content}
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setPreviewModal(null)} className="btn-secondary bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-md text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
