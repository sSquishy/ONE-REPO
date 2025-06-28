document.addEventListener('DOMContentLoaded', () => {

  /* ────────────────── 1. Equal-height .chat-card ────────────────── */
  const cardEls   = [...document.querySelectorAll('.chat-card')];
  if (cardEls.length) {
    const unifyHeights = () => {
      cardEls.forEach(c => c.style.minHeight = '');
      const max = Math.max(...cardEls.map(c => c.offsetHeight));
      cardEls.forEach(c => c.style.minHeight = max + 'px');
    };
    unifyHeights();

    const ro = new ResizeObserver(() => {
      clearTimeout(window.__equalTO);
      window.__equalTO = setTimeout(unifyHeights, 100);
    });
    cardEls.forEach(c => ro.observe(c));
  }

  /* ────────────────── 2. Search + Pagination ────────────────── */
  const cols        = cardEls.map(c => c.closest('.col-sm-6, .col-lg-4')); // whole grid cols
  const searchInput = document.getElementById('cardSearch');
  const pagerUL     = document.getElementById('cardPagination');
  const noResBox    = document.getElementById('noResult');
  const noTermSpan  = document.getElementById('noTerm');  // inside the placeholder
  const perPage     = 6;

  let filtered = cols.slice(); // current working set
  let page     = 1;
  let lastTerm = '';

  /* ---------- pagination helpers ---------- */
  const buildPager = () => {
    const total = Math.max(1, Math.ceil(filtered.length / perPage));
    pagerUL.innerHTML = '';

    const add = (lbl, tgt, dis, act) => {
      const li = document.createElement('li');
      li.className = `page-item${dis?' disabled':''}${act?' active':''}`;
      li.innerHTML = `<a href="javascript:void(0)" class="page-link">${lbl}</a>`;
      if (!dis) li.firstChild.addEventListener('click', () => showPage(tgt));
      pagerUL.appendChild(li);
    };

    add('‹', page-1, page === 1);
    for (let i=1;i<=total;i++) add(i, i, false, i===page);
    add('›', page+1, page === total);
  };

  const showPage = p => {
    page = p;
    const start = (p-1)*perPage, end = start + perPage;

    cols.forEach(col => col.classList.add('d-none'));

    if (filtered.length === 0){
      noTermSpan.textContent = lastTerm || '';
      noResBox.classList.remove('d-none');
      pagerUL.innerHTML = '';
      return;
    }

    noResBox.classList.add('d-none');
    filtered.slice(start, end).forEach(col => col.classList.remove('d-none'));
    buildPager();
  };

  /* ---------- filter on type ---------- */
  const applyFilter = () => {
    lastTerm = searchInput.value.trim().toLowerCase();
    filtered = cols.filter(col => {
      const t = col.querySelector('.chat-title')?.textContent.toLowerCase() || '';
      const d = col.querySelector('.chat-desc') ?.textContent.toLowerCase() || '';
      const b = col.querySelector('.badge')     ?.textContent.toLowerCase() || '';
      return t.includes(lastTerm) || d.includes(lastTerm) || b.includes(lastTerm);
    });
    showPage(1);
  };

  searchInput.addEventListener('input', applyFilter);

  /* ---------- init first view ---------- */
  showPage(1);
});
