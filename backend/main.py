from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from database import engine
import models
from routers import auth, resources, demands, volunteers, elders, service_requests

# 建立所有資料表
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="社區物資共享平台", version="1.0.0")

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


@app.get("/health")
def health():
    return {"status": "ok"}
