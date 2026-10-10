from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from ...persistence.database import get_db
from ...persistence.models import Advisory
from ...intelligence import simulate_zero_day_scenario
from ...graph import DependencyGraph

router = APIRouter()

@router.get("")
def list_advisories(severity: Optional[str] = None, kev_only: bool = False, db: Session = Depends(get_db)):
  query = db.query(Advisory)
  if kev_only:
    query = query.filter(Advisory.kev == True)
  if severity and severity != "All":
    query = query.filter(Advisory.severity == severity)
  advisories = query.all()
  return advisories

@router.get("/{advisory_id}")
def get_advisory_detail(advisory_id: str, db: Session = Depends(get_db)):
  adv = db.query(Advisory).filter(Advisory.id == advisory_id).first()
  if not adv:
    raise HTTPException(status_code=404, detail="Advisory not found")
  return adv

@router.post("/zero-day-simulate")
def zero_day_simulate(package: str = Query("log4j-core"), version: str = Query("2.14.1"), db: Session = Depends(get_db)):
  g = DependencyGraph()
  g.add_project("proj-001", "api-gateway", {})
  g.add_package("log4j-core@2.14.1", "log4j-core", "2.14.1", "Maven")
  g.add_dependency("proj-001", "log4j-core@2.14.1")
  
  res = simulate_zero_day_scenario(g, package, version)
  return res
