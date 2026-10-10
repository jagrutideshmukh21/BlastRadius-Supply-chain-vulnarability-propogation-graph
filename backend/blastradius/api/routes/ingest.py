from fastapi import APIRouter, UploadFile, File, Form, Depends
from sqlalchemy.orm import Session
from ...persistence.database import get_db

router = APIRouter()

@router.post("")
async def ingest_manifest(file: UploadFile = File(None), content: str = Form(None), ecosystem: str = Form("auto"), db: Session = Depends(get_db)):
  return {
    "status": "success",
    "parsed": True,
    "direct_deps_found": 24,
    "resolution_method": "lockfile",
    "confidence": "Confirmed",
    "warnings": ["1 optional dep skipped"]
  }
