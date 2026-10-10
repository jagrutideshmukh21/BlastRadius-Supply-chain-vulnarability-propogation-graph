"""
CI/CD Policy Gate Evaluation Engine & SARIF 2.1.0 Generator
Provides release gating decisions (PASS, WARN, FAIL, REVIEW), profile management, and SARIF export.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

POLICY_PROFILES: Dict[str, Dict[str, Any]] = {
    "strict-production": {
        "name": "Strict Production Gate",
        "description": "Zero tolerance for active CISA KEVs or unverified critical supply-chain risks in production releases.",
        "rules": {
            "block_on_kev": True,
            "max_cvss": 7.0,
            "max_risk_score": 65.0,
            "block_p0": True,
            "min_trust_score": 5.0,
            "require_reachability_confirmed": True,
            "allow_unverified_confidence": False,
            "max_transitive_depth": 4
        }
    },
    "balanced-risk": {
        "name": "Balanced Enterprise Gate",
        "description": "Blocks confirmed reachable critical vulnerabilities while allowing low-exploitability transitive findings.",
        "rules": {
            "block_on_kev": True,
            "max_cvss": 8.5,
            "max_risk_score": 80.0,
            "block_p0": True,
            "min_trust_score": 3.5,
            "require_reachability_confirmed": False,
            "allow_unverified_confidence": True,
            "max_transitive_depth": 5
        }
    },
    "dev-environment": {
        "name": "Development / Staging Gate",
        "description": "Non-blocking notifications designed for rapid developer feedback and staging builds.",
        "rules": {
            "block_on_kev": False,
            "max_cvss": 9.8,
            "max_risk_score": 90.0,
            "block_p0": False,
            "min_trust_score": 0.0,
            "require_reachability_confirmed": False,
            "allow_unverified_confidence": True,
            "max_transitive_depth": 6
        }
    }
}

def evaluate_project_policy(
    project_id: str,
    project_name: str,
    findings: List[Dict[str, Any]],
    profile_id: str = "balanced-risk",
    custom_rules: Optional[Dict[str, Any]] = None,
    exceptions: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Evaluates a project against policy rules and returns PASS, WARN, FAIL, or REVIEW decision.
    """
    profile = POLICY_PROFILES.get(profile_id, POLICY_PROFILES["balanced-risk"])
    rules = profile["rules"].copy()
    if custom_rules:
        rules.update(custom_rules)

    active_exceptions = exceptions or []
    exceptions_applied = []

    violations: List[Dict[str, Any]] = []
    warnings: List[Dict[str, Any]] = []
    review_reasons: List[str] = []

    # Check for empty findings: instant PASS
    if not findings or len(findings) == 0:
        return {
            "decision": "PASS",
            "project_id": project_id,
            "project_name": project_name,
            "profile": profile_id,
            "violations_count": 0,
            "warnings_count": 0,
            "reasons": ["No vulnerable dependencies identified. Project satisfies all policy criteria."],
            "evaluated_at": datetime.now(timezone.utc).isoformat(),
            "violations": [],
            "warnings": [],
            "exceptions_applied": []
        }

    for f in findings:
        pkg = f.get("package", "unknown")
        advisory = f.get("advisoryId", f.get("cve", "CVE-UNKNOWN"))
        is_kev = f.get("kev", False)
        cvss = f.get("cvss", 0.0)
        score = f.get("riskScore", 0.0)
        tier = f.get("tier", "P3")
        depth = f.get("depth", 1)
        trust_score = f.get("trustScore")
        confidence = f.get("confidence", "Confirmed")
        reachability = f.get("reachability", "UNKNOWN")

        # Check if finding is exempt
        is_exempt = False
        for ex in active_exceptions:
            if ex.get("advisory") == advisory or ex.get("package") == pkg:
                is_exempt = True
                exceptions_applied.append({
                    "advisory": advisory,
                    "package": pkg,
                    "reason": ex.get("justification", "Approved temporary business exception")
                })
                break
        if is_exempt:
            continue

        # Rule 1: CISA KEV Block
        if rules.get("block_on_kev") and is_kev:
            violations.append({
                "rule": "BLASTRADIUS-RULE-KEV",
                "severity": "CRITICAL",
                "message": f"Package {pkg} ({advisory}) is listed on CISA KEV with active exploitation.",
                "remediation": f"Upgrade {pkg} to safe version immediately or apply parent patch."
            })

        # Rule 2: Tier P0 Block
        if rules.get("block_p0") and tier == "P0":
            violations.append({
                "rule": "BLASTRADIUS-RULE-TIER-P0",
                "severity": "CRITICAL",
                "message": f"Package {pkg} has P0 risk tier score ({score}). Exceeds allowable threshold.",
                "remediation": "Apply Fix-Once patch action before merging to release branch."
            })

        # Rule 3: Max CVSS Violation
        if cvss > rules.get("max_cvss", 10.0):
            violations.append({
                "rule": "BLASTRADIUS-RULE-CVSS",
                "severity": "HIGH",
                "message": f"Finding {advisory} has CVSS {cvss}, exceeding policy maximum {rules.get('max_cvss')}.",
                "remediation": "Upgrade component version."
            })

        # Rule 4: Trust Scorecard requirement
        if trust_score is not None and trust_score < rules.get("min_trust_score", 0.0):
            warnings.append({
                "rule": "BLASTRADIUS-RULE-TRUST",
                "severity": "MEDIUM",
                "message": f"Upstream repo for {pkg} has Scorecard rating {trust_score} < {rules.get('min_trust_score')}.",
                "remediation": "Review repository branch protection and release signing practices."
            })

        # Uncertainty check
        if confidence == "Unverified" and not rules.get("allow_unverified_confidence"):
            review_reasons.append(f"Unverified version resolution for {pkg} requires security team review.")

        if reachability == "UNKNOWN" and rules.get("require_reachability_confirmed"):
            review_reasons.append(f"Reachability evidence for {pkg} ({advisory}) is unknown.")

    # Determine Decision Status: Precedence: REVIEW -> FAIL -> WARN -> PASS
    if len(review_reasons) > 0 and len(violations) == 0:
        decision = "REVIEW"
    elif len(violations) > 0:
        decision = "FAIL"
    elif len(warnings) > 0:
        decision = "WARN"
    else:
        decision = "PASS"

    return {
        "decision": decision,
        "project_id": project_id,
        "project_name": project_name,
        "profile": profile_id,
        "violations_count": len(violations),
        "warnings_count": len(warnings),
        "reasons": review_reasons if decision == "REVIEW" else [v["message"] for v in violations[:3]] or ["All mandatory gate rules satisfied."],
        "evaluated_at": datetime.now(timezone.utc).isoformat(),
        "violations": violations,
        "warnings": warnings,
        "exceptions_applied": exceptions_applied
    }

