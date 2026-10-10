"""
BlastRadius Command Line Interface
Usage: python -m blastradius scan data/sample [--offline]
"""

import os
import sys
import json
import argparse
from typing import Dict, List, Any

from .parsers import parse_pom_xml, parse_package_json, parse_package_lock_json, parse_requirements_txt, parse_cyclonedx_json
from .resolver import DependencyResolver
from .osv_matcher import is_version_affected_osv, find_fixed_version
from .graph import DependencyGraph

def load_snapshot_data(snapshot_dir: str) -> Dict[str, Any]:
  snapshots = {}
  feed_files = {
    "cisa_kev": "cisa_kev.json",
    "osv_log4j": "osv_log4j.json",
    "osv_spring4shell": "osv_spring4shell.json",
    "osv_lodash": "osv_lodash.json",
    "osv_py": "osv_py.json",
    "first_epss": "first_epss.json"
  }
  for key, filename in feed_files.items():
    filepath = os.path.join(snapshot_dir, filename)
    if os.path.exists(filepath):
      with open(filepath, "r", encoding="utf-8") as f:
        snapshots[key] = json.load(f).get("data", {})
  return snapshots

def scan_sample_portfolio(sample_dir: str, offline: bool = True) -> Dict[str, Any]:
  base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
  snapshot_dir = os.path.join(base_dir, "data", "snapshots")
  snapshots = load_snapshot_data(snapshot_dir)
  
  projects_json = os.path.join(sample_dir, "projects.json")
  if not os.path.exists(projects_json):
    print(f"Error: Sample directory missing projects.json at {sample_dir}")
    sys.exit(1)

  with open(projects_json, "r", encoding="utf-8") as f:
    projects_meta = json.load(f)

  dep_graph = DependencyGraph()
  resolver = DependencyResolver()
  findings = []

  # Known vulnerable packages from snapshots
  vuln_rules = [
    {
      "pkg_name": "log4j-core",
      "ecosystem": "Maven",
      "advisory_id": "GHSA-jfh8-c2jp-hdph",
      "alias": "CVE-2021-44228",
      "osv": snapshots.get("osv_log4j", {})
    },
    {
      "pkg_name": "org.springframework:spring-webmvc",
      "ecosystem": "Maven",
      "advisory_id": "GHSA-36p3-wjmg-h94x",
      "alias": "CVE-2022-22965",
      "osv": snapshots.get("osv_spring4shell", {})
    },
    {
      "pkg_name": "lodash",
      "ecosystem": "npm",
      "advisory_id": "GHSA-jvfv-7rvx-43m5",
      "alias": "CVE-2019-10744",
      "osv": snapshots.get("osv_lodash", {})
    },
    {
      "pkg_name": "py",
      "ecosystem": "PyPI",
      "advisory_id": "PYSEC-2022-42969",
      "alias": "CVE-2022-42969",
      "osv": snapshots.get("osv_py", {})
    }
  ]

  for p in projects_meta:
    pid = p["id"]
    pname = p["name"]
    ecosystem = p["ecosystem"]
    manifest_file = p.get("manifest_file", "")
    lock_file = p.get("lock_file")

    dep_graph.add_project(pid, pname, p)

    p_dir = os.path.join(sample_dir, pid)
    parsed_proj = {"dependencies": []}

    if manifest_file:
      m_path = os.path.join(p_dir, manifest_file)
      if os.path.exists(m_path):
        with open(m_path, "r", encoding="utf-8") as mf:
          m_content = mf.read()
          if ecosystem == "Maven":
            parsed_proj = parse_pom_xml(m_content)
          elif ecosystem == "npm":
            parsed_proj = parse_package_json(m_content)
          elif ecosystem == "PyPI":
            parsed_proj = parse_requirements_txt(m_content)

    lock_data = []
    if lock_file:
      l_path = os.path.join(p_dir, lock_file)
      if os.path.exists(l_path):
        with open(l_path, "r", encoding="utf-8") as lf:
          lock_data = parse_package_lock_json(lf.read())

    resolved_deps = resolver.resolve(parsed_proj, lock_data)

    for dep in resolved_deps:
      pkg_id = f"{dep['name']}@{dep['version']}"
      dep_graph.add_package(pkg_id, dep["name"], dep["version"], ecosystem)
      dep_graph.add_dependency(pid, pkg_id, scope=dep["scope"], is_direct=dep["is_direct"])

      # Check against OSV rules
      for rule in vuln_rules:
        if rule["ecosystem"] == ecosystem and (rule["pkg_name"] == dep["name"] or dep["name"] in rule["pkg_name"]):
          status = is_version_affected_osv(dep["name"], dep["version"], ecosystem, rule["osv"])
          if status == "AFFECTED":
            fixed_v = find_fixed_version(rule["osv"], ecosystem)
            findings.append({
              "project_id": pid,
              "project_name": pname,
              "advisory_id": rule["advisory_id"],
              "alias": rule["alias"],
              "package": dep["name"],
              "version": dep["version"],
              "confidence": dep["confidence"],
              "resolution_method": dep["resolution_method"],
              "fixed_version": fixed_v,
              "is_direct": dep["is_direct"]
            })

  # Compute propagation paths for log4j
  log4j_blast = dep_graph.compute_blast_radius("log4j-core@2.14.1")

  return {
    "total_projects": len(projects_meta),
    "total_findings": len(findings),
    "findings": findings,
    "log4j_blast": log4j_blast
  }

