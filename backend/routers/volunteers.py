import json
import random
import string
from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from fastapi import Depends
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
import models

router = APIRouter(prefix="/volunteers", tags=["volunteers"])


class VolunteerCreate(BaseModel):
    name: str
    phone: str
    services: List[str]
    time_slots: List[str]


@router.post("/", status_code=201)
def register_volunteer(req: VolunteerCreate, db: Session = Depends(get_db)):
    v = models.Volunteer(
        name=req.name,
        phone=req.phone,
        services=json.dumps(req.services, ensure_ascii=False),
        time_slots=json.dumps(req.time_slots, ensure_ascii=False),
    )
    db.add(v); db.commit(); db.refresh(v)
    return {"id": v.id, "name": v.name, "message": "志工登記成功，等待審核"}


@router.get("/")
def list_volunteers(db: Session = Depends(get_db)):
    vs = db.query(models.Volunteer).order_by(models.Volunteer.created_at.desc()).all()
    return [{"id": v.id, "name": v.name, "services": json.loads(v.services),
             "time_slots": json.loads(v.time_slots), "is_verified": v.is_verified,
             "created_at": v.created_at.isoformat()} for v in vs]


@router.patch("/{vid}/verify")
def verify_volunteer(vid: int, db: Session = Depends(get_db)):
    v = db.query(models.Volunteer).filter(models.Volunteer.id == vid).first()
    if not v: raise HTTPException(404, "找不到此志工")
    v.is_verified = True; db.commit()
    return {"message": "志工已審核通過"}
