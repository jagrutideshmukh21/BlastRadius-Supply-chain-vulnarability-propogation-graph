"""
SQLAlchemy 2 Database Setup with SQLite
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_PATH = os.path.join(BASE_DIR, "blastradius.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
  DATABASE_URL,
  connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()

def init_db():
  Base.metadata.create_all(bind=engine)
