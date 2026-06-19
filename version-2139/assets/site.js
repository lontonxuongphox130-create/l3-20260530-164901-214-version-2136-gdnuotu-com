(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
        var current = 0;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var filterSelects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-select]'));
    var filterChips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var emptyState = document.querySelector('[data-empty-state]');

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function getParam(name) {
        return new URLSearchParams(window.location.search).get(name) || '';
    }

    if (filterInput && getParam('q')) {
        filterInput.value = getParam('q');
    }

    function applyFilter() {
        if (!cards.length) {
            return;
        }

        var query = normalize(filterInput ? filterInput.value : '');
        var activeChip = document.querySelector('[data-filter-chip].active');
        var chipValue = activeChip ? activeChip.getAttribute('data-filter-chip') : '';
        var visible = 0;

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute('data-text'));
            var matched = !query || text.indexOf(query) !== -1;

            filterSelects.forEach(function (select) {
                var value = select.value;
                var field = select.getAttribute('data-filter-select');
                if (value && card.getAttribute('data-' + field) !== value) {
                    matched = false;
                }
            });

            if (chipValue && card.getAttribute('data-type') !== chipValue) {
                matched = false;
            }

            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('show', visible === 0);
        }
    }

    if (filterInput) {
        filterInput.addEventListener('input', applyFilter);
    }

    filterSelects.forEach(function (select) {
        select.addEventListener('change', applyFilter);
    });

    filterChips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            filterChips.forEach(function (item) {
                item.classList.remove('active');
            });
            chip.classList.add('active');
            applyFilter();
        });
    });

    applyFilter();
})();

function initMoviePlayer(streamUrl) {
    var frame = document.querySelector('[data-player-frame]');
    if (!frame) {
        return;
    }

    var video = frame.querySelector('video');
    var cover = frame.querySelector('[data-player-cover]');
    var errorBox = frame.querySelector('[data-player-error]');
    var initialized = false;
    var hlsInstance = null;

    function showError() {
        if (errorBox) {
            errorBox.textContent = '播放暂时不可用，请稍后再试。';
            errorBox.classList.add('show');
        }
    }

    function attachStream() {
        if (initialized) {
            return;
        }

        initialized = true;

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        hlsInstance.destroy();
                        showError();
                    }
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else {
            showError();
        }
    }

    function startPlayback() {
        attachStream();
        if (cover) {
            cover.classList.add('hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                if (cover) {
                    cover.classList.remove('hidden');
                }
            });
        }
    }

    if (cover) {
        cover.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        } else {
            video.pause();
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
