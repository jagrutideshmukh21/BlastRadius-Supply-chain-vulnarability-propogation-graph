"""
API Routes for CI/CD Policy Gate & SARIF Export
"""

from fastapi import APIRouter, HTTPException, Query, Body
from typing import Optional, List, Dict, Any
from ...intelligence.policy import (
    POLICY_PROFILES,
    evaluate_project_policy,
    generate_sarif_report
)

router = APIRouter()

@router.get("/profiles")
def get_policy_profiles():
    """
    Returns available policy gate profiles (Strict Production, Balanced Risk, Dev Environment).
    """
    return {
        "profiles": [
            {"id": k, **v}
            for k, v in POLICY_PROFILES.items()
        ]
    }

@router.post("/evaluate")
def evaluate_gate(payload: Dict[str, Any] = Body(...)):
    """
    Evaluates project findings against selected policy profile.
    Returns PASS, WARN, FAIL, or REVIEW.
    """
    project_id = payload.get("project_id", "proj-001")
    project_name = payload.get("project_name", "api-gateway")
    profile_id = payload.get("profile_id", "balanced-risk")
    findings = payload.get("findings", [])
    custom_rules = payload.get("custom_rules")
    exceptions = payload.get("exceptions")

    result = evaluate_project_policy(
        project_id=project_id,
        project_name=project_name,
        findings=findings,
        profile_id=profile_id,
        custom_rules=custom_rules,
        exceptions=exceptions
    )
    return result

@router.post("/export/sarif")
def export_sarif(payload: Dict[str, Any] = Body(...)):
    """
    Generates standard SARIF 2.1.0 JSON report from evaluation results.
    """
    evaluation = payload.get("evaluation")
    if not evaluation:
        # Generate default evaluation for current project
        evaluation = evaluate_project_policy(
            project_id=payload.get("project_id", "proj-001"),
            project_name=payload.get("project_name", "api-gateway"),
            findings=payload.get("findings", []),
            profile_id=payload.get("profile_id", "balanced-risk")
        )

    sarif = generate_sarif_report(evaluation)
    return sarif
