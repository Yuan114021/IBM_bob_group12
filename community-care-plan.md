# 社區關懷平台 — 開發計畫

## 概覽

建立一個純靜態網頁（HTML + CSS + JS + localStorage），實作兩大功能模組：

1. **需求登記**：保護居民隱私的匿名需求提交與審核機制
2. **志工媒合**：長者與志工的雙向配對，含基本身份認證模擬

技術棧：純 HTML / TailwindCSS（CDN）/ Vanilla JS / localStorage  
部署：靜態檔案，無需後端，適合 Demo 展示

---

## 子任務一：專案基礎結構

**Intent**  
建立整個專案的資料夾骨架與共用元件（導覽列、樣式主題、共用 JS 工具），讓後續子任務可以直接在此基礎上開發。

**Expected Outcomes**
- `index.html`：首頁，有兩個功能入口按鈕（需求登記、志工媒合）
- `css/style.css`：自訂樣式（補充 Tailwind 不足處）
- `js/utils.js`：共用工具函式（產生匿名代號、localStorage 讀寫封裝）
- 所有頁面引入 TailwindCSS CDN

**Todo List**
- [ ] 建立資料夾結構：`css/`、`js/`、`pages/`
- [ ] 建立 `index.html`（首頁 + 導覽）
- [ ] 建立 `css/style.css`
- [ ] 建立 `js/utils.js`，實作 `generateAnonymousId()`、`saveToStorage()`、`loadFromStorage()`
- [ ] commit：`feat: 初始化專案結構與共用工具`

**Relevant Context**
- 匿名代號格式：`愛心居民 #` + 4 碼隨機英數字（如 `#A382`）
- localStorage key 規劃：`needs_list`（需求清單）、`volunteers`（志工清單）、`elders`（長者清單）

**Status**  
`[ ] pending`

---

## 子任務二：需求登記功能

**Intent**  
實作匿名需求提交表單與管理員審核介面，保護弱勢居民隱私。

**Expected Outcomes**
- `pages/needs.html`：居民填寫需求的表單頁
  - 填寫欄位：需求類型（下拉）、說明（textarea）、聯絡方式（選填）
  - 選擇「生活物資」時，額外展開物資細項：物資類別（食物/飲水、日用品、藥品、衣物、其他）、數量說明、緊急程度（一般 / 緊急）
  - 送出後顯示系統自動產生的匿名代號
  - 資料存入 localStorage（狀態預設為「待審核」）
- `pages/needs-admin.html`：管理員審核頁（模擬里長/志工端）
  - 列出所有待審核需求（以匿名代號顯示，不顯示真實聯絡資料）
  - 每筆可操作「通過」或「拒絕」，更新 localStorage 狀態
  - 通過的需求才對外顯示
  - 下方設「物資需求公告欄」：列出所有審核通過且類型為生活物資的項目（含物資類別、數量、緊急程度）

**Todo List**
- [ ] 建立 `pages/needs.html`（表單 UI，含物資細項動態展開）
- [ ] 建立 `pages/needs-admin.html`（審核 UI + 物資需求公告欄）
- [ ] 在 `js/needs.js` 實作：表單送出 → 產生代號 → 存 localStorage → 顯示代號 Modal；物資類型時額外儲存細項欄位
- [ ] 在 `js/needs-admin.js` 實作：讀取清單 → 渲染列表 → 通過/拒絕操作 → 物資公告欄渲染
- [ ] commit：`feat: 完成需求登記與審核功能`

**Relevant Context**
- 需求類型選項：生活物資、就醫陪同、日常陪伴、家務協助、其他
- 物資細項（選「生活物資」時才顯示）：
  - 物資類別：食物/飲水、日用品、藥品、衣物、其他
  - 數量／說明：自由文字
  - 緊急程度：一般（綠色標籤）/ 緊急（紅色標籤）
- 審核頁不需要真實登入，提示「此為管理員模式」即可（Demo 用）
- 使用 `utils.js` 的 `generateAnonymousId()` 和 `saveToStorage()`

**Status**  
`[ ] pending`

---

## 子任務三：志工媒合功能

**Intent**  
實作長者需求登記、志工資料登記（含身份認證模擬）與雙向配對結果顯示。

**Expected Outcomes**
- `pages/matching.html`：媒合主頁，兩個入口（長者端 / 志工端）
- `pages/elder-register.html`：長者登記陪伴需求
  - 選擇需要的服務類型（複選）、偏好時段
  - 存入 localStorage
- `pages/volunteer-register.html`：志工登記可提供的服務
  - 選擇可提供的服務項目（複選）、可配合時段
  - 模擬身份認證：顯示「請上傳身分證或良民證」的檔案選擇器（UI 展示用，不真的上傳）
  - 存入 localStorage，狀態標記為「認證中」
- `pages/match-result.html`：配對結果頁
  - 根據服務類型與時段交集，列出配對成功的組合

**Todo List**
- [ ] 建立 `pages/matching.html`（媒合入口頁）
- [ ] 建立 `pages/elder-register.html`（長者登記表單）
- [ ] 建立 `pages/volunteer-register.html`（志工登記表單 + 認證 UI）
- [ ] 建立 `pages/match-result.html`（配對結果展示）
- [ ] 在 `js/matching.js` 實作：讀取長者與志工資料 → 交集配對演算 → 渲染結果
- [ ] commit：`feat: 完成志工媒合與配對功能`

**Relevant Context**
- 服務類型選項：聊天陪伴、散步、陪同看診、代買物資、家務協助
- 時段選項：平日上午、平日下午、平日晚上、假日上午、假日下午
- 配對邏輯：長者需求的服務類型 ∩ 志工可提供項目 ≠ 空集合，且時段有交集
- 志工身份認證為 UI 模擬，不需真實檔案處理

**Status**  
`[ ] pending`
