import { H as Hls } from './hls-dru42stk.js';

function showMessage(container, message) {
  var messageNode = container.querySelector('.player-message');
  if (messageNode) {
    messageNode.textContent = message;
  }
}

function startPlayback(container) {
  var video = container.querySelector('.video-player');
  var button = container.querySelector('.play-trigger');
  var src = container.dataset.videoSrc;

  if (!video || !src) {
    showMessage(container, '当前播放源暂不可用。');
    return;
  }

  if (button) {
    button.classList.add('is-hidden');
  }

  showMessage(container, '正在加载高清播放源...');

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = src;
    video.play().then(function () {
      showMessage(container, '');
    }).catch(function () {
      showMessage(container, '播放被浏览器拦截，请再次点击播放。');
      if (button) {
        button.classList.remove('is-hidden');
      }
    });
    return;
  }

  if (Hls && Hls.isSupported()) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hls.loadSource(src);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      video.play().then(function () {
        showMessage(container, '');
      }).catch(function () {
        showMessage(container, '播放被浏览器拦截，请再次点击播放。');
        if (button) {
          button.classList.remove('is-hidden');
        }
      });
    });

    hls.on(Hls.Events.ERROR, function (event, data) {
      if (data && data.fatal) {
        showMessage(container, '播放源加载失败，请刷新页面或稍后重试。');
        if (button) {
          button.classList.remove('is-hidden');
        }
        hls.destroy();
      }
    });
    return;
  }

  showMessage(container, '当前浏览器不支持 HLS 播放。');
  if (button) {
    button.classList.remove('is-hidden');
  }
}

document.querySelectorAll('.player-card').forEach(function (container) {
  var button = container.querySelector('.play-trigger');
  if (button) {
    button.addEventListener('click', function () {
      startPlayback(container);
    });
  }
});
