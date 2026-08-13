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
    supplyCatEl.setAttribute('required', 'required');
  } else {
    supplySectionEl.classList.add('hidden');
    supplyCatEl.removeAttribute('required');
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
  const record = {
    id: anonymousId,
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

  // 顯示匿名代號
  anonymousIdEl.textContent = anonymousId;
  successModal.classList.remove('hidden');

  // 重置表單
  form.reset();
  supplySectionEl.classList.add('hidden');
});

function closeModal() {
  successModal.classList.add('hidden');
}
