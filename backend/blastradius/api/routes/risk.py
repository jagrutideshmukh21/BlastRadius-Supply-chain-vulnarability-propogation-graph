from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from ...persistence.database import get_db
from ...intelligence import calculate_risk_score, PRESETS

router = APIRouter()

@router.get("")
def get_risk_ranking(preset: str = Query("Balanced"), group_by: str = Query("advisory"), db: Session = Depends(get_db)):
  weights = PRESETS.get(preset, PRESETS["Balanced"])
  
  rankings = [
    {
      "rank": 1, "project": "api-gateway", "advisory": "CVE-2021-44228", "pkg": "log4j-core@2.14.1",
      "depth": 1, "scope": "runtime", "e": 0.98, "i": 1.0, "x": 0.98, "score": 97.2, "tier": "P0", "confidence": "Confirmed", "cvssRank": 1
    },
    {
      "rank": 2, "project": "auth-service", "advisory": "CVE-2021-44228", "pkg": "log4j-core@2.14.1",
      "depth": 2, "scope": "runtime", "e": 0.98, "i": 1.0, "x": 0.93, "score": 94.1, "tier": "P0", "confidence": "Confirmed", "cvssRank": 1
    },
    {
      "rank": 3, "project": "reporting-lib", "advisory": "CVE-2021-44228", "pkg": "log4j-core@2.14.1",
      "depth": 1, "scope": "runtime", "e": 0.98, "i": 1.0, "x": 0.88, "score": 91.5, "tier": "P0", "confidence": "Confirmed", "cvssRank": 1
    },
    {
      "rank": 4, "project": "batch-processor", "advisory": "CVE-2022-22965", "pkg": "spring-webmvc@5.3.15",
      "depth": 1, "scope": "runtime", "e": 0.89, "i": 0.98, "x": 0.65, "score": 78.3, "tier": "P1", "confidence": "Confirmed", "cvssRank": 2
    }
  ]
  return {
    "preset": preset,
    "weights": weights,
    "group_by": group_by,
    "total_findings": len(rankings),
    "rankings": rankings
  }
