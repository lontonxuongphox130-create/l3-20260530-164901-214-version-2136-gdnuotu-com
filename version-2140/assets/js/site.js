
(function () {
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function setupNavToggle() {
    const btn = qs('[data-nav-toggle]');
    const nav = qs('[data-nav]');
    if (!btn || !nav) return;
    btn.addEventListener('click', () => nav.classList.toggle('open'));
  }

  function setupHeroSlider() {
    const slides = qsa('[data-hero-slide]');
    if (slides.length <= 1) return;
    let idx = slides.findIndex(s => s.classList.contains('active'));
    if (idx < 0) idx = 0;
    const show = (n) => {
      idx = (n + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle('active', i === idx));
    };
    const next = () => show(idx + 1);
    const prev = () => show(idx - 1);
    const btnNext = qs('[data-hero-next]');
    const btnPrev = qs('[data-hero-prev]');
    if (btnNext) btnNext.addEventListener('click', next);
    if (btnPrev) btnPrev.addEventListener('click', prev);
    let timer = setInterval(next, 5000);
    const hero = qs('[data-hero]');
    if (hero) {
      hero.addEventListener('mouseenter', () => { clearInterval(timer); });
      hero.addEventListener('mouseleave', () => { timer = setInterval(next, 5000); });
      hero.addEventListener('touchstart', () => { clearInterval(timer); }, {passive:true});
    }
  }

  function setupScrollTop() {
    const btn = qs('[data-scroll-top]');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.style.opacity = window.scrollY > 600 ? '1' : '0';
      btn.style.pointerEvents = window.scrollY > 600 ? 'auto' : 'none';
    });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  function setupSearchPage() {
    const input = qs('[data-search-input]');
    const list = qs('[data-search-results]');
    if (!input || !list || !window.MOVIE_CATALOG) return;

    const url = new URL(location.href);
    const initial = (url.searchParams.get('q') || '').trim();
    input.value = initial;

    const render = () => {
      const q = input.value.trim().toLowerCase();
      const items = !q ? window.MOVIE_CATALOG.slice(0, 36) : window.MOVIE_CATALOG.filter(m => {
        return [m.title, m.region, m.type, m.genre, m.oneLine].join(' ').toLowerCase().includes(q);
      });
      list.innerHTML = items.map((m, i) => `
        <a class="card" href="${m.link}">
          <div class="poster"><img src="../${m.poster}" alt="${escapeHtml(m.title)}"></div>
          <div class="card-body">
            <h3>${escapeHtml(m.title)}</h3>
            <div class="meta"><span>${escapeHtml(m.year)}</span><span>${escapeHtml(m.region)}</span><span>${escapeHtml(m.genre)}</span></div>
            <div class="one-line">${escapeHtml(m.oneLine || '')}</div>
          </div>
        </a>
      `).join('') || '<div class="panel" style="padding:20px;">没有匹配结果。</div>';
      const summary = qs('[data-search-summary]');
      if (summary) summary.textContent = q ? `找到 ${items.length} 条结果。` : `展示最近 ${items.length} 条影片。`;
    };
    input.addEventListener('input', render);
    render();
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setupPlayer() {
    const video = qs('[data-player-video]');
    if (!video) return;
    const hlsSrc = video.getAttribute('data-hls-src');
    const mp4Src = video.getAttribute('data-mp4-src');
    if (hlsSrc && window.Hls && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(hlsSrc);
      hls.attachMedia(video);
    } else if (hlsSrc && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsSrc;
    } else if (mp4Src) {
      video.src = mp4Src;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupNavToggle();
    setupHeroSlider();
    setupScrollTop();
    setupSearchPage();
    setupPlayer();
  });
})();
