import json
import random
import string
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
import models

router = APIRouter(prefix="/service-requests", tags=["service_requests"])

SERVICES = ["日間照護", "居家訪視", "課程教學", "健康諮詢", "其他"]


def generate_anonymous_id():
    chars = string.ascii_uppercase.replace('I', '').replace('O', '') + '23456789'
    return '匿名用戶 #' + ''.join(random.choices(chars, k=4))


class ServiceRequestCreate(BaseModel):
    request_type: str
    category: Optional[str] = None
    quantity: Optional[str] = None
    urgency: Optional[str] = None
    description: Optional[str] = None
    phone: Optional[str] = None


@router.post("/", status_code=201)
def create_request(req: ServiceRequestCreate, db: Session = Depends(get_db)):
    anon_id = generate_anonymous_id()
    sr = models.ServiceRequest(
        anonymous_id=anon_id,
        request_type=req.request_type,
        category=req.category,
        quantity=req.quantity,
        urgency=req.urgency,
        description=req.description,
        phone=req.phone,
    )
    db.add(sr); db.commit(); db.refresh(sr)
    return {"anonymous_id": anon_id, "message": "需求已提交"}


@router.get("/")
def list_requests(db: Session = Depends(get_db)):
    reqs = db.query(models.ServiceRequest).order_by(models.ServiceRequest.created_at.desc()).all()
    return [{"id": r.id, "anonymous_id": r.anonymous_id, "request_type": r.request_type,
             "category": r.category, "quantity": r.quantity, "urgency": r.urgency,
             "description": r.description, "status": r.status,
             "created_at": r.created_at.isoformat()} for r in reqs]


@router.patch("/{rid}/approve")
def approve_request(rid: int, db: Session = Depends(get_db)):
    r = db.query(models.ServiceRequest).filter(models.ServiceRequest.id == rid).first()
    if not r: raise HTTPException(404, "找不到此需求")
    r.status = "approved"; db.commit()
    return {"message": "已審核"}


@router.get("/match")
def get_matches(db: Session = Depends(get_db)):
    """自動配對銀髮族與志工（依服務項目與時段交集）"""
    elders = db.query(models.Elder).filter(models.Elder.is_matched == False).all()
    volunteers = db.query(models.Volunteer).filter(models.Volunteer.is_verified == True).all()

    matches = []
    unmatched_elders = []

    for elder in elders:
        elder_services = set(json.loads(elder.services))
        elder_slots = set(json.loads(elder.time_slots))
        best_vol = None
        best_score = 0

        for vol in volunteers:
            vol_services = set(json.loads(vol.services))
            vol_slots = set(json.loads(vol.time_slots))
            score = len(elder_services & vol_services) + len(elder_slots & vol_slots)
            if score > best_score:
                best_score = score
                best_vol = vol

        if best_vol and best_score > 0:
            matches.append({
                "elder": {"id": elder.id, "name": elder.name, "services": json.loads(elder.services)},
                "volunteer": {"id": best_vol.id, "name": best_vol.name, "services": json.loads(best_vol.services)},
                "score": best_score,
            })
        else:
            unmatched_elders.append({"id": elder.id, "name": elder.name})

    total_vols = db.query(models.Volunteer).count()
    total_elders = db.query(models.Elder).count()

    return {
        "stats": {"elders": total_elders, "volunteers": total_vols, "matches": len(matches)},
        "matches": matches,
        "unmatched": unmatched_elders,
    }
