# 社區物資共享平台 — 開發計畫

## 概述

打造一個以社區為單位的物資共享網頁平台，讓居民可以分享多餘的食物、二手物品，
也可以登記自己的需求，並透過地圖視覺化找到附近的物資與需求點。

### 技術選型

| 層級 | 技術 |
|------|------|
| 前端 | React + Vite + Tailwind CSS |
| 後端 | FastAPI (Python) |
| 資料庫 | SQLite (透過 SQLAlchemy ORM) |
| 地圖 | Leaflet.js + OpenStreetMap (免費、無需 API key) |
| 認證 | JWT Token |
| 圖片儲存 | 本機 uploads/ 資料夾 |

### 非目標（本階段不實作）

- 即時聊天功能
- 金流/付費機制
- 行動 App
- 雲端部署

---

## 子任務清單

---

### 子任務 1 — 專案初始化與目錄結構建立

**Intent**
建立前後端的基礎專案骨架，確保開發環境可以正常啟動。

**Expected Outcomes**
- 後端 FastAPI 可在 `http://localhost:8000` 啟動，`/health` 回傳 OK
- 前端 React 可在 `http://localhost:5173` 啟動，顯示初始頁面
- 專案目錄結構清晰，前後端分離

**Todo List**
1. 建立 `backend/` 目錄，初始化 Python 虛擬環境，安裝 FastAPI、uvicorn、SQLAlchemy、python-jose（JWT）、python-multipart（圖片上傳）
2. 建立 `backend/main.py`（FastAPI 進入點）、`backend/database.py`（SQLite 連線）、`backend/models.py`（資料模型）、`backend/routers/` 目錄
3. 建立 `frontend/` 目錄，使用 Vite 初始化 React 專案，安裝 Tailwind CSS、react-router-dom、leaflet、react-leaflet、axios
4. 確認前後端均可正常啟動

**Relevant Context**
- 專案根目錄：`IBM_bob_group12/`
- 後端執行指令：`uvicorn main:app --reload`
- 前端執行指令：`npm run dev`

**Status**: [ ] pending

---

### 子任務 2 — 資料庫模型設計與建立

**Intent**
定義核心資料表，涵蓋使用者、物資發布、需求登記三個主要實體。

**Expected Outcomes**
- SQLite 資料庫自動建立，包含所有資料表
- 各資料表欄位符合需求規格

**Todo List**
1. 設計 `User` 資料表：id、username、email、hashed_password、location_lat、location_lng、created_at
2. 設計 `Resource` 資料表（物資發布）：id、user_id、title、category（食品/衣物/家電/其他）、description、photo_path、condition（新舊程度）、pickup_method（面交/自取/投遞）、expiry_date（食物專用，可為空）、location_lat、location_lng、location_display（模糊地址）、is_available、created_at
3. 設計 `Demand` 資料表（需求登記）：id、user_id、title、category、description、location_lat、location_lng、location_display、is_fulfilled、created_at
4. 在 `database.py` 中設定 SQLAlchemy engine，執行 `Base.metadata.create_all()` 自動建表

**Relevant Context**
- 食物類別需強制填寫 `expiry_date`，由後端 API 驗證
- 地圖顯示使用模糊位置（`location_display`），不暴露精確座標

**Status**: [ ] pending

---

### 子任務 3 — 使用者認證 API（註冊 / 登入 / JWT）

**Intent**
實作使用者註冊與登入功能，產生 JWT token，讓後續需要登入的 API 受到保護。

**Expected Outcomes**
- `POST /auth/register` — 註冊成功回傳使用者資訊
- `POST /auth/login` — 登入成功回傳 JWT token
- 受保護的 API 若未帶 token 則回傳 401

**Todo List**
1. 在 `backend/routers/auth.py` 實作 `/register` 與 `/login` 端點
2. 使用 `passlib` 做密碼雜湊（bcrypt）
3. 使用 `python-jose` 產生與驗證 JWT token
4. 建立 `get_current_user` dependency，供需要登入的路由使用

**Relevant Context**
- 瀏覽功能（搜尋、地圖）不需登入
- 發布物資、登記需求需要登入

**Status**: [ ] pending

---

### 子任務 4 — 物資發布 API

**Intent**
實作物資的新增、查詢（含關鍵字搜尋與地理範圍篩選）、取得單筆、標記已領完等 API。

**Expected Outcomes**
- `POST /resources/` — 發布新物資（需登入，支援圖片上傳）
- `GET /resources/` — 查詢物資列表（支援關鍵字、分類、附近範圍篩選）
- `GET /resources/{id}` — 取得單筆物資詳情
- `PATCH /resources/{id}/close` — 標記物資已領完（需為物資擁有者）

**Todo List**
1. 在 `backend/routers/resources.py` 實作上述端點
2. 圖片上傳儲存至 `backend/uploads/` 並回傳相對路徑
3. 地理範圍篩選：使用 Haversine 公式計算兩點距離，預設顯示 5 公里內的物資
4. 食物類別強制驗證 `expiry_date` 不為空

**Relevant Context**
- 地圖座標不直接暴露給前端，改用 `location_display` 模糊地址
- 地圖標記座標使用「街區中心點」（四捨五入到小數點後兩位）

