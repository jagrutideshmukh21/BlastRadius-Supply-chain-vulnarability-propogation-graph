"""
FastAPI Main Application for BlastRadius
Provides full REST API covering every control in the Per-Page Control Inventory.
"""

import os
import sys
import time
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from ..persistence.service import seed_database_if_empty, init_db_tables

# Initialize DB on startup
init_db_tables()
seed_database_if_empty()

app = FastAPI(
  title="BlastRadius API",
  description="Supply-Chain Vulnerability Propagation Graph API for CISA CSB-03 Problem",
  version="1.0.0",
  docs_url="/docs",
  redoc_url="/redoc"
)

# CORS Allowlist
app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

# Security headers & Central error handling middleware
@app.middleware("http")
async def add_security_headers_and_error_handling(request: Request, call_next):
  start_time = time.time()
  try:
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Server"] = "BlastRadius/1.0"
    return response
  except Exception as exc:
    # Central error handler without leaking internal stack traces to users
    return JSONResponse(
      status_code=500,
      content={
        "error": "Internal Server Error",
        "message": str(exc),
        "request_id": request.headers.get("X-Request-ID", "req-000")
      }
    )

# Basic Health check
@app.get("/api/health")
def health_check():
  return {
    "status": "healthy",
    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
    "mode": "Snapshot",
    "version": "1.0.0"
  }

# Route Imports
from .routes import (
  demo_router, projects_router, ingest_router, graph_router,
  impact_router, risk_router, advisories_router, patch_router,
  timemachine_router, reports_router, alerts_router, audit_router,
  settings_router, search_router, osv_live_router, trust_router, policy_router
)

app.include_router(demo_router, prefix="/api/demo", tags=["Demo"])
app.include_router(projects_router, prefix="/api/projects", tags=["Projects"])
app.include_router(ingest_router, prefix="/api/ingest", tags=["Ingest"])
app.include_router(graph_router, prefix="/api/graph", tags=["Graph"])
app.include_router(impact_router, prefix="/api/impact", tags=["Impact"])
app.include_router(risk_router, prefix="/api/risk", tags=["Risk"])
app.include_router(advisories_router, prefix="/api/advisories", tags=["Advisories"])
app.include_router(patch_router, prefix="/api/patch", tags=["Patch Planner"])
app.include_router(timemachine_router, prefix="/api/timemachine", tags=["Time Machine"])
app.include_router(reports_router, prefix="/api/reports", tags=["Reports & SBOM"])
app.include_router(alerts_router, prefix="/api/alerts", tags=["Alerts & Watchlist"])
app.include_router(audit_router, prefix="/api/audit", tags=["Audit Log"])
app.include_router(settings_router, prefix="/api/settings", tags=["Settings"])
app.include_router(search_router, prefix="/api/search", tags=["Global Search"])
app.include_router(osv_live_router, prefix="/api/osv", tags=["OSV.dev Live"])
app.include_router(trust_router, prefix="/api/trust", tags=["Supply Chain Trust"])
app.include_router(policy_router, prefix="/api/policy", tags=["CI/CD Policy Gate"])
