"""
Maven ComparableVersion Implementation per Apache Maven Spec
Handles qualifier tokens: alpha, beta, milestone, rc, snapshot, final, ga, sp
Compares version strings according to Maven spec rules.
"""

import re
from typing import List, Union

QUALIFIERS = {
  "alpha": -5,
  "a": -5,
  "beta": -4,
  "b": -4,
  "milestone": -3,
  "m": -3,
  "rc": -2,
  "cr": -2,
  "snapshot": -1,
  "": 0,
  "final": 0,
  "ga": 0,
  "sp": 1
}

class MavenVersion:
  def __init__(self, version_str: str):
    self.raw = version_str or ""
    self.tokens = self._parse(self.raw)

  def _parse(self, v: str) -> List[Union[int, str]]:
    v = v.lower()
    # Replace separators '-' and '.' with '.'
    v = v.replace("-", ".")
    raw_tokens = [t for t in v.split(".") if t]
    parsed: List[Union[int, str]] = []
    
    for t in raw_tokens:
      # Split mixed digit and string (e.g. 1.0b2 -> 1, 0, b, 2)
      sub_tokens = re.findall(r'(\d+|[a-z]+)', t)
      for st in sub_tokens:
        if st.isdigit():
          parsed.append(int(st))
        else:
          parsed.append(st)
    return parsed

  def __lt__(self, other: "MavenVersion") -> bool:
    return self.compare_to(other) < 0

  def __eq__(self, other: "MavenVersion") -> bool:
    return self.compare_to(other) == 0

  def __le__(self, other: "MavenVersion") -> bool:
    return self.compare_to(other) <= 0

  def compare_to(self, other: "MavenVersion") -> int:
    max_len = max(len(self.tokens), len(other.tokens))
    for i in range(max_len):
      t1 = self.tokens[i] if i < len(self.tokens) else 0
      t2 = other.tokens[i] if i < len(other.tokens) else 0
      
      val1 = QUALIFIERS.get(str(t1), t1) if isinstance(t1, str) else t1
      val2 = QUALIFIERS.get(str(t2), t2) if isinstance(t2, str) else t2
      
      if isinstance(val1, int) and isinstance(val2, int):
        if val1 != val2:
          return -1 if val1 < val2 else 1
      elif isinstance(val1, str) and isinstance(val2, str):
        if val1 != val2:
          return -1 if val1 < val2 else 1
      else:
        # Int vs string precedence: int > string qualifier except sp
        if isinstance(val1, int) and isinstance(val2, str):
          q2 = QUALIFIERS.get(val2, -10)
          return -1 if 0 < q2 else 1
        elif isinstance(val1, str) and isinstance(val2, int):
          q1 = QUALIFIERS.get(val1, -10)
          return 1 if 0 < q1 else -1
    return 0

def compare_maven(v1: str, v2: str) -> int:
  return MavenVersion(v1).compare_to(MavenVersion(v2))
