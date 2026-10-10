// BlastRadius Mock Data - All UI data comes from here
// In production this would be fetched from the FastAPI backend

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
export type Tier = 'P0' | 'P1' | 'P2' | 'P3';
export type Confidence = 'Confirmed' | 'Probable' | 'Unverified';
export type Ecosystem = 'npm' | 'PyPI' | 'Maven';

export interface Advisory {
  id: string;
  aliases: string[];
  package: string;
  ecosystem: Ecosystem;
  summary: string;
  cvss: number;
  cvssVector: string;
  epss: number;
  kev: boolean;
  kevDueDate?: string;
  published: string;
  modified: string;
  fixedVersion?: string;
  affectedRange: string;
  affectedProjects: number;
  severity: Severity;
  source: string;
  references: string[];
}

export interface Project {
  id: string;
  name: string;
  ecosystem: Ecosystem;
  owner: string;
  internetFacing: boolean;
  criticality: number;
  isInternalLib: boolean;
  directDeps: number;
  transitiveDeps: number;
  findings: number;
  worstTier: Tier;
  confidence: Confidence;
  lastScan: string;
  description: string;
  version: string;
}

export interface Finding {
  id: string;
  projectId: string;
  advisoryId: string;
  package: string;
  version: string;
  depth: number;
  scope: string;
  tier: Tier;
  riskScore: number;
  exploitability: number;
  impact: number;
  exposure: number;
  confidence: Confidence;
  paths: string[][];
  fixedVersion?: string;
  isDirect: boolean;
}

export interface PatchAction {
  id: string;
  type: 'DIRECT_BUMP' | 'PARENT_BUMP' | 'OVERRIDE' | 'INTERNAL_LIB_RELEASE';
  package: string;
  fromVersion: string;
  toVersion: string;
  effort: number;
  riskCleared: number;
  wave: 0 | 1 | 2 | 3;
  projectsTouched: string[];
  breakingChange: boolean;
  command: string;
  state: 'proposed' | 'simulated' | 'accepted' | 'applied' | 'verified';
  advisories: string[];
}

