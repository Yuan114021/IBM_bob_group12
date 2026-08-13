// 配對演算邏輯

const elders     = loadFromStorage('elders', []);
const volunteers = loadFromStorage('volunteers', []);

const matchListEl       = document.getElementById('matchList');
const unmatchedListEl   = document.getElementById('unmatchedList');
const unmatchedSection  = document.getElementById('unmatchedSection');

document.getElementById('statElders').textContent    = elders.length;
document.getElementById('statVolunteers').textContent = volunteers.length;

/**
 * 配對條件：
 *  - 服務項目交集不為空
 *  - 時段交集不為空
 */
function intersect(a, b) {
  return a.filter(v => b.includes(v));
}

const matched   = [];
const matchedElderIds = new Set();

elders.forEach(elder => {
  const candidates = volunteers.map(vol => {
    const commonServices = intersect(elder.services, vol.services);
    const commonTimes    = intersect(elder.times, vol.times);
    if (commonServices.length > 0 && commonTimes.length > 0) {
      return { vol, commonServices, commonTimes };
    }
    return null;
  }).filter(Boolean);

  if (candidates.length > 0) {
    matchedElderIds.add(elder.id);
    matched.push({ elder, candidates });
  }
});

document.getElementById('statMatches').textContent = matched.length;

// 渲染配對結果
if (matched.length === 0) {
  matchListEl.innerHTML = `
    <div class="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-400">
      <div class="text-4xl mb-3">🔍</div>
      <p class="text-sm">目前還沒有配對結果。</p>
      <p class="text-xs mt-1">請先完成長者與志工登記。</p>
      <a href="matching.html" class="inline-block mt-4 text-blue-600 text-sm hover:underline">前往登記 →</a>
    </div>
  `;
} else {
  matchListEl.innerHTML = matched.map(({ elder, candidates }) => `
    <div class="bg-white rounded-2xl border border-gray-200 p-6">
      <!-- 長者資訊 -->
      <div class="flex items-center gap-3 mb-4">
        <span class="text-2xl">👴</span>
        <div>
          <span class="font-bold text-gray-800">${elder.name}</span>
          <span class="text-xs text-gray-400 ml-2">${formatDate(elder.createdAt)}</span>
        </div>
      </div>
      <div class="flex flex-wrap gap-2 mb-4">
        ${elder.services.map(s => `<span class="text-xs bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-3 py-0.5">${s}</span>`).join('')}
        ${elder.times.map(t => `<span class="text-xs bg-gray-100 text-gray-600 rounded-full px-3 py-0.5">${t}</span>`).join('')}
      </div>

      <!-- 配對志工清單 -->
      <div class="space-y-3 border-t border-gray-100 pt-4">
        ${candidates.map(({ vol, commonServices, commonTimes }) => {
          const matchRoomId = `MATCH_${elder.id}_${vol.id}`;
          return `
          <div class="bg-green-50 rounded-xl p-4 border border-green-100">
            <div class="flex items-start gap-3">
              <span class="text-xl">🙋</span>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-semibold text-gray-700 text-sm">${vol.name}</span>
                  ${vol.verified
                    ? '<span class="badge-volunteer">💜 愛心志工</span>'
                    : '<span class="badge-pending">認證中</span>'}
                </div>
                <div class="mt-1 flex flex-wrap gap-1">
                  <span class="text-xs text-gray-400">共同服務：</span>
                  ${commonServices.map(s => `<span class="text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5">${s}</span>`).join('')}
                </div>
                <div class="mt-1 flex flex-wrap gap-1">
                  <span class="text-xs text-gray-400">共同時段：</span>
                  ${commonTimes.map(t => `<span class="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">${t}</span>`).join('')}
                </div>
              </div>
            </div>
            <div class="mt-3 flex justify-end">
              <a href="chat.html?room=${encodeURIComponent(matchRoomId)}"
                 class="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-white hover:bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 transition font-semibold">
                💬 開啟匿名聊天室
              </a>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>
  `).join('');
}

// 渲染未配對長者
const unmatched = elders.filter(e => !matchedElderIds.has(e.id));
if (unmatched.length > 0) {
  unmatchedSection.classList.remove('hidden');
  unmatchedListEl.innerHTML = unmatched.map(elder => `
    <div class="bg-white rounded-xl border border-dashed border-gray-300 p-4 flex items-center gap-3">
      <span class="text-xl">👴</span>
      <div class="flex-1">
        <span class="font-medium text-gray-700 text-sm">${elder.name}</span>
        <div class="flex flex-wrap gap-1 mt-1">
          ${elder.services.map(s => `<span class="text-xs bg-blue-50 text-blue-700 rounded-full px-2 py-0.5">${s}</span>`).join('')}
        </div>
      </div>
      <a href="volunteer-register.html" class="text-xs text-blue-600 hover:underline whitespace-nowrap">徵求志工 →</a>
    </div>
  `).join('');
}
