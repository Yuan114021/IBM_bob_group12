/**
 * 共用工具函式
 */

/** 產生匿名代號，格式：愛心居民 #XXXX */
function generateAnonymousId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `愛心居民 #${code}`;
}

/** 寫入 localStorage */
function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

/** 讀取 localStorage，找不到時回傳預設值 */
function loadFromStorage(key, defaultValue = []) {
  const raw = localStorage.getItem(key);
  if (raw === null) return defaultValue;
  try {
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

/** 格式化日期時間 */
function formatDate(isoString) {
  const d = new Date(isoString);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** 套用全域字體大小（從 localStorage 讀取，預設 16px） */
function applyGlobalFontSize() {
  const size = localStorage.getItem('global_font_size');
  if (size) {
    document.documentElement.style.fontSize = size + 'px';
  }
}