// ===== ADVISORIES =====
export const ADVISORIES: Advisory[] = [
  {
    id: 'GHSA-jfh8-c2jp-hdph',
    aliases: ['CVE-2021-44228', 'GHSA-jfh8-c2jp-hdph'],
    package: 'log4j-core',
    ecosystem: 'Maven',
    summary: 'Log4Shell: Remote code execution in Apache Log4j2 JNDI features',
    cvss: 10.0,
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H',
    epss: 0.975,
    kev: true,
    kevDueDate: '2021-12-24',
    published: '2021-12-10',
    modified: '2023-02-03',
    fixedVersion: '2.17.1',
    affectedRange: '>= 2.0-beta9, < 2.17.1',
    affectedProjects: 6,
    severity: 'CRITICAL',
    source: 'OSV + CISA KEV',
    references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-44228', 'https://logging.apache.org/log4j/2.x/security.html'],
  },
  {
    id: 'GHSA-36p3-wjmg-h94x',
    aliases: ['CVE-2022-22965', 'GHSA-36p3-wjmg-h94x'],
    package: 'spring-webmvc',
    ecosystem: 'Maven',
    summary: 'Spring4Shell: Remote code execution via Data Binding in Spring Framework',
    cvss: 9.8,
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
    epss: 0.972,
    kev: true,
    kevDueDate: '2022-04-25',
    published: '2022-03-31',
    modified: '2023-08-11',
    fixedVersion: '5.3.18',
    affectedRange: '>= 5.3.0, < 5.3.18',
    affectedProjects: 3,
    severity: 'CRITICAL',
    source: 'OSV + CISA KEV',
    references: ['https://nvd.nist.gov/vuln/detail/CVE-2022-22965'],
  },
  {
    id: 'GHSA-jvfv-7rvx-43m5',
    aliases: ['CVE-2019-10744', 'GHSA-jvfv-7rvx-43m5'],
    package: 'lodash',
    ecosystem: 'npm',
    summary: 'Prototype Pollution in lodash via defaultsDeep, merge, and mergeWith',
    cvss: 9.1,
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N',
    epss: 0.734,
    kev: false,
    published: '2019-07-26',
    modified: '2023-01-28',
    fixedVersion: '4.17.21',
    affectedRange: '< 4.17.21',
    affectedProjects: 4,
    severity: 'HIGH',
    source: 'OSV + GitHub Advisory',
    references: ['https://nvd.nist.gov/vuln/detail/CVE-2019-10744'],
  },
  {
    id: 'PYSEC-2022-42969',
    aliases: ['CVE-2022-42969', 'PYSEC-2022-42969'],
    package: 'py',
    ecosystem: 'PyPI',
    summary: 'ReDoS vulnerability in py library path traversal regex',
    cvss: 7.5,
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H',
    epss: 0.043,
    kev: false,
    published: '2022-10-16',
    modified: '2023-01-24',
    fixedVersion: '1.11.0',
    affectedRange: '< 1.11.0',
    affectedProjects: 2,
    severity: 'HIGH',
    source: 'OSV + PyPA Advisory',
    references: ['https://nvd.nist.gov/vuln/detail/CVE-2022-42969'],
  },
  {
    id: 'GHSA-c2qf-rxjj-qqgw',
    aliases: ['CVE-2020-28469', 'GHSA-c2qf-rxjj-qqgw'],
    package: 'glob-parent',
    ecosystem: 'npm',
    summary: 'Regular Expression Denial of Service in glob-parent',
    cvss: 7.5,
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H',
    epss: 0.12,
    kev: false,
    published: '2021-06-03',
    modified: '2023-02-02',
    fixedVersion: '5.1.2',
    affectedRange: '< 5.1.2',
    affectedProjects: 3,
    severity: 'HIGH',
    source: 'OSV + npm Advisory',
    references: ['https://nvd.nist.gov/vuln/detail/CVE-2020-28469'],
  },
  {
    id: 'GHSA-35jh-r3h4-6jhm',
    aliases: ['CVE-2022-25883', 'GHSA-35jh-r3h4-6jhm'],
    package: 'semver',
    ecosystem: 'npm',
    summary: 'Regular Expression Denial of Service (ReDoS) in semver',
    cvss: 7.5,
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H',
    epss: 0.098,
    kev: false,
    published: '2023-06-21',
    modified: '2023-07-06',
    fixedVersion: '7.5.2',
    affectedRange: '< 7.5.2',
    affectedProjects: 2,
    severity: 'HIGH',
    source: 'OSV',
    references: ['https://nvd.nist.gov/vuln/detail/CVE-2022-25883'],
  },
  {
    id: 'PYSEC-2023-135',
    aliases: ['CVE-2023-35116', 'PYSEC-2023-135'],
    package: 'jackson-databind',
    ecosystem: 'Maven',
    summary: 'StackOverflowError in jackson-databind when serializing deeply nested data',
    cvss: 5.9,
    cvssVector: 'CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:N/I:N/A:H',
    epss: 0.025,
    kev: false,
    published: '2023-06-14',
    modified: '2023-07-10',
    fixedVersion: '2.15.2',
    affectedRange: '< 2.15.2',
    affectedProjects: 2,
    severity: 'MEDIUM',
    source: 'OSV',
    references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-35116'],
  },
  {
    id: 'GHSA-wrvw-hg22-4m67',
    aliases: ['CVE-2021-23337', 'GHSA-wrvw-hg22-4m67'],
    package: 'lodash',
    ecosystem: 'npm',
    summary: 'Command Injection in lodash template function',
    cvss: 7.2,
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:H/UI:N/S:U/C:H/I:H/A:H',
    epss: 0.18,
    kev: false,
    published: '2021-02-15',
    modified: '2023-02-03',
    fixedVersion: '4.17.21',
    affectedRange: '< 4.17.21',
    affectedProjects: 3,
    severity: 'HIGH',
    source: 'OSV + GitHub Advisory',
    references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-23337'],
  },
];

