// 匿名聊天室邏輯

let currentRoom = '';
let myAlias     = '';   // 顯示用代號（如「居民 #A382」或「志工 小明」）
let myRole      = '居民';

// ── 讀取 URL 參數，自動帶入房間代號 ──
(function () {
  const params = new URLSearchParams(window.location.search);
  const roomFromUrl = params.get('room');
  if (roomFromUrl) {
    document.getElementById('roomIdInput').value = decodeURIComponent(roomFromUrl);
  }
})();

// ── 進入聊天室 ──
document.getElementById('enterBtn').addEventListener('click', () => {
  const roomId   = document.getElementById('roomIdInput').value.trim();
  const nickname = document.getElementById('nicknameInput').value.trim();
  myRole         = document.querySelector('input[name="myRole"]:checked').value;

  if (!roomId) { alert('請輸入需求代號或配對編號'); return; }

  currentRoom = 'chat_' + roomId;
  myAlias     = nickname || (myRole === '居民' ? '匿名居民' : '匿名志工');

  // 切換到聊天室
  document.getElementById('entryPanel').classList.add('hidden');
  document.getElementById('chatPanel').classList.remove('hidden');
  document.getElementById('navRoomId').textContent   = roomId;
  document.getElementById('chatRoomTitle').textContent = `聊天室：${roomId}`;
  document.getElementById('chatMyRole').textContent  = `您的身份：${myAlias}（${myRole}）`;

  // 發送進入訊息
  pushSystemMsg(`${myAlias} 已進入聊天室`);
  renderMessages();
  document.getElementById('msgInput').focus();
});

// ── 送出訊息 ──
document.getElementById('sendBtn').addEventListener('click', sendMessage);
document.getElementById('msgInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});

function sendMessage() {
  const input = document.getElementById('msgInput');
  const text  = input.value.trim();
  if (!text) return;

  const msgs = loadFromStorage(currentRoom, []);
  msgs.push({
    alias:   myAlias,
    role:    myRole,
    text,
    type:    'message',
    sentAt:  new Date().toISOString(),
  });
  saveToStorage(currentRoom, msgs);
  input.value = '';
  renderMessages();
}

// ── 系統訊息 ──
function pushSystemMsg(text) {
  const msgs = loadFromStorage(currentRoom, []);
  msgs.push({ type: 'system', text, sentAt: new Date().toISOString() });
  saveToStorage(currentRoom, msgs);
}

// ── 渲染訊息 ──
function renderMessages() {
  const list = loadFromStorage(currentRoom, []);
  const el   = document.getElementById('messageList');

  if (list.length === 0) {
    el.innerHTML = `
      <div class="text-center text-gray-400 text-sm py-10">
        <div class="text-3xl mb-2">💬</div>
        <p>聊天室是空的，送出第一則訊息吧！</p>
        <p class="text-xs mt-1">雙方使用相同代號進入，即可匿名溝通。</p>
      </div>`;
    return;
  }

  el.innerHTML = list.map(msg => {
    if (msg.type === 'system' || msg.type === 'contact') {
      const icon = msg.type === 'contact' ? '📞' : 'ℹ️';
      return `<div class="text-center"><span class="msg-system">${icon} ${escHtml(msg.text)}</span></div>`;
    }

    const isMe  = msg.alias === myAlias;
    const time  = formatDate(msg.sentAt).split(' ')[1];    // 只顯示時間
    const color = msg.role === '志工' ? 'text-purple-600' : 'text-blue-600';

    return `
      <div class="flex ${isMe ? 'justify-end' : 'justify-start'} gap-2">
        ${!isMe ? `<div class="w-8 h-8 rounded-full bg-gray-200 text-sm flex items-center justify-center shrink-0">${msg.role === '志工' ? '🙋' : '🏠'}</div>` : ''}
        <div class="max-w-xs">
          ${!isMe ? `<div class="text-xs ${color} font-semibold mb-1">${escHtml(msg.alias)}</div>` : ''}
          <div class="${isMe ? 'msg-bubble-me' : 'msg-bubble-other'} px-4 py-2 text-sm text-gray-800 leading-relaxed">
            ${escHtml(msg.text)}
          </div>
          <div class="text-xs text-gray-300 mt-0.5 ${isMe ? 'text-right' : ''}">${time}</div>
        </div>
        ${isMe ? `<div class="w-8 h-8 rounded-full bg-blue-100 text-sm flex items-center justify-center shrink-0">我</div>` : ''}
      </div>`;
  }).join('');

  // 捲到最新訊息
  el.scrollTop = el.scrollHeight;
}

// ── 清除聊天記錄 ──
document.getElementById('clearBtn').addEventListener('click', () => {
  if (!confirm('確定要清除此聊天室的所有記錄嗎？')) return;
  localStorage.removeItem(currentRoom);
  renderMessages();
});

// ── 交換聯絡方式 ──
document.getElementById('shareContactBtn').addEventListener('click', () => {
  document.getElementById('contactModal').classList.remove('hidden');
});

document.getElementById('sendContactBtn').addEventListener('click', () => {
  const text = document.getElementById('contactText').value.trim();
  if (!text) { alert('請填寫聯絡資訊'); return; }

  const msgs = loadFromStorage(currentRoom, []);
  msgs.push({
    type:   'contact',
    text:   `${myAlias} 分享聯絡方式：${text}`,
    sentAt: new Date().toISOString(),
  });
  saveToStorage(currentRoom, msgs);
  document.getElementById('contactText').value = '';
  document.getElementById('contactModal').classList.add('hidden');
  renderMessages();
});

// ── XSS 防護 ──
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
