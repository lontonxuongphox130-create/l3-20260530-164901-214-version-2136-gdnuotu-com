(function () {
  function setupPlayer() {
    var shell = document.querySelector('[data-player]');
    if (!shell) {
      return;
    }

    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-play]');
    if (!video || !button) {
      return;
    }

    var source = video.getAttribute('data-src');
    var initialized = false;

    function bindSource() {
      if (initialized || !source) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        initialized = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        initialized = true;
        return;
      }

      video.src = source;
      initialized = true;
    }

    function playVideo() {
      bindSource();
      var result = video.play();
      shell.classList.add('is-playing');
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          shell.classList.remove('is-playing');
        });
      }
    }

    button.addEventListener('click', playVideo);
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });
    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      shell.classList.remove('is-playing');
    });
  }

  if (document.readyState !== 'loading') {
    setupPlayer();
  } else {
    document.addEventListener('DOMContentLoaded', setupPlayer);
  }
})();