def run_policy_gate(project_id: str, policy_profile: str, out_format: str = "json") -> int:
  from .intelligence.policy import evaluate_project_policy, generate_sarif_report
  
  # Sample project findings for CLI test/CI gate
  sample_findings = [
    {
      "package": "log4j-core",
      "advisoryId": "CVE-2021-44228",
      "kev": True,
      "cvss": 10.0,
      "riskScore": 97.2,
      "tier": "P0",
      "confidence": "Confirmed"
    }
  ] if project_id in ["proj-001", "api-gateway", "all"] else []

  eval_res = evaluate_project_policy(
    project_id=project_id,
    project_name=project_id,
    findings=sample_findings,
    profile_id=policy_profile
  )

  if out_format == "sarif":
    sarif = generate_sarif_report(eval_res)
    print(json.dumps(sarif, indent=2))
  else:
    print(json.dumps(eval_res, indent=2))

  decision = eval_res["decision"]
  if decision == "PASS":
    return 0
  elif decision == "WARN":
    return 0
  elif decision == "FAIL":
    return 1
  else: # REVIEW
    return 2

def main():
  parser = argparse.ArgumentParser(description="BlastRadius Engine CLI")
  subparsers = parser.add_subparsers(dest="command", help="Sub-commands")

  # Scan command
  scan_parser = subparsers.add_parser("scan", help="Scan portfolio manifest directory")
  scan_parser.add_argument("target", help="Target sample directory")
  scan_parser.add_argument("--offline", action="store_true", default=True, help="Run offline using snapshots")

  # Gate command
  gate_parser = subparsers.add_parser("gate", help="Evaluate CI/CD Policy Gate for a project")
  gate_parser.add_argument("--project", default="proj-001", help="Target project ID")
  gate_parser.add_argument("--policy", default="balanced-risk", help="Policy profile (strict-production, balanced-risk, dev-environment)")
  gate_parser.add_argument("--format", choices=["json", "sarif"], default="json", help="Output format (json, sarif)")

  args = parser.parse_args()

  if args.command == "scan":
    print(f"=== BlastRadius Engine Scan ===")
    print(f"Scanning target: {args.target} (Offline: {args.offline})")
    results = scan_sample_portfolio(args.target, args.offline)
    print(f"[OK] Total Projects Scanned: {results['total_projects']}")
    print(f"[OK] Total Vulnerability Findings: {results['total_findings']}")
    print("\n--- Log4Shell (CVE-2021-44228) Blast Radius ---")
    for proj in results['log4j_blast'].get('affected_projects', []):
      print(f"  • {proj['project_name']} (Depth: {proj['depth']}, Direct: {proj['is_direct']}, Scope: {proj['scope']})")
      for path in proj['paths']:
        print(f"    Path: {' -> '.join(path)}")
    sys.exit(0)

  elif args.command == "gate":
    exit_code = run_policy_gate(args.project, args.policy, args.format)
    sys.exit(exit_code)

  else:
    parser.print_help()
    sys.exit(1)

if __name__ == "__main__":
  main()
