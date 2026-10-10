"""
Exploit-Aware Composite Scoring Engine
Formula:
  E = min(1, 0.45*EPSS + 0.35*KEV + 0.20*AV)
  I = CVSS / 10
  X = min(1, scope_f * depth_f * internet_f * crit_f * path_f)
  Risk = 100 * (w_e*E + w_i*I + w_x*X)
Returns full explainable object detailing inputs, values, formula, timestamps.
"""

from typing import Dict, List, Any, Optional, Tuple

PRESETS = {
  "Balanced": {"w_e": 0.40, "w_i": 0.25, "w_x": 0.35},
  "KEV-first": {"w_e": 0.60, "w_i": 0.20, "w_x": 0.20},
  "Business-critical-first": {"w_e": 0.25, "w_i": 0.30, "w_x": 0.45}
}

AV_WEIGHTS = {
  "NETWORK": 1.0,
  "ADJACENT": 0.7,
  "LOCAL": 0.4,
  "PHYSICAL": 0.2
}

SCOPE_WEIGHTS = {
  "runtime": 1.0,
  "compile": 1.0,
  "optional": 0.6,
  "dev": 0.3,
  "test": 0.2
}

def parse_cvss_vector(cvss_vector: str) -> Tuple[float, float]:
  """Extracts base score and Attack Vector (AV) from CVSS v3 vector string."""
  av_val = 1.0  # Default Network
  score = 7.5  # Default fallback
  
  if "AV:N" in cvss_vector:
    av_val = 1.0
  elif "AV:A" in cvss_vector:
    av_val = 0.7
  elif "AV:L" in cvss_vector:
    av_val = 0.4
  elif "AV:P" in cvss_vector:
    av_val = 0.2
    
  return score, av_val

def compute_exploitability(epss: Optional[float], is_kev: bool, av_score: float = 1.0) -> Tuple[float, Dict[str, Any]]:
  epss_val = epss if epss is not None else 0.10  # Neutral prior if missing
  epss_flagged = epss is None
  
  kev_val = 1.0 if is_kev else 0.0
  
  e = min(1.0, 0.45 * epss_val + 0.35 * kev_val + 0.20 * av_score)
  
  breakdown = {
    "epss_input": epss_val,
    "epss_estimated": epss_flagged,
    "epss_contribution": round(0.45 * epss_val, 4),
    "kev_input": is_kev,
    "kev_contribution": round(0.35 * kev_val, 4),
    "av_input": av_score,
    "av_contribution": round(0.20 * av_score, 4),
    "formula": "min(1, 0.45*EPSS + 0.35*KEV + 0.20*AV)"
  }
  return round(e, 4), breakdown

def compute_exposure(scope: str, depth: int, internet_facing: bool, criticality: int, path_count: int = 1) -> Tuple[float, Dict[str, Any]]:
  scope_f = SCOPE_WEIGHTS.get(scope.lower(), 1.0)
  depth_f = max(0.6, 1.0 - 0.1 * depth)
  internet_f = 1.0 if internet_facing else 0.7
  crit_f = 0.5 + 0.1 * min(5, max(1, criticality))
  path_f = min(1.15, 1.0 + 0.03 * max(0, path_count - 1))
  
  x = min(1.0, scope_f * depth_f * internet_f * crit_f * path_f)
  
  breakdown = {
    "scope_factor": scope_f,
    "depth_factor": round(depth_f, 2),
    "internet_factor": internet_f,
    "criticality_factor": round(crit_f, 2),
    "path_factor": round(path_f, 2),
    "formula": "min(1, scope_f * depth_f * internet_f * crit_f * path_f)"
  }
  return round(x, 4), breakdown

def calculate_risk_score(
  cvss_base: float,
  epss: Optional[float],
  is_kev: bool,
  scope: str = "runtime",
  depth: int = 1,
  internet_facing: bool = False,
  criticality: int = 3,
  path_count: int = 1,
  av_score: float = 1.0,
  weights: Dict[str, float] = None,
  thresholds: Dict[str, int] = None
) -> Dict[str, Any]:
  if not weights:
    weights = PRESETS["Balanced"]
  if not thresholds:
    thresholds = {"p0": 85, "p1": 65, "p2": 40}

  w_e = weights.get("w_e", 0.40)
  w_i = weights.get("w_i", 0.25)
  w_x = weights.get("w_x", 0.35)

  e, e_breakdown = compute_exploitability(epss, is_kev, av_score)
  i = min(1.0, cvss_base / 10.0)
  x, x_breakdown = compute_exposure(scope, depth, internet_facing, criticality, path_count)

  risk_score = round(100.0 * (w_e * e + w_i * i + w_x * x), 1)

  # Tier Determination
  is_p0_kev_rule = is_kev and scope.lower() in ("runtime", "compile") and (internet_facing or criticality >= 4)
  
  if is_p0_kev_rule or risk_score >= thresholds["p0"]:
    tier = "P0"
  elif risk_score >= thresholds["p1"]:
    tier = "P1"
  elif risk_score >= thresholds["p2"]:
    tier = "P2"
  else:
    tier = "P3"

  explanation = {
    "risk_score": risk_score,
    "tier": tier,
    "components": {
      "E": e,
      "I": round(i, 4),
      "X": x
    },
    "weights": {"w_e": w_e, "w_i": w_i, "w_x": w_x},
    "exploitability_breakdown": e_breakdown,
    "exposure_breakdown": x_breakdown,
    "formula_str": f"100 * ({w_e}*{e} + {w_i}*{round(i,4)} + {w_x}*{x})",
    "inputs": {
      "cvss_base": cvss_base,
      "epss": epss,
      "is_kev": is_kev,
      "scope": scope,
      "depth": depth,
      "internet_facing": internet_facing,
      "criticality": criticality,
      "path_count": path_count
    }
  }

  return explanation
