/**
 * ?梁撌亙?賢?
 */

/** ?Ｙ??踹?隞??嚗撘???撅? #XXXX */
function generateAnonymousId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `??撅? #${code}`;
}

/** 撖怠 localStorage */
function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

/** 霈??localStorage嚗銝???喲?閮剖?*/
function loadFromStorage(key, defaultValue = []) {
  const raw = localStorage.getItem(key);
  if (raw === null) return defaultValue;
  try {
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

/** ?澆??????*/
function formatDate(isoString) {
  const d = new Date(isoString);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** 憟?典?摮?憭批?嚗? localStorage 霈???身 16px嚗?*/
function applyGlobalFontSize() {
  const size = localStorage.getItem('global_font_size');
  if (size) {
    document.documentElement.style.fontSize = size + 'px';
  }
}