// ===== PROJECTS =====
export const PROJECTS: Project[] = [
  {
    id: 'proj-001',
    name: 'api-gateway',
    ecosystem: 'Maven',
    owner: 'platform-team',
    internetFacing: true,
    criticality: 5,
    isInternalLib: false,
    directDeps: 24,
    transitiveDeps: 156,
    findings: 3,
    worstTier: 'P0',
    confidence: 'Confirmed',
    lastScan: '2024-01-15T10:30:00Z',
    description: 'Main API gateway handling all external traffic',
    version: '3.2.1',
  },
  {
    id: 'proj-002',
    name: 'auth-service',
    ecosystem: 'Maven',
    owner: 'security-team',
    internetFacing: true,
    criticality: 5,
    isInternalLib: false,
    directDeps: 18,
    transitiveDeps: 98,
    findings: 2,
    worstTier: 'P0',
    confidence: 'Confirmed',
    lastScan: '2024-01-15T10:35:00Z',
    description: 'Authentication and authorization service',
    version: '2.1.0',
  },
  {
    id: 'proj-003',
    name: 'reporting-lib',
    ecosystem: 'Maven',
    owner: 'data-team',
    internetFacing: false,
    criticality: 4,
    isInternalLib: true,
    directDeps: 12,
    transitiveDeps: 67,
    findings: 4,
    worstTier: 'P0',
    confidence: 'Confirmed',
    lastScan: '2024-01-15T10:40:00Z',
    description: 'Internal shared reporting library used by 3 services',
    version: '1.5.3',
  },
  {
    id: 'proj-004',
    name: 'batch-processor',
    ecosystem: 'Maven',
    owner: 'data-team',
    internetFacing: false,
    criticality: 3,
    isInternalLib: false,
    directDeps: 31,
    transitiveDeps: 203,
    findings: 3,
    worstTier: 'P1',
    confidence: 'Probable',
    lastScan: '2024-01-15T10:45:00Z',
    description: 'Nightly batch processing jobs with Spring Boot',
    version: '4.0.2',
  },
  {
    id: 'proj-005',
    name: 'frontend-app',
    ecosystem: 'npm',
    owner: 'frontend-team',
    internetFacing: true,
    criticality: 4,
    isInternalLib: false,
    directDeps: 45,
    transitiveDeps: 734,
    findings: 5,
    worstTier: 'P1',
    confidence: 'Confirmed',
    lastScan: '2024-01-15T11:00:00Z',
    description: 'React SPA with webpack build chain',
    version: '2.8.0',
  },
  {
    id: 'proj-006',
    name: 'admin-dashboard',
    ecosystem: 'npm',
    owner: 'frontend-team',
    internetFacing: true,
    criticality: 4,
    isInternalLib: false,
    directDeps: 38,
    transitiveDeps: 621,
    findings: 4,
    worstTier: 'P1',
    confidence: 'Confirmed',
    lastScan: '2024-01-15T11:05:00Z',
    description: 'Internal admin panel built with Vue.js',
    version: '1.3.2',
  },
  {
    id: 'proj-007',
    name: 'cli-tooling',
    ecosystem: 'npm',
    owner: 'devops-team',
    internetFacing: false,
    criticality: 2,
    isInternalLib: false,
    directDeps: 22,
    transitiveDeps: 289,
    findings: 2,
    worstTier: 'P2',
    confidence: 'Probable',
    lastScan: '2024-01-15T11:10:00Z',
    description: 'Internal CLI tools for deployment automation',
    version: '0.9.5',
  },
  {
    id: 'proj-008',
    name: 'test-helpers',
    ecosystem: 'npm',
    owner: 'qa-team',
    internetFacing: false,
    criticality: 1,
    isInternalLib: true,
    directDeps: 15,
    transitiveDeps: 178,
    findings: 1,
    worstTier: 'P3',
    confidence: 'Confirmed',
    lastScan: '2024-01-15T11:15:00Z',
    description: 'Shared test utilities (dev-only vulnerable dep)',
    version: '1.0.1',
  },
  {
    id: 'proj-009',
    name: 'ml-pipeline',
    ecosystem: 'PyPI',
    owner: 'ml-team',
    internetFacing: false,
    criticality: 3,
    isInternalLib: false,
    directDeps: 28,
    transitiveDeps: 145,
    findings: 2,
    worstTier: 'P2',
    confidence: 'Probable',
    lastScan: '2024-01-15T11:20:00Z',
    description: 'Machine learning model training pipeline',
    version: '3.1.0',
  },
  {
    id: 'proj-010',
    name: 'data-ingestion',
    ecosystem: 'PyPI',
    owner: 'data-team',
    internetFacing: false,
    criticality: 3,
    isInternalLib: false,
    directDeps: 19,
    transitiveDeps: 87,
    findings: 1,
    worstTier: 'P2',
    confidence: 'Confirmed',
    lastScan: '2024-01-15T11:25:00Z',
    description: 'Data ingestion from external sources',
    version: '2.0.4',
  },
  {
    id: 'proj-011',
    name: 'notification-svc',
    ecosystem: 'PyPI',
    owner: 'platform-team',
    internetFacing: true,
    criticality: 3,
    isInternalLib: false,
    directDeps: 14,
    transitiveDeps: 62,
    findings: 1,
    worstTier: 'P2',
    confidence: 'Unverified',
    lastScan: '2024-01-15T11:30:00Z',
    description: 'Email/SMS notification service (manifest-only, no lockfile)',
    version: '1.2.0',
  },
  {
    id: 'proj-012',
    name: 'secure-payments',
    ecosystem: 'PyPI',
    owner: 'finance-team',
    internetFacing: true,
    criticality: 5,
    isInternalLib: false,
    directDeps: 11,
    transitiveDeps: 43,
    findings: 0,
    worstTier: 'P3',
    confidence: 'Confirmed',
    lastScan: '2024-01-15T11:35:00Z',
    description: 'Payment processing (uses fixed version - negative control)',
    version: '5.1.2',
  },
];

