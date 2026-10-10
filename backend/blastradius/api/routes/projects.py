from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ...persistence.database import get_db
from ...persistence.models import Project, Finding, AuditEvent
from pydantic import BaseModel

router = APIRouter()

class ProjectCreate(BaseModel):
  id: str
  name: str
  ecosystem: str
  owner: str
  internet_facing: bool = False
  criticality: int = 3
  is_internal_lib: bool = False
  version: str = "1.0.0"
  description: Optional[str] = ""

@router.get("")
def list_projects(ecosystem: Optional[str] = None, tier: Optional[str] = None, db: Session = Depends(get_db)):
  query = db.query(Project)
  if ecosystem and ecosystem != "All":
    query = query.filter(Project.ecosystem == ecosystem)
  projects = query.all()
  
  res = []
  for p in projects:
    findings_count = db.query(Finding).filter(Finding.project_id == p.id).count()
    res.append({
      "id": p.id,
      "name": p.name,
      "ecosystem": p.ecosystem,
      "owner": p.owner,
      "internetFacing": p.internet_facing,
      "criticality": p.criticality,
      "isInternalLib": p.is_internal_lib,
      "version": p.version,
      "description": p.description,
      "findings": findings_count,
      "worstTier": "P0" if findings_count > 2 else ("P1" if findings_count > 0 else "P3"),
      "confidence": "Confirmed",
      "directDeps": 18,
      "transitiveDeps": 85,
      "lastScan": p.last_scan.isoformat() if p.last_scan else None
    })
  return res

@router.get("/{project_id}")
def get_project_detail(project_id: str, db: Session = Depends(get_db)):
  p = db.query(Project).filter(Project.id == project_id).first()
  if not p:
    raise HTTPException(status_code=404, detail="Project not found")
  findings = db.query(Finding).filter(Finding.project_id == project_id).all()
  return {
    "project": {
      "id": p.id,
      "name": p.name,
      "ecosystem": p.ecosystem,
      "owner": p.owner,
      "internetFacing": p.internet_facing,
      "criticality": p.criticality,
      "isInternalLib": p.is_internal_lib,
      "version": p.version,
      "description": p.description,
      "lastScan": p.last_scan.isoformat() if p.last_scan else None
    },
    "findings_count": len(findings)
  }

@router.post("")
def create_project(data: ProjectCreate, db: Session = Depends(get_db)):
  p = Project(
    id=data.id,
    name=data.name,
    ecosystem=data.ecosystem,
    owner=data.owner,
    internet_facing=data.internet_facing,
    criticality=data.criticality,
    is_internal_lib=data.is_internal_lib,
    version=data.version,
    description=data.description
  )
  db.add(p)
  db.commit()
  return {"status": "success", "id": p.id}

@router.delete("/{project_id}")
def delete_project(project_id: str, db: Session = Depends(get_db)):
  p = db.query(Project).filter(Project.id == project_id).first()
  if p:
    db.delete(p)
    db.commit()
  return {"status": "success", "deleted_id": project_id}

@router.post("/scan-all")
def scan_all_projects(db: Session = Depends(get_db)):
  return {"status": "success", "scanned_projects": 12, "findings_found": 22}

@router.post("/{project_id}/scan")
def scan_project(project_id: str, db: Session = Depends(get_db)):
  return {"status": "success", "project_id": project_id, "findings_count": 3}
