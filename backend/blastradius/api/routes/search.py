from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from ...persistence.database import get_db
from ...persistence.models import Project, Advisory

router = APIRouter()

@router.get("")
def global_search(q: str = Query("", min_length=1), db: Session = Depends(get_db)):
  query = q.lower()
  results = []
  
  projects = db.query(Project).filter(Project.name.ilike(f"%{query}%")).all()
  for p in projects:
    results.append({
      "type": "project",
      "id": p.id,
      "title": p.name,
      "subtitle": f"{p.ecosystem} · {p.owner}",
      "url": f"/projects/{p.id}"
    })
    
  advisories = db.query(Advisory).filter(Advisory.package.ilike(f"%{query}%")).all()
  for a in advisories:
    results.append({
      "type": "advisory",
      "id": a.id,
      "title": a.id,
      "subtitle": f"{a.package} · CVSS {a.cvss}",
      "url": f"/advisories/{a.id}"
    })
    
  return results
