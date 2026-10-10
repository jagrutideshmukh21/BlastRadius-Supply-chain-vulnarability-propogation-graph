import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Ingest from './pages/Ingest';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import GraphExplorer from './pages/GraphExplorer';
import Advisories from './pages/Advisories';
import AdvisoryDetail from './pages/AdvisoryDetail';
import Impact from './pages/Impact';
import Risk from './pages/Risk';
import Patch from './pages/Patch';
import TimeMachine from './pages/TimeMachine';
import Reports from './pages/Reports';
import Alerts from './pages/Alerts';
import Audit from './pages/Audit';
import Settings from './pages/Settings';
import TrustCenter from './pages/TrustCenter';
import PolicyGate from './pages/PolicyGate';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-96 text-center p-12">
      <div className="text-6xl font-bold text-slate-300 mb-4">404</div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Page Not Found</h1>
      <p className="text-slate-500 mb-6">The page you're looking for doesn't exist.</p>
      <a href="/dashboard" className="btn-primary">Go to Dashboard</a>
    </div>
  );
}

function LayoutWrapper() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#ffffff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#ffffff' } },
        }}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<LayoutWrapper />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/demo" element={<Navigate to="/dashboard" replace />} />
          <Route path="/ingest" element={<Ingest />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/graph" element={<GraphExplorer />} />
          <Route path="/trust" element={<TrustCenter />} />
          <Route path="/policy" element={<PolicyGate />} />
          <Route path="/advisories" element={<Advisories />} />
          <Route path="/advisories/:id" element={<AdvisoryDetail />} />
          <Route path="/impact/:advisoryId" element={<Impact />} />
          <Route path="/risk" element={<Risk />} />
          <Route path="/patch" element={<Patch />} />
          <Route path="/timemachine" element={<TimeMachine />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/audit" element={<Audit />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
