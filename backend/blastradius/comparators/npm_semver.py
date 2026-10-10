"""
npm Semver Range Comparator
Handles ^, ~, x, *, ||, >=, <=, >, <, = and prereleases.
"""

import re
from packaging.version import parse as parse_version, Version

def normalize_version(v: str) -> str:
  v = v.strip().lstrip("v=")
  # Convert 1.2 -> 1.2.0
  parts = v.split(".")
  while len(parts) < 3:
    parts.append("0")
  return ".".join(parts[:3]) + ("." + ".".join(parts[3:]) if len(parts) > 3 else "")

def parse_semver(v_str: str) -> Version:
  try:
    return parse_version(normalize_version(v_str))
  except Exception:
    return parse_version("0.0.0")

def match_single_clause(version_str: str, clause: str) -> bool:
  clause = clause.strip()
  if not clause or clause in ("*", "x", "X"):
    return True

  ver = parse_semver(version_str)

  # Wildcards like 1.x or 1.*
  if ".x" in clause.lower() or ".*" in clause:
    major_prefix = clause.lower().replace(".x", "").replace(".*", "").strip()
    if major_prefix.isdigit():
      return ver.major == int(major_prefix)

  # Caret ^ range
  if clause.startswith("^"):
    base_str = clause[1:].strip()
    base_ver = parse_semver(base_str)
    if ver < base_ver:
      return False
    return ver.major == base_ver.major

  # Tilde ~ range
  if clause.startswith("~"):
    base_str = clause[1:].strip()
    base_ver = parse_semver(base_str)
    if ver < base_ver:
      return False
    return ver.major == base_ver.major and ver.minor == base_ver.minor

  # Comparison operators
  if clause.startswith(">="):
    return ver >= parse_semver(clause[2:].strip())
  if clause.startswith("<="):
    return ver <= parse_semver(clause[2:].strip())
  if clause.startswith(">"):
    return ver > parse_semver(clause[1:].strip())
  if clause.startswith("<"):
    return ver < parse_semver(clause[1:].strip())
  if clause.startswith("="):
    return ver == parse_semver(clause[1:].strip())

  try:
    target = parse_semver(clause)
    return ver == target
  except Exception:
    return False

def is_version_in_range(version_str: str, range_str: str) -> bool:
  if not range_str or range_str.strip() in ("*", "x", "X", ""):
    return True

  or_clauses = range_str.split("||")
  for or_c in or_clauses:
    # Tokenize comparison operators with spaces e.g. "< 4.17.21" -> "< 4.17.21"
    tokens = re.findall(r'(?:>=|<=|>|<|=|~|\^)?\s*[v=]?\d+(?:\.\d+)*(?:\.[xX\*])?|\*|[xX]', or_c.strip())
    if not tokens:
      tokens = [or_c.strip()]
    if all(match_single_clause(version_str, tok) for tok in tokens):
      return True
  return False
