from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from ...persistence.database import get_db
from ...persistence.models import Watchlist, Notification

router = APIRouter()

@router.get("/watchlist")
def get_watchlist(db: Session = Depends(get_db)):
  items = db.query(Watchlist).all()
  return [w.item for w in items] or ["CVE-2021-44228", "log4j-core", "spring-webmvc"]

@router.post("/watchlist")
def add_watchlist_item(item: str = Body(..., embed=True), db: Session = Depends(get_db)):
  w = Watchlist(id=f"w-{int(db.query(Watchlist).count())+1}", item=item)
  db.add(w)
  db.commit()
  return {"status": "success", "item": item}

@router.delete("/watchlist/{item}")
def remove_watchlist_item(item: str, db: Session = Depends(get_db)):
  db.query(Watchlist).filter(Watchlist.item == item).delete()
  db.commit()
  return {"status": "success", "removed": item}

@router.get("/notifications")
def get_notifications(db: Session = Depends(get_db)):
  notifs = db.query(Notification).all()
  if not notifs:
    return [
      {"id": "notif-001", "type": "NEW_KEV", "title": "New KEV Entry: CVE-2021-44228", "message": "Log4Shell added to CISA KEV catalog", "severity": "CRITICAL", "time": "2024-01-15T10:00:00Z", "read": False},
      {"id": "notif-002", "type": "NEW_ADVISORY", "title": "Spring4Shell Disclosed", "message": "High severity Spring Framework RCE vulnerability", "severity": "CRITICAL", "time": "2024-01-15T09:30:00Z", "read": False}
    ]
  return notifs

@router.post("/notifications/mark-all-read")
def mark_all_read(db: Session = Depends(get_db)):
  db.query(Notification).update({Notification.read: True})
  db.commit()
  return {"status": "success"}
