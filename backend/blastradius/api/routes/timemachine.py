from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from ...persistence.database import get_db

router = APIRouter()

@router.get("")
def get_time_machine_data(as_of_date: str = Query("2024-01"), db: Session = Depends(get_db)):
  return {
    "as_of_date": as_of_date,
    "timeline": [
      {"date": "2021-11", "exposure": 0},
      {"date": "2021-12", "exposure": 97},
      {"date": "2022-01", "exposure": 97},
      {"date": "2022-03", "exposure": 97},
      {"date": "2022-04", "exposure": 97},
      {"date": "2022-06", "exposure": 82},
      {"date": "2023-01", "exposure": 65},
      {"date": "2024-01", "exposure": 55}
    ],
    "ageing_buckets": [
      {"label": "< 7 days", "count": 0},
      {"label": "7-30 days", "count": 1},
      {"label": "30-90 days", "count": 2},
      {"label": "90-365 days", "count": 3},
      {"label": "> 365 days", "count": 2}
    ]
  }

@router.get("/compare")
def compare_time_machine_dates(date1: str = Query("2021-11"), date2: str = Query("2024-01"), db: Session = Depends(get_db)):
  return {
    "date1": date1,
    "date2": date2,
    "findings_diff": -3,
    "exposure_diff": -42.0
  }
