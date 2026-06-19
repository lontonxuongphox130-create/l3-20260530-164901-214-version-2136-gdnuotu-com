(function () {
  'use strict';

  var mobileButton = document.querySelector('.mobile-toggle');
  var mobileNav = document.querySelector('#mobileNav');

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('is-open');
      mobileButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function activateHeroSlide(index) {
    var slides = document.querySelectorAll('.hero-slide');
    var dots = document.querySelectorAll('.hero-dot');
    var previews = document.querySelectorAll('.hero-mini-card');

    slides.forEach(function (slide) {
      slide.classList.toggle('is-active', Number(slide.dataset.slide) === index);
    });

    dots.forEach(function (dot) {
      dot.classList.toggle('is-active', Number(dot.dataset.slideTo) === index);
    });

    previews.forEach(function (preview) {
      preview.classList.toggle('is-active', Number(preview.dataset.slidePreview) === index);
    });
  }

  var heroSlides = document.querySelectorAll('.hero-slide');
  if (heroSlides.length > 1) {
    var currentHeroIndex = 0;
    var heroTimer = window.setInterval(function () {
      currentHeroIndex = (currentHeroIndex + 1) % heroSlides.length;
      activateHeroSlide(currentHeroIndex);
    }, 5200);

    document.querySelectorAll('.hero-dot').forEach(function (dot) {
      dot.addEventListener('click', function () {
        currentHeroIndex = Number(dot.dataset.slideTo) || 0;
        activateHeroSlide(currentHeroIndex);
        window.clearInterval(heroTimer);
      });
    });

    document.querySelectorAll('.hero-mini-card').forEach(function (preview) {
      preview.addEventListener('mouseenter', function () {
        currentHeroIndex = Number(preview.dataset.slidePreview) || 0;
        activateHeroSlide(currentHeroIndex);
      });
    });
  }

  function normalize(text) {
    return String(text || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('.js-local-filter');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var countNode = scope.querySelector('[data-visible-count]');
    var activeChip = '';

    function applyFilter() {
      var query = normalize(input ? input.value : '');
      var visibleCount = 0;

      cards.forEach(function (card) {
        var keywords = normalize(card.dataset.keywords + ' ' + card.dataset.title + ' ' + card.dataset.category);
        var matchesQuery = !query || keywords.indexOf(query) !== -1;
        var matchesChip = !activeChip || keywords.indexOf(normalize(activeChip)) !== -1;
        var visible = matchesQuery && matchesChip;

        card.classList.toggle('is-hidden', !visible);
        if (visible) {
          visibleCount += 1;
        }
      });

      if (countNode) {
        countNode.textContent = String(visibleCount);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    scope.querySelectorAll('.filter-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        scope.querySelectorAll('.filter-chip').forEach(function (item) {
          item.classList.remove('is-active');
        });
        chip.classList.add('is-active');
        activeChip = chip.dataset.filter || '';
        applyFilter();
      });
    });
  });

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderSearchResults() {
    var resultsContainer = document.querySelector('#searchResults');
    if (!resultsContainer || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = normalize(params.get('q') || '');
    var input = document.querySelector('#searchPageInput');
    var count = document.querySelector('#searchResultCount');

    if (input) {
      input.value = params.get('q') || '';
    }

    var matches = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
      if (!query) {
        return true;
      }
      var haystack = normalize([
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.category,
        (movie.tags || []).join(' '),
        movie.oneLine
      ].join(' '));
      return haystack.indexOf(query) !== -1;
    }).slice(0, 240);

    if (count) {
      count.textContent = String(matches.length);
    }

    if (!matches.length) {
      resultsContainer.innerHTML = '<p class="empty-state">没有找到匹配内容，请尝试更换关键词。</p>';
      return;
    }

    resultsContainer.innerHTML = matches.map(function (movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return [
        '<article class="movie-card card">',
        '  <a class="poster-link" href="' + escapeHtml(movie.url) + '">',
        '    <figure class="poster-frame">',
        '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy">',
        '      <figcaption>' + escapeHtml(movie.type) + '</figcaption>',
        '    </figure>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <div class="movie-meta-line"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
        '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p>' + escapeHtml(movie.oneLine) + '</p>',
        '    <div class="tag-list">' + tags + '</div>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');
  }

  renderSearchResults();
})();
