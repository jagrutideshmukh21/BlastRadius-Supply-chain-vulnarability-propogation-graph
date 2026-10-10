"""
npm manifest and lockfile parser
Supports package.json & package-lock.json v2/v3
"""

import json
from typing import Dict, List, Any

def parse_package_json(content: str) -> Dict[str, Any]:
  data = json.loads(content)
  name = data.get("name", "unnamed-npm-project")
  version = data.get("version", "1.0.0")
  
  dependencies = []
  
  for dep_name, ver in data.get("dependencies", {}).items():
    dependencies.append({
      "name": dep_name,
      "version_spec": ver,
      "scope": "runtime",
      "is_direct": True
    })
    
  for dep_name, ver in data.get("devDependencies", {}).items():
    dependencies.append({
      "name": dep_name,
      "version_spec": ver,
      "scope": "dev",
      "is_direct": True
    })
    
  for dep_name, ver in data.get("optionalDependencies", {}).items():
    dependencies.append({
      "name": dep_name,
      "version_spec": ver,
      "scope": "optional",
      "is_direct": True
    })
    
  return {
    "name": name,
    "version": version,
    "ecosystem": "npm",
    "dependencies": dependencies,
    "overrides": data.get("overrides", {})
  }

def parse_package_lock_json(content: str) -> List[Dict[str, Any]]:
  data = json.loads(content)
  resolved_deps = []
  
  # Lockfile v2/v3 packages object
  packages = data.get("packages", {})
  if packages:
    for pkg_path, pkg_info in packages.items():
      if not pkg_path:  # Root package
        continue
      pkg_name = pkg_info.get("name") or pkg_path.split("node_modules/")[-1]
      pkg_ver = pkg_info.get("version")
      if pkg_name and pkg_ver:
        resolved_deps.append({
          "name": pkg_name,
          "version": pkg_ver,
          "resolved_url": pkg_info.get("resolved"),
          "integrity": pkg_info.get("integrity"),
          "resolution_method": "lockfile",
          "confidence": "Confirmed"
        })
  else:
    # Lockfile v1 dependencies fallback
    deps = data.get("dependencies", {})
    for dep_name, dep_info in deps.items():
      if isinstance(dep_info, dict) and "version" in dep_info:
        resolved_deps.append({
          "name": dep_name,
          "version": dep_info["version"],
          "resolution_method": "lockfile",
          "confidence": "Confirmed"
        })
        
  return resolved_deps
