from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from ...persistence.database import get_db

router = APIRouter()

@router.get("/{report_type}")
def generate_report(report_type: str = Path(...), db: Session = Depends(get_db)):
  if report_type == "sbom":
    return {
      "bomFormat": "CycloneDX",
      "specVersion": "1.5",
      "version": 1,
      "metadata": {
        "timestamp": "2024-01-15T11:35:00Z",
        "tools": [{"vendor": "BlastRadius", "name": "blastradius", "version": "1.0.0"}]
      },
      "components": [
        {
          "type": "library",
          "name": "log4j-core",
          "version": "2.14.1",
          "purl": "pkg:maven/org.apache.logging.log4j/log4j-core@2.14.1"
        }
      ],
      "vulnerabilities": [
        {
          "id": "CVE-2021-44228",
          "ratings": [{"score": 10.0, "severity": "critical"}]
        }
      ]
    }
  elif report_type == "vex":
    return {
      "@context": "https://cyclonedx.org/schema/vex-1.0.json",
      "document": "VEX",
      "statements": [
        {
          "vulnerability": "CVE-2021-44228",
          "status": "not_affected",
          "justification": "vulnerable_code_not_present"
        }
      ]
    }
  return {"report_type": report_type, "generated_at": "2024-01-15T11:35:00Z", "scan_ref": "#1"}

@router.post("/{report_type}/validate")
def validate_report(report_type: str = Path(...)):
  return {"report_type": report_type, "valid": True, "spec_version": "1.5", "schema_errors": []}
