(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMobileNav() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var target = form.getAttribute("action") || "./all-movies.html";
        if (value) {
          window.location.href = target + "?q=" + encodeURIComponent(value);
        } else {
          window.location.href = target;
        }
      });
    });
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, "");
  }

  function filterCards(input) {
    var section = input.closest("section") || document;
    var list = section.querySelector("[data-card-list]") || document.querySelector("[data-card-list]");
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
    var empty = section.querySelector("[data-empty-state]") || document.querySelector("[data-empty-state]");
    var query = normalize(input.value);
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = normalize((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-keywords") || "") + " " + card.textContent);
      var matched = !query || haystack.indexOf(query) !== -1;
      card.style.display = matched ? "" : "none";
      if (matched) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle("is-visible", visible === 0);
    }
  }

  function initCardSearch() {
    var inputs = document.querySelectorAll("[data-card-search]");
    if (!inputs.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    inputs.forEach(function (input) {
      if (q) {
        input.value = q;
      }
      input.addEventListener("input", function () {
        filterCards(input);
      });
      var panel = input.closest(".filter-panel");
      if (panel) {
        panel.querySelectorAll("[data-search-word]").forEach(function (button) {
          button.addEventListener("click", function () {
            input.value = button.getAttribute("data-search-word") || "";
            filterCards(input);
            input.focus();
          });
        });
      }
      filterCards(input);
    });
  }

  function initCarousel() {
    document.querySelectorAll("[data-carousel]").forEach(function (root) {
      var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(root.querySelectorAll("[data-carousel-dot]"));
      var prev = root.querySelector("[data-carousel-prev]");
      var next = root.querySelector("[data-carousel-next]");
      var index = 0;
      var timer = null;
      if (slides.length < 2) {
        return;
      }
      function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      }
      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }
      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          start();
        });
      });
      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }
      root.addEventListener("mouseenter", stop);
      root.addEventListener("mouseleave", start);
      show(0);
      start();
    });
  }

  function bindPlayer(source) {
    var frame = document.querySelector("[data-player]");
    if (!frame || !source) {
      return;
    }
    var video = frame.querySelector("video");
    var button = frame.querySelector("[data-player-button]");
    var attached = false;
    function attachSource() {
      if (!video || attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }
    function startPlayback() {
      attachSource();
      if (button) {
        button.classList.add("is-hidden");
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          video.controls = true;
        });
      }
    }
    if (button) {
      button.addEventListener("click", startPlayback);
    }
    video.addEventListener("click", function () {
      if (!attached) {
        startPlayback();
      }
    });
  }

  ready(function () {
    initMobileNav();
    initSearchForms();
    initCardSearch();
    initCarousel();
  });

  window.MovieSite = {
    initPlayer: function (source) {
      ready(function () {
        bindPlayer(source);
      });
    }
  };
})();
