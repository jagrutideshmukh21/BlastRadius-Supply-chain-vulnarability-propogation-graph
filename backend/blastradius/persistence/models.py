"""
SQLAlchemy 2 Models for BlastRadius
All 17 tables with indexes, foreign keys, and unique constraints.
"""

from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON, Index
from .database import Base

class Project(Base):
  __tablename__ = "projects"

  id = Column(String, primary_key=True, index=True)
  name = Column(String, nullable=False, index=True)
  ecosystem = Column(String, nullable=False)
  owner = Column(String, nullable=False)
  internet_facing = Column(Boolean, default=False)
  criticality = Column(Integer, default=3)
  is_internal_lib = Column(Boolean, default=False)
  version = Column(String, default="1.0.0")
  description = Column(Text, nullable=True)
  last_scan = Column(DateTime, default=datetime.utcnow)

class Manifest(Base):
  __tablename__ = "manifests"

  id = Column(String, primary_key=True, index=True)
  project_id = Column(String, ForeignKey("projects.id"), nullable=False)
  file_name = Column(String, nullable=False)
  ecosystem = Column(String, nullable=False)
  content = Column(Text, nullable=False)
  sha256 = Column(String, nullable=False)
  created_at = Column(DateTime, default=datetime.utcnow)

class Package(Base):
  __tablename__ = "packages"

  id = Column(String, primary_key=True, index=True)  # pkg:ecosystem/name@version
  name = Column(String, nullable=False, index=True)
  version = Column(String, nullable=False)
  ecosystem = Column(String, nullable=False)

class DependencyEdge(Base):
  __tablename__ = "dependency_edges"

  id = Column(Integer, primary_key=True, autoincrement=True)
  source_id = Column(String, nullable=False, index=True)
  target_id = Column(String, nullable=False, index=True)
  scope = Column(String, default="runtime")
  is_direct = Column(Boolean, default=True)

class ProjectDependency(Base):
  __tablename__ = "project_dependencies"

  id = Column(Integer, primary_key=True, autoincrement=True)
  project_id = Column(String, ForeignKey("projects.id"), nullable=False, index=True)
  package = Column(String, nullable=False)
  version = Column(String, nullable=False)
  depth = Column(Integer, default=1)
  scope = Column(String, default="runtime")
  is_direct = Column(Boolean, default=True)
  resolution_method = Column(String, default="lockfile")
  confidence = Column(String, default="Confirmed")
  paths = Column(JSON, nullable=True)

class Advisory(Base):
  __tablename__ = "advisories"

  id = Column(String, primary_key=True, index=True)
  aliases = Column(JSON, nullable=True)
  package = Column(String, nullable=False, index=True)
  ecosystem = Column(String, nullable=False)
  summary = Column(Text, nullable=False)
  cvss = Column(Float, default=7.5)
  cvss_vector = Column(String, nullable=True)
  epss = Column(Float, default=0.1)
  kev = Column(Boolean, default=False)
  kev_due_date = Column(String, nullable=True)
  published = Column(String, nullable=False)
  modified = Column(String, nullable=False)
  fixed_version = Column(String, nullable=True)
  affected_range = Column(String, nullable=True)
  severity = Column(String, default="HIGH")
  source = Column(String, default="OSV")
  references = Column(JSON, nullable=True)

class Intel(Base):
  __tablename__ = "intel"

  id = Column(String, primary_key=True)
  cve_id = Column(String, unique=True, index=True)
  epss_score = Column(Float, nullable=True)
  epss_percentile = Column(Float, nullable=True)
  is_kev = Column(Boolean, default=False)
  kev_date_added = Column(String, nullable=True)
  kev_due_date = Column(String, nullable=True)
  fetched_at = Column(DateTime, default=datetime.utcnow)

