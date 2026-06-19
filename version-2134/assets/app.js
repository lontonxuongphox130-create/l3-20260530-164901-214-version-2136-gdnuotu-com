(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var current = 0;
    var timer;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function startTimer() {
      if (slides.length > 1) {
        timer = window.setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }
    }

    function resetTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      startTimer();
    }

    var prev = document.querySelector(".hero-arrow.prev");
    var next = document.querySelector(".hero-arrow.next");
    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        resetTimer();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        resetTimer();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-slide")) || 0);
        resetTimer();
      });
    });
    startTimer();

    document.querySelectorAll("[data-filter-bar]").forEach(function (bar) {
      var section = bar.closest("section") || document;
      var list = section.querySelector("[data-filter-list]");
      var cards = list ? Array.prototype.slice.call(list.querySelectorAll("[data-card]")) : [];
      var textInput = bar.querySelector("[data-filter-text]");
      var yearSelect = bar.querySelector("[data-filter-year]");
      var kindSelect = bar.querySelector("[data-filter-kind]");
      var empty = section.querySelector("[data-empty-state]");

      function applyFilter() {
        var q = textInput ? textInput.value.trim().toLowerCase() : "";
        var year = yearSelect ? yearSelect.value : "";
        var kind = kindSelect ? kindSelect.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-kind"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-year")
          ].join(" ").toLowerCase();
          var ok = true;
          if (q && haystack.indexOf(q) === -1) {
            ok = false;
          }
          if (year && card.getAttribute("data-year") !== year) {
            ok = false;
          }
          if (kind && card.getAttribute("data-kind") !== kind) {
            ok = false;
          }
          card.classList.toggle("is-hidden", !ok);
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }

      [textInput, yearSelect, kindSelect].forEach(function (item) {
        if (item) {
          item.addEventListener("input", applyFilter);
          item.addEventListener("change", applyFilter);
        }
      });
      applyFilter();
    });

    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim().toLowerCase();
    var searchInput = document.querySelector("[data-search-input]");
    var searchList = document.querySelector("[data-search-list]");
    if (searchInput && query) {
      searchInput.value = params.get("q") || "";
    }
    if (searchList) {
      var searchCards = Array.prototype.slice.call(searchList.querySelectorAll("[data-card]"));
      var emptySearch = document.querySelector("[data-search-empty]");
      function applySearch() {
        var q = (searchInput ? searchInput.value : query).trim().toLowerCase();
        var visible = 0;
        searchCards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-kind"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-year")
          ].join(" ").toLowerCase();
          var ok = !q || haystack.indexOf(q) !== -1;
          card.classList.toggle("is-hidden", !ok);
          if (ok) {
            visible += 1;
          }
        });
        if (emptySearch) {
          emptySearch.classList.toggle("show", visible === 0);
        }
      }
      if (searchInput) {
        searchInput.addEventListener("input", applySearch);
      }
      applySearch();
    }

    document.querySelectorAll(".player-shell").forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector(".player-start");
      var hlsUrl = shell.getAttribute("data-hls");
      var hlsPlayer = null;

      function attach() {
        if (!video || video.getAttribute("data-ready") === "1") {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsPlayer = new window.Hls({ enableWorker: true });
          hlsPlayer.loadSource(hlsUrl);
          hlsPlayer.attachMedia(video);
        } else {
          video.src = hlsUrl;
        }
        video.setAttribute("data-ready", "1");
      }

      function playVideo() {
        attach();
        if (button) {
          button.classList.add("hidden");
        }
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            if (button) {
              button.classList.remove("hidden");
            }
          });
        }
      }

      if (button && video && hlsUrl) {
        button.addEventListener("click", playVideo);
        video.addEventListener("play", function () {
          button.classList.add("hidden");
        });
        video.addEventListener("pause", function () {
          if (!video.ended) {
            button.classList.remove("hidden");
          }
        });
      }

      window.addEventListener("pagehide", function () {
        if (hlsPlayer) {
          hlsPlayer.destroy();
        }
      });
    });
  });
})();
