"""
Persistence Service
Database CRUD operations, sample data seeder, and job management.
"""

import os
import json
from datetime import datetime
from sqlalchemy.orm import Session
from .database import engine, Base, SessionLocal
from .models import (
  Project, Manifest, Package, DependencyEdge, ProjectDependency,
  Advisory, Finding, ScanRun, Job, PatchAction, VEXDecision, Watchlist,
  Notification, DataSourceSync, AuditEvent, Setting
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
SAMPLE_DIR = os.path.join(BASE_DIR, "data", "sample")

def seed_database_if_empty():
  init_db_tables()
  db = SessionLocal()
  try:
    # Seed sample projects from data/sample/projects.json if not present
    projects_file = os.path.join(SAMPLE_DIR, "projects.json")
    if os.path.exists(projects_file) and db.query(Project).count() == 0:
      with open(projects_file, "r", encoding="utf-8") as f:
        projects_data = json.load(f)
        for p in projects_data:
          proj = Project(
            id=p["id"],
            name=p["name"],
            ecosystem=p["ecosystem"],
            owner=p["owner"],
            internet_facing=p.get("internet_facing", False),
            criticality=p.get("criticality", 3),
            is_internal_lib=p.get("is_internal_lib", False),
            version=p.get("version", "1.0.0"),
            description=p.get("description", ""),
            last_scan=datetime.utcnow()
          )
          db.add(proj)

    # Seed initial Advisories if not present
    if not db.query(Advisory).filter(Advisory.id == "GHSA-jfh8-c2jp-hdph").first():
      adv_log4j = Advisory(
        id="GHSA-jfh8-c2jp-hdph",
        aliases=["CVE-2021-44228"],
        package="log4j-core",
        ecosystem="Maven",
        summary="Log4Shell: Remote code execution in Apache Log4j2 JNDI features",
        cvss=10.0,
        cvss_vector="CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H",
        epss=0.975,
        kev=True,
        kev_due_date="2021-12-24",
        published="2021-12-10T17:15:00Z",
        modified="2023-02-03T00:00:00Z",
        fixed_version="2.17.1",
        affected_range=">= 2.0-beta9, < 2.17.1",
        severity="CRITICAL",
        source="OSV + CISA KEV",
        references=["https://nvd.nist.gov/vuln/detail/CVE-2021-44228"]
      )
      db.add(adv_log4j)

    if not db.query(Advisory).filter(Advisory.id == "GHSA-36p3-wjmg-h94x").first():
      adv_spring = Advisory(
        id="GHSA-36p3-wjmg-h94x",
        aliases=["CVE-2022-22965"],
        package="org.springframework:spring-webmvc",
        ecosystem="Maven",
        summary="Spring4Shell: Remote code execution via Data Binding in Spring Framework",
        cvss=9.8,
        cvss_vector="CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
        epss=0.972,
        kev=True,
        kev_due_date="2022-04-25",
        published="2022-03-31T00:00:00Z",
        modified="2023-08-11T00:00:00Z",
        fixed_version="5.3.18",
        affected_range=">= 5.3.0, < 5.3.18",
        severity="CRITICAL",
        source="OSV + CISA KEV",
        references=["https://nvd.nist.gov/vuln/detail/CVE-2022-22965"]
      )
      db.add(adv_spring)

    # Seed Findings if not present
    if not db.query(Finding).filter(Finding.id == "find-001").first():
      f1 = Finding(
        id="find-001",
        project_id="proj-001",
        advisory_id="GHSA-jfh8-c2jp-hdph",
        package="log4j-core",
        version="2.14.1",
        depth=1,
        scope="runtime",
        tier="P0",
        risk_score=97.2,
        exploitability=0.98,
        impact=1.0,
        exposure=0.98,
        confidence="Confirmed",
        paths=[["api-gateway", "log4j-core@2.14.1"]],
        fixed_version="2.17.1",
        is_direct=True
      )
      db.add(f1)

    # Audit event if not present
    if db.query(AuditEvent).count() == 0:
      audit_init = AuditEvent(
        id="audit-001",
        actor="system",
        action="SEED_DATABASE",
        entity="database",
        entity_name="BlastRadius DB",
        reason="Initial seed on server startup",
        before_state=None,
        after_state="Seeded 12 sample projects"
      )
      db.add(audit_init)

    db.commit()
  finally:
    db.close()

def init_db_tables():
  Base.metadata.create_all(bind=engine)
