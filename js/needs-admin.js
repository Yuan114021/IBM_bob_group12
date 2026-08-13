// 管理員審核頁邏輯

const pendingListEl  = document.getElementById('pendingList');
const reviewedListEl = document.getElementById('reviewedList');
const supplyBoardEl  = document.getElementById('supplyBoard');
const pendingCountEl = document.getElementById('pendingCount');

function render() {
  const list = loadFromStorage('needs_list', []);

  const pending  = list.filter(r => r.status === 'pending');
  const reviewed = list.filter(r => r.status !== 'pending');
  const approved_supply = list.filter(r => r.status === 'approved' && r.type === '生活物資');

  // 待審核數量
  pendingCountEl.textContent = pending.length ? `（${pending.length} 筆）` : '';

  // 待審核清單
  if (pending.length === 0) {
    pendingListEl.innerHTML = '<p class="text-sm text-gray-400 text-center py-8">目前沒有待審核的需求。</p>';
  } else {
    pendingListEl.innerHTML = pending.map(r => renderCard(r, true)).join('');
  }

  // 已審核紀錄
  if (reviewed.length === 0) {
    reviewedListEl.innerHTML = '<p class="text-sm text-gray-400 text-center py-4">尚無審核紀錄。</p>';
  } else {
    reviewedListEl.innerHTML = reviewed.map(r => renderCard(r, false)).join('');
  }

  // 物資公告欄
  if (approved_supply.length === 0) {
    supplyBoardEl.innerHTML = '<p class="text-sm text-gray-400 text-center py-4">目前沒有物資需求。</p>';
  } else {
    supplyBoardEl.innerHTML = approved_supply.map(r => `
      <div class="bg-white rounded-xl border border-orange-100 p-4 flex items-start gap-4">
        <div class="text-2xl">📦</div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap mb-1">
            <span class="font-semibold text-gray-700 text-sm">${r.supply?.category || '–'}</span>
            ${r.supply?.urgency === '緊急' ? '<span class="badge-urgent">緊急</span>' : '<span class="badge-normal">一般</span>'}
          </div>
          ${r.supply?.qty ? `<p class="text-sm text-gray-500">${r.supply.qty}</p>` : ''}
          ${r.desc ? `<p class="text-xs text-gray-400 mt-1">${r.desc}</p>` : ''}
          <p class="text-xs text-gray-300 mt-1">${formatDate(r.createdAt)}</p>
        </div>
      </div>
    `).join('');
  }
}

function renderCard(r, showActions) {
  const statusBadge = {
    pending:  '<span class="badge-pending">待審核</span>',
    approved: '<span class="badge-approved">已通過</span>',
    rejected: '<span class="badge-rejected">已拒絕</span>',
  }[r.status] || '';

  const supplyInfo = r.supply ? `
    <div class="mt-2 text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2 inline-flex gap-3 flex-wrap">
      <span>📦 ${r.supply.category}</span>
      ${r.supply.qty ? `<span>${r.supply.qty}</span>` : ''}
      ${r.supply.urgency === '緊急' ? '<span class="badge-urgent">緊急</span>' : '<span class="badge-normal">一般</span>'}
    </div>
  ` : '';

  const actions = showActions ? `
    <div class="flex gap-2 mt-3">
      <button onclick="updateStatus('${r.id}','approved')"
        class="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg py-2 transition">
        ✓ 通過
      </button>
      <button onclick="updateStatus('${r.id}','rejected')"
        class="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg py-2 transition">
        ✗ 拒絕
      </button>
    </div>
  ` : '';

  return `
    <div class="bg-white rounded-xl border border-gray-200 p-4">
      <div class="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <span class="font-bold text-gray-700 text-sm">${r.id}</span>
          <span class="ml-2 text-xs text-gray-400">${r.type}</span>
        </div>
        ${statusBadge}
      </div>
      ${supplyInfo}
      ${r.desc ? `<p class="text-sm text-gray-500 mt-2">${r.desc}</p>` : ''}
      <p class="text-xs text-gray-300 mt-1">${formatDate(r.createdAt)}</p>
      ${actions}
    </div>
  `;
}

function updateStatus(id, status) {
  const list = loadFromStorage('needs_list', []);
  const idx = list.findIndex(r => r.id === id);
  if (idx !== -1) {
    list[idx].status = status;
    saveToStorage('needs_list', list);
    render();
  }
}

render();
