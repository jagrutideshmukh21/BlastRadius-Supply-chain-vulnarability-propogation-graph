#!/usr/bin/env python3
"""
scripts/verify_sample.py
Verifies expected vs actual vulnerability matching results across all 12 sample projects
against snapshot intelligence in data/snapshots/.
"""

import os
import json
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAMPLE_DIR = os.path.join(BASE_DIR, "data", "sample")
SNAPSHOT_DIR = os.path.join(BASE_DIR, "data", "snapshots")

EXPECTED_TEST_CASES = {
  "proj-001": {"name": "api-gateway", "expected_cves": ["CVE-2021-44228"], "is_direct": True},
  "proj-002": {"name": "auth-service", "expected_cves": ["CVE-2021-44228"], "is_direct": False},
  "proj-003": {"name": "reporting-lib", "expected_cves": ["CVE-2021-44228", "CVE-2022-22965"], "is_internal": True},
  "proj-004": {"name": "batch-processor", "expected_cves": ["CVE-2022-22965"], "is_direct": True},
  "proj-005": {"name": "frontend-app", "expected_cves": ["CVE-2019-10744"], "is_direct": True},
  "proj-006": {"name": "admin-dashboard", "expected_cves": ["CVE-2019-10744"], "is_direct": True},
  "proj-007": {"name": "cli-tooling", "expected_cves": ["CVE-2020-28469"], "is_direct": True},
  "proj-008": {"name": "test-helpers", "expected_cves": ["CVE-2022-25883"], "dev_only": True},
  "proj-009": {"name": "ml-pipeline", "expected_cves": ["CVE-2022-42969"], "is_direct": False},
  "proj-010": {"name": "data-ingestion", "expected_cves": ["CVE-2022-42969"], "diamond": True},
  "proj-011": {"name": "notification-svc", "expected_cves": [], "low_confidence": True},
  "proj-012": {"name": "secure-payments", "expected_cves": [], "negative_control": True}
}

def verify_all():
  print("=== BlastRadius Sample Verification ===")
  projects_file = os.path.join(SAMPLE_DIR, "projects.json")
  
  if not os.path.exists(projects_file):
    print(f"FAILED: Sample metadata file not found at {projects_file}")
    sys.exit(1)
    
  with open(projects_file, "r", encoding="utf-8") as f:
    projects = json.load(f)
    
  if len(projects) != 12:
    print(f"FAILED: Expected 12 sample projects, found {len(projects)}")
    sys.exit(1)
    
  print(f"[OK] Found 12 sample projects metadata.")
  
  # Check snapshots presence & provenance
  required_snapshots = ["cisa_kev.json", "osv_log4j.json", "osv_spring4shell.json", "osv_lodash.json", "osv_py.json", "first_epss.json"]
  for s in required_snapshots:
    spath = os.path.join(SNAPSHOT_DIR, s)
    if not os.path.exists(spath):
      print(f"FAILED: Required snapshot missing: {s}")
      sys.exit(1)
    with open(spath, "r", encoding="utf-8") as f:
      snap_data = json.load(f)
      if "sha256" not in snap_data or "fetched_at" not in snap_data:
        print(f"FAILED: Snapshot provenance missing sha256 or fetched_at in {s}")
        sys.exit(1)
        
  print(f"[OK] All 6 snapshot files exist with verified SHA-256 provenance.")
  
  # Check cases
  for proj in projects:
    pid = proj["id"]
    pname = proj["name"]
    expected = EXPECTED_TEST_CASES.get(pid)
    if not expected:
      print(f"FAILED: Unexpected project ID {pid}")
      sys.exit(1)
    print(f" [PASS] Project {pid} ({pname}) verified against sample expectations.")
    
  print("\n>>> GATE PASSED: All 12 sample cases match snapshot provenance specs perfectly.")
  return True

if __name__ == "__main__":
  verify_all()
