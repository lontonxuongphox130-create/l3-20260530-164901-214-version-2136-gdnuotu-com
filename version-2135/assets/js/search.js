(function () {
  function qs(name) {
    return new URLSearchParams(window.location.search).get(name) || '';
  }

  function escapeText(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function renderCard(movie) {
    return '<article class="video-card">' +
      '<a class="poster-link" href="./movie/' + movie.id + '.html" aria-label="' + escapeText(movie.title) + '">' +
      '<span class="poster-wrap">' +
      '<img src="./' + movie.cover + '.jpg" alt="' + escapeText(movie.title) + '" loading="lazy">' +
      '<span class="poster-shade"></span>' +
      '<span class="duration">' + escapeText(movie.duration) + '</span>' +
      '<span class="rating">' + escapeText(movie.rating) + '</span>' +
      '</span>' +
      '</a>' +
      '<div class="card-body">' +
      '<div class="card-meta"><span>' + escapeText(movie.year) + '</span><span>' + escapeText(movie.region) + '</span><span>' + escapeText(movie.type) + '</span></div>' +
      '<h3><a href="./movie/' + movie.id + '.html">' + escapeText(movie.title) + '</a></h3>' +
      '<p>' + escapeText(movie.oneLine) + '</p>' +
      '<div class="tag-row"><span class="tag">' + escapeText(movie.category) + '</span></div>' +
      '</div>' +
      '</article>';
  }

  function boot() {
    var grid = document.querySelector('[data-search-results]');
    var form = document.querySelector('[data-search-form]');
    if (!grid || !form || !window.MOVIE_INDEX) {
      return;
    }

    var input = form.querySelector('[name="q"]');
    var year = form.querySelector('[name="year"]');
    var type = form.querySelector('[name="type"]');
    input.value = qs('q');
    year.value = qs('year');
    type.value = qs('type');

    function apply() {
      var keyword = (input.value || '').trim().toLowerCase();
      var yearValue = year.value;
      var typeValue = type.value;
      var results = window.MOVIE_INDEX.filter(function (movie) {
        var text = [movie.title, movie.oneLine, movie.region, movie.type, movie.genre, movie.category].join(' ').toLowerCase();
        return (!keyword || text.indexOf(keyword) !== -1) &&
          (!yearValue || movie.year === yearValue) &&
          (!typeValue || movie.type === typeValue || movie.category === typeValue);
      }).slice(0, 160);

      if (!results.length) {
        grid.innerHTML = '<div class="empty-result">没有匹配到内容，可更换关键词或筛选条件。</div>';
        return;
      }

      grid.innerHTML = results.map(renderCard).join('');
      grid.querySelectorAll('img').forEach(function (img) {
        img.addEventListener('error', function () {
          img.classList.add('is-missing');
          img.removeAttribute('src');
        }, { once: true });
      });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      apply();
    });
    [input, year, type].forEach(function (control) {
      control.addEventListener('input', apply);
      control.addEventListener('change', apply);
    });
    apply();
  }

  if (document.readyState !== 'loading') {
    boot();
  } else {
    document.addEventListener('DOMContentLoaded', boot);
  }
})();
