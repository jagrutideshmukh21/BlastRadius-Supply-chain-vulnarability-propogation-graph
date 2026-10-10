import React, { useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search, ZoomIn, ZoomOut, Maximize2, Download, Network, GitBranch, X, AlertTriangle, ChevronRight
} from 'lucide-react';
import { ADVISORIES, downloadFile, exportAsJSON } from '../data/mockData';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const NODES = [
  { id: 'api-gateway', label: 'api-gateway', type: 'project-vuln', tier: 'P0', x: 380, y: 60, desc: 'Maven · 3 findings · P0' },
  { id: 'auth-service', label: 'auth-service', type: 'project-vuln', tier: 'P0', x: 80, y: 60, desc: 'Maven · 2 findings · P0' },
  { id: 'reporting-lib', label: 'reporting-lib', type: 'project-vuln', tier: 'P0', x: 680, y: 60, desc: 'Maven · 4 findings · P0 · internal lib' },
  { id: 'batch-processor', label: 'batch-processor', type: 'project-mid', tier: 'P1', x: 680, y: 350, desc: 'Maven · 3 findings · P1' },
  { id: 'log4j', label: 'log4j-core\n2.14.1', type: 'pkg-vuln', tier: 'P0', x: 380, y: 240, desc: 'CVE-2021-44228 · CVSS 10.0 · KEV' },
  { id: 'spring-security', label: 'spring-security\n5.6.1', type: 'pkg-safe', x: 80, y: 180, desc: 'No known vulnerabilities' },
  { id: 'spring-webmvc', label: 'spring-webmvc\n5.3.15', type: 'pkg-vuln', tier: 'P1', x: 680, y: 200, desc: 'CVE-2022-22965 · CVSS 9.8 · KEV' },
  { id: 'lodash', label: 'lodash\n4.17.15', type: 'pkg-vuln', tier: 'P1', x: 200, y: 380, desc: 'CVE-2019-10744 · CVSS 9.1' },
  { id: 'frontend-app', label: 'frontend-app', type: 'project-mid', tier: 'P1', x: 80, y: 480, desc: 'npm · 5 findings · P1' },
  { id: 'admin-dash', label: 'admin-dashboard', type: 'project-mid', tier: 'P1', x: 320, y: 480, desc: 'npm · 4 findings · P1' },
  { id: 'secure-pay', label: 'secure-payments', type: 'project-clean', tier: 'P3', x: 560, y: 480, desc: '0 findings · verified clean' },
];

const EDGES = [
  { s: 'api-gateway', t: 'log4j', scope: 'runtime', direct: true },
  { s: 'auth-service', t: 'spring-security', scope: 'runtime', direct: true },
  { s: 'spring-security', t: 'log4j', scope: 'runtime', direct: false },
  { s: 'reporting-lib', t: 'log4j', scope: 'runtime', direct: true },
  { s: 'reporting-lib', t: 'spring-webmvc', scope: 'runtime', direct: true },
  { s: 'batch-processor', t: 'spring-webmvc', scope: 'runtime', direct: true },
  { s: 'frontend-app', t: 'lodash', scope: 'runtime', direct: false },
  { s: 'admin-dash', t: 'lodash', scope: 'runtime', direct: false },
];

const NODE_FILLS: Record<string, string> = {
  'project-vuln': '#fee2e2',
  'project-mid': '#fff7ed',
  'project-clean': '#ecfdf5',
  'pkg-vuln': '#fef2f2',
  'pkg-safe': '#eff6ff',
};
const NODE_STROKE: Record<string, string> = {
  'project-vuln': '#dc2626',
  'project-mid': '#ea580c',
  'project-clean': '#16a34a',
  'pkg-vuln': '#b91c1c',
  'pkg-safe': '#2563eb',
};
const NODE_TEXT: Record<string, string> = {
  'project-vuln': '#991b1b',
  'project-mid': '#9a3412',
  'project-clean': '#166534',
  'pkg-vuln': '#7f1d1d',
  'pkg-safe': '#1e40af',
};

