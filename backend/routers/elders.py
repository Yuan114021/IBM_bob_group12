import json
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
import models

router = APIRouter(prefix="/elders", tags=["elders"])


class ElderCreate(BaseModel):
    name: str
    services: List[str]
    time_slots: List[str]
    note: Optional[str] = None


@router.post("/", status_code=201)
def register_elder(req: ElderCreate, db: Session = Depends(get_db)):
    e = models.Elder(
        name=req.name,
        services=json.dumps(req.services, ensure_ascii=False),
        time_slots=json.dumps(req.time_slots, ensure_ascii=False),
        note=req.note,
    )
    db.add(e); db.commit(); db.refresh(e)
    return {"id": e.id, "name": e.name, "message": "銀髮族登記成功"}


@router.get("/")
def list_elders(db: Session = Depends(get_db)):
    es = db.query(models.Elder).order_by(models.Elder.created_at.desc()).all()
    return [{"id": e.id, "name": e.name, "services": json.loads(e.services),
             "time_slots": json.loads(e.time_slots), "note": e.note,
             "is_matched": e.is_matched, "created_at": e.created_at.isoformat()} for e in es]