// ===== FINDINGS =====
export const FINDINGS: Finding[] = [
  {
    id: 'find-001',
    projectId: 'proj-001',
    advisoryId: 'GHSA-jfh8-c2jp-hdph',
    package: 'log4j-core',
    version: '2.14.1',
    depth: 1,
    scope: 'runtime',
    tier: 'P0',
    riskScore: 97.2,
    exploitability: 0.98,
    impact: 1.0,
    exposure: 0.98,
    confidence: 'Confirmed',
    paths: [['api-gateway', 'log4j-core@2.14.1']],
    fixedVersion: '2.17.1',
    isDirect: true,
  },
  {
    id: 'find-002',
    projectId: 'proj-002',
    advisoryId: 'GHSA-jfh8-c2jp-hdph',
    package: 'log4j-core',
    version: '2.14.1',
    depth: 2,
    scope: 'runtime',
    tier: 'P0',
    riskScore: 94.1,
    exploitability: 0.98,
    impact: 1.0,
    exposure: 0.93,
    confidence: 'Confirmed',
    paths: [['auth-service', 'spring-security', 'log4j-core@2.14.1']],
    fixedVersion: '2.17.1',
    isDirect: false,
  },
  {
    id: 'find-003',
    projectId: 'proj-003',
    advisoryId: 'GHSA-jfh8-c2jp-hdph',
    package: 'log4j-core',
    version: '2.14.1',
    depth: 1,
    scope: 'runtime',
    tier: 'P0',
    riskScore: 91.5,
    exploitability: 0.98,
    impact: 1.0,
    exposure: 0.88,
    confidence: 'Confirmed',
    paths: [['reporting-lib', 'log4j-core@2.14.1']],
    fixedVersion: '2.17.1',
    isDirect: true,
  },
  {
    id: 'find-004',
    projectId: 'proj-004',
    advisoryId: 'GHSA-36p3-wjmg-h94x',
    package: 'spring-webmvc',
    version: '5.3.15',
    depth: 1,
    scope: 'runtime',
    tier: 'P1',
    riskScore: 78.3,
    exploitability: 0.89,
    impact: 0.98,
    exposure: 0.65,
    confidence: 'Confirmed',
    paths: [['batch-processor', 'spring-webmvc@5.3.15']],
    fixedVersion: '5.3.18',
    isDirect: true,
  },
  {
    id: 'find-005',
    projectId: 'proj-005',
    advisoryId: 'GHSA-jvfv-7rvx-43m5',
    package: 'lodash',
    version: '4.17.15',
    depth: 3,
    scope: 'runtime',
    tier: 'P1',
    riskScore: 71.4,
    exploitability: 0.73,
    impact: 0.91,
    exposure: 0.72,
    confidence: 'Confirmed',
    paths: [
      ['frontend-app', 'webpack', 'babel-loader', 'lodash@4.17.15'],
      ['frontend-app', 'eslint', 'lodash@4.17.15'],
    ],
    fixedVersion: '4.17.21',
    isDirect: false,
  },
  {
    id: 'find-006',
    projectId: 'proj-009',
    advisoryId: 'PYSEC-2022-42969',
    package: 'py',
    version: '1.10.0',
    depth: 2,
    scope: 'runtime',
    tier: 'P2',
    riskScore: 54.2,
    exploitability: 0.43,
    impact: 0.75,
    exposure: 0.58,
    confidence: 'Probable',
    paths: [['ml-pipeline', 'pytest', 'py@1.10.0']],
    fixedVersion: '1.11.0',
    isDirect: false,
  },
];

