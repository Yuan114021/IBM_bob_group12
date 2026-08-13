// 需求登記表單邏輯

const needTypeEl      = document.getElementById('needType');
const supplySectionEl = document.getElementById('supplySection');
const supplyCatEl     = document.getElementById('supplyCategory');
const supplyQtyEl     = document.getElementById('supplyQty');
const needDescEl      = document.getElementById('needDesc');
const needContactEl   = document.getElementById('needContact');
const form            = document.getElementById('needsForm');
const successModal    = document.getElementById('successModal');
const anonymousIdEl   = document.getElementById('anonymousId');

// 選「生活物資」時展開細項
needTypeEl.addEventListener('change', () => {
  if (needTypeEl.value === '生活物資') {
    supplySectionEl.classList.remove('hidden');
    supplyCatEl.disabled = false;
  } else {
    supplySectionEl.classList.add('hidden');
    supplyCatEl.disabled = true;
    supplyCatEl.value = '';   // 切換類型時重置，避免殘值
  }
});

// 表單送出
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const type = needTypeEl.value;
  if (!type) {
    alert('請選擇需求類型');
    return;
  }

  // 物資細項驗證
  let supplyData = null;
  if (type === '生活物資') {
    const category = supplyCatEl.value;
    if (!category) {
      alert('請選擇物資類別');
      return;
    }
    const urgency = document.querySelector('input[name="urgency"]:checked')?.value || '一般';
    supplyData = {
      category,
      qty: supplyQtyEl.value.trim(),
      urgency,
    };
  }

  const anonymousId = generateAnonymousId();
  const chatCode    = anonymousId;   // 聊天室代碼 = 需求匿名代號，方便對方輸入
  const record = {
    id: anonymousId,
    chatCode,
    type,
    desc: needDescEl.value.trim(),
    contact: needContactEl.value.trim(),
    supply: supplyData,
    status: 'pending',       // pending | approved | rejected
    createdAt: new Date().toISOString(),
  };

  const list = loadFromStorage('needs_list', []);
  list.unshift(record);
  saveToStorage('needs_list', list);

  // 顯示匿名代號 + 聊天室代碼
  anonymousIdEl.textContent = anonymousId;
  document.getElementById('chatCodeDisplay').textContent = chatCode;
  document.getElementById('chatEntryLink').href = `chat.html?room=${encodeURIComponent(chatCode)}`;
  successModal.classList.remove('hidden');

  // 重置表單（手動 reset 避免觸發 change 事件殘留 required）
  needTypeEl.value   = '';
  needDescEl.value   = '';
  needContactEl.value = '';
  supplySectionEl.classList.add('hidden');
  supplyCatEl.value   = '';
  supplyCatEl.disabled = true;
  supplyQtyEl.value   = '';
  const urgencyDefault = document.querySelector('input[name="urgency"][value="一般"]');
  if (urgencyDefault) urgencyDefault.checked = true;
});

function closeModal() {
  successModal.classList.add('hidden');
}
