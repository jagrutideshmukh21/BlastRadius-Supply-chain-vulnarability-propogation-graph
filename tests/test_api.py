"""
tests/test_api.py
Integration tests for FastAPI REST API endpoints
"""

import pytest
from fastapi.testclient import TestClient
from backend.blastradius.api.main import app
from backend.blastradius.persistence.database import SessionLocal
from backend.blastradius.persistence.models import AuditEvent

client = TestClient(app)

def test_api_health():
  resp = client.get("/api/health")
  assert resp.status_code == 200
  data = resp.json()
  assert data["status"] == "healthy"
  assert data["version"] == "1.0.0"

def test_api_demo_log4shell():
  resp = client.post("/api/demo/log4shell")
  assert resp.status_code == 200
  data = resp.json()
  assert data["status"] == "success"
  assert data["affected_projects"] == 6

def test_api_list_projects():
  resp = client.get("/api/projects")
  assert resp.status_code == 200
  projects = resp.json()
  assert len(projects) >= 12
  assert any(p["name"] == "api-gateway" for p in projects)

def test_api_get_impact():
  resp = client.get("/api/impact/GHSA-jfh8-c2jp-hdph")
  assert resp.status_code == 200
  data = resp.json()
  assert data["total_affected"] == 6
  assert len(data["paths"]) > 0

def test_api_get_risk():
  resp = client.get("/api/risk?preset=Balanced")
  assert resp.status_code == 200
  data = resp.json()
  assert len(data["rankings"]) > 0
  assert data["rankings"][0]["rank"] == 1

def test_api_patch_simulate_pure():
  resp = client.post("/api/patch/simulate", json=["patch-001"])
  assert resp.status_code == 200
  data = resp.json()
  assert data["simulated"] is True

def test_api_patch_apply_writes_audit():
  resp = client.post("/api/patch/apply", json={"action_id": "patch-001", "reason": "Log4Shell KEV Remediation", "actor": "security-lead"})
  assert resp.status_code == 200
  data = resp.json()
  assert data["status"] == "success"
  assert "audit_id" in data

def test_api_list_audit():
  resp = client.get("/api/audit")
  assert resp.status_code == 200
  events = resp.json()
  assert len(events) > 0

def test_api_global_search():
  resp = client.get("/api/search?q=api")
  assert resp.status_code == 200
  results = resp.json()
  assert any(r["type"] == "project" for r in results)
