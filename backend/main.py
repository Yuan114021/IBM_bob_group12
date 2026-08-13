from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from contextlib import asynccontextmanager
import os
from database import get_db, engine
import models
from routers import auth, resources, demands, volunteers, elders, service_requests, gov_announcements

# 建立所有資料表
models.Base.metadata.create_all(bind=engine)

scheduler = AsyncIOScheduler()


async def _scheduled_fetch():
    """排程爬蟲：每天自動執行一次"""
    db = next(get_db())
    try:
        await gov_announcements.fetch_and_save(db)
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 啟動時立刻爬一次，之後每天一次
    await _scheduled_fetch()
    scheduler.add_job(_scheduled_fetch, "interval", hours=24)
    scheduler.start()
    yield
    scheduler.shutdown()


app = FastAPI(title="社區物資共享平台", version="1.0.0", lifespan=lifespan)

# CORS 設定
import os as _os
_allowed = _os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://192.168.152.135:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 靜態檔案（圖片）
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# 路由
app.include_router(auth.router)
app.include_router(resources.router)
app.include_router(demands.router)
app.include_router(volunteers.router)
app.include_router(elders.router)
app.include_router(service_requests.router)
app.include_router(gov_announcements.router)


@app.get("/health")
def health():
    return {"status": "ok"}
