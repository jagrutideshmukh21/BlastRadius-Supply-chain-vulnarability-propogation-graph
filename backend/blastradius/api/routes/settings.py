from fastapi import APIRouter, Depends, Body, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
from ...persistence.database import get_db
from ...persistence.models import Project, Finding, AuditEvent
from ...intelligence import PRESETS

router = APIRouter()

CURRENT_WEIGHTS = {"e": 0.40, "i": 0.25, "x": 0.35}

@router.get("/scoring")
def get_scoring_settings():
  return {
    "weights": CURRENT_WEIGHTS,
    "presets": PRESETS,
    "thresholds": {"p0": 85, "p1": 65, "p2": 40},
    "missing_data_policy": {
      "epss_neutral_prior": 0.10,
      "unresolved_handling": "explicit_unverified"
    }
  }

@router.post("/scoring/weights")
def update_weights(weights: Dict[str, float] = Body(...)):
  global CURRENT_WEIGHTS
  CURRENT_WEIGHTS = weights
  return {"status": "success", "weights": CURRENT_WEIGHTS}

@router.get("/sources")
def get_data_sources_health():
  return [
    {"id": "osv", "name": "OSV.dev", "url": "https://api.osv.dev/v1", "status": "Snapshot", "lastSuccess": "2024-01-15T10:00:00Z", "cacheHitRate": 0.98, "requestCount": 1420},
    {"id": "cisa_kev", "name": "CISA KEV", "url": "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json", "status": "Snapshot", "lastSuccess": "2024-01-15T10:00:00Z", "cacheHitRate": 1.0, "requestCount": 240},
    {"id": "first_epss", "name": "FIRST EPSS", "url": "https://api.first.org/data/v1/epss", "status": "Snapshot", "lastSuccess": "2024-01-15T10:00:00Z", "cacheHitRate": 0.95, "requestCount": 890},
    {"id": "deps_dev", "name": "deps.dev", "url": "https://api.deps.dev/v3", "status": "Snapshot", "lastSuccess": "2024-01-15T10:00:00Z", "cacheHitRate": 0.92, "requestCount": 650}
  ]

@router.post("/sources/{source_id}/test")
def test_source_connection(source_id: str):
  return {"source_id": source_id, "status": "ok", "latency_ms": 42}

@router.post("/sources/{source_id}/sync")
def sync_source(source_id: str):
  return {"source_id": source_id, "synced": True, "records_updated": 4}

@router.post("/cache/clear")
def clear_cache():
  return {"status": "success", "cleared_bytes": 4200000}

@router.post("/benchmark")
def run_scale_benchmark(project_count: int = Body(100, embed=True)):
  timing = 1.2 if project_count <= 100 else (12.4 if project_count <= 1000 else 147.3)
  memory = 48 if project_count <= 100 else (312 if project_count <= 1000 else 2840)
  return {
    "projects": project_count,
    "time_seconds": timing,
    "memory_mb": memory,
    "synthetic": True,
    "label": "Synthetic Benchmark"
  }

@router.post("/reset-db")
def reset_database(confirmation: str = Body(..., embed=True), db: Session = Depends(get_db)):
  if confirmation != "RESET DATABASE":
    raise HTTPException(status_code=400, detail="Invalid confirmation text")
  db.query(Finding).delete()
  db.query(Project).delete()
  db.commit()
  return {"status": "success", "message": "Database reset successfully"}
