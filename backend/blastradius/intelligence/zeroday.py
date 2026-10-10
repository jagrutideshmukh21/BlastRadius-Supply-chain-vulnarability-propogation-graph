"""
Hypothetical Zero-Day Simulator Module
Simulates "what if package X is compromised tomorrow?"
Traverses graph to show full potential blast radius. PURE FUNCTION (writes nothing to DB).
"""

from typing import Dict, List, Any
from ..graph import DependencyGraph

def simulate_zero_day_scenario(dep_graph: DependencyGraph, package_name: str, version: str) -> Dict[str, Any]:
  # Find matching package node
  target_node = None
  for node, data in dep_graph.graph.nodes(data=True):
    if data.get("type") == "package" and data.get("package") == package_name and data.get("version") == version:
      target_node = node
      break

  if not target_node:
    # Fallback search by package name only
    for node, data in dep_graph.graph.nodes(data=True):
      if data.get("type") == "package" and data.get("package") == package_name:
        target_node = node
        break

  if not target_node:
    return {
      "simulated_package": package_name,
      "version": version,
      "affected_projects_count": 0,
      "affected_projects": [],
      "message": f"Package {package_name}@{version} not found in dependency graph."
    }

  blast = dep_graph.compute_blast_radius(target_node)

  return {
    "simulated_package": package_name,
    "version": version,
    "hypothetical_cve": "CVE-2026-ZERO-DAY",
    "cvss_simulated": 10.0,
    "affected_projects_count": blast.get("total_affected_projects", 0),
    "affected_projects": blast.get("affected_projects", []),
    "paths": blast.get("all_paths", []),
    "is_db_written": False
  }
