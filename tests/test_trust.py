"""
Tests for Supply Chain Trust Intelligence (OpenSSF Scorecard integration)
"""

import pytest
from blastradius.intelligence.trust import (
    get_package_trust_summary,
    get_all_portfolio_trust,
    fetch_scorecard_data,
    VERIFIED_REPOS
)

def test_verified_repos_present():
    assert "log4j-core" in VERIFIED_REPOS
    assert "spring-webmvc" in VERIFIED_REPOS
    assert "lodash" in VERIFIED_REPOS

def test_package_trust_summary_known():
    res = get_package_trust_summary("log4j-core")
    assert res["status"] == "Known"
    assert res["score"] == 7.8
    assert res["repo"] == "github.com/apache/logging-log4j2"
    assert "Snapshot" in res["source"]

def test_package_trust_summary_unknown():
    res = get_package_trust_summary("nonexistent-package-xyz")
    assert res["status"] == "Unknown"
    assert res["score"] is None
    assert res["repo"] is None

def test_portfolio_trust_list():
    items = get_all_portfolio_trust()
    assert len(items) >= 5
    log4j = next((i for i in items if i["package"] == "log4j-core"), None)
    assert log4j is not None
    assert log4j["score"] > 7.0

import asyncio

def test_fetch_scorecard_data_snapshot_fallback():
    data = asyncio.run(fetch_scorecard_data("github.com/apache/logging-log4j2"))
    assert data is not None
    assert "score" in data
    assert len(data.get("checks", [])) >= 10
