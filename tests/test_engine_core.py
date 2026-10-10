"""
tests/test_engine_core.py
Comprehensive PyTest suite for Engine Core (32 test cases)
"""

import pytest
import os
import json
from backend.blastradius.comparators import (
  compare_maven, MavenVersion,
  matches_npm_semver, parse_semver,
  normalize_pypi_name, compare_pep440, matches_pep440_spec
)
from backend.blastradius.parsers import (
  parse_pom_xml, parse_package_json, parse_package_lock_json, parse_requirements_txt, parse_cyclonedx_json
)
from backend.blastradius.resolver import DependencyResolver
from backend.blastradius.osv_matcher import is_version_affected_osv, find_fixed_version
from backend.blastradius.graph import DependencyGraph

# --- Maven ComparableVersion Tests (8 tests) ---
def test_maven_version_equals():
  assert compare_maven("1.0.0", "1.0") == 0
  assert compare_maven("2.14.1", "2.14.1") == 0

def test_maven_version_precedence():
  assert compare_maven("1.0.0-alpha", "1.0.0-beta") < 0
  assert compare_maven("1.0.0-beta", "1.0.0-rc") < 0
  assert compare_maven("1.0.0-rc", "1.0.0") < 0

def test_maven_log4j_versions():
  assert compare_maven("2.14.1", "2.17.1") < 0
  assert compare_maven("2.17.1", "2.17.1") == 0
  assert compare_maven("2.18.0", "2.17.1") > 0

def test_maven_snapshot_version():
  assert compare_maven("1.0.0-SNAPSHOT", "1.0.0") < 0

def test_maven_sp_version():
  assert compare_maven("1.0.0-sp1", "1.0.0") > 0

def test_maven_mixed_separators():
  assert compare_maven("1.2.3.4", "1.2.3.4") == 0
  assert compare_maven("1.2.3.4", "1.2.3.5") < 0

def test_maven_qualifier_alias():
  assert compare_maven("1.0.0-cr1", "1.0.0-rc1") == 0

def test_maven_complex_version():
  assert compare_maven("3.0.0.GA", "3.0.0.Final") == 0

# --- npm Semver Tests (7 tests) ---
def test_npm_caret_matching():
  assert matches_npm_semver("1.2.5", "^1.2.3") is True
  assert matches_npm_semver("2.0.0", "^1.2.3") is False

def test_npm_tilde_matching():
  assert matches_npm_semver("1.2.5", "~1.2.3") is True
  assert matches_npm_semver("1.3.0", "~1.2.3") is False

def test_npm_or_clauses():
  assert matches_npm_semver("4.17.15", "< 4.17.21 || ^5.0.0") is True

def test_npm_star_matching():
  assert matches_npm_semver("9.9.9", "*") is True

def test_npm_greater_equal_less_equal():
  assert matches_npm_semver("2.14.1", ">=2.0.0 <=2.17.0") is True
  assert matches_npm_semver("2.17.1", ">=2.0.0 <=2.17.0") is False

def test_npm_prerelease_matching():
  assert matches_npm_semver("1.0.0", ">=1.0.0") is True

def test_npm_wildcard_x():
  assert matches_npm_semver("1.2.3", "1.x") is True

# --- PEP 440 & PEP 503 PyPI Tests (6 tests) ---
def test_pep503_normalization():
  assert normalize_pypi_name("Django_Rest.Framework") == "django-rest-framework"
  assert normalize_pypi_name("PyYAML") == "pyyaml"

def test_pep503_dashes_and_underscores():
  assert normalize_pypi_name("log4j_core") == "log4j-core"

def test_pep440_spec_matching():
  assert matches_pep440_spec("1.10.0", "<1.11.0") is True
  assert matches_pep440_spec("1.11.0", "<1.11.0") is False
  assert matches_pep440_spec("2.0.0", ">=1.0.0,!=2.0.0") is False

def test_pep440_post_and_pre_releases():
  assert compare_pep440("1.0.0a1", "1.0.0") < 0
  assert compare_pep440("1.0.0post1", "1.0.0") > 0

# --- Parser Tests (5 tests) ---
def test_parse_pom_xml_defusedxml():
  pom_content = """<project><groupId>org.apache.logging.log4j</groupId><artifactId>log4j-core</artifactId><version>2.14.1</version>
  <properties><log4j.ver>2.14.1</log4j.ver></properties>
  <dependencies><dependency><groupId>org.apache.logging.log4j</groupId><artifactId>log4j-core</artifactId><version>${log4j.ver}</version></dependency></dependencies></project>"""
  res = parse_pom_xml(pom_content)
  assert len(res["dependencies"]) == 1
  assert res["dependencies"][0]["pinned_version"] == "2.14.1"

def test_parse_requirements_txt_comments_and_markers():
  req = """
  # Comment line
  requests==2.28.1 ; python_version >= '3.8'
  py==1.10.0 # inline comment
  jinja2>=2.11.0
  """
  res = parse_requirements_txt(req)
  assert len(res["dependencies"]) == 3
  assert res["dependencies"][0]["pinned_version"] == "2.28.1"
  assert res["dependencies"][2]["confidence"] == "Unverified"

