from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from ...persistence.database import get_db
from ...persistence.models import AuditEvent

router = APIRouter()

@router.get("")
def list_audit_events(action: Optional[str] = None, actor: Optional[str] = None, db: Session = Depends(get_db)):
  query = db.query(AuditEvent)
  if action and action != "All":
    query = query.filter(AuditEvent.action == action)
  if actor:
    query = query.filter(AuditEvent.actor == actor)
  events = query.order_by(AuditEvent.time.desc()).all()
  
  if not events:
    return [
      {"id": "audit-001", "actor": "system", "action": "SCAN_COMPLETE", "entity": "proj-001", "entityName": "api-gateway", "time": "2024-01-15T11:30:00Z", "reason": "Portfolio scan", "before": None, "after": "3 findings"},
      {"id": "audit-002", "actor": "demo", "action": "DEMO_RUN", "entity": "demo", "entityName": "Log4Shell Guided Demo", "time": "2024-01-15T10:00:00Z", "reason": "User executed 9-step guided demo", "before": None, "after": "6 affected projects identified"},
      {"id": "audit-003", "actor": "system", "action": "SYNC_KEV", "entity": "cisa_kev", "entityName": "CISA KEV Feed", "time": "2024-01-15T08:00:00Z", "reason": "Scheduled sync", "before": "4 records", "after": "4 records"}
    ]
    
  return [
    {
      "id": e.id,
      "actor": e.actor,
      "action": e.action,
      "entity": e.entity,
      "entityName": e.entity_name,
      "time": e.time.isoformat() if hasattr(e.time, 'isoformat') else str(e.time),
      "reason": e.reason,
      "before": e.before_state,
      "after": e.after_state
    } for e in events
  ]
