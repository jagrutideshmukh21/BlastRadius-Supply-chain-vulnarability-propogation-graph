"""
PyPI requirements.txt Parser
Handles ==, >=, ~=, extras, markers, comments, PEP 503 name normalization
"""

import re
from typing import Dict, List, Any
from ..comparators.pep440 import normalize_pypi_name

def parse_requirements_txt(content: str) -> Dict[str, Any]:
  dependencies = []
  
  for line in content.splitlines():
    line = line.strip()
    # Ignore comments, empty lines, and -r includes
    if not line or line.startswith("#") or line.startswith("-r") or line.startswith("-e"):
      continue
      
    # Strip inline comments
    if " #" in line:
      line = line.split(" #")[0].strip()
      
    # Strip markers (e.g. ; python_version >= '3.8')
    if ";" in line:
      line = line.split(";")[0].strip()
      
    # Match dependency name and version specifier
    # e.g., requests==2.28.1, django>=4.0, py==1.10.0
    match = re.match(r'^([a-zA-Z0-9_\-\.]+)(?:\[[^\]]*\])?\s*([<>=!~^].*)?$', line)
    if match:
      raw_name, ver_spec = match.groups()
      normalized_name = normalize_pypi_name(raw_name)
      ver_spec = (ver_spec or "").strip()
      
      # Determine if exact version is pinned (==)
      is_pinned = ver_spec.startswith("==")
      pinned_ver = ver_spec.lstrip("=").strip() if is_pinned else None
      
      dependencies.append({
        "name": normalized_name,
        "raw_name": raw_name,
        "version_spec": ver_spec,
        "pinned_version": pinned_ver,
        "scope": "runtime",
        "is_direct": True,
        "confidence": "Confirmed" if is_pinned else "Unverified"
      })
      
  return {
    "ecosystem": "PyPI",
    "dependencies": dependencies
  }
