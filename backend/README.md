# 社區物資共享平台 — 後端

## 環境建立

```bash
cd backend
python -m venv venv
venv\Scripts\activate      # Windows
pip install -r requirements.txt
```

## 啟動後端

```bash
uvicorn main:app --reload
```

- API 文件：http://localhost:8000/docs
- 健康檢查：http://localhost:8000/health
