(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initMobileMenu() {
        var button = qs('[data-menu-toggle]');
        var nav = qs('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function initHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var prev = qs('[data-hero-prev]', hero);
        var next = qs('[data-hero-next]', hero);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
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

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilters() {
        var blocks = qsa('[data-filter-scope]');
        blocks.forEach(function (scope) {
            var searchInput = qs('[data-filter-search]', scope);
            var typeSelect = qs('[data-filter-type]', scope);
            var yearSelect = qs('[data-filter-year]', scope);
            var cards = qsa('[data-search]', scope);
            var count = qs('[data-result-count]', scope);

            function apply() {
                var query = normalize(searchInput && searchInput.value);
                var type = typeSelect ? typeSelect.value : '';
                var year = yearSelect ? yearSelect.value : '';
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-search'));
                    var cardType = card.getAttribute('data-type') || '';
                    var cardYear = card.getAttribute('data-year') || '';
                    var matched = true;

                    if (query && text.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (type && cardType !== type) {
                        matched = false;
                    }
                    if (year && cardYear !== year) {
                        matched = false;
                    }

                    card.classList.toggle('hidden', !matched);
                    if (matched) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = '当前显示 ' + visible + ' 部';
                }
            }

            if (searchInput) {
                searchInput.addEventListener('input', apply);
            }
            if (typeSelect) {
                typeSelect.addEventListener('change', apply);
            }
            if (yearSelect) {
                yearSelect.addEventListener('change', apply);
            }

            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q && searchInput) {
                searchInput.value = q;
            }
            apply();
        });
    }

    function initPlayers() {
        qsa('[data-player]').forEach(function (box) {
            var stage = qs('[data-player-stage]', box);
            var video = qs('video', box);
            var trigger = qs('[data-player-trigger]', box);
            var message = qs('[data-player-message]', box);
            var src = box.getAttribute('data-video-src');
            var initialized = false;

            function setMessage(text) {
                if (message) {
                    message.textContent = text;
                    message.classList.remove('hidden');
                }
            }

            function play() {
                if (!video || !src) {
                    setMessage('当前播放源暂不可用，请检查 m3u8 地址。');
                    return;
                }

                if (!initialized) {
                    if (window.Hls && window.Hls.isSupported()) {
                        var hls = new window.Hls({ enableWorker: true });
                        hls.loadSource(src);
                        hls.attachMedia(video);
                        hls.on(window.Hls.Events.ERROR, function (_, data) {
                            if (data && data.fatal) {
                                setMessage('播放源加载失败，请稍后重试。');
                            }
                        });
                    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = src;
                    } else {
                        video.src = src;
                    }
                    initialized = true;
                }

                if (stage) {
                    stage.classList.add('playing');
                }
                video.controls = true;
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        setMessage('浏览器阻止自动播放，请再次点击播放按钮。');
                    });
                }
            }

            if (trigger) {
                trigger.addEventListener('click', play);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initHero();
        initFilters();
        initPlayers();
    });
}());