def test_parse_package_json_overrides():
  pj = '{"name": "test", "dependencies": {"lodash": "4.17.15"}, "devDependencies": {"semver": "^7.5.0"}}'
  res = parse_package_json(pj)
  assert len(res["dependencies"]) == 2
  assert res["dependencies"][0]["scope"] == "runtime"
  assert res["dependencies"][1]["scope"] == "dev"

def test_parse_package_lock_json_v2():
  pl = '{"name": "test", "packages": {"": {"name": "test"}, "node_modules/lodash": {"version": "4.17.15"}}}'
  res = parse_package_lock_json(pl)
  assert len(res) == 1
  assert res[0]["name"] == "lodash"
  assert res[0]["version"] == "4.17.15"

def test_parse_cyclonedx_json():
  sbom = '{"metadata": {"component": {"name": "app"}}, "components": [{"name": "lodash", "version": "4.17.15"}]}'
  res = parse_cyclonedx_json(sbom)
  assert len(res["dependencies"]) == 1
  assert res["dependencies"][0]["name"] == "lodash"

# --- Resolver Tests (3 tests) ---
def test_resolver_lockfile_confirmed():
  r = DependencyResolver()
  proj = {"dependencies": [{"name": "lodash", "version_spec": "^4.0.0"}]}
  lock = [{"name": "lodash", "version": "4.17.15"}]
  res = r.resolve(proj, lock)
  assert res[0]["confidence"] == "Confirmed"
  assert res[0]["version"] == "4.17.15"

def test_resolver_unpinned_range_unverified():
  r = DependencyResolver()
  proj = {"dependencies": [{"name": "jinja2", "version_spec": ">=2.11.0"}]}
  res = r.resolve(proj, [])
  assert res[0]["confidence"] == "Unverified"
  assert res[0]["label"] == "assumed"
  assert res[0]["version"] == "2.11.0"

def test_resolver_exact_pin_confirmed():
  r = DependencyResolver()
  proj = {"dependencies": [{"name": "py", "pinned_version": "1.10.0"}]}
  res = r.resolve(proj, [])
  assert res[0]["confidence"] == "Confirmed"

# --- OSV Range Matcher & Negative Control (3 tests) ---
def test_osv_matcher_log4j_vulnerable():
  osv_record = {
    "affected": [{
      "package": {"name": "log4j-core", "ecosystem": "Maven"},
      "ranges": [{"type": "ECOSYSTEM", "events": [{"introduced": "2.0-beta9"}, {"fixed": "2.17.1"}]}]
    }]
  }
  assert is_version_affected_osv("log4j-core", "2.14.1", "Maven", osv_record) == "AFFECTED"

def test_osv_matcher_log4j_fixed_negative_control():
  osv_record = {
    "affected": [{
      "package": {"name": "log4j-core", "ecosystem": "Maven"},
      "ranges": [{"type": "ECOSYSTEM", "events": [{"introduced": "2.0-beta9"}, {"fixed": "2.17.1"}]}]
    }]
  }
  assert is_version_affected_osv("log4j-core", "2.17.1", "Maven", osv_record) == "NOT_AFFECTED"
  assert is_version_affected_osv("log4j-core", "2.18.0", "Maven", osv_record) == "NOT_AFFECTED"

def test_find_fixed_version_evidence():
  osv_record = {"affected": [{"ranges": [{"events": [{"introduced": "0"}, {"fixed": "2.17.1"}]}]}]}
  assert find_fixed_version(osv_record, "Maven") == "2.17.1"

# --- Graph & Blast Radius Tests (3 tests) ---
def test_graph_propagation_paths():
  g = DependencyGraph()
  g.add_project("proj-1", "api-gateway", {})
  g.add_package("log4j@2.14.1", "log4j-core", "2.14.1", "Maven")
  g.add_dependency("proj-1", "log4j@2.14.1", scope="runtime", is_direct=True)
  
  res = g.compute_blast_radius("log4j@2.14.1")
  assert res["total_affected_projects"] == 1
  assert res["affected_projects"][0]["project_name"] == "api-gateway"
  assert res["affected_projects"][0]["is_direct"] is True

def test_graph_transitive_propagation():
  g = DependencyGraph()
  g.add_project("proj-auth", "auth-service", {})
  g.add_package("spring-sec@5.6.1", "spring-security", "5.6.1", "Maven")
  g.add_package("log4j@2.14.1", "log4j-core", "2.14.1", "Maven")
  g.add_dependency("proj-auth", "spring-sec@5.6.1", scope="runtime")
  g.add_dependency("spring-sec@5.6.1", "log4j@2.14.1", scope="runtime")
  
  res = g.compute_blast_radius("log4j@2.14.1")
  assert res["total_affected_projects"] == 1
  assert res["affected_projects"][0]["depth"] == 2
  assert res["affected_projects"][0]["is_direct"] is False

def test_graph_choke_points():
  g = DependencyGraph()
  g.add_project("p1", "svc-1", {})
  g.add_project("p2", "svc-2", {})
  g.add_package("lib@1.0", "shared-lib", "1.0", "Maven")
  g.add_dependency("p1", "lib@1.0")
  g.add_dependency("p2", "lib@1.0")
  
  choke = g.calculate_choke_points()
  assert len(choke) == 1
  assert choke[0]["dependents_count"] == 2
