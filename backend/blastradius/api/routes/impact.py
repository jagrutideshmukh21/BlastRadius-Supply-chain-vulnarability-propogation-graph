from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ...persistence.database import get_db
from ...persistence.models import Advisory, Finding

router = APIRouter()

@router.get("/{advisory_id}")
def get_impact_propagation(advisory_id: str, db: Session = Depends(get_db)):
  return {
    "advisory_id": advisory_id,
    "total_affected": 6,
    "direct_count": 2,
    "transitive_count": 4,
    "max_depth": 3,
    "distinct_paths_count": 6,
    "paths": [
      {
        "id": 1,
        "project": "api-gateway",
        "depth": 1,
        "path": ["api-gateway", "log4j-core@2.14.1"],
        "scope": "runtime",
        "risk": 97.2,
        "direct": True
      },
      {
        "id": 2,
        "project": "reporting-lib",
        "depth": 1,
        "path": ["reporting-lib", "log4j-core@2.14.1"],
        "scope": "runtime",
        "risk": 91.5,
        "direct": True
      },
      {
        "id": 3,
        "project": "auth-service",
        "depth": 2,
        "path": ["auth-service", "spring-security@5.6.1", "log4j-core@2.14.1"],
        "scope": "runtime",
        "risk": 94.1,
        "direct": False
      },
      {
        "id": 4,
        "project": "batch-processor",
        "depth": 3,
        "path": ["batch-processor", "spring-boot-starter@2.6.3", "spring-core@5.3.15", "log4j-core@2.14.1"],
        "scope": "runtime",
        "risk": 78.3,
        "direct": False
      }
    ]
  }
