import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
import models
import utils

router = APIRouter(prefix="/resources", tags=["resources"])
UPLOAD_DIR = "uploads"


def resource_to_dict(r: models.Resource, user_lat: float = None, user_lng: float = None):
    fuzzy_lat, fuzzy_lng = utils.fuzzy_location(r.location_lat, r.location_lng)
    d = {
        "id": r.id,
        "user_id": r.user_id,
        "username": r.owner.username if r.owner else None,
        "title": r.title,
        "category": r.category,
        "description": r.description,
        "photo_path": r.photo_path,
        "condition": r.condition,
        "pickup_method": r.pickup_method,
        "expiry_date": r.expiry_date,
        "location_lat": fuzzy_lat,
        "location_lng": fuzzy_lng,
        "location_display": r.location_display,
        "is_available": r.is_available,
        "created_at": r.created_at.isoformat(),
    }
    if user_lat is not None and user_lng is not None:
        d["distance_km"] = round(utils.haversine_distance(user_lat, user_lng, r.location_lat, r.location_lng), 2)
    return d


@router.post("/", status_code=201)
async def create_resource(
    title: str = Form(...),
    category: str = Form(...),
    description: str = Form(None),
    condition: str = Form(None),
    pickup_method: str = Form(...),
    expiry_date: str = Form(None),
    location_lat: float = Form(...),
    location_lng: float = Form(...),
    location_display: str = Form(...),
    photo: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.get_current_user),
):
    if category == "食品" and not expiry_date:
        raise HTTPException(status_code=422, detail="食品類別必須填寫有效期限")

    photo_path = None
    if photo and photo.filename:
        ext = os.path.splitext(photo.filename)[1]
        filename = f"{uuid.uuid4()}{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        content = await photo.read()
        with open(filepath, "wb") as f:
            f.write(content)
        photo_path = filepath

    resource = models.Resource(
        user_id=current_user.id,
        title=title,
        category=category,
        description=description,
        condition=condition,
        pickup_method=pickup_method,
        expiry_date=expiry_date,
        location_lat=location_lat,
        location_lng=location_lng,
        location_display=location_display,
        photo_path=photo_path,
    )
    db.add(resource)
    db.commit()
    db.refresh(resource)

    # 檢查是否有相符的需求
    matched = db.query(models.Demand).filter(
        models.Demand.category == category,
        models.Demand.is_fulfilled == False,
    ).all()
    nearby_matched = [
        d for d in matched
        if utils.haversine_distance(location_lat, location_lng, d.location_lat, d.location_lng) <= 5
    ]

    return {
        **resource_to_dict(resource),
        "matched_demands": [{"id": d.id, "title": d.title} for d in nearby_matched],
    }


@router.get("/")
def list_resources(
    keyword: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    radius_km: float = Query(5.0),
    db: Session = Depends(get_db),
):
    query = db.query(models.Resource).filter(models.Resource.is_available == True)
    if keyword:
        query = query.filter(models.Resource.title.contains(keyword))
    if category:
        query = query.filter(models.Resource.category == category)

    results = query.order_by(models.Resource.created_at.desc()).all()

    if lat is not None and lng is not None:
        results = [
            r for r in results
            if utils.haversine_distance(lat, lng, r.location_lat, r.location_lng) <= radius_km
        ]
        results.sort(key=lambda r: utils.haversine_distance(lat, lng, r.location_lat, r.location_lng))

    return [resource_to_dict(r, lat, lng) for r in results]


@router.get("/{resource_id}")
def get_resource(resource_id: int, db: Session = Depends(get_db)):
    r = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="找不到此物資")
    return resource_to_dict(r)


@router.patch("/{resource_id}/close")
def close_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.get_current_user),
):
    r = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="找不到此物資")
    if r.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="只有發布者可以關閉此物資")
    r.is_available = False
    db.commit()
    return {"message": "物資已標記為已領完"}
