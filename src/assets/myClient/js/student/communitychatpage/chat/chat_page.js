document.addEventListener('DOMContentLoaded', () => {
  /* ──────────────────────────────────────────────────────────────
    HELPERS & STATE
  ────────────────────────────────────────────────────────────── */
  const unreadCounts = {};
  const mutedRooms   = new Set();
  const GAP_MS       = 20 * 60 * 1000;
  const slug         = s => s.toLowerCase().replace(/[^a-z0-9]+/g,'-');
  const meAvatar     = '{% static "img/avatars/1.png" %}';
  window.leftCommunities = window.leftCommunities || {};

  function nowISO() {
    return new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  }
  function toAmPm(d) {
    const yyyy = d.getFullYear(),
          MM   = String(d.getMonth()+1).padStart(2,'0'),
          dd   = String(d.getDate()).padStart(2,'0'),
          hh24 = d.getHours(),
          ampm = hh24 >= 12 ? 'PM' : 'AM',
          hh   = String((hh24 % 12) || 12).padStart(2,'0'),
          mi   = String(d.getMinutes()).padStart(2,'0');
    return `${yyyy}-${MM}-${dd} ${hh}:${mi} ${ampm}`;
  }
  function timeAgo(d) {
    const sec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (sec < 5)   return 'just now';
    if (sec < 60)  return sec + 's ago';
    const min = Math.floor(sec / 60);
    if (min < 60)  return min + 'm ago';
    const hr = Math.floor(min / 60);
    if (hr < 24)   return hr + 'h ago';
    return Math.floor(hr / 24) + 'd ago';
  }

  /* ──────────────────────────────────────────────────────────────
    AUTO-SCROLL HELPERS
  ────────────────────────────────────────────────────────────── */
  const chatBody = document.querySelector('.chat-history-body');
  function scrollToBottom() {
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  /* ──────────────────────────────────────────────────────────────
    MUTE MENU LOGIC
  ────────────────────────────────────────────────────────────── */
  const muteMenuItem = Array.from(
    document.querySelectorAll('.dropdown-menu .dropdown-item')
  ).find(a => a.textContent.trim().startsWith('Mute'));

  if (muteMenuItem) {
    muteMenuItem.addEventListener('click', e => {
      e.preventDefault();
      if (!currentRoom) return;
      if (mutedRooms.has(currentRoom)) mutedRooms.delete(currentRoom);
      else mutedRooms.add(currentRoom);
      updateMuteMenu();
      updateMuteIcon(currentRoom);
    });
  }

  function updateMuteMenu() {
    if (!muteMenuItem) return;
    const icon = muteMenuItem.querySelector('i');
    const txt  = muteMenuItem;
    if (mutedRooms.has(currentRoom)) {
      icon.classList.replace('mdi-bell-off-outline','mdi-bell-outline');
      txt.childNodes[1].textContent = ' Unmute';
    } else {
      icon.classList.replace('mdi-bell-outline','mdi-bell-off-outline');
      txt.childNodes[1].textContent = ' Mute';
    }
  }

  function updateMuteIcon(room) {
    const li = document.querySelector(`.community-item[data-slug="${room}"]`);
    if (!li) return;
    // remove any existing
    const prev = li.querySelector('.muted-icon');
    if (prev) prev.remove();
    if (mutedRooms.has(room)) {
      const icon = document.createElement('i');
      icon.className = 'mdi mdi-bell-off-outline text-muted ms-1 muted-icon';
      li.querySelector('a').appendChild(icon);
    }
  }

  /* ──────────────────────────────────────────────────────────────
    INITIAL “last-msg-time” ELEMENT
  ────────────────────────────────────────────────────────────── */
  document.querySelectorAll('.community-item').forEach(li => {
    li.dataset.slug = slug(li.dataset.name);
    const a = li.querySelector('a');
    const last = document.createElement('small');
    last.className = 'last-msg-time text-muted small';
    last.style.marginLeft = '0.5rem';
    a.appendChild(last);
  });

  function updateAllLastTimes() {
    Object.entries(chats).forEach(([room, msgs]) => {
      if (!msgs.length) return;
      const lastMsg = msgs[msgs.length - 1];
      const li      = document.querySelector(`.community-item[data-slug="${room}"]`);
      if (!li) return;
      const lbl = li.querySelector('.last-msg-time');
      lbl.textContent = timeAgo(new Date(lastMsg.time));
      updateMuteIcon(room);
    });
  }

  /* ──────────────────────────────────────────────────────────────
    BUMP & UNREAD HANDLING
  ────────────────────────────────────────────────────────────── */
  function moveLiToTop(li) {
    const list    = document.getElementById('community-list'),
          titleLi = list.querySelector('.chat-contact-list-item-title');
    list.insertBefore(li, titleLi.nextSibling);
  }
  function bumpCommunity(room) {
    const li = document.querySelector(`.community-item[data-slug="${room}"]`);
    if (!li) return;
    unreadCounts[room] = (unreadCounts[room]||0) + 1;
    let badge = li.querySelector('.unread-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'badge bg-danger ms-2 unread-badge';
      li.querySelector('.chat-contact-info').appendChild(badge);
    }
    badge.textContent = unreadCounts[room];
    moveLiToTop(li);
  }
  function moveCommunity(room) {
    const li = document.querySelector(`.community-item[data-slug="${room}"]`);
    if (li) moveLiToTop(li);
  }
  function clearUnread(room) {
    unreadCounts[room] = 0;
    const li = document.querySelector(`.community-item[data-slug="${room}"]`);
    if (!li) return;
    const b = li.querySelector('.unread-badge');
    if (b) b.remove();
  }

  /* ──────────────────────────────────────────────────────────────
    PATCH window.addSystemEvent
  ────────────────────────────────────────────────────────────── */
  const origAdd = window.addSystemEvent;
  window.addSystemEvent = (room, txt) => {
    origAdd(room, txt);
    if (room !== currentRoom) bumpCommunity(room);
    updateAllLastTimes();
  };
  document.querySelectorAll('.community-item').forEach(li => {
    li.addEventListener('click', () => clearUnread(li.dataset.slug));
  });

  /* ──────────────────────────────────────────────────────────────
    CHAT DATA & DOM REFS
  ────────────────────────────────────────────────────────────── */
  const initialChats = {
    'junior-marketing-society': [
      { user:'system', text:'Ben White joined.', time:'2025-04-29T09:58:00Z' },
      { user:'me', text:'Welcome! 🎉', time:'2025-04-29T10:00:00Z', avatar:meAvatar },
      { user:'Ben White', text:'Don’t forget tomorrow’s workshop!', time:'2025-04-29T10:02:00Z', avatar:'{% static "img/avatars/2.png" %}' }
    ],
    'dev-club': [
      { user:'me', text:'Stand-up in 5 minutes.', time:'2025-04-29T09:55:00Z', avatar:meAvatar },
      { user:'Evan Yu', text:'Roger that.', time:'2025-04-29T09:56:00Z', avatar:'{% static "img/avatars/5.png" %}' }
    ],
    'art-hub': [
      { user:'system', text:'Jamie joined.', time:'2025-04-28T18:28:00Z' },
      { user:'Jamie Chua', text:'Uploading mock-ups.', time:'2025-04-28T18:30:00Z', avatar:'{% static "img/avatars/3.png" %}' }
    ]
  };
  const chats = JSON.parse(JSON.stringify(initialChats));

  const list       = document.getElementById('community-list');
  const coverImg   = document.getElementById('commCover');
  const avatarL    = document.getElementById('commAvatar');
  const nameL      = document.getElementById('commName');
  const tagsL      = document.getElementById('commTags');
  const descL      = document.getElementById('commDesc');
  const headerAv   = document.getElementById('headerAvatar');
  const headerNm   = document.getElementById('headerName');
  const headerMem  = document.getElementById('headerMembers');
  const msgInput   = document.getElementById('msgInput');
  const msgList    = document.getElementById('messageList');
  const clearBtn   = document.querySelector('.clear-chat-btn');
  const sendForm   = document.querySelector('.form-send-message');
  const placeholderHTML = msgList.querySelector('.placeholder-msg').outerHTML;
  let   currentRoom = null;

  /* ──────────────────────────────────────────────────────────────
    RENDER & LOAD COMMUNITY
  ────────────────────────────────────────────────────────────── */
  function renderMessages(room) {
    const arr = chats[room]||[];
    if (!arr.length) {
      msgList.innerHTML = placeholderHTML;
      scrollToBottom();
      return;
    }
    let html = '', prev = null;
    arr.forEach(m => {
      const date = new Date(m.time);
      if (!prev || (date - prev) > GAP_MS) {
        html += `<li class="chat-divider text-center text-muted small my-2">${toAmPm(date)}</li>`;
      }
      prev = date;
      if (m.user==='system') {
        html += `<li class="chat-divider text-center text-muted small my-2">— ${m.text} —</li>`;
        return;
      }
      const me = m.user==='me';
      const side = me ? 'right' : 'left';
      const name = me ? '' : `<small class="text-primary">${m.user}</small>`;
      const avat = `<img src="${m.avatar}" class="rounded-circle">`;
      html += `
        <li class="chat-message chat-message-${side}">
          <div class="d-flex overflow-hidden">
            ${!me ? `<div class="user-avatar flex-shrink-0 me-3"><div class="avatar avatar-sm">${avat}</div></div>` : ''}
            <div class="chat-message-wrapper flex-grow-1">
              ${name}
              <div class="chat-message-text"><p class="mb-0">${m.text}</p></div>
              <div class="${me?'text-end':''} text-muted small"><small class="msg-time">${toAmPm(date)}</small></div>
            </div>
            ${me ? `<div class="user-avatar flex-shrink-0 ms-3"><div class="avatar avatar-sm">${avat}</div></div>` : ''}
          </div>
        </li>`;
    });
    msgList.innerHTML = html;
    scrollToBottom();
  }

  function loadCommunity(li) {
    const d    = li.dataset,
          room = d.slug;
    list.querySelectorAll('.community-item').forEach(x=>x.classList.remove('active'));
    li.classList.add('active');
    coverImg.src        = d.cover;
    avatarL.src         = headerAv.src = d.avatar;
    nameL.textContent   = headerNm.textContent = d.name;
    tagsL.textContent   = d.tags;
    descL.textContent   = d.desc;
    headerMem.textContent = `${d.members} members`;
    msgInput.placeholder  = `Message #${room}`;
    document.querySelector('.chat-history-footer')
            .classList.toggle('d-none', !!window.leftCommunities?.[room]);
    currentRoom = room;

    renderMessages(room);
    updateAllLastTimes();
    updateMuteMenu();
  }

  document.querySelectorAll('.community-item')
          .forEach(li => li.addEventListener('click', () => loadCommunity(li)));
  loadCommunity(document.querySelector('.community-item.active'));

  /* ──────────────────────────────────────────────────────────────
    SENDING MY MESSAGE
  ────────────────────────────────────────────────────────────── */
  sendForm.addEventListener('submit', e => {
    e.preventDefault();
    if (window.leftCommunities?.[currentRoom]) return;
    const txt = msgInput.value.trim();
    if (!txt) return;
    chats[currentRoom] = chats[currentRoom]||[];
    chats[currentRoom].push({ user:'me', text:txt, time:nowISO(), avatar:meAvatar });
    renderMessages(currentRoom);
    msgInput.value = '';
    moveCommunity(currentRoom);
    updateAllLastTimes();
  });

  /* ──────────────────────────────────────────────────────────────
    CLEAR CHAT
  ────────────────────────────────────────────────────────────── */
  clearBtn.addEventListener('click', () => {
    chats[currentRoom] = [];
    renderMessages(currentRoom);
  });

  /* ──────────────────────────────────────────────────────────────
    SEARCH + NO-RESULT
  ────────────────────────────────────────────────────────────── */
  const searchInput    = document.querySelector('.chat-search-input');
  const communityItems = Array.from(document.querySelectorAll('.community-item'));
  const noResultDiv    = document.getElementById('noResult');
  const noTermSpan     = document.getElementById('noTerm');

  if (searchInput) {
    searchInput.addEventListener('input', e => {
      const term = e.target.value.toLowerCase().trim();
      let matches = 0;
      communityItems.forEach(item => {
        const txt = (item.dataset.name + ' ' + item.dataset.tags).toLowerCase();
        const ok  = !term || txt.includes(term);
        item.classList.toggle('d-none', !ok);
        if (ok) matches++;
      });
      if (!term || matches) {
        noResultDiv.classList.add('d-none');
      } else {
        noTermSpan.textContent = term;
        noResultDiv.classList.remove('d-none');
      }
    });
  }

  // refresh “time ago” every minute
  setInterval(updateAllLastTimes, 60*1000);

});
