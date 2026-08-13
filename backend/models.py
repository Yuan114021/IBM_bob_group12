from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    resources = relationship("Resource", back_populates="owner")
    demands = relationship("Demand", back_populates="owner")


class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False)  # 食品/衣物/家電/其他
    description = Column(Text, nullable=True)
    photo_path = Column(String, nullable=True)
    condition = Column(String, nullable=True)   # 全新/良好/普通/堪用
    pickup_method = Column(String, nullable=False)  # 面交/自取/投遞
    expiry_date = Column(String, nullable=True)     # 僅食品類使用 (YYYY-MM-DD)
    location_lat = Column(Float, nullable=False)
    location_lng = Column(Float, nullable=False)
    location_display = Column(String, nullable=False)  # 模糊地址
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="resources")


class Demand(Base):
    __tablename__ = "demands"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    location_lat = Column(Float, nullable=False)
    location_lng = Column(Float, nullable=False)
    location_display = Column(String, nullable=False)
    is_fulfilled = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="demands")


class Volunteer(Base):
    __tablename__ = "volunteers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    services = Column(String, nullable=False)   # JSON 陣列字串，例如 '["居家訪視","課程教學"]'
    time_slots = Column(String, nullable=False)  # JSON 陣列字串
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Elder(Base):
    __tablename__ = "elders"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    services = Column(String, nullable=False)   # JSON 陣列字串
    time_slots = Column(String, nullable=False)  # JSON 陣列字串
    note = Column(Text, nullable=True)
    is_matched = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class ServiceRequest(Base):
    __tablename__ = "service_requests"

    id = Column(Integer, primary_key=True, index=True)
    anonymous_id = Column(String, nullable=False, index=True)
    request_type = Column(String, nullable=False)   # 服務類型
    category = Column(String, nullable=True)        # 物資分類（物資需求時使用）
    quantity = Column(String, nullable=True)
    urgency = Column(String, nullable=True)         # 一般/急迫
    description = Column(Text, nullable=True)
    phone = Column(String, nullable=True)
    status = Column(String, default="pending")      # pending / approved / fulfilled
    created_at = Column(DateTime, default=datetime.utcnow)
