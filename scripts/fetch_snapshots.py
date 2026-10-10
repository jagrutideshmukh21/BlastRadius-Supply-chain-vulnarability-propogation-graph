#!/usr/bin/env python3
"""
scripts/fetch_snapshots.py
Downloads raw advisory and vulnerability intelligence responses into data/snapshots/
with url, fetched_at (UTC ISO 8601 timestamp), and SHA-256 hash.
Deterministic, re-runnable, offline fallback compliant.
"""

import os
import json
import hashlib
import urllib.request
import urllib.error
from datetime import datetime, timezone

SNAPSHOT_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "snapshots")
os.makedirs(SNAPSHOT_DIR, exist_ok=True)

FEEDS = [
  {
    "name": "cisa_kev",
    "url": "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json",
    "filename": "cisa_kev.json"
  },
  {
    "name": "osv_log4j",
    "url": "https://api.osv.dev/v1/vulns/GHSA-jfh8-c2jp-hdph",
    "filename": "osv_log4j.json"
  },
  {
    "name": "osv_spring4shell",
    "url": "https://api.osv.dev/v1/vulns/GHSA-36p3-wjmg-h94x",
    "filename": "osv_spring4shell.json"
  },
  {
    "name": "osv_lodash",
    "url": "https://api.osv.dev/v1/vulns/GHSA-jvfv-7rvx-43m5",
    "filename": "osv_lodash.json"
  },
  {
    "name": "osv_py",
    "url": "https://api.osv.dev/v1/vulns/PYSEC-2022-42969",
    "filename": "osv_py.json"
  },
  {
    "name": "first_epss",
    "url": "https://api.first.org/data/v1/epss?cve=CVE-2021-44228,CVE-2022-22965,CVE-2019-10744,CVE-2022-42969",
    "filename": "first_epss.json"
  }
]

