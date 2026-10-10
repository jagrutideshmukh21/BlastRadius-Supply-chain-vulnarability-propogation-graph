"""
PEP 440 PyPI Version Comparator and Name Normalizer per PEP 503
"""

import re
from packaging.version import parse as parse_pep440, Version
from packaging.specifiers import SpecifierSet

def normalize_pypi_name(name: str) -> str:
  """PEP 503 normalization: replace [-_.] with - and lowercase."""
  return re.sub(r"[-_.]+", "-", name).lower()

def compare_pep440(v1: str, v2: str) -> int:
  p1 = parse_pep440(v1)
  p2 = parse_pep440(v2)
  if p1 < p2:
    return -1
  elif p1 > p2:
    return 1
  return 0

def matches_pep440_spec(version_str: str, spec_str: str) -> bool:
  try:
    v = parse_pep440(version_str)
    spec = SpecifierSet(spec_str)
    return v in spec
  except Exception:
    return False
