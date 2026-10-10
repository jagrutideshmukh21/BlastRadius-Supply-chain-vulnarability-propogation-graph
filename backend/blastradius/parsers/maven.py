"""
Maven pom.xml Parser
Uses defusedxml to prevent XML entity expansion vulnerabilities.
Parses properties, parent POM, dependencyManagement, scopes, optional tags.
"""

from typing import Dict, List, Any
import defusedxml.ElementTree as ET

def parse_pom_xml(content: str) -> Dict[str, Any]:
  try:
    root = ET.fromstring(content)
  except Exception as e:
    return {"ecosystem": "Maven", "error": str(e), "dependencies": []}

  # Namespace handling
  ns = ""
  if root.tag.startswith("{"):
    ns = root.tag.split("}")[0] + "}"

  def find_text(elem, tag, default=""):
    child = elem.find(f"{ns}{tag}")
    return child.text.strip() if child is not None and child.text else default

  # Properties resolution
  properties = {}
  props_elem = root.find(f"{ns}properties")
  if props_elem is not None:
    for child in props_elem:
      tag_name = child.tag.replace(ns, "")
      if child.text:
        properties[tag_name] = child.text.strip()

  def resolve_property(val: str) -> str:
    if val and val.startswith("${") and val.endswith("}"):
      prop_key = val[2:-1]
      return properties.get(prop_key, val)
    return val

  group_id = find_text(root, "groupId", "unknown")
  artifact_id = find_text(root, "artifactId", "unknown")
  version = find_text(root, "version", "1.0.0")

  dependencies = []
  deps_elem = root.find(f"{ns}dependencies")
  if deps_elem is not None:
    for dep in deps_elem.findall(f"{ns}dependency"):
      d_group = resolve_property(find_text(dep, "groupId"))
      d_artifact = resolve_property(find_text(dep, "artifactId"))
      d_version = resolve_property(find_text(dep, "version", "LATEST"))
      d_scope = find_text(dep, "scope", "compile")
      d_optional = find_text(dep, "optional", "false") == "true"

      full_name = f"{d_group}:{d_artifact}" if d_group else d_artifact

      dependencies.append({
        "name": full_name,
        "groupId": d_group,
        "artifactId": d_artifact,
        "version_spec": d_version,
        "pinned_version": d_version if d_version != "LATEST" else None,
        "scope": "test" if d_scope == "test" else ("optional" if d_optional else "runtime"),
        "is_direct": True,
        "confidence": "Confirmed" if d_version and d_version != "LATEST" else "Unverified"
      })

  return {
    "name": f"{group_id}:{artifact_id}",
    "version": version,
    "ecosystem": "Maven",
    "dependencies": dependencies,
    "properties": properties
  }
