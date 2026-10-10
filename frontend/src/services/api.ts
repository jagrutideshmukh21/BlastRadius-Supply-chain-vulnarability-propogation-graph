/**
 * BlastRadius API Client
 * Connects frontend UI to FastAPI backend with automatic snapshot fallback.
 */

const API_BASE = 'http://localhost:8000/api';

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    if (!response.ok) {
      console.warn(`API request to ${endpoint} returned status ${response.status}`);
      return null;
    }
    return await response.json();
  } catch (err) {
    console.warn(`API call failed for ${endpoint}, using client snapshot fallback:`, err);
    return null;
  }
}

export const api = {
  health: () => apiFetch('/health'),
  runLog4ShellDemo: () => apiFetch('/demo/log4shell', { method: 'POST' }),
  resetDemo: () => apiFetch('/demo/reset', { method: 'POST' }),
  listProjects: (ecosystem?: string) => apiFetch(`/projects${ecosystem ? `?ecosystem=${ecosystem}` : ''}`),
  getProjectDetail: (id: string) => apiFetch(`/projects/${id}`),
  scanAllProjects: () => apiFetch('/projects/scan-all', { method: 'POST' }),
  scanProject: (id: string) => apiFetch(`/projects/${id}/scan`, { method: 'POST' }),
  getGraphData: (advisory?: string, layout?: string) => apiFetch(`/graph?${new URLSearchParams({ advisory: advisory || '', layout: layout || 'dagre' })}`),
  getImpact: (advisoryId: string) => apiFetch(`/impact/${advisoryId}`),
  getRiskRanking: (preset: string = 'Balanced') => apiFetch(`/risk?preset=${preset}`),
  getPatchPlan: () => apiFetch('/patch/plan'),
  simulatePatch: (actionIds: string[]) => apiFetch('/patch/simulate', { method: 'POST', body: JSON.stringify(actionIds) }),
  applyPatch: (actionId: string, reason: string) => apiFetch('/patch/apply', { method: 'POST', body: JSON.stringify({ action_id: actionId, reason }) }),
  getTimeMachine: (asOfDate: string = '2024-01') => apiFetch(`/timemachine?as_of_date=${asOfDate}`),
  getReport: (type: string) => apiFetch(`/reports/${type}`),
  validateReport: (type: string) => apiFetch(`/reports/${type}/validate`, { method: 'POST' }),
  getWatchlist: () => apiFetch('/alerts/watchlist'),
  addWatchlist: (item: string) => apiFetch('/alerts/watchlist', { method: 'POST', body: JSON.stringify({ item }) }),
  getNotifications: () => apiFetch('/alerts/notifications'),
  markNotificationsRead: () => apiFetch('/alerts/notifications/mark-all-read', { method: 'POST' }),
  getAuditEvents: () => apiFetch('/audit'),
  getDataSources: () => apiFetch('/settings/sources'),
  testSource: (id: string) => apiFetch(`/settings/sources/${id}/test`, { method: 'POST' }),
  runBenchmark: (projects: number) => apiFetch('/settings/benchmark', { method: 'POST', body: JSON.stringify({ project_count: projects }) }),
  globalSearch: (q: string) => apiFetch(`/search?q=${encodeURIComponent(q)}`),
};
