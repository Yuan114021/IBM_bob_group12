// 管理員審核頁邏輯

const pendingListEl     = document.getElementById('pendingList');
const reviewedListEl    = document.getElementById('reviewedList');
const supplyBoardEl     = document.getElementById('supplyBoard');
const pendingCountEl    = document.getElementById('pendingCount');
const volPendingListEl  = document.getElementById('volPendingList');
const volReviewedListEl = document.getElementById('volReviewedList');
const volPendingCountEl = document.getElementById('volPendingCount');

// ── 需求審核 ──────────────────────────────

function render() {
  const list = loadFromStorage('needs_list', []);

  const pending  = list.filter(r => r.status === 'pending');
  const reviewed = list.filter(r => r.status !== 'pending');
  const approved_supply = list.filter(r => r.status === 'approved' && r.type === '生活物資');

  pendingCountEl.textContent = pending.length ? `（${pending.length} 筆）` : '';

  if (pending.length === 0) {
    pendingListEl.innerHTML = '<p class="text-sm text-gray-400 text-center py-8">目前沒有待審核的需求。</p>';
  } else {
    pendingListEl.innerHTML = pending.map(r => renderCard(r, true)).join('');
  }

  if (reviewed.length === 0) {
    reviewedListEl.innerHTML = '<p class="text-sm text-gray-400 text-center py-4">尚無審核紀錄。</p>';
  } else {
    reviewedListEl.innerHTML = reviewed.map(r => renderCard(r, false)).join('');
  }

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

  const chatBtn = r.status === 'approved' ? `
    <a href="chat.html?room=${encodeURIComponent(r.id)}"
       class="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg px-3 py-1.5 transition font-semibold">
      💬 開啟匿名聊天室
    </a>
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
      ${chatBtn}
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

// ── 志工審核 ──────────────────────────────

function renderVolunteers() {
  const volunteers = loadFromStorage('volunteers', []);
  const pending  = volunteers.filter(v => !v.verified && v.verifyStatus !== 'rejected');
  const reviewed = volunteers.filter(v => v.verified || v.verifyStatus === 'rejected');

  volPendingCountEl.textContent = pending.length ? `（${pending.length} 筆待審）` : '';

  if (pending.length === 0) {
    volPendingListEl.innerHTML = '<p class="text-sm text-gray-400 text-center py-6">目前沒有待審核的志工。</p>';
  } else {
    volPendingListEl.innerHTML = pending.map(v => renderVolCard(v, true)).join('');
  }

  if (reviewed.length === 0) {
    volReviewedListEl.innerHTML = '<p class="text-sm text-gray-400 text-center py-3">尚無審核紀錄。</p>';
  } else {
    volReviewedListEl.innerHTML = reviewed.map(v => renderVolCard(v, false)).join('');
  }
}

function renderVolCard(v, showActions) {
  const badge = v.verified
    ? '<span class="badge-volunteer">💜 愛心志工</span>'
    : v.verifyStatus === 'rejected'
      ? '<span class="badge-rejected">已拒絕</span>'
      : '<span class="badge-pending">待審核</span>';

  const actions = showActions ? `
    <div class="flex gap-2 mt-3">
      <button onclick="updateVolStatus('${v.id}', true)"
        class="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg py-2 transition">
        ✓ 核發「愛心志工」徽章
      </button>
      <button onclick="updateVolStatus('${v.id}', false)"
        class="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg py-2 transition">
        ✗ 拒絕
      </button>
    </div>
  ` : '';

  return `
    <div class="bg-white rounded-xl border border-gray-200 p-4">
      <div class="flex items-start justify-between gap-3 flex-wrap mb-2">
        <div>
          <span class="font-bold text-gray-700 text-sm">${v.name}</span>
          <span class="ml-2 text-xs text-gray-400">${v.phone}</span>
        </div>
        ${badge}
      </div>
      <div class="flex flex-wrap gap-1 mb-1">
        ${v.services.map(s => `<span class="text-xs bg-purple-50 text-purple-700 rounded-full px-2 py-0.5">${s}</span>`).join('')}
      </div>
      <div class="flex flex-wrap gap-1">
        ${v.times.map(t => `<span class="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">${t}</span>`).join('')}
      </div>
      <p class="text-xs text-gray-300 mt-2">${formatDate(v.createdAt)}</p>
      ${actions}
    </div>
  `;
}

function updateVolStatus(id, approve) {
  const volunteers = loadFromStorage('volunteers', []);
  const idx = volunteers.findIndex(v => v.id === id);
  if (idx !== -1) {
    volunteers[idx].verified     = approve;
    volunteers[idx].verifyStatus = approve ? 'approved' : 'rejected';
    saveToStorage('volunteers', volunteers);
    renderVolunteers();
  }
}

render();
renderVolunteers();
