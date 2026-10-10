"""
Time Machine Module
Filters findings using only advisories published on or before date D.
"""

from typing import Dict, List, Any
from datetime import datetime

def filter_findings_by_as_of_date(findings: List[Dict[str, Any]], advisories_meta: List[Dict[str, Any]], as_of_date: str) -> List[Dict[str, Any]]:
  """
  Returns findings considering only advisories published on or before as_of_date (YYYY-MM-DD or YYYY-MM).
  """
  as_of_ts = as_of_date.strip()
  if len(as_of_ts) == 7:  # YYYY-MM
    as_of_ts += "-31"

  valid_adv_ids = set()
  for adv in advisories_meta:
    pub_date = adv.get("published", "")[:10]
    if pub_date and pub_date <= as_of_ts:
      valid_adv_ids.add(adv.get("id"))
      for alias in adv.get("aliases", []):
        valid_adv_ids.add(alias)

  time_machine_findings = []
  for f in findings:
    if f.get("advisory_id") in valid_adv_ids or f.get("alias") in valid_adv_ids:
      time_machine_findings.append(f)

  return time_machine_findings
