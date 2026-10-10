"""
Dependency Graph & Blast Radius Propagation Module
Uses networkx to build a directed graph of projects and package@version nodes.
Maintains a persistent REVERSE INDEX (package -> dependents) for fast BFS propagation.
"""

import networkx as nx
from typing import Dict, List, Set, Any, Tuple, Optional

class DependencyGraph:
  def __init__(self):
    self.graph = nx.DiGraph()
    # Reverse index: target_node -> list of (source_node, edge_data)
    self.reverse_index: Dict[str, List[Tuple[str, Dict[str, Any]]]] = {}

  def add_project(self, project_id: str, name: str, metadata: Dict[str, Any]):
    self.graph.add_node(project_id, type="project", name=name, metadata=metadata)
    if project_id not in self.reverse_index:
      self.reverse_index[project_id] = []

  def add_package(self, package_id: str, package_name: str, version: str, ecosystem: str):
    self.graph.add_node(package_id, type="package", package=package_name, version=version, ecosystem=ecosystem)
    if package_id not in self.reverse_index:
      self.reverse_index[package_id] = []

  def add_dependency(self, source_id: str, target_id: str, scope: str = "runtime", is_direct: bool = True):
    self.graph.add_edge(source_id, target_id, scope=scope, is_direct=is_direct)
    if target_id not in self.reverse_index:
      self.reverse_index[target_id] = []
    self.reverse_index[target_id].append((source_id, {"scope": scope, "is_direct": is_direct}))

  def compute_blast_radius(self, vuln_package_id: str) -> Dict[str, Any]:
    """
    BFS up the reverse index from vuln_package_id to all reachable project nodes.
    Returns direct vs transitive findings, shortest depth, paths, scope inheritance.
    """
    if vuln_package_id not in self.graph:
      return {"affected_projects": [], "paths": [], "total_paths": 0}

    affected_projects = []
    all_paths = []
    visited_nodes: Set[str] = set()

    # Find all paths from any project to vuln_package_id in the original graph
    project_nodes = [n for n, d in self.graph.nodes(data=True) if d.get("type") == "project"]
    
    for proj_id in project_nodes:
      if nx.has_path(self.graph, proj_id, vuln_package_id):
        # Find all simple paths (up to 10)
        try:
          paths_gen = nx.all_simple_paths(self.graph, source=proj_id, target=vuln_package_id, cutoff=10)
          paths_list = []
          for p in paths_gen:
            paths_list.append(p)
            if len(paths_list) >= 10:
              break
        except Exception:
          paths_list = [[proj_id, vuln_package_id]]

        if not paths_list:
          continue

        shortest_len = min(len(p) - 1 for p in paths_list)
        is_direct = any(len(p) == 2 for p in paths_list)

        # Scope inheritance: if any edge in path is dev, scope is dev
        inherited_scope = "runtime"
        for p in paths_list:
          for i in range(len(p) - 1):
            edge_data = self.graph.get_edge_data(p[i], p[i+1]) or {}
            if edge_data.get("scope") == "dev":
              inherited_scope = "dev"
              break

        proj_meta = self.graph.nodes[proj_id].get("metadata", {})
        proj_name = self.graph.nodes[proj_id].get("name", proj_id)

        affected_projects.append({
          "project_id": proj_id,
          "project_name": proj_name,
          "depth": shortest_len,
          "is_direct": is_direct,
          "scope": inherited_scope,
          "paths": paths_list,
          "metadata": proj_meta
        })

        all_paths.extend(paths_list)

    return {
      "vuln_package_id": vuln_package_id,
      "affected_projects": affected_projects,
      "total_affected_projects": len(affected_projects),
      "all_paths": all_paths,
      "total_distinct_paths": len(all_paths)
    }

  def calculate_choke_points(self) -> List[Dict[str, Any]]:
    """
    Computes dependent count and betweenness centrality to identify critical choke points.
    """
    betweenness = nx.betweenness_centrality(self.graph)
    choke_points = []

    for node, data in self.graph.nodes(data=True):
      if data.get("type") == "package":
        dependents_count = len(self.reverse_index.get(node, []))
        centrality = betweenness.get(node, 0.0)
        choke_points.append({
          "package_id": node,
          "package": data.get("package"),
          "version": data.get("version"),
          "dependents_count": dependents_count,
          "betweenness_centrality": round(centrality, 4)
        })

    choke_points.sort(key=lambda x: (x["dependents_count"], x["betweenness_centrality"]), reverse=True)
    return choke_points
