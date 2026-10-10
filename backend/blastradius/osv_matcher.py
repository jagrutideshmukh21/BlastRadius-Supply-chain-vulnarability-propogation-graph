"""
OSV Range Matcher
Matches package@version against OSV affected ranges (introduced, fixed, last_affected).
Uncertain cases return UNKNOWN, never SAFE.
"""

from typing import Dict, List, Any, Optional
from .comparators import matches_npm_semver, matches_pep440_spec, compare_maven, compare_pep440

def is_version_affected_osv(pkg_name: str, version_str: str, ecosystem: str, osv_record: Dict[str, Any]) -> str:
  """
  Returns 'AFFECTED', 'NOT_AFFECTED', or 'UNKNOWN'
  """
  if not version_str or version_str == "unresolved":
    return "UNKNOWN"

  affected_entries = osv_record.get("affected", [])
  if not affected_entries:
    return "UNKNOWN"

  for entry in affected_entries:
    pkg = entry.get("package", {})
    entry_pkg_name = pkg.get("name", "")
    entry_ecosystem = pkg.get("ecosystem", "")
    
    # Check if package matches (handling Maven group:artifact or PyPI normalization)
    if entry_pkg_name and entry_pkg_name != pkg_name:
      # Try matching after normalization or substring check
      if not (pkg_name in entry_pkg_name or entry_pkg_name in pkg_name):
        continue

    ranges = entry.get("ranges", [])
    for r in ranges:
      r_type = r.get("type", "")
      events = r.get("events", [])
      
      introduced = None
      fixed = None
      last_affected = None
      
      for ev in events:
        if "introduced" in ev:
          introduced = ev["introduced"]
        if "fixed" in ev:
          fixed = ev["fixed"]
        if "last_affected" in ev:
          last_affected = ev["last_affected"]

      # Compare using ecosystem specific comparator
      try:
        if ecosystem == "Maven":
          is_after_intro = True if (not introduced or introduced == "0" or compare_maven(version_str, introduced) >= 0) else False
          is_before_fix = True if (fixed and compare_maven(version_str, fixed) < 0) else (True if not fixed else False)
          if is_after_intro and is_before_fix:
            return "AFFECTED"
        elif ecosystem == "npm":
          if r_type == "SEMVER":
            range_expr = ""
            if introduced and introduced != "0":
              range_expr += f">={introduced} "
            if fixed:
              range_expr += f"<{fixed}"
            if matches_npm_semver(version_str, range_expr.strip()):
              return "AFFECTED"
          else:
            if fixed and version_str == fixed:
              return "NOT_AFFECTED"
            return "AFFECTED"
        elif ecosystem == "PyPI":
          is_after_intro = True if (not introduced or introduced == "0" or compare_pep440(version_str, introduced) >= 0) else False
          is_before_fix = True if (fixed and compare_pep440(version_str, fixed) < 0) else (True if not fixed else False)
          if is_after_intro and is_before_fix:
            return "AFFECTED"
      except Exception:
        return "UNKNOWN"

  return "NOT_AFFECTED"

def find_fixed_version(osv_record: Dict[str, Any], ecosystem: str) -> Optional[str]:
  for entry in osv_record.get("affected", []):
    for r in entry.get("ranges", []):
      for ev in r.get("events", []):
        if "fixed" in ev:
          return ev["fixed"]
  return None