// ===== PATCH ACTIONS =====
export const PATCH_ACTIONS: PatchAction[] = [
  {
    id: 'patch-001',
    type: 'INTERNAL_LIB_RELEASE',
    package: 'log4j-core',
    fromVersion: '2.14.1',
    toVersion: '2.17.1',
    effort: 4,
    riskCleared: 87.5,
    wave: 0,
    projectsTouched: ['reporting-lib'],
    breakingChange: false,
    command: '<!-- pom.xml -->\n<log4j.version>2.17.1</log4j.version>',
    state: 'proposed',
    advisories: ['GHSA-jfh8-c2jp-hdph'],
  },
  {
    id: 'patch-002',
    type: 'DIRECT_BUMP',
    package: 'log4j-core',
    fromVersion: '2.14.1',
    toVersion: '2.17.1',
    effort: 1,
    riskCleared: 97.2,
    wave: 0,
    projectsTouched: ['api-gateway'],
    breakingChange: false,
    command: '<!-- pom.xml -->\n<dependency>\n  <groupId>org.apache.logging.log4j</groupId>\n  <artifactId>log4j-core</artifactId>\n  <version>2.17.1</version>\n</dependency>',
    state: 'proposed',
    advisories: ['GHSA-jfh8-c2jp-hdph'],
  },
  {
    id: 'patch-003',
    type: 'PARENT_BUMP',
    package: 'spring-boot-starter-parent',
    fromVersion: '2.6.3',
    toVersion: '2.6.6',
    effort: 3,
    riskCleared: 78.3,
    wave: 1,
    projectsTouched: ['auth-service', 'batch-processor'],
    breakingChange: false,
    command: '<!-- pom.xml -->\n<parent>\n  <groupId>org.springframework.boot</groupId>\n  <artifactId>spring-boot-starter-parent</artifactId>\n  <version>2.6.6</version>\n</parent>',
    state: 'proposed',
    advisories: ['GHSA-36p3-wjmg-h94x'],
  },
  {
    id: 'patch-004',
    type: 'OVERRIDE',
    package: 'lodash',
    fromVersion: '4.17.15',
    toVersion: '4.17.21',
    effort: 2,
    riskCleared: 71.4,
    wave: 1,
    projectsTouched: ['frontend-app', 'admin-dashboard'],
    breakingChange: false,
    command: '// package.json\n"overrides": {\n  "lodash": "^4.17.21"\n}',
    state: 'proposed',
    advisories: ['GHSA-jvfv-7rvx-43m5', 'GHSA-wrvw-hg22-4m67'],
  },
  {
    id: 'patch-005',
    type: 'DIRECT_BUMP',
    package: 'py',
    fromVersion: '1.10.0',
    toVersion: '1.11.0',
    effort: 1,
    riskCleared: 54.2,
    wave: 2,
    projectsTouched: ['ml-pipeline', 'data-ingestion'],
    breakingChange: false,
    command: '# requirements.txt\npy>=1.11.0',
    state: 'proposed',
    advisories: ['PYSEC-2022-42969'],
  },
];

