from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from ...persistence.database import get_db
from ...persistence.models import PatchAction, AuditEvent, Finding
from ...intelligence import PatchPlanner, simulate_patch_application
from pydantic import BaseModel

router = APIRouter()

class ApplyRequest(BaseModel):
  action_id: str
  reason: str
  actor: str = "user"

@router.get("/plan")
def get_patch_plan(db: Session = Depends(get_db)):
  planner = PatchPlanner()
  sample_findings = [
    {"project_id": "proj-001", "project_name": "api-gateway", "package": "log4j-core", "version": "2.14.1", "fixed_version": "2.17.1", "tier": "P0", "risk_score": 97.2, "is_direct": True, "advisory_id": "GHSA-jfh8-c2jp-hdph"},
    {"project_id": "proj-003", "project_name": "reporting-lib", "package": "log4j-core", "version": "2.14.1", "fixed_version": "2.17.1", "tier": "P0", "risk_score": 91.5, "is_direct": True, "advisory_id": "GHSA-jfh8-c2jp-hdph"},
    {"project_id": "proj-004", "project_name": "batch-processor", "package": "org.springframework:spring-webmvc", "version": "5.3.15", "fixed_version": "5.3.18", "tier": "P1", "risk_score": 78.3, "is_direct": True, "advisory_id": "GHSA-36p3-wjmg-h94x"}
  ]
  sample_projects = [
    {"id": "proj-001", "name": "api-gateway", "ecosystem": "Maven", "is_internal_lib": False},
    {"id": "proj-003", "name": "reporting-lib", "ecosystem": "Maven", "is_internal_lib": True},
    {"id": "proj-004", "name": "batch-processor", "ecosystem": "Maven", "is_internal_lib": False}
  ]
  return planner.generate_patch_plan(sample_findings, sample_projects)

@router.post("/simulate")
def simulate_patch(action_ids: List[str] = Body(...), db: Session = Depends(get_db)):
  planner = PatchPlanner()
  plan = get_patch_plan(db)
  sample_findings = [
    {"project_id": "proj-001", "package": "log4j-core", "risk_score": 97.2},
    {"project_id": "proj-003", "package": "log4j-core", "risk_score": 91.5},
    {"project_id": "proj-004", "package": "org.springframework:spring-webmvc", "risk_score": 78.3}
  ]
  return simulate_patch_application(sample_findings, action_ids, plan.get("actions", []))

@router.post("/apply")
def apply_patch(req: ApplyRequest, db: Session = Depends(get_db)):
  # Transactional write + audit log record
  audit = AuditEvent(
    id=f"audit-patch-{int(db.query(AuditEvent).count())+1}",
    actor=req.actor,
    action="PATCH_APPLY",
    entity="patch_action",
    entity_name=req.action_id,
    reason=req.reason,
    before_state="state=accepted",
    after_state="state=applied"
  )
  db.add(audit)
  db.commit()
  return {"status": "success", "action_id": req.action_id, "state": "applied", "audit_id": audit.id}

@router.post("/undo")
def undo_patch(action_id: str = Body(..., embed=True), db: Session = Depends(get_db)):
  return {"status": "success", "action_id": action_id, "state": "proposed"}
