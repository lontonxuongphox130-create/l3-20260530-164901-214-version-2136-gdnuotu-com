(function () {
  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  document.querySelectorAll("img").forEach(function (img) {
    img.addEventListener("error", function () {
      img.remove();
    });
  });

  var toggle = document.querySelector("[data-mobile-toggle]");
  var panel = document.querySelector("[data-mobile-panel]");
  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

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

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  });

  function applyFilter(input) {
    var target = document.querySelector(input.getAttribute("data-filter-target"));
    if (!target) {
      return;
    }
    var term = normalize(input.value);
    var items = Array.prototype.slice.call(target.querySelectorAll("[data-search-text]"));
    items.forEach(function (item) {
      var text = normalize(item.getAttribute("data-search-text"));
      item.classList.toggle("is-hidden-by-filter", term && text.indexOf(term) === -1);
    });
  }

  document.querySelectorAll(".page-filter-input").forEach(function (input) {
    input.addEventListener("input", function () {
      applyFilter(input);
    });
  });

  var params = new URLSearchParams(window.location.search);
  var q = params.get("q");
  var mainSearch = document.getElementById("main-search-input");
  if (mainSearch && q) {
    mainSearch.value = q;
    applyFilter(mainSearch);
  }

  document.querySelectorAll("[data-player]").forEach(function (player) {
    var video = player.querySelector("video");
    var button = player.querySelector("[data-play-button]");
    if (!video) {
      return;
    }
    var source = video.getAttribute("data-src");
    var loaded = false;

    function loadVideo() {
      if (loaded || !source) {
        return;
      }
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function playVideo() {
      loadVideo();
      var attempt = video.play();
      if (attempt && typeof attempt.then === "function") {
        attempt.then(function () {
          player.classList.add("playing");
        }).catch(function () {
          player.classList.remove("playing");
        });
      } else {
        player.classList.add("playing");
      }
    }

    if (button) {
      button.addEventListener("click", playVideo);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", function () {
      player.classList.add("playing");
    });

    video.addEventListener("pause", function () {
      player.classList.remove("playing");
    });
  });
})();