// ===== DASHBOARD KPIs =====
export const DASHBOARD_KPIs = {
  totalProjects: 12,
  totalPackages: 2847,
  vulnerablePackages: 23,
  affectedProjects: 9,
  directFindings: 8,
  transitiveFindings: 14,
  kevFindings: 4,
  p0Count: 3,
  dataFreshness: 'Snapshot',
  snapshotDate: '2024-01-15T10:00:00Z',
  lastScan: '2024-01-15T11:35:00Z',
};

export const SEVERITY_BREAKDOWN = [
  { name: 'Critical', value: 3, color: '#ef4444' },
  { name: 'High', value: 8, color: '#f97316' },
  { name: 'Medium', value: 6, color: '#f59e0b' },
  { name: 'Low', value: 5, color: '#3b82f6' },
];

export const ECOSYSTEM_BREAKDOWN = [
  { ecosystem: 'Maven', findings: 9 },
  { ecosystem: 'npm', findings: 8 },
  { ecosystem: 'PyPI', findings: 5 },
];

export const TOP_RISKY_PROJECTS = [
  { name: 'api-gateway', score: 97.2, tier: 'P0' },
  { name: 'auth-service', score: 94.1, tier: 'P0' },
  { name: 'reporting-lib', score: 91.5, tier: 'P0' },
  { name: 'batch-processor', score: 78.3, tier: 'P1' },
  { name: 'frontend-app', score: 71.4, tier: 'P1' },
];

export const TOP_CHOKE_POINTS = [
  { package: 'log4j-core@2.14.1', dependents: 6, centrality: 0.94 },
  { package: 'lodash@4.17.15', dependents: 4, centrality: 0.71 },
  { package: 'spring-webmvc@5.3.15', dependents: 3, centrality: 0.65 },
  { package: 'py@1.10.0', dependents: 2, centrality: 0.41 },
];

export const DEPTH_HISTOGRAM = [
  { depth: 1, count: 8 },
  { depth: 2, count: 7 },
  { depth: 3, count: 4 },
  { depth: 4, count: 3 },
  { depth: 5, count: 1 },
];

export const TIME_MACHINE_DATA = [
  { date: '2021-11', exposure: 0 },
  { date: '2021-12', exposure: 97 },
  { date: '2022-01', exposure: 97 },
  { date: '2022-03', exposure: 97 },
  { date: '2022-04', exposure: 97 },
  { date: '2022-06', exposure: 82 },
  { date: '2022-09', exposure: 78 },
  { date: '2023-01', exposure: 65 },
  { date: '2023-06', exposure: 60 },
  { date: '2024-01', exposure: 55 },
];

