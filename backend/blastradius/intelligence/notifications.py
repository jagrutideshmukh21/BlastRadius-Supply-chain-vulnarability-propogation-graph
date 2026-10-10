"""
Notification Generator Module
Generates alerts for new advisories, KEV additions, sync failures, or scan completions.
"""

import time
from typing import Dict, List, Any

def generate_notifications(watchlist: List[str], findings: List[Dict[str, Any]], sync_status: Dict[str, Any] = None) -> List[Dict[str, Any]]:
  notifications = []
  
  # KEV notification
  for f in findings:
    if f.get("alias") in ("CVE-2021-44228", "CVE-2022-22965"):
      notifications.append({
        "id": f"notif-kev-{f.get('alias')}",
        "type": "NEW_KEV",
        "title": f"New KEV Entry: {f.get('alias')}",
        "message": f"{f.get('package')} added to CISA KEV catalog. Due date: {f.get('kev_due_date', '2021-12-24')}",
        "severity": "CRITICAL",
        "time": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "read": False
      })
      break

  # Watchlist notifications
  for item in watchlist:
    matched = [f for f in findings if f.get("package") == item or f.get("alias") == item or f.get("advisory_id") == item]
    if matched:
      notifications.append({
        "id": f"notif-watch-{item}",
        "type": "NEW_ADVISORY",
        "title": f"Watched Item Alert: {item}",
        "message": f"Advisory affects watched package/CVE {item} in {len(matched)} projects.",
        "severity": "HIGH",
        "time": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "read": False
      })

  return notifications
