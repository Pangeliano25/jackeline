// Invitación Jackeline
(function () {
    'use strict';

    // Marca que hay JS activo (el CSS solo oculta .reveal si esto existe)
    document.documentElement.classList.add('js');

    /* ---------- Animaciones al hacer scroll ---------- */
    function initReveal() {
        var items = document.querySelectorAll('.reveal');

        if (!('IntersectionObserver' in window)) {
            items.forEach(function (el) { el.classList.add('is-visible'); });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

        items.forEach(function (el) { observer.observe(el); });
    }

    /* ---------- Cuenta regresiva ---------- */
    function initCountdown() {
        var els = {
            days: document.getElementById('days'),
            hours: document.getElementById('hours'),
            minutes: document.getElementById('minutes'),
            seconds: document.getElementById('seconds')
        };
        if (!els.days) return;

        // 21 nov 2026, 19:00 (los meses empiezan en 0: noviembre = 10).
        // Este formato funciona en todos los navegadores, incluido Safari.
        var eventDate = new Date(2026, 10, 21, 19, 0, 0).getTime();
        var timer;

        function pad(n) { return String(n).padStart(2, '0'); }

        function update() {
            var distance = eventDate - Date.now();

            if (distance <= 0) {
                clearInterval(timer);
                distance = 0;
            }

            var s = Math.floor(distance / 1000);
            els.days.textContent = pad(Math.floor(s / 86400));
            els.hours.textContent = pad(Math.floor((s % 86400) / 3600));
            els.minutes.textContent = pad(Math.floor((s % 3600) / 60));
            els.seconds.textContent = pad(s % 60);
        }

        update(); // pinta de inmediato, sin esperar 1 segundo
        timer = setInterval(update, 1000);
    }

    /* ---------- Carrusel de fotos ---------- */
    function initCarousel() {
        var track = document.getElementById('carousel-track');
        var dotsBox = document.getElementById('carousel-dots');
        if (!track || !dotsBox) return;

        var slides = track.children;
        var prev = document.querySelector('.carousel__btn--prev');
        var next = document.querySelector('.carousel__btn--next');
        var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var current = 0;
        var autoplay;

        // Puntos de navegación
        var dots = [];
        Array.prototype.forEach.call(slides, function (_, i) {
            var dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'carousel__dot';
            dot.setAttribute('role', 'tab');
            dot.setAttribute('aria-label', 'Ir a la foto ' + (i + 1));
            dot.addEventListener('click', function () { goTo(i); stopAutoplay(); });
            dotsBox.appendChild(dot);
            dots.push(dot);
        });

        function goTo(index) {
            var n = slides.length;
            current = (index + n) % n;
            track.scrollTo({ left: current * track.clientWidth, behavior: reduceMotion ? 'auto' : 'smooth' });
        }

        function setActive(index) {
            dots.forEach(function (d, i) {
                var on = i === index;
                d.classList.toggle('is-active', on);
                d.setAttribute('aria-selected', on ? 'true' : 'false');
            });
        }

        // Detecta la foto visible, tanto al usar botones como al deslizar con el dedo
        var ticking = false;
        track.addEventListener('scroll', function () {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(function () {
                current = Math.round(track.scrollLeft / track.clientWidth);
                setActive(current);
                ticking = false;
            });
        }, { passive: true });

        prev.addEventListener('click', function () { goTo(current - 1); stopAutoplay(); });
        next.addEventListener('click', function () { goTo(current + 1); stopAutoplay(); });

        track.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current - 1); stopAutoplay(); }
            if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); stopAutoplay(); }
        });

        // Si cambia el tamaño de pantalla, mantiene la foto actual centrada
        window.addEventListener('resize', function () {
            track.scrollTo({ left: current * track.clientWidth, behavior: 'auto' });
        });

        // Avance automático (se detiene al tocar o si se prefiere menos movimiento)
        function startAutoplay() {
            if (reduceMotion) return;
            autoplay = setInterval(function () { goTo(current + 1); }, 5000);
        }
        function stopAutoplay() { clearInterval(autoplay); }

        track.addEventListener('touchstart', stopAutoplay, { passive: true });
        track.addEventListener('pointerdown', stopAutoplay);

        setActive(0);
        startAutoplay();
    }

    /* ---------- Música ---------- */
    function initMusic() {
        var audio = document.getElementById('bg-audio');
        var floatBtn = document.getElementById('music-toggle');
        var floatIcon = document.getElementById('music-icon');
        var heroBtn = document.getElementById('hero-play');
        var heroText = document.getElementById('hero-play-text');
        if (!audio) return;

        // El botón y el audio siempre quedan sincronizados con el estado real
        function render(playing) {
            floatIcon.classList.toggle('fa-pause', playing);
            floatIcon.classList.toggle('fa-play', !playing);
            floatBtn.classList.toggle('is-playing', playing);
            floatBtn.setAttribute('aria-pressed', playing ? 'true' : 'false');
            floatBtn.setAttribute('aria-label', playing ? 'Pausar música' : 'Reproducir música');

            if (heroBtn) {
                heroBtn.classList.toggle('is-playing', playing);
                heroBtn.setAttribute('aria-label', playing ? 'Pausar música' : 'Reproducir música');
                heroText.textContent = playing ? 'Pausar' : 'Dale Play';
            }
        }

        function toggle() {
            if (audio.paused) {
                // play() devuelve una promesa que falla si el navegador lo bloquea
                audio.play().catch(function () { render(false); });
            } else {
                audio.pause();
            }
        }

        audio.addEventListener('play', function () { render(true); });
        audio.addEventListener('pause', function () { render(false); });

        floatBtn.addEventListener('click', toggle);
        if (heroBtn) heroBtn.addEventListener('click', toggle);

        render(false);
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMusic();
        initReveal();
        initCountdown();
        initCarousel();
    });
})();
