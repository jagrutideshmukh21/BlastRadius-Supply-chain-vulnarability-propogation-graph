"""
Resolver Module
Determines resolution method and confidence rating per dependency:
- Lockfile/SBOM: Confirmed (High confidence)
- deps.dev on exact version: Probable (Medium confidence)
- Range with assumed version: Unverified (Low confidence, labelled "assumed")
- Otherwise: Unresolved (explicit, never silently dropped)
"""

from typing import Dict, List, Any

class DependencyResolver:
  def resolve(self, project_data: Dict[str, Any], lockfile_data: List[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    resolved_list = []
    lockfile_map = {item["name"]: item["version"] for item in (lockfile_data or []) if "name" in item and "version" in item}
    
    for dep in project_data.get("dependencies", []):
      d_name = dep["name"]
      v_spec = dep.get("version_spec", "")
      pinned_v = dep.get("pinned_version")
      
      if d_name in lockfile_map:
        version = lockfile_map[d_name]
        method = "lockfile"
        confidence = "Confirmed"
        label = "exact"
      elif pinned_v:
        version = pinned_v
        method = "pinned_manifest"
        confidence = "Confirmed"
        label = "exact"
      elif v_spec and not any(char in v_spec for char in (">", "<", "^", "~", "*")):
        version = v_spec.lstrip("=v ")
        method = "manifest_pin"
        confidence = "Confirmed"
        label = "exact"
      elif v_spec:
        # Range with assumed fallback version
        # Strip operators to make an assumed version
        assumed = v_spec.replace("^", "").replace("~", "").replace(">=", "").replace("<=", "").replace(">", "").replace("<", "").replace("=", "").strip()
        version = assumed if assumed else "0.0.0"
        method = "range_assumed"
        confidence = "Unverified"
        label = "assumed"
      else:
        version = "unresolved"
        method = "unresolved"
        confidence = "Unverified"
        label = "unresolved"
        
      resolved_list.append({
        "name": d_name,
        "version": version,
        "version_spec": v_spec,
        "scope": dep.get("scope", "runtime"),
        "is_direct": dep.get("is_direct", True),
        "resolution_method": method,
        "confidence": confidence,
        "label": label
      })
      
    return resolved_list