export default function GraphExplorer() {
  const [searchParams] = useSearchParams();
  const [selected, setSelected] = useState<string | null>(null);
  const [blastMode, setBlastMode] = useState(false);
  const [layout, setLayout] = useState('dagre');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const selectedNode = NODES.find(n => n.id === selected);

  const isBlastHighlighted = (nodeId: string) => {
    if (!blastMode) return false;
    const vuln = ['log4j', 'spring-webmvc', 'lodash'];
    const affected = ['api-gateway', 'auth-service', 'reporting-lib', 'batch-processor', 'frontend-app', 'admin-dash'];
    return vuln.includes(nodeId) || affected.includes(nodeId);
  };

  const handleExportPNG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement('canvas');
    canvas.width = 900; canvas.height = 600;
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(0, 0, 900, 600);
      ctx.drawImage(img, 0, 0);
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl; a.download = 'BlastRadius_Graph.png';
      a.click();
      toast.success('Graph exported as PNG!');
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleExportJSON = () => {
    exportAsJSON({ nodes: NODES, edges: EDGES }, 'BlastRadius_Graph.json');
    toast.success('Graph data exported as JSON!');
  };

  return (
    <div className="flex h-full">
      {/* Sidebar Controls */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 shadow-sm">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-900 mb-3">Graph Explorer</h2>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input placeholder="Search nodes..." className="input pl-8 text-xs" />
          </div>
        </div>

        <div className="p-4 border-b border-slate-200 space-y-3">
          <div>
            <label className="text-xs text-slate-500 mb-1 block font-medium">Layout</label>
            <select value={layout} onChange={e => setLayout(e.target.value)} className="input text-xs">
              <option value="dagre">Dagre (Hierarchical)</option>
              <option value="fcose">fCoSE (Force-directed)</option>
              <option value="concentric">Concentric</option>
            </select>
          </div>
        </div>

        <div className="p-4 border-b border-slate-200 space-y-2">
          <button onClick={() => setBlastMode(!blastMode)}
            className={clsx('w-full text-xs px-3 py-2 rounded-lg font-semibold transition-all flex items-center gap-2',
              blastMode ? 'bg-red-600 text-slate-900 shadow-sm' : 'btn-secondary')}>
            <Network size={13} />
            {blastMode ? 'Exit Blast Radius' : 'Animate Blast Radius'}
          </button>
          <button className="btn-secondary w-full text-xs flex items-center gap-2">
            <GitBranch size={13} /> Shortest Path
          </button>
          <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            className="btn-secondary w-full text-xs">
            Reset View
          </button>
        </div>

        <div className="p-4 space-y-2">
          <button onClick={handleExportPNG} className="btn-primary w-full text-xs flex items-center gap-2">
            <Download size={13} /> Export PNG
          </button>
          <button onClick={handleExportJSON} className="btn-secondary w-full text-xs flex items-center gap-2">
            <Download size={13} /> Export JSON
          </button>
        </div>

        {/* Legend */}
        <div className="p-4 mt-auto border-t border-slate-200 bg-slate-50">
          <div className="text-xs text-slate-500 font-semibold mb-2">Legend</div>
          {[
            { fill: '#fee2e2', stroke: '#dc2626', label: 'Project (P0 Critical)' },
            { fill: '#fff7ed', stroke: '#ea580c', label: 'Project (P1 Affected)' },
            { fill: '#ecfdf5', stroke: '#16a34a', label: 'Project (Clean)' },
            { fill: '#fef2f2', stroke: '#b91c1c', label: 'Vulnerable Package' },
            { fill: '#eff6ff', stroke: '#2563eb', label: 'Safe Package' },
            { fill: 'transparent', stroke: '#2563eb', label: 'Dependency Edge' },
          ].map(({ fill, stroke, label }) => (
            <div key={label} className="flex items-center gap-2 mb-1.5">
              <div className="w-3.5 h-3.5 rounded-sm shrink-0 border-2" style={{ background: fill, borderColor: stroke }} />
              <span className="text-xs text-slate-600">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Graph Canvas */}
      <div className="flex-1 relative overflow-hidden bg-slate-100">
        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-1">
          <button onClick={() => setZoom(z => Math.min(z + 0.2, 3))} className="bg-white border border-slate-200 p-2 rounded-lg shadow-sm hover:bg-slate-50">
            <ZoomIn size={16} className="text-slate-600" />
          </button>
          <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.3))} className="bg-white border border-slate-200 p-2 rounded-lg shadow-sm hover:bg-slate-50">
            <ZoomOut size={16} className="text-slate-600" />
          </button>
          <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="bg-white border border-slate-200 p-2 rounded-lg shadow-sm hover:bg-slate-50">
            <Maximize2 size={16} className="text-slate-600" />
          </button>
        </div>

        {/* Blast Radius Banner */}
        {blastMode && (
          <div className="absolute top-4 left-4 z-10 bg-red-50 border border-red-200 rounded-lg px-4 py-2 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-red-700 font-bold">
              <AlertTriangle size={14} />
              <span>Blast Radius Mode: CVE-2021-44228</span>
            </div>
            <div className="text-xs text-red-600 mt-0.5">6 projects affected · 4 propagation paths highlighted</div>
          </div>
        )}

        {/* SVG Graph */}
        <svg
          ref={svgRef}
          width="100%" height="100%"
          onMouseDown={e => { setDragging(true); setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y }); }}
          onMouseMove={e => { if (dragging) setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); }}
          onMouseUp={() => setDragging(false)}
          onMouseLeave={() => setDragging(false)}
          style={{ cursor: dragging ? 'grabbing' : 'grab' }}
        >
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
              <polygon points="0 0, 8 4, 0 8" fill="#2563eb" opacity="0.6" />
            </marker>
          </defs>

          <g transform={`translate(${pan.x + 40}, ${pan.y + 40}) scale(${zoom})`}>
            {/* Edges */}
            {EDGES.map((e, i) => {
              const sn = NODES.find(n => n.id === e.s);
              const tn = NODES.find(n => n.id === e.t);
              if (!sn || !tn) return null;
              const highlighted = blastMode && (isBlastHighlighted(e.s) || isBlastHighlighted(e.t));
              return (
                <line
                  key={i}
                  x1={sn.x} y1={sn.y} x2={tn.x} y2={tn.y}
                  stroke={highlighted ? '#dc2626' : '#2563eb'}
                  strokeOpacity={highlighted ? 0.8 : 0.3}
                  strokeWidth={highlighted ? 2.5 : 1}
                  strokeDasharray={e.direct ? undefined : '4 3'}
                  markerEnd="url(#arrowhead)"
                />
              );
            })}

            {/* Nodes */}
            {NODES.map(node => {
              const highlighted = isBlastHighlighted(node.id);
              const isSelected = selected === node.id;
              const fill = NODE_FILLS[node.type] ?? '#eff6ff';
              const stroke = NODE_STROKE[node.type] ?? '#2563eb';
              const textColor = NODE_TEXT[node.type] ?? '#1e40af';
              const isProject = node.type.startsWith('project');
              const w = isProject ? 120 : 100;
              const h = isProject ? 44 : 38;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x - w / 2}, ${node.y - h / 2})`}
                  onClick={() => setSelected(node.id === selected ? null : node.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <rect
                    width={w} height={h}
                    rx={isProject ? 10 : 8}
                    fill={fill}
                    stroke={isSelected ? '#1e40af' : stroke}
                    strokeWidth={isSelected ? 2.5 : (highlighted ? 2.5 : 1.5)}
                    strokeOpacity={1}
                  />
                  {node.label.split('\n').map((line, li) => (
                    <text
                      key={li}
                      x={w / 2} y={li === 0 ? (node.label.includes('\n') ? 15 : 26) : 29}
                      textAnchor="middle"
                      fill={textColor}
                      fontSize={li === 0 ? (isProject ? 10 : 9) : 8}
                      fontWeight={li === 0 ? 700 : 500}
                      fontFamily="monospace"
                    >
                      {line}
                    </text>
                  ))}
                  {node.tier && (
                    <text x={w - 6} y={13} textAnchor="end" fill={stroke} fontSize={8} fontWeight={800}>{node.tier}</text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Node Detail Drawer */}
        {selected && selectedNode && (
          <div className="absolute right-0 top-0 h-full w-72 bg-white border-l border-slate-200 overflow-y-auto shadow-lg">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">{selectedNode.label.replace('\n', ' ')}</h3>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="text-xs text-slate-600">{selectedNode.desc}</div>

              {selectedNode.type.includes('vuln') && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-800">Related Advisories</div>
                  {ADVISORIES.slice(0, 2).map(adv => (
                    <div key={adv.id} className="p-2.5 bg-red-50 border border-red-200 rounded-lg">
                      <div className="text-xs font-mono font-bold text-red-700">{adv.aliases[0]}</div>
                      <div className="text-xs text-slate-600 mt-0.5 line-clamp-2">{adv.summary}</div>
                      <div className="flex gap-2 mt-1.5">
                        <span className="text-xs text-slate-500 font-medium">CVSS {adv.cvss}</span>
                        {adv.kev && <span className="badge-kev text-xs">KEV</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-800">Actions</div>
                <Link to={`/advisories/${ADVISORIES[0].id}`}
                  className="btn-secondary w-full text-xs flex items-center justify-between">
                  View Advisory <ChevronRight size={12} />
                </Link>
                <Link to="/impact/GHSA-jfh8-c2jp-hdph"
                  className="btn-secondary w-full text-xs flex items-center justify-between">
                  Open Impact <ChevronRight size={12} />
                </Link>
                <Link to="/patch"
                  className="btn-primary w-full text-xs flex items-center justify-between">
                  Generate Patch Plan <ChevronRight size={12} />
                </Link>
              </div>

              {selectedNode.type.startsWith('project') && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-800">Propagation Path</div>
                  <div className="font-mono text-xs text-slate-600 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    {selectedNode.id} → log4j-core@2.14.1<br/>
                    <span className="text-slate-400">depth: 1 · runtime · direct</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