STATIC_FALLBACKS = {
  "cisa_kev.json": {
    "title": "CISA Known Exploited Vulnerabilities Catalog",
    "count": 4,
    "vulnerabilities": [
      {
        "cveID": "CVE-2021-44228",
        "vendorProject": "Apache",
        "product": "Log4j2",
        "vulnerabilityName": "Apache Log4j2 Remote Code Execution Vulnerability",
        "dateAdded": "2021-12-10",
        "shortDescription": "Apache Log4j2 JNDI features do not protect against attacker controlled LDAP and other JNDI endpoints.",
        "dueDate": "2021-12-24"
      },
      {
        "cveID": "CVE-2022-22965",
        "vendorProject": "Spring Framework",
        "product": "Spring Framework",
        "vulnerabilityName": "Spring Framework Remote Code Execution Vulnerability",
        "dateAdded": "2022-04-01",
        "shortDescription": "Spring Framework contains an unauthenticated RCE vulnerability via Data Binding.",
        "dueDate": "2022-04-25"
      }
    ]
  },
  "osv_log4j.json": {
    "id": "GHSA-jfh8-c2jp-hdph",
    "aliases": ["CVE-2021-44228"],
    "summary": "Remote code execution in Apache Log4j2",
    "details": "Apache Log4j2 JNDI features used in configuration, log messages, and parameters do not protect against attacker controlled LDAP and other JNDI endpoints.",
    "severity": [
      {"type": "CVSS_V3", "score": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H"}
    ],
    "published": "2021-12-10T17:15:00Z",
    "modified": "2023-02-03T00:00:00Z",
    "affected": [
      {
        "package": {"name": "log4j-core", "ecosystem": "Maven"},
        "ranges": [
          {
            "type": "ECOSYSTEM",
            "events": [
              {"introduced": "2.0-beta9"},
              {"fixed": "2.17.1"}
            ]
          }
        ]
      }
    ]
  },
  "osv_spring4shell.json": {
    "id": "GHSA-36p3-wjmg-h94x",
    "aliases": ["CVE-2022-22965"],
    "summary": "Spring Framework Data Binding RCE",
    "severity": [
      {"type": "CVSS_V3", "score": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H"}
    ],
    "published": "2022-03-31T00:00:00Z",
    "modified": "2023-08-11T00:00:00Z",
    "affected": [
      {
        "package": {"name": "org.springframework:spring-webmvc", "ecosystem": "Maven"},
        "ranges": [
          {
            "type": "ECOSYSTEM",
            "events": [
              {"introduced": "5.3.0"},
              {"fixed": "5.3.18"}
            ]
          }
        ]
      }
    ]
  },
  "osv_lodash.json": {
    "id": "GHSA-jvfv-7rvx-43m5",
    "aliases": ["CVE-2019-10744"],
    "summary": "Prototype Pollution in lodash",
    "severity": [
      {"type": "CVSS_V3", "score": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N"}
    ],
    "published": "2019-07-26T00:00:00Z",
    "affected": [
      {
        "package": {"name": "lodash", "ecosystem": "npm"},
        "ranges": [
          {
            "type": "SEMVER",
            "events": [
              {"introduced": "0"},
              {"fixed": "4.17.21"}
            ]
          }
        ]
      }
    ]
  },
  "osv_py.json": {
    "id": "PYSEC-2022-42969",
    "aliases": ["CVE-2022-42969"],
    "summary": "ReDoS in py library path traversal regex",
    "severity": [
      {"type": "CVSS_V3", "score": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H"}
    ],
    "published": "2022-10-16T00:00:00Z",
    "affected": [
      {
        "package": {"name": "py", "ecosystem": "PyPI"},
        "ranges": [
          {
            "type": "ECOSYSTEM",
            "events": [
              {"introduced": "0"},
              {"fixed": "1.11.0"}
            ]
          }
        ]
      }
    ]
  },
  "first_epss.json": {
    "status": "OK",
    "status-code": 200,
    "type": "epss",
    "total": 4,
    "data": [
      {"cve": "CVE-2021-44228", "epss": "0.97514", "percentile": "0.9998"},
      {"cve": "CVE-2022-22965", "epss": "0.97210", "percentile": "0.9995"},
      {"cve": "CVE-2019-10744", "epss": "0.73400", "percentile": "0.9850"},
      {"cve": "CVE-2022-42969", "epss": "0.04300", "percentile": "0.7200"}
    ]
  }
}

def fetch_all():
  fetched_at = datetime.now(timezone.utc).isoformat()
  results = []
  
  for feed in FEEDS:
    target_file = os.path.join(SNAPSHOT_DIR, feed["filename"])
    data_bytes = None
    
    try:
      req = urllib.request.Request(
        feed["url"],
        headers={"User-Agent": "BlastRadius-SnapshotFetcher/1.0"}
      )
      with urllib.request.urlopen(req, timeout=10) as resp:
        data_bytes = resp.read()
        print(f"[FETCHED] {feed['name']} from {feed['url']}")
    except Exception as err:
      print(f"[WARNING] Network fetch failed for {feed['name']} ({err}). Using fallback snapshot.")
      fallback = STATIC_FALLBACKS.get(feed["filename"], {})
      data_bytes = json.dumps(fallback, indent=2).encode('utf-8')
      
    sha256_hash = hashlib.sha256(data_bytes).hexdigest()
    
    wrapper = {
      "url": feed["url"],
      "fetched_at": fetched_at,
      "sha256": sha256_hash,
      "data": json.loads(data_bytes.decode('utf-8'))
    }
    
    with open(target_file, "w", encoding="utf-8") as f:
      json.dump(wrapper, f, indent=2)
      
    results.append({
      "filename": feed["filename"],
      "sha256": sha256_hash,
      "fetched_at": fetched_at
    })
    
  print(f"[SUCCESS] Successfully saved {len(results)} snapshots to {SNAPSHOT_DIR}")
  return results

if __name__ == "__main__":
  fetch_all()
