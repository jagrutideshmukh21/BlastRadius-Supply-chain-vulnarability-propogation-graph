"""
Supply Chain Trust Intelligence Module
Integrates OpenSSF Scorecard metrics, separates repository security posture from CVE exposure,
and tracks security practices across upstream dependencies.
"""

import time
import httpx
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

# Verified upstream repository mappings for top open-source dependencies
VERIFIED_REPOS: Dict[str, Dict[str, str]] = {
    "log4j-core": {
        "repo": "github.com/apache/logging-log4j2",
        "ecosystem": "Maven",
        "url": "https://github.com/apache/logging-log4j2"
    },
    "spring-webmvc": {
        "repo": "github.com/spring-projects/spring-framework",
        "ecosystem": "Maven",
        "url": "https://github.com/spring-projects/spring-framework"
    },
    "spring-security": {
        "repo": "github.com/spring-projects/spring-security",
        "ecosystem": "Maven",
        "url": "https://github.com/spring-projects/spring-security"
    },
    "lodash": {
        "repo": "github.com/lodash/lodash",
        "ecosystem": "npm",
        "url": "https://github.com/lodash/lodash"
    },
    "express": {
        "repo": "github.com/expressjs/express",
        "ecosystem": "npm",
        "url": "https://github.com/expressjs/express"
    },
    "axios": {
        "repo": "github.com/axios/axios",
        "ecosystem": "npm",
        "url": "https://github.com/axios/axios"
    },
    "semver": {
        "repo": "github.com/npm/node-semver",
        "ecosystem": "npm",
        "url": "https://github.com/npm/node-semver"
    },
    "glob-parent": {
        "repo": "github.com/gulpjs/glob-parent",
        "ecosystem": "npm",
        "url": "https://github.com/gulpjs/glob-parent"
    },
    "py": {
        "repo": "github.com/pytest-dev/py",
        "ecosystem": "PyPI",
        "url": "https://github.com/pytest-dev/py"
    },
    "django": {
        "repo": "github.com/django/django",
        "ecosystem": "PyPI",
        "url": "https://github.com/django/django"
    },
    "requests": {
        "repo": "github.com/psf/requests",
        "ecosystem": "PyPI",
        "url": "https://github.com/psf/requests"
    },
    "urllib3": {
        "repo": "github.com/urllib3/urllib3",
        "ecosystem": "PyPI",
        "url": "https://github.com/urllib3/urllib3"
    },
    "cryptography": {
        "repo": "github.com/pyca/cryptography",
        "ecosystem": "PyPI",
        "url": "https://github.com/pyca/cryptography"
    },
    "jackson-databind": {
        "repo": "github.com/FasterXML/jackson-databind",
        "ecosystem": "Maven",
        "url": "https://github.com/FasterXML/jackson-databind"
    }
}

