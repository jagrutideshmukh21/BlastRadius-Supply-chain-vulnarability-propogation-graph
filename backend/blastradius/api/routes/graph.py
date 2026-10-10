from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from ...persistence.database import get_db

router = APIRouter()

@router.get("")
def get_graph_data(advisory: str = Query(None), project: str = Query(None), layout: str = Query("dagre"), db: Session = Depends(get_db)):
  return {
    "nodes": [
      {"id": "n-api-gateway", "label": "api-gateway", "type": "project", "tier": "P0", "x": 400, "y": 100},
      {"id": "n-auth-service", "label": "auth-service", "type": "project", "tier": "P0", "x": 100, "y": 100},
      {"id": "n-reporting-lib", "label": "reporting-lib", "type": "project", "tier": "P0", "x": 700, "y": 100},
      {"id": "n-log4j", "label": "log4j-core\n2.14.1", "type": "package-vuln", "advisoryId": "GHSA-jfh8-c2jp-hdph", "x": 400, "y": 300},
      {"id": "n-spring-security", "label": "spring-security\n5.6.1", "type": "package-safe", "x": 100, "y": 200},
      {"id": "n-spring-webmvc", "label": "spring-webmvc\n5.3.15", "type": "package-vuln", "advisoryId": "GHSA-36p3-wjmg-h94x", "x": 700, "y": 250},
      {"id": "n-batch-processor", "label": "batch-processor", "type": "project", "tier": "P1", "x": 700, "y": 400}
    ],
    "edges": [
      {"source": "n-api-gateway", "target": "n-log4j", "scope": "runtime"},
      {"source": "n-auth-service", "target": "n-spring-security", "scope": "runtime"},
      {"source": "n-spring-security", "target": "n-log4j", "scope": "runtime"},
      {"source": "n-reporting-lib", "target": "n-log4j", "scope": "runtime"},
      {"source": "n-reporting-lib", "target": "n-spring-webmvc", "scope": "runtime"},
      {"source": "n-batch-processor", "target": "n-spring-webmvc", "scope": "runtime"}
    ],
    "layout": layout
  }
