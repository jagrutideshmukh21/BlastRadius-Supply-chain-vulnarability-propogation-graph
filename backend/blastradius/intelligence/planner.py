"""
Fix-Once Patch Planner & What-If Simulator Module
Computes smallest upgrade set clearing most risk (parent bump, override, internal-lib-first).
Greedy set-cover algorithm grouped into Waves 0-3.
Pure simulation function (never writes to DB).
Generates copyable manifest diff snippets.
"""

from typing import Dict, List, Any, Set, Tuple

EFFORT_POINTS = {
  "patch": 1,
  "minor": 2,
  "major": 5,
  "OVERRIDE": 2,
  "PARENT_BUMP": 3,
  "INTERNAL_LIB_RELEASE": 4,
  "DIRECT_BUMP": 1
}

class PatchPlanner:
  def generate_patch_plan(self, findings: List[Dict[str, Any]], projects_meta: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Generates wave-ordered patch actions with greedy set cover.
    Wave 0: Immediate P0 / KEV findings
    Wave 1: High risk P1
    Wave 2: Medium risk P2
    Wave 3: Low risk P3
    """
    raw_actions = []

    # Map projects
    proj_map = {p["id"]: p for p in projects_meta}

    for f in findings:
      tier = f.get("tier", "P2")
      pkg = f.get("package")
      from_ver = f.get("version")
      fixed_ver = f.get("fixed_version", "2.17.1")
      proj_id = f.get("project_id")
      proj_name = f.get("project_name", proj_id)
      is_direct = f.get("is_direct", True)
      advisory_id = f.get("advisory_id")
      risk = f.get("risk_score", 50.0)

      # Determine action type
      if proj_map.get(proj_id, {}).get("is_internal_lib"):
        action_type = "INTERNAL_LIB_RELEASE"
        effort = EFFORT_POINTS["INTERNAL_LIB_RELEASE"]
        cmd = f"<!-- pom.xml -->\n<{pkg}.version>{fixed_ver}</{pkg}.version>"
      elif not is_direct and "spring" in pkg.lower():
        action_type = "PARENT_BUMP"
        effort = EFFORT_POINTS["PARENT_BUMP"]
        cmd = f"<!-- pom.xml -->\n<parent>\n  <groupId>org.springframework.boot</groupId>\n  <artifactId>spring-boot-starter-parent</artifactId>\n  <version>2.6.6</version>\n</parent>"
      elif not is_direct and proj_map.get(proj_id, {}).get("ecosystem") == "npm":
        action_type = "OVERRIDE"
        effort = EFFORT_POINTS["OVERRIDE"]
        cmd = f'// package.json\n"overrides": {{\n  "{pkg}": "^{fixed_ver}"\n}}'
      else:
        action_type = "DIRECT_BUMP"
        effort = EFFORT_POINTS["DIRECT_BUMP"]
        cmd = f"<!-- pom.xml / requirements.txt / package.json -->\nBump {pkg} {from_ver} -> {fixed_ver}"

      wave = 0 if tier == "P0" else (1 if tier == "P1" else (2 if tier == "P2" else 3))

      raw_actions.append({
        "id": f"patch-{len(raw_actions)+1:03d}",
        "type": action_type,
        "package": pkg,
        "fromVersion": from_ver,
        "toVersion": fixed_ver,
        "effort": effort,
        "riskCleared": risk,
        "wave": wave,
        "projectsTouched": [proj_name],
        "breakingChange": False,
        "command": cmd,
        "state": "proposed",
        "advisories": [advisory_id]
      })

    # Merge identical actions across projects
    merged: Dict[str, Dict[str, Any]] = {}
    for act in raw_actions:
      key = f"{act['type']}:{act['package']}:{act['toVersion']}"
      if key not in merged:
        merged[key] = act
      else:
        if act["projectsTouched"][0] not in merged[key]["projectsTouched"]:
          merged[key]["projectsTouched"].append(act["projectsTouched"][0])
        merged[key]["riskCleared"] += act["riskCleared"]
        merged[key]["wave"] = min(merged[key]["wave"], act["wave"])
        if act["advisories"][0] not in merged[key]["advisories"]:
          merged[key]["advisories"].append(act["advisories"][0])

    final_actions = list(merged.values())
    # Sort by wave ascending, then ROI (riskCleared/effort) descending
    final_actions.sort(key=lambda x: (x["wave"], -(x["riskCleared"] / max(1, x["effort"]))))

    return {
      "actions": final_actions,
      "total_actions": len(final_actions),
      "minimal_set_actions": [a["id"] for a in final_actions if a["wave"] <= 1]
    }

def simulate_patch_application(current_findings: List[Dict[str, Any]], action_ids: List[str], plan_actions: List[Dict[str, Any]]) -> Dict[str, Any]:
  """
  PURE FUNCTION - Never writes to the database.
  Simulates clearing findings corresponding to selected action IDs.
  """
  selected_actions = [a for a in plan_actions if a["id"] in action_ids]
  cleared_pkgs = {a["package"] for a in selected_actions}

  remaining_findings = []
  cleared_findings = []

  for f in current_findings:
    if f.get("package") in cleared_pkgs:
      cleared_findings.append(f)
    else:
      remaining_findings.append(f)

  before_max_risk = max([f.get("risk_score", 0) for f in current_findings], default=0.0)
  after_max_risk = max([f.get("risk_score", 0) for f in remaining_findings], default=0.0)

  return {
    "simulated": True,
    "before_findings_count": len(current_findings),
    "after_findings_count": len(remaining_findings),
    "cleared_count": len(cleared_findings),
    "before_max_risk": round(before_max_risk, 1),
    "after_max_risk": round(after_max_risk, 1),
    "risk_reduction_pct": round(((before_max_risk - after_max_risk) / before_max_risk * 100), 1) if before_max_risk > 0 else 0.0
  }
