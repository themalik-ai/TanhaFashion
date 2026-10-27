/* =============================================================================
   TANHA'S FASHION — motion.js
   -----------------------------------------------------------------------------
   The animation layer. Purely decorative: if this file fails to load, or if
   the visitor has asked for reduced motion, the site is exactly as complete
   and readable — just still.

   Everything here is wrapped so a failure in one effect can never break
   another, and never break the shop.

     1  Entrance choreography      5  Cursor follower
     2  Scroll reveal              6  Magnetic buttons
     3  Parallax                   7  Page transitions
     4  Scroll progress + header   8  Count-up, tab bar, gallery dots
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var canObserve = 'IntersectionObserver' in window;

  /* If motion is not wanted, reveal everything and stop. Nothing else runs. */
  if (reduce) {
    root.classList.remove('no-js');
    document.querySelectorAll('[data-anim]').forEach(function (el) { el.classList.add('is-in'); });
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-in'); });
    initTabBar();          /* not an animation — navigation must still work */
    return;
  }

  root.classList.remove('no-js');
  root.classList.add('motion-on');

  /* Modules that only read the DOM as it stands. They are safe to run again
     after a page script injects markup (the shop grid, the product gallery). */
  var BINDINGS = [initEntrance, initReveal, initParallax, initCursor,
                  initMagnetic, initCountUp, initGalleryRail, initTabBar];
  /* Modules that own a global listener or state. Once is enough. */
  var ONCE = [initScrollUI, initPageTransitions];

  function run(list) {
    list.forEach(function (fn) {
      try { fn(); } catch (err) { if (window.console) console.warn('[motion] ' + fn.name, err); }
    });
  }

  run(ONCE);
  run(BINDINGS);

  /* Page scripts load after us, so they call this once they have rendered. */
  window.TF_MOTION = { refresh: function () { run(BINDINGS); } };

  /* ===========================================================================
     1 · ENTRANCE CHOREOGRAPHY
     Elements declare data-anim and an optional data-anim-d step number.
     ======================================================================== */
  function initEntrance() {
    document.querySelectorAll('[data-anim-d]').forEach(function (el) {
      var d = parseInt(el.getAttribute('data-anim-d'), 10);
      if (!isNaN(d)) el.style.setProperty('--anim-d', String(d));
    });

    /* The hero plays immediately; anything further down waits for scroll. */
    var hero = document.querySelector('.hero');
    var immediate = hero ? hero.querySelectorAll('[data-anim]') : [];
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        immediate.forEach(function (el) { el.classList.add('is-in'); });
      });
    });

    /* Stagger the .reveal cards inside any grid so they cascade. */
    document.querySelectorAll('.prod-grid, .coll-grid, .ig-grid, .values-grid')
      .forEach(function (grid) {
        var items = grid.querySelectorAll('.reveal');
        for (var i = 0; i < items.length; i++) {
          if (!items[i].style.getPropertyValue('--i')) {
            items[i].style.setProperty('--i', String(Math.min(i, 8)));
          }
        }
      });
  }

  /* ===========================================================================
     2 · SCROLL REVEAL (for [data-anim] outside the hero)
     ======================================================================== */
  function initReveal() {
    var targets = Array.prototype.filter.call(
      document.querySelectorAll('[data-anim]:not(.is-in)'),
      function (el) { return !el.closest('.hero'); }
    );
    if (!targets.length) return;

    if (!canObserve) {
      targets.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    targets.forEach(function (el) { io.observe(el); });
  }

  /* ===========================================================================
     3 · PARALLAX
     Each [data-parallax] carries a signed factor; the hero layers drift at
     different rates so the collage separates as you scroll.
     ======================================================================== */
  function initParallax() {
    var layers = [].slice.call(document.querySelectorAll('[data-parallax]'));
    if (!layers.length || !fine) return;
    if (initParallax.bound) return;
    initParallax.bound = true;

    var ticking = false;

    function apply() {
      ticking = false;
      var vh = window.innerHeight || 1;
      for (var i = 0; i < layers.length; i++) {
        var el = layers[i];
        var f = parseFloat(el.getAttribute('data-parallax')) || 0;
        var r = el.getBoundingClientRect();
        /* how far the element's centre sits from the viewport centre, -1…1 */
        var centre = r.top + r.height / 2;
        var offset = (centre - vh / 2) / vh;
        var px = -(offset * f * vh * 0.55);
        el.style.setProperty('--py', px.toFixed(2) + 'px');
      }
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(apply);
    }

    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
  }

  /* ===========================================================================
     4 · SCROLL PROGRESS + HEADER SHOW/HIDE
     ======================================================================== */
  function initScrollUI() {
    var bar = document.getElementById('scroll-progress-bar');
    var header = document.getElementById('site-header');
    var last = window.pageYOffset || 0;
    var ticking = false;

    function apply() {
      ticking = false;
      var y = window.pageYOffset || 0;

      if (bar) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        var pct = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
        bar.style.transform = 'scaleX(' + pct.toFixed(4) + ')';
      }

      if (header && !document.body.classList.contains('sheet-open')) {
        /* ignore the jitter of small scrolls, and never hide near the top */
        if (Math.abs(y - last) > 6) {
          if (y > last && y > 220) header.classList.add('is-hidden');
          else header.classList.remove('is-hidden');
          last = y;
        }
      }
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(apply);
    }

    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
  }

  /* ===========================================================================
     5 · CURSOR FOLLOWER  (pointer devices only)
     ======================================================================== */
  function initCursor() {
    if (!fine) return;
    var dot = document.createElement('div');
    dot.className = 'tf-cursor';
    dot.setAttribute('aria-hidden', 'true');
    dot.textContent = 'View';
    document.body.appendChild(dot);

    var x = window.innerWidth / 2, y = window.innerHeight / 2;
    var tx = x, ty = y, raf = null, on = false;

    function loop() {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      dot.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)' +
                            ' translate(-50%,-50%)' + (on ? ' scale(1)' : ' scale(.4)');
      raf = requestAnimationFrame(loop);
    }

    document.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      var card = e.target.closest && e.target.closest('.card, .coll-tile');
      var want = !!card;
      if (want !== on) { on = want; dot.classList.toggle('is-on', on); }
      if (raf === null) raf = requestAnimationFrame(loop);
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
      on = false; dot.classList.remove('is-on');
    });
  }

  /* ===========================================================================
     6 · MAGNETIC BUTTONS
     ======================================================================== */
  function initMagnetic() {
    if (!fine) return;
    document.querySelectorAll('[data-magnetic]:not([data-magnet])').forEach(function (el) {
      el.setAttribute('data-magnet', '');
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        var dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        el.classList.add('is-pulled');
        el.style.transform = 'translate3d(' + (dx * 9).toFixed(2) + 'px,' + (dy * 6).toFixed(2) + 'px,0)';
      });
      el.addEventListener('mouseleave', function () {
        el.classList.remove('is-pulled');
        el.style.transform = '';
      });
    });
  }

  /* ===========================================================================
     7 · PAGE TRANSITIONS
     Fade the document out on internal navigation. Skipped for modified clicks,
     new tabs, downloads, hashes and anything with a target.
     ======================================================================== */
  function initPageTransitions() {
    document.documentElement.classList.add('has-transitions');

    var main = document.querySelector('main');
    if (main) {
      main.classList.add('page-enter');
      main.addEventListener('animationend', function () {
        main.classList.remove('page-enter');
      }, { once: true });
    }

    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      if (a.target && a.target !== '_self') return;
      if (a.hasAttribute('download')) return;

      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#') return;
      /* only same-origin page navigations */
      var url;
      try { url = new URL(a.href, location.href); } catch (_) { return; }
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      if (a.closest('.no-transition')) return;

      e.preventDefault();
      document.body.classList.add('is-leaving');
      setTimeout(function () { location.href = url.href; }, 240);
    });
  }

  /* ===========================================================================
     8 · COUNT-UP
     ======================================================================== */
  function initCountUp() {
    var els = [].slice.call(document.querySelectorAll('[data-count]'));
    if (!els.length) return;

    function run(el) {
      var to = parseFloat(el.getAttribute('data-count')) || 0;
      var dur = 1100, t0 = null;
      function step(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = String(Math.round(to * eased));
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = String(to);
      }
      requestAnimationFrame(step);
    }

    if (!canObserve) { els.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        if (en.target.getAttribute('data-counted')) return;
        en.target.setAttribute('data-counted', '');
        run(en.target);
      });
    }, { threshold: 0.4 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ===========================================================================
     9 · TAB BAR  (navigation, not decoration — runs even with reduced motion)
     Marks the current section and keeps the bar out of the way of sheets.
     ======================================================================== */
  function initTabBar() {
    var items = [].slice.call(document.querySelectorAll('.tabbar__item[data-tab]'));
    if (!items.length || initTabBar.bound) return;
    initTabBar.bound = true;

    var path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    var search = (location.search || '').toLowerCase();

    items.forEach(function (el) {
      var tab = el.getAttribute('data-tab');
      var active =
        (tab === 'shop' && (path === 'shop.html' || path === 'product.html' || path === 'index.html')) ||
        (tab === 'wishlist' && path === 'wishlist.html');
      if (tab === 'shop' && path === 'shop.html' && search.indexOf('c=best-sellers') > -1) active = true;
      if (active) { el.classList.add('is-active'); el.setAttribute('aria-current', 'page'); }
    });

    /* Hide the bar while a drawer, sheet or search has the screen. */
    var watched = ['#drawer-nav', '#bag-drawer', '#filter-drawer', '#search-panel'];
    function sync() {
      var open = watched.some(function (sel) {
        var el = document.querySelector(sel);
        return el && el.classList.contains('is-open');
      });
      document.body.classList.toggle('sheet-open', !!open);
    }
    document.addEventListener('click', function () { setTimeout(sync, 60); });
    window.addEventListener('tf:drawer', sync);
    sync();
  }

  /* ===========================================================================
     10 · MOBILE GALLERY RAIL  (dots reflect the snapped image)
     ======================================================================== */
  function initGalleryRail() {
    var rail = document.getElementById('pdp-rail');
    if (!rail || rail.getAttribute('data-rail-bound')) return;
    rail.setAttribute('data-rail-bound', '');
    var imgs = rail.querySelectorAll('img');
    var wrap = document.querySelector('.gallery__dots');
    if (!wrap || imgs.length < 2) return;

    var dots = [];
    for (var i = 0; i < imgs.length; i++) {
      var d = document.createElement('span');
      d.className = 'gallery__dot';
      d.setAttribute('aria-current', i === 0 ? 'true' : 'false');
      wrap.appendChild(d);
      dots.push(d);
    }

    function activeIndex() {
      var best = 0, bestDist = Infinity;
      var mid = rail.scrollLeft + rail.clientWidth / 2;
      for (var i = 0; i < imgs.length; i++) {
        var c = imgs[i].offsetLeft + imgs[i].offsetWidth / 2;
        var dist = Math.abs(c - mid);
        if (dist < bestDist) { bestDist = dist; best = i; }
      }
      return best;
    }

    var ticking = false;
    function sync() {
      ticking = false;
      var idx = activeIndex();
      for (var i = 0; i < dots.length; i++) {
        dots[i].setAttribute('aria-current', i === idx ? 'true' : 'false');
      }
    }
    rail.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(sync);
    }, { passive: true });
  }
})();