export const AUDIT_EVENTS = [
  {
    id: 'audit-001',
    actor: 'system',
    action: 'SCAN_COMPLETE',
    entity: 'proj-001',
    entityName: 'api-gateway',
    time: '2024-01-15T11:35:00Z',
    reason: 'Scheduled scan',
    before: null,
    after: '3 findings',
  },
  {
    id: 'audit-002',
    actor: 'demo',
    action: 'DEMO_RUN',
    entity: 'demo',
    entityName: 'Log4Shell Demo',
    time: '2024-01-15T10:00:00Z',
    reason: 'User ran guided demo',
    before: null,
    after: 'Demo completed successfully',
  },
  {
    id: 'audit-003',
    actor: 'system',
    action: 'SYNC_KEV',
    entity: 'data-source',
    entityName: 'CISA KEV Feed',
    time: '2024-01-15T09:00:00Z',
    reason: 'Scheduled daily sync',
    before: '1247 entries',
    after: '1249 entries (+2)',
  },
];

export const NOTIFICATIONS = [
  {
    id: 'notif-001',
    type: 'NEW_KEV',
    title: 'New KEV Entry: CVE-2021-44228',
    message: 'log4j-core added to CISA KEV catalog. Due date: 2021-12-24',
    time: '2024-01-15T09:00:00Z',
    read: false,
    severity: 'CRITICAL' as Severity,
  },
  {
    id: 'notif-002',
    type: 'NEW_ADVISORY',
    title: 'New Advisory affects watched package',
    message: 'GHSA-35jh-r3h4-6jhm affects semver < 7.5.2 used in 2 projects',
    time: '2024-01-14T16:30:00Z',
    read: false,
    severity: 'HIGH' as Severity,
  },
  {
    id: 'notif-003',
    type: 'SCAN_DONE',
    title: 'Scan completed: api-gateway',
    message: '3 findings (1 P0, 1 P1, 1 P2). Previous: 2 findings.',
    time: '2024-01-15T10:30:00Z',
    read: true,
    severity: 'HIGH' as Severity,
  },
];

export const DATA_SOURCES = [
  {
    id: 'osv',
    name: 'OSV.dev',
    url: 'https://api.osv.dev/v1',
    lastSuccess: '2024-01-15T09:00:00Z',
    lastError: null,
    cacheHitRate: 0.87,
    requestCount: 1247,
    status: 'Snapshot' as const,
  },
  {
    id: 'kev',
    name: 'CISA KEV',
    url: 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json',
    lastSuccess: '2024-01-15T09:00:00Z',
    lastError: null,
    cacheHitRate: 0.95,
    requestCount: 24,
    status: 'Snapshot' as const,
  },
  {
    id: 'epss',
    name: 'FIRST EPSS',
    url: 'https://api.first.org/data/v1/epss',
    lastSuccess: '2024-01-15T09:00:00Z',
    lastError: null,
    cacheHitRate: 0.82,
    requestCount: 389,
    status: 'Snapshot' as const,
  },
  {
    id: 'depsdev',
    name: 'deps.dev',
    url: 'https://api.deps.dev/v3',
    lastSuccess: '2024-01-14T22:00:00Z',
    lastError: null,
    cacheHitRate: 0.73,
    requestCount: 2841,
    status: 'Snapshot' as const,
  },
];

