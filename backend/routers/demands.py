from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
import models
import utils

router = APIRouter(prefix="/demands", tags=["demands"])


class DemandCreate(BaseModel):
    title: str
    category: str
    description: Optional[str] = None
    location_lat: float
    location_lng: float
    location_display: str


def demand_to_dict(d: models.Demand, user_lat: float = None, user_lng: float = None):
    fuzzy_lat, fuzzy_lng = utils.fuzzy_location(d.location_lat, d.location_lng)
    result = {
        "id": d.id,
        "user_id": d.user_id,
        "username": d.owner.username if d.owner else None,
        "title": d.title,
        "category": d.category,
        "description": d.description,
        "location_lat": fuzzy_lat,
        "location_lng": fuzzy_lng,
        "location_display": d.location_display,
        "is_fulfilled": d.is_fulfilled,
        "created_at": d.created_at.isoformat(),
    }
    if user_lat is not None and user_lng is not None:
        result["distance_km"] = round(utils.haversine_distance(user_lat, user_lng, d.location_lat, d.location_lng), 2)
    return result


@router.post("/", status_code=201)
def create_demand(
    req: DemandCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.get_current_user),
):
    demand = models.Demand(
        user_id=current_user.id,
        title=req.title,
        category=req.category,
        description=req.description,
        location_lat=req.location_lat,
        location_lng=req.location_lng,
        location_display=req.location_display,
    )
    db.add(demand)
    db.commit()
    db.refresh(demand)
    return demand_to_dict(demand)


@router.get("/")
def list_demands(
    keyword: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    radius_km: float = Query(5.0),
    db: Session = Depends(get_db),
):
    query = db.query(models.Demand).filter(models.Demand.is_fulfilled == False)
    if keyword:
        query = query.filter(models.Demand.title.contains(keyword))
    if category:
        query = query.filter(models.Demand.category == category)

    results = query.order_by(models.Demand.created_at.desc()).all()

    if lat is not None and lng is not None:
        results = [
            d for d in results
            if utils.haversine_distance(lat, lng, d.location_lat, d.location_lng) <= radius_km
        ]
        results.sort(key=lambda d: utils.haversine_distance(lat, lng, d.location_lat, d.location_lng))

    return [demand_to_dict(d, lat, lng) for d in results]


@router.get("/{demand_id}")
def get_demand(demand_id: int, db: Session = Depends(get_db)):
    d = db.query(models.Demand).filter(models.Demand.id == demand_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="找不到此需求")
    return demand_to_dict(d)


@router.patch("/{demand_id}/fulfill")
def fulfill_demand(
    demand_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.get_current_user),
):
    d = db.query(models.Demand).filter(models.Demand.id == demand_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="找不到此需求")
    if d.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="只有登記者可以關閉此需求")
    d.is_fulfilled = True
    db.commit()
    return {"message": "需求已標記為已滿足"}