class Finding(Base):
  __tablename__ = "findings"

  id = Column(String, primary_key=True, index=True)
  project_id = Column(String, ForeignKey("projects.id"), nullable=False, index=True)
  advisory_id = Column(String, ForeignKey("advisories.id"), nullable=False, index=True)
  package = Column(String, nullable=False)
  version = Column(String, nullable=False)
  depth = Column(Integer, default=1)
  scope = Column(String, default="runtime")
  tier = Column(String, default="P1")
  risk_score = Column(Float, nullable=False)
  exploitability = Column(Float, nullable=False)
  impact = Column(Float, nullable=False)
  exposure = Column(Float, nullable=False)
  confidence = Column(String, default="Confirmed")
  paths = Column(JSON, nullable=True)
  fixed_version = Column(String, nullable=True)
  is_direct = Column(Boolean, default=True)

class ScanRun(Base):
  __tablename__ = "scan_runs"

  id = Column(String, primary_key=True, index=True)
  project_id = Column(String, ForeignKey("projects.id"), nullable=False)
  status = Column(String, default="COMPLETED")
  findings_count = Column(Integer, default=0)
  scanned_at = Column(DateTime, default=datetime.utcnow)

class Job(Base):
  __tablename__ = "jobs"

  id = Column(String, primary_key=True, index=True)
  name = Column(String, nullable=False)
  status = Column(String, default="queued")  # queued, running, succeeded, failed
  progress = Column(Integer, default=0)
  stage = Column(String, default="init")
  error = Column(Text, nullable=True)
  created_at = Column(DateTime, default=datetime.utcnow)
  updated_at = Column(DateTime, default=datetime.utcnow)

class PatchAction(Base):
  __tablename__ = "patch_actions"

  id = Column(String, primary_key=True, index=True)
  type = Column(String, nullable=False)
  package = Column(String, nullable=False)
  from_version = Column(String, nullable=False)
  to_version = Column(String, nullable=False)
  effort = Column(Integer, default=1)
  risk_cleared = Column(Float, default=0.0)
  wave = Column(Integer, default=0)
  projects_touched = Column(JSON, nullable=False)
  breaking_change = Column(Boolean, default=False)
  command = Column(Text, nullable=False)
  state = Column(String, default="proposed")  # simulated, proposed, accepted, applied, verified
  advisories = Column(JSON, nullable=False)

class VEXDecision(Base):
  __tablename__ = "vex_decisions"

  id = Column(String, primary_key=True, index=True)
  finding_id = Column(String, ForeignKey("findings.id"), nullable=False)
  status = Column(String, default="not_affected")
  justification = Column(String, nullable=False)
  detail = Column(Text, nullable=False)
  created_at = Column(DateTime, default=datetime.utcnow)

class Watchlist(Base):
  __tablename__ = "watchlist"

  id = Column(String, primary_key=True, index=True)
  item = Column(String, unique=True, nullable=False)
  item_type = Column(String, default="package")  # package, advisory, cve
  created_at = Column(DateTime, default=datetime.utcnow)

class Notification(Base):
  __tablename__ = "notifications"

  id = Column(String, primary_key=True, index=True)
  type = Column(String, nullable=False)
  title = Column(String, nullable=False)
  message = Column(Text, nullable=False)
  severity = Column(String, default="HIGH")
  time = Column(DateTime, default=datetime.utcnow)
  read = Column(Boolean, default=False)

class DataSourceSync(Base):
  __tablename__ = "data_source_syncs"

  id = Column(String, primary_key=True, index=True)
  name = Column(String, nullable=False)
  last_success = Column(DateTime, nullable=True)
  last_error = Column(Text, nullable=True)
  status = Column(String, default="Snapshot")

class AuditEvent(Base):
  __tablename__ = "audit_events"

  id = Column(String, primary_key=True, index=True)
  actor = Column(String, default="system")
  action = Column(String, nullable=False)
  entity = Column(String, nullable=False)
  entity_name = Column(String, nullable=False)
  time = Column(DateTime, default=datetime.utcnow)
  reason = Column(Text, nullable=False)
  before_state = Column(Text, nullable=True)
  after_state = Column(Text, nullable=True)

class Setting(Base):
  __tablename__ = "settings"

  key = Column(String, primary_key=True)
  value = Column(JSON, nullable=False)
