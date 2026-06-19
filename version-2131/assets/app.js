(function () {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));

  const navToggle = $('.mobile-toggle');
  const navLinks = $('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  }

  const searchInputs = $$('[data-search]');
  const cards = $$('[data-movie-card]');
  if (searchInputs.length && cards.length) {
    const apply = (value) => {
      const q = value.trim().toLowerCase();
      cards.forEach(card => {
        const hay = [card.dataset.title, card.dataset.genre, card.dataset.tags, card.dataset.region, card.dataset.year, card.dataset.type, card.dataset.oneLine]
          .join(' ').toLowerCase();
        card.style.display = (!q || hay.includes(q)) ? '' : 'none';
      });
      const visible = cards.filter(c => c.style.display !== 'none');
      const counter = $('[data-result-count]');
      if (counter) counter.textContent = String(visible.length);
    };
    searchInputs.forEach(inp => inp.addEventListener('input', e => apply(e.target.value)));
    apply(searchInputs[0].value || '');
  }

  const slides = $$('.slide');
  const dots = $$('.dot');
  if (slides.length > 1 && dots.length) {
    let active = 0;
    const show = (i) => {
      slides.forEach((s, idx) => s.classList.toggle('active', idx === i));
      dots.forEach((d, idx) => d.classList.toggle('active', idx === i));
      active = i;
    };
    dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));
    setInterval(() => show((active + 1) % slides.length), 5000);
  }

  const video = $('#movie-video');
  if (video) {
    const overlay = $('.player-overlay');
    const btn = $('.player-btn');
    const src = video.dataset.m3u8 || video.getAttribute('src');
    const init = () => {
      if (src && window.Hls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        window.__movieHls = hls;
      } else if (src && video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (src && !video.src) {
        video.src = src;
      }
    };
    init();
    const play = async () => {
      try {
        await video.play();
        if (overlay) overlay.style.display = 'none';
      } catch (err) {}
    };
    if (btn) btn.addEventListener('click', play);
    video.addEventListener('click', play);
    video.addEventListener('play', () => { if (overlay) overlay.style.display = 'none'; });
    video.addEventListener('pause', () => { if (overlay) overlay.style.display = ''; });
  }
})();
