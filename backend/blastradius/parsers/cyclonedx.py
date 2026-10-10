"""
CycloneDX JSON SBOM Parser (spec versions 1.4, 1.5)
"""

import json
from typing import Dict, List, Any

def parse_cyclonedx_json(content: str) -> Dict[str, Any]:
  data = json.loads(content)
  metadata = data.get("metadata", {})
  component = metadata.get("component", {})
  
  project_name = component.get("name", "cyclonedx-project")
  project_version = component.get("version", "1.0.0")
  
  dependencies = []
  for comp in data.get("components", []):
    c_name = comp.get("name")
    c_group = comp.get("group")
    c_ver = comp.get("version", "0.0.0")
    c_purl = comp.get("purl")
    
    full_name = f"{c_group}:{c_name}" if c_group else c_name
    
    dependencies.append({
      "name": full_name,
      "version": c_ver,
      "purl": c_purl,
      "scope": "runtime",
      "is_direct": True,
      "confidence": "Confirmed"
    })
    
  return {
    "name": project_name,
    "version": project_version,
    "ecosystem": "CycloneDX",
    "dependencies": dependencies
  }
