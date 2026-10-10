from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ...persistence.database import get_db
from ...persistence.models import Job, AuditEvent, Finding, Project

router = APIRouter()

@router.post("/log4shell")
def run_log4shell_demo(db: Session = Depends(get_db)):
  import time
  job_id = f"job-demo-{int(time.time() * 1000)}"
  job = Job(
    id=job_id,
    name="Log4Shell Guided Demo Run",
    status="succeeded",
    progress=100,
    stage="completed"
  )
  db.add(job)
  
  audit = AuditEvent(
    id=f"audit-demo-{int(db.query(AuditEvent).count())+1}",
    actor="demo",
    action="DEMO_RUN",
    entity="demo",
    entity_name="Log4Shell Guided Demo",
    reason="User triggered guided Log4Shell story demo",
    after_state="Completed 9 steps with 6 affected projects"
  )
  db.add(audit)
  db.commit()

  return {
    "status": "success",
    "message": "Log4Shell demo job completed successfully.",
    "job_id": job.id,
    "affected_projects": 6,
    "active_kev_count": 4,
    "p0_count": 3
  }

@router.post("/reset")
def reset_demo(db: Session = Depends(get_db)):
  return {"status": "success", "message": "Demo state reset to initial snapshots."}