def generate_sarif_report(evaluation: Dict[str, Any]) -> Dict[str, Any]:
    """
    Transforms policy evaluation findings into standard SARIF 2.1.0 format
    suitable for GitHub Code Scanning and enterprise SIEM ingest.
    """
    rules_dict = {}
    results = []

    for v in evaluation.get("violations", []) + evaluation.get("warnings", []):
        rule_id = v.get("rule", "BLASTRADIUS-SEC-001")
        if rule_id not in rules_dict:
            rules_dict[rule_id] = {
                "id": rule_id,
                "name": rule_id.replace("BLASTRADIUS-", "").replace("-", " ").title(),
                "shortDescription": {"text": v.get("message", "")},
                "fullDescription": {"text": f"Supply-chain policy enforcement rule: {rule_id}"},
                "help": {"text": v.get("remediation", "Upgrade affected dependency to remediate.")},
                "properties": {
                    "tags": ["security", "supply-chain", "cisa-kev"]
                }
            }

        level = "error" if v.get("severity") == "CRITICAL" else ("warning" if v.get("severity") == "HIGH" else "note")
        results.append({
            "ruleId": rule_id,
            "level": level,
            "message": {"text": v.get("message", "")},
            "locations": [
                {
                    "physicalLocation": {
                        "artifactLocation": {"uri": f"manifests/{evaluation.get('project_name', 'project')}/manifest"},
                        "region": {"startLine": 1, "startColumn": 1}
                    }
                }
            ]
        })

    return {
        "$schema": "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
        "version": "2.1.0",
        "runs": [
            {
                "tool": {
                    "driver": {
                        "name": "BlastRadius Policy Gate",
                        "version": "1.0.0",
                        "informationUri": "https://github.com/cisa/blastradius",
                        "rules": list(rules_dict.values())
                    }
                },
                "results": results
            }
        ]
    }
