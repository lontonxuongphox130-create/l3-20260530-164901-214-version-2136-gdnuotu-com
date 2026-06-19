(function () {
  function each(selector, root, callback) {
    Array.prototype.forEach.call((root || document).querySelectorAll(selector), callback);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var index = 0;
      var activate = function (next) {
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      };
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          activate(Number(dot.getAttribute("data-hero-dot")) || 0);
        });
      });
      if (slides.length > 1) {
        setInterval(function () {
          activate(index + 1);
        }, 5200);
      }
    }

    each("[data-filter-bar]", document, function (bar) {
      var scope = bar.closest("main") || document;
      var keyword = bar.querySelector("[data-filter-keyword]");
      var year = bar.querySelector("[data-filter-year]");
      var type = bar.querySelector("[data-filter-type]");
      var apply = function () {
        var q = keyword ? keyword.value.trim().toLowerCase() : "";
        var y = year ? year.value : "";
        var t = type ? type.value.toLowerCase() : "";
        each("[data-card]", scope, function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" ").toLowerCase();
          var okKeyword = !q || text.indexOf(q) !== -1;
          var okYear = !y || (card.getAttribute("data-year") || "").indexOf(y) !== -1;
          var okType = !t || text.indexOf(t) !== -1;
          card.classList.toggle("is-hidden", !(okKeyword && okYear && okType));
        });
      };
      [keyword, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });

    var searchRoot = document.querySelector("[data-search-results]");
    if (searchRoot && window.MOVIE_SEARCH_INDEX) {
      var params = new URLSearchParams(window.location.search);
      var query = (params.get("q") || "").trim();
      var title = document.querySelector("[data-search-title]");
      if (title) {
        title.textContent = query ? "搜索结果：" + query : "搜索影片";
      }
      if (!query) {
        searchRoot.innerHTML = '<div class="search-empty">请输入关键词查找片名、地区、类型或标签。</div>';
        return;
      }
      var q = query.toLowerCase();
      var results = window.MOVIE_SEARCH_INDEX.filter(function (item) {
        return item.search.indexOf(q) !== -1;
      }).slice(0, 160);
      if (!results.length) {
        searchRoot.innerHTML = '<div class="search-empty">未找到相关内容，可以尝试更换关键词。</div>';
        return;
      }
      searchRoot.innerHTML = results.map(function (item) {
        return '<article class="movie-card">' +
          '<a class="movie-card-link" href="' + item.url + '">' +
          '<div class="poster-frame"><img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy"><span class="year-badge">' + escapeHtml(item.year) + '</span></div>' +
          '<div class="movie-body"><h3>' + escapeHtml(item.title) + '</h3><p>' + escapeHtml(item.oneLine) + '</p>' +
          '<div class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
          '<div class="tag-row"><span>' + escapeHtml(item.genre) + '</span></div></div></a></article>';
      }).join("");
    }
  });

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        "\"": "&quot;"
      }[char];
    });
  }

  window.setupVideoPlayer = function (frame) {
    if (!frame) {
      return;
    }
    var video = frame.querySelector("video");
    var cover = frame.querySelector("[data-play-cover]");
    var stream = frame.getAttribute("data-stream");
    var attached = false;
    var hlsInstance = null;

    var attach = function () {
      if (!video || !stream || attached) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        attached = true;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        attached = true;
        return;
      }
      video.src = stream;
      attached = true;
    };

    var play = function () {
      attach();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    };

    attach();
    if (cover) {
      cover.addEventListener("click", play);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        if (cover) {
          cover.classList.add("is-hidden");
        }
      });
      video.addEventListener("error", function () {
        if (hlsInstance && window.Hls) {
          hlsInstance.startLoad();
        }
      });
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    each("[data-player]", document, function (frame) {
      window.setupVideoPlayer(frame);
    });
  });
})();