# Committed baseline snapshot for offline resilience
SCORECARD_SNAPSHOTS: Dict[str, Dict[str, Any]] = {
    "github.com/apache/logging-log4j2": {
        "package": "log4j-core",
        "score": 7.8,
        "date": "2024-01-15T08:00:00Z",
        "source": "Snapshot",
        "checks": [
            {"name": "Binary-Artifacts", "score": 10, "reason": "No binaries found in repo"},
            {"name": "Branch-Protection", "score": 8, "reason": "Branch protection rules enforced on main"},
            {"name": "CI-Tests", "score": 10, "reason": "30 CI runs in past 30 days"},
            {"name": "CII-Best-Practices", "score": 10, "reason": "Silver badge achieved"},
            {"name": "Code-Review", "score": 9, "reason": "GitHub code reviews required"},
            {"name": "Dangerous-Workflow", "score": 10, "reason": "No untrusted checkouts detected"},
            {"name": "Dependency-Update-Tool", "score": 10, "reason": "Dependabot active"},
            {"name": "Fuzzing", "score": 10, "reason": "Integrated with OSS-Fuzz"},
            {"name": "Maintained", "score": 10, "reason": "High commit and release frequency"},
            {"name": "Pinned-Dependencies", "score": 4, "reason": "Some unpinned GitHub actions"},
            {"name": "SAST", "score": 8, "reason": "CodeQL and SonarCloud active"},
            {"name": "Security-Policy", "score": 10, "reason": "SECURITY.md found in repository"},
            {"name": "Signed-Releases", "score": 9, "reason": "Cryptographically signed artifacts (GPG)"},
            {"name": "Token-Permissions", "score": 6, "reason": "Permissions not explicitly set on all jobs"}
        ]
    },
    "github.com/spring-projects/spring-framework": {
        "package": "spring-webmvc",
        "score": 8.4,
        "date": "2024-01-15T08:00:00Z",
        "source": "Snapshot",
        "checks": [
            {"name": "Binary-Artifacts", "score": 10, "reason": "No binaries found"},
            {"name": "Branch-Protection", "score": 9, "reason": "Strict branch protection"},
            {"name": "CI-Tests", "score": 10, "reason": "Extensive GitHub actions matrix"},
            {"name": "Code-Review", "score": 10, "reason": "Mandatory peer reviews"},
            {"name": "Dangerous-Workflow", "score": 10, "reason": "Safe workflow configurations"},
            {"name": "Dependency-Update-Tool", "score": 10, "reason": "Automated Dependabot updates"},
            {"name": "Fuzzing", "score": 7, "reason": "Partial fuzz testing coverage"},
            {"name": "Maintained", "score": 10, "reason": "Active maintainer team"},
            {"name": "Pinned-Dependencies", "score": 6, "reason": "Partial action pinning"},
            {"name": "SAST", "score": 9, "reason": "CodeQL integrated"},
            {"name": "Security-Policy", "score": 10, "reason": "Clear security vulnerability intake"},
            {"name": "Signed-Releases", "score": 8, "reason": "Published with verified signatures"},
            {"name": "Token-Permissions", "score": 8, "reason": "Read-only token defaults"}
        ]
    },
    "github.com/lodash/lodash": {
        "package": "lodash",
        "score": 4.2,
        "date": "2024-01-15T08:00:00Z",
        "source": "Snapshot",
        "checks": [
            {"name": "Binary-Artifacts", "score": 10, "reason": "No binary artifacts"},
            {"name": "Branch-Protection", "score": 0, "reason": "Branch protection not enabled on default branch"},
            {"name": "CI-Tests", "score": 4, "reason": "Infrequent test runs on recent commits"},
            {"name": "Code-Review", "score": 2, "reason": "Single-maintainer merges without review"},
            {"name": "Dangerous-Workflow", "score": 10, "reason": "No dangerous workflows"},
            {"name": "Dependency-Update-Tool", "score": 0, "reason": "No automated dependency update bot"},
            {"name": "Fuzzing", "score": 0, "reason": "No fuzzing detected"},
            {"name": "Maintained", "score": 2, "reason": "Very low commit activity in past 12 months"},
            {"name": "Pinned-Dependencies", "score": 2, "reason": "Unpinned dependencies in build chain"},
            {"name": "SAST", "score": 0, "reason": "No static analysis tool configured"},
            {"name": "Security-Policy", "score": 5, "reason": "Generic security guidelines"},
            {"name": "Signed-Releases", "score": 0, "reason": "Releases published without cryptographic signatures"},
            {"name": "Token-Permissions", "score": 4, "reason": "Unrestricted default tokens"}
        ]
    },
    "github.com/pytest-dev/py": {
        "package": "py",
        "score": 3.8,
        "date": "2024-01-15T08:00:00Z",
        "source": "Snapshot",
        "checks": [
            {"name": "Maintained", "score": 0, "reason": "Repository is marked unmaintained / deprecated"},
            {"name": "Branch-Protection", "score": 0, "reason": "No active branch protection"},
            {"name": "CI-Tests", "score": 3, "reason": "Failing legacy test suites"},
            {"name": "Code-Review", "score": 5, "reason": "Historical reviews only"},
            {"name": "Security-Policy", "score": 4, "reason": "Directs users to migrate to standard library"},
            {"name": "SAST", "score": 0, "reason": "No SAST tool active"},
            {"name": "Signed-Releases", "score": 0, "reason": "No PyPI signed attestation"}
        ]
    },
    "github.com/django/django": {
        "package": "django",
        "score": 9.1,
        "date": "2024-01-15T08:00:00Z",
        "source": "Snapshot",
        "checks": [
            {"name": "Binary-Artifacts", "score": 10, "reason": "No binaries in repository"},
            {"name": "Branch-Protection", "score": 10, "reason": "Enforced branch protection with 2 approvers"},
            {"name": "CI-Tests", "score": 10, "reason": "Exhaustive continuous integration matrix"},
            {"name": "Code-Review", "score": 10, "reason": "Strict peer review mandate"},
            {"name": "Fuzzing", "score": 8, "reason": "Regular security testing"},
            {"name": "Maintained", "score": 10, "reason": "Full-time security team & DSF fellow"},
            {"name": "SAST", "score": 9, "reason": "Automated security tooling"},
            {"name": "Security-Policy", "score": 10, "reason": "Formal security release process"}
        ]
    }
}