**Status**: [ ] pending

---

### 子任務 5 — 需求登記 API

**Intent**
實作需求的新增、查詢、媒合（當有人發布符合需求的物資時可通知）等 API。

**Expected Outcomes**
- `POST /demands/` — 登記新需求（需登入）
- `GET /demands/` — 查詢需求列表（支援關鍵字、附近範圍篩選）
- `PATCH /demands/{id}/fulfill` — 標記需求已滿足

**Todo List**
1. 在 `backend/routers/demands.py` 實作上述端點
2. 查詢邏輯與物資 API 相同，使用 Haversine 公式做範圍篩選
3. 新增物資時，後端自動檢查是否有相符的未滿足需求（同分類、同地區），若有則在回應中提示

**Relevant Context**
- 媒合提示為簡單的 API 回應欄位（`matched_demands`），不實作推播通知

**Status**: [ ] pending

---

### 子任務 6 — 前端：基礎頁面與路由架構

**Intent**
建立前端的頁面骨架與導覽結構，讓所有主要頁面可以路由切換。

**Expected Outcomes**
- 導覽列包含：首頁、地圖、發布物資、登記需求、登入/註冊
- 路由正確對應各頁面元件
- 訪客只能看到瀏覽相關頁面，發布類頁面自動導向登入

**Todo List**
1. 建立 `src/pages/` 目錄，新增 HomePage、MapPage、PublishPage、DemandPage、LoginPage、RegisterPage
2. 在 `App.jsx` 設定 react-router-dom 路由
3. 建立 `AuthContext`，管理登入狀態與 JWT token（存放於 localStorage）
4. 建立 `PrivateRoute` 元件，未登入時導向 `/login`

**Relevant Context**
- 前端 API 呼叫使用 axios，設定 baseURL 為 `http://localhost:8000`

**Status**: [ ] pending

---

### 子任務 7 — 前端：地圖頁面（核心功能）

**Intent**
實作地圖視覺化頁面，在地圖上以不同顏色圖示顯示物資點與需求點，並支援點擊查看詳情。

**Expected Outcomes**
- 地圖預設以使用者目前位置為中心（使用瀏覽器 Geolocation API）
- 綠色圖示：物資點；藍色圖示：需求點
- 點擊圖示顯示 Popup，內含標題、分類、模糊地址、查看詳情連結
- 右上角可切換顯示「物資」或「需求」或「全部」

**Todo List**
1. 安裝並設定 react-leaflet，在 MapPage 渲染 OpenStreetMap 底圖
2. 從後端 API 取得附近物資與需求資料，在地圖上渲染 Marker
3. 自訂綠色（物資）與藍色（需求）圖示
4. 實作 Popup 元件顯示簡要資訊
5. 實作篩選切換按鈕（物資/需求/全部）

**Relevant Context**
- 地圖座標使用模糊化後的座標（小數點後兩位）
- Leaflet 需在 `index.html` 或 CSS 引入樣式

**Status**: [ ] pending

---

### 子任務 8 — 前端：搜尋與列表頁面

**Intent**
實作關鍵字搜尋與篩選功能，讓使用者可以找到附近的物資或需求。

**Expected Outcomes**
- 首頁提供搜尋框，輸入關鍵字後顯示物資與需求列表
- 可依分類（食品/衣物/家電/其他）篩選
- 每張卡片顯示：圖片縮圖、標題、分類標籤、模糊地址、發布時間

**Todo List**
1. 建立 `ResourceCard` 與 `DemandCard` 共用元件
2. 在 HomePage 實作搜尋框與篩選器，呼叫後端 API 取得結果
3. 實作分頁或無限捲動（初版使用簡單分頁）

**Relevant Context**
- 預設顯示附近 5 公里內的物資，由後端依座標篩選

**Status**: [ ] pending

---

### 子任務 9 — 前端：發布物資與登記需求表單

**Intent**
實作發布物資與登記需求的表單頁面，包含食物類別的特殊提醒。

**Expected Outcomes**
- 發布物資表單包含：照片上傳、標題、分類、有效期限（食物顯示）、新舊程度、取件方式
- 選擇「食品」分類時，自動跳出安全提醒：「本平台僅供善意分享，生鮮食品請自行評估食用安全」
- 需求登記表單包含：標題、分類、描述
- 表單送出後導向地圖頁，並顯示成功提示

**Todo List**
1. 建立 PublishPage 表單，使用 controlled components 管理狀態
2. 實作食品分類警告 Modal
3. 圖片上傳使用 `multipart/form-data` 送至後端
4. 建立 DemandPage 表單
5. 表單驗證：必填欄位、食物類別必填有效期限

**Relevant Context**
- 位置自動使用使用者的瀏覽器 Geolocation，不需手動輸入

**Status**: [ ] pending

---

## 實作順序建議

```
子任務 1 → 子任務 2 → 子任務 3 → 子任務 4 → 子任務 5
                                              ↓
子任務 9 ← 子任務 8 ← 子任務 7 ← 子任務 6
```

後端先行，前端接著串接 API。
