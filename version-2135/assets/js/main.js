(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        menu.classList.toggle('open');
      });
    }

    document.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('is-missing');
        img.removeAttribute('src');
      }, { once: true });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var index = 0;

      function showSlide(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('active', slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === index);
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          showSlide(dotIndex);
        });
      });

      showSlide(0);
      window.setInterval(function () {
        showSlide(index + 1);
      }, 5600);
    }

    var filterRoot = document.querySelector('[data-filter-root]');
    if (filterRoot) {
      var keywordInput = filterRoot.querySelector('[data-filter-keyword]');
      var yearSelect = filterRoot.querySelector('[data-filter-year]');
      var typeSelect = filterRoot.querySelector('[data-filter-type]');
      var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));

      function applyFilter() {
        var keyword = (keywordInput && keywordInput.value || '').trim().toLowerCase();
        var year = yearSelect && yearSelect.value || '';
        var type = typeSelect && typeSelect.value || '';

        cards.forEach(function (card) {
          var title = (card.getAttribute('data-title') || '').toLowerCase();
          var cardYear = card.getAttribute('data-year') || '';
          var cardType = card.getAttribute('data-category') || '';
          var matchedKeyword = !keyword || title.indexOf(keyword) !== -1 || card.innerText.toLowerCase().indexOf(keyword) !== -1;
          var matchedYear = !year || cardYear === year;
          var matchedType = !type || cardType === type;
          card.style.display = matchedKeyword && matchedYear && matchedType ? '' : 'none';
        });
      }

      [keywordInput, yearSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilter);
          control.addEventListener('change', applyFilter);
        }
      });
    }
  });
})();