export const GRAPH_NODES = [
  { id: 'n-api-gateway', label: 'api-gateway', type: 'project', tier: 'P0', x: 400, y: 100 },
  { id: 'n-auth-service', label: 'auth-service', type: 'project', tier: 'P0', x: 100, y: 100 },
  { id: 'n-reporting-lib', label: 'reporting-lib', type: 'project', tier: 'P0', x: 700, y: 100 },
  { id: 'n-log4j', label: 'log4j-core\n2.14.1', type: 'package-vuln', advisoryId: 'GHSA-jfh8-c2jp-hdph', x: 400, y: 300 },
  { id: 'n-spring-security', label: 'spring-security\n5.6.1', type: 'package-safe', x: 100, y: 200 },
  { id: 'n-spring-webmvc', label: 'spring-webmvc\n5.3.15', type: 'package-vuln', advisoryId: 'GHSA-36p3-wjmg-h94x', x: 700, y: 250 },
  { id: 'n-batch-processor', label: 'batch-processor', type: 'project', tier: 'P1', x: 700, y: 400 },
];

export const GRAPH_EDGES = [
  { source: 'n-api-gateway', target: 'n-log4j', scope: 'runtime' },
  { source: 'n-auth-service', target: 'n-spring-security', scope: 'runtime' },
  { source: 'n-spring-security', target: 'n-log4j', scope: 'runtime' },
  { source: 'n-reporting-lib', target: 'n-log4j', scope: 'runtime' },
  { source: 'n-reporting-lib', target: 'n-spring-webmvc', scope: 'runtime' },
  { source: 'n-batch-processor', target: 'n-spring-webmvc', scope: 'runtime' },
];

export const SCORE_WEIGHTS = {
  exploitability: { epss: 0.45, kev: 0.35, av: 0.20 },
  risk: { e: 0.40, i: 0.25, x: 0.35 },
  scope: { runtime: 1.0, optional: 0.6, dev: 0.3, test: 0.2 },
};

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function severityColor(s: Severity): string {
  const m: Record<Severity, string> = {
    CRITICAL: 'text-red-700',
    HIGH: 'text-orange-700',
    MEDIUM: 'text-amber-700',
    LOW: 'text-blue-700',
    NONE: 'text-slate-500',
  };
  return m[s];
}

export function severityBadge(s: Severity): string {
  const m: Record<Severity, string> = {
    CRITICAL: 'bg-red-100 text-red-700 border border-red-200',
    HIGH: 'bg-orange-100 text-orange-700 border border-orange-200',
    MEDIUM: 'bg-amber-100 text-amber-700 border border-amber-200',
    LOW: 'bg-blue-100 text-blue-700 border border-blue-200',
    NONE: 'bg-slate-100 text-slate-700 border border-slate-200',
  };
  return m[s];
}

export function tierColor(t: Tier): string {
  const m: Record<Tier, string> = {
    P0: 'badge-p0',
    P1: 'badge-p1',
    P2: 'badge-p2',
    P3: 'badge-p3',
  };
  return m[t];
}

export function confidenceBadge(c: Confidence): string {
  const m: Record<Confidence, string> = {
    Confirmed: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
    Probable: 'text-amber-700 bg-amber-50 border border-amber-200',
    Unverified: 'text-slate-600 bg-slate-100 border border-slate-300',
  };
  return m[c];
}

// ===== MISSING DATA POLICY =====
export const MISSING_DATA_POLICY = {
  epss: {
    neutralPrior: 0.1,
    label: 'Estimated (10th percentile neutral prior)',
    flag: 'estimated',
  },
  cvss: {
    severityMapping: { CRITICAL: 9.0, HIGH: 7.0, MEDIUM: 4.0, LOW: 1.0, NONE: 0.0 } as Record<Severity, number>,
    label: 'Estimated (severity label mapping)',
    flag: 'estimated',
  },
  noAdvisory: 'No advisory found is NOT proof of safety. Absence of evidence ≠ evidence of absence.',
  failedSource: 'A failed data source never produces a "clean" result. Failed inputs are shown as unavailable.',
};

// ===== EXPORT HELPERS =====
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportAsCSV(headers: string[], rows: string[][], filename: string) {
  const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
  downloadFile(csvContent, filename, 'text/csv');
}

export function exportAsJSON(data: any, filename: string) {
  downloadFile(JSON.stringify(data, null, 2), filename, 'application/json');
}