# In-memory runtime cache for live queries
_live_cache: Dict[str, Dict[str, Any]] = {}

async def fetch_scorecard_data(repo_path: str) -> Optional[Dict[str, Any]]:
    """
    Fetches OpenSSF Scorecard metrics for a repository path (e.g. github.com/apache/logging-log4j2).
    Checks cache first, then official API, falling back to verified snapshot.
    """
    clean_repo = repo_path.replace("https://", "").replace("http://", "").strip("/")

    # 1. Check live cache (1 hour expiry)
    now = time.time()
    if clean_repo in _live_cache:
        cached = _live_cache[clean_repo]
        if now - cached.get("cached_at", 0) < 3600:
            return cached["data"]

    # 2. Try live OpenSSF Scorecard API
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(f"https://api.securityscorecards.dev/projects/{clean_repo}")
            if resp.status_code == 200:
                body = resp.json()
                data = {
                    "score": round(body.get("score", 0), 1),
                    "date": body.get("date", datetime.now(timezone.utc).isoformat()),
                    "source": "Live",
                    "repo": clean_repo,
                    "checks": [
                        {
                            "name": c.get("name"),
                            "score": c.get("score"),
                            "reason": c.get("reason", "")
                        }
                        for c in body.get("checks", [])
                    ]
                }
                _live_cache[clean_repo] = {"data": data, "cached_at": now}
                return data
    except Exception:
        # Network or timeout: fall through to snapshot
        pass

    # 3. Fallback to Snapshot
    if clean_repo in SCORECARD_SNAPSHOTS:
        snap = SCORECARD_SNAPSHOTS[clean_repo].copy()
        snap["repo"] = clean_repo
        return snap

    return None

def get_package_trust_summary(package_name: str) -> Dict[str, Any]:
    """
    Returns trust intelligence for a given package name.
    """
    base_name = package_name.split(":")[-1] if ":" in package_name else package_name
    info = VERIFIED_REPOS.get(base_name.lower())

    if not info:
        return {
            "package": package_name,
            "status": "Unknown",
            "score": None,
            "repo": None,
            "url": None,
            "source": "None",
            "message": "Upstream repository not yet verified or absent from Scorecard catalog"
        }

    repo = info["repo"]
    snap = SCORECARD_SNAPSHOTS.get(repo)
    if snap:
        return {
            "package": package_name,
            "status": "Known",
            "score": snap["score"],
            "repo": repo,
            "url": info["url"],
            "ecosystem": info["ecosystem"],
            "source": snap.get("source", "Snapshot"),
            "date": snap.get("date"),
            "checks_count": len(snap.get("checks", [])),
            "critical_concerns": [c["name"] for c in snap.get("checks", []) if c.get("score", 10) < 4]
        }

    return {
        "package": package_name,
        "status": "Unknown",
        "score": None,
        "repo": repo,
        "url": info.get("url"),
        "source": "None",
        "message": "Repository registered but Scorecard evaluation pending"
    }

def get_all_portfolio_trust() -> List[Dict[str, Any]]:
    """
    Returns trust overview for all mapped packages in the portfolio.
    """
    results = []
    for pkg, info in VERIFIED_REPOS.items():
        summary = get_package_trust_summary(pkg)
        results.append(summary)
    return results
