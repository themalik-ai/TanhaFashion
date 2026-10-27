/* =============================================================================
   TANHA'S FASHION — main.js
   Shared engine: storage, cart, wishlist, toasts, modals, header, search,
   product cards, lazy reveal. Loaded on every page after products.js.
   ========================================================================== */
(function () {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ===========================================================================
     STORAGE  (silently degrades if localStorage is blocked)
  =========================================================================== */
  const store = {
    available() {
      try {
        const k = '__tf_probe__';
        localStorage.setItem(k, '1'); localStorage.removeItem(k);
        return true;
      } catch (_) { return false; }
    },
    get(key, fallback) {
      if (!this.available()) return fallback;
      try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (_) { return fallback; }
    },
    set(key, value) {
      if (!this.available()) return;
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
    }
  };

  const KEY_CART = 'tanhas.cart.v1';
  const KEY_WISH = 'tanhas.wishlist.v1';
  const KEY_ANNC = 'tanhas.announcement.dismissed';

  /* ===========================================================================
     MONEY  —  PRICE MODE aware
  =========================================================================== */
  const isCatalogueMode = () => BRAND.priceMode === 'catalogue';

  function formatMoney(amount) {
    const n = Number(amount);
    if (!isFinite(n)) return '';
    const body = n.toLocaleString('en-PK', { maximumFractionDigits: 0 });
    return BRAND.currencySymbol ? BRAND.currencySymbol + ' ' + body : BRAND.currencyCode + ' ' + body;
  }

  /** Display price for a product, honouring PRICE MODE. */
  function priceLabel(product) {
    if (isCatalogueMode() && typeof product.price === 'number' && isFinite(product.price)) {
      return formatMoney(product.price);
    }
    return 'Price on request';
  }
  const isPriced = (p) =>
    isCatalogueMode() && typeof p.price === 'number' && isFinite(p.price);

  /* ===========================================================================
     CART
  =========================================================================== */
  const Cart = {
    items: [],

    load() { this.items = store.get(KEY_CART, []) || []; return this.items; },
    save() {
      store.set(KEY_CART, this.items);
      document.dispatchEvent(new CustomEvent('tf:cartchange', { detail: { count: this.count() } }));
    },
    keyOf(line) { return [line.slug, line.size || '', line.color || ''].join('|'); },

    count() { return this.items.reduce((n, i) => n + Number(i.qty || 0), 0); },

    add(line) {
      const key = this.keyOf(line);
      const found = this.items.find(i => this.keyOf(i) === key);
      if (found) {
        found.qty = Math.min(99, Number(found.qty) + Number(line.qty));
      } else {
        this.items.push({
          slug: line.slug,
          name: line.name,
          image: line.image,
          size: line.size || null,
          color: line.color || null,
          unitPrice: (isCatalogueMode() && typeof line.unitPrice === 'number') ? line.unitPrice : null,
          qty: Math.max(1, Number(line.qty) || 1)
        });
      }
      this.save();
      return found ? 'updated' : 'added';
    },

    setQty(key, qty) {
      const it = this.items.find(i => this.keyOf(i) === key);
      if (!it) return;
      const q = Math.max(1, Math.min(99, parseInt(qty, 10) || 1));
      it.qty = q; this.save();
    },

    remove(key) {
      this.items = this.items.filter(i => this.keyOf(i) !== key);
      this.save();
    },

    clear() { this.items = []; this.save(); },

    /** null when any line has no confirmed price */
    subtotal() {
      if (!this.items.length) return 0;
      if (this.items.some(i => typeof i.unitPrice !== 'number')) return null;
      return this.items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
    }
  };

  /* ===========================================================================
     WISHLIST
  =========================================================================== */
  const Wishlist = {
    slugs: [],
    load() { this.slugs = store.get(KEY_WISH, []) || []; return this.slugs; },
    save() {
      store.set(KEY_WISH, this.slugs);
      document.dispatchEvent(new CustomEvent('tf:wishchange', { detail: { count: this.slugs.length } }));
    },
    has(slug) { return this.slugs.includes(slug); },
    toggle(slug) {
      const i = this.slugs.indexOf(slug);
      if (i > -1) { this.slugs.splice(i, 1); } else { this.slugs.push(slug); }
      this.save();
      return i === -1;   // true = added
    },
    remove(slug) {
      this.slugs = this.slugs.filter(s => s !== slug);
      this.save();
    },
    clear() { this.slugs = []; this.save(); }
  };

  /* ===========================================================================
     TOASTS
  =========================================================================== */
  const ICON_CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  const ICON_INFO  = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/></svg>';

  function toast(message, opts) {
    opts = opts || {};
    let host = $('.toasts');
    if (!host) {
      host = document.createElement('div');
      host.className = 'toasts';
      host.setAttribute('role', 'status');
      host.setAttribute('aria-live', 'polite');
      document.body.appendChild(host);
    }
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = (opts.icon === false ? '' : (opts.tone === 'info' ? ICON_INFO : ICON_CHECK)) +
                   '<span>' + message + '</span>';
    host.appendChild(el);
    const life = opts.duration || 3600;
    setTimeout(() => {
      el.classList.add('toast--out');
      setTimeout(() => el.remove(), 400);
    }, life);
  }

  /* ===========================================================================
     MODALS  —  focus trap, Escape, backdrop, scroll lock
  =========================================================================== */
  const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  let lastFocused = null;

  const Modal = {
    open(el) {
      if (!el) return;
      lastFocused = document.activeElement;
      el.classList.add('is-open');
      el.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      const focusTarget = el.querySelector('[data-autofocus]') || el.querySelector(FOCUSABLE);
      if (focusTarget) setTimeout(() => focusTarget.focus(), 60);
    },
    close(el) {
      if (!el) return;
      el.classList.remove('is-open');
      el.setAttribute('aria-hidden', 'true');
      if (!document.querySelector('.modal.is-open, .drawer-nav.is-open, .bag-drawer.is-open, .filter-drawer.is-open')) {
        document.body.style.overflow = '';
      }
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    },
    closeAll() {
      $$('.modal.is-open').forEach(m => this.close(m));
    }
  };

  document.addEventListener('keydown', (e) => {
    /* ⌘K / Ctrl-K, or "/" when not typing, opens search */
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '')
                   || document.activeElement?.isContentEditable;
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault(); toggleSearch(true); return;
    }
    if (e.key === '/' && !typing && !$('.modal.is-open')) {
      e.preventDefault(); toggleSearch(true); return;
    }
    if (e.key === 'Escape') {
      const openModal = $('.modal.is-open');
      if (openModal) { e.preventDefault(); Modal.close(openModal); return; }
      if ($('.search-panel.is-open')) { e.preventDefault(); toggleSearch(false); return; }
      ['#drawer-nav', '#bag-drawer', '#filter-drawer'].forEach(sel => {
        const d = $(sel);
        if (d && d.classList.contains('is-open')) { e.preventDefault(); closeDrawer(d); }
      });
    }
    /* keep focus inside an open modal */
    if (e.key === 'Tab') {
      const m = $('.modal.is-open');
      if (!m) return;
      const nodes = $$(FOCUSABLE, m).filter(n => n.offsetParent !== null);
      if (!nodes.length) return;
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ===========================================================================
     DRAWERS + SCRIM
  =========================================================================== */
  function openDrawer(el) {
    if (!el) return;
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
    showScrim(true);
    document.body.style.overflow = 'hidden';
    const btn = el.querySelector('[data-drawer-close]');
    if (btn) setTimeout(() => btn.focus(), 60);
  }
  function closeDrawer(el) {
    if (!el) return;
    el.classList.remove('is-open');
    el.setAttribute('aria-hidden', 'true');
    showScrim(false);
    if (!$('.drawer-nav.is-open, .bag-drawer.is-open, .filter-drawer.is-open, .modal.is-open')) {
      document.body.style.overflow = '';
    }
  }
  function closeAllDrawers() {
    ['#drawer-nav', '#bag-drawer', '#filter-drawer'].forEach(s => closeDrawer($(s)));
  }
  function showScrim(on) {
    const scrim = $('#scrim');
    if (scrim) scrim.classList.toggle('is-open', !!on);
  }

  /* ===========================================================================
     SEARCH
  =========================================================================== */
  function toggleSearch(force) {
    const panel = $('#search-panel');
    if (!panel) return;
    const open = typeof force === 'boolean' ? force : !panel.classList.contains('is-open');
    panel.classList.toggle('is-open', open);
    panel.setAttribute('aria-hidden', String(!open));
    const input = $('#search-input');
    if (open) {
      toggleSearchClose(true);
      setTimeout(() => input && input.focus(), 120);
    } else {
      toggleSearchClose(false);
      const trigger = $('[data-search-open]');
      if (trigger) trigger.focus();
    }
  }
  function toggleSearchClose(on) {
    $$('[data-search-open]').forEach(b => b.setAttribute('aria-expanded', String(!!on)));
  }

  function searchProducts(term) {
    const q = String(term || '').trim().toLowerCase();
    if (!q) return [];
    const words = q.split(/\s+/);
    return PRODUCTS.filter(p => {
      const hay = [
        p.name, p.subtitle, p.description, p.pieceType, p.fabric,
        p.includes, (p.details || []).join(' '), p.categories.join(' '),
        (p.colors || []).map(c => c.name).join(' ')
      ].join(' ').toLowerCase();
      return words.every(w => hay.includes(w));
    });
  }

  function renderSearchResults(term) {
    const box = $('#search-results');
    if (!box) return;
    const q = String(term || '').trim();
    if (!q) { box.innerHTML = ''; return; }
    const hits = searchProducts(q).slice(0, 6);
    if (!hits.length) {
      box.innerHTML =
        '<p class="search-hint">No pieces match &ldquo;' + escapeHtml(q) +
        '&rdquo;. Try “linen”, “sheesha silk”, “frock” or “lawn”.</p>';
      return;
    }
    box.innerHTML =
      '<ul>' + hits.map(p => `
        <li>
          <a class="search-result" href="product.html?p=${encodeURIComponent(p.slug)}">
            <img src="${p.images[0]}" alt="${escapeAttr(p.alt || p.name)}" width="56" height="74" loading="lazy" decoding="async">
            <span>
              <span class="search-result__name">${escapeHtml(p.name)}</span>
              <span class="search-result__meta">${escapeHtml(p.pieceType || p.subtitle || '')} &middot; ${priceLabel(p)}</span>
            </span>
          </a>
        </li>`).join('') + '</ul>' +
      '<a class="link mt-1" style="display:inline-flex" href="shop.html?q=' + encodeURIComponent(q) + '">See all results</a>';
  }

  /* ===========================================================================
     HTML HELPERS
  =========================================================================== */
  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  const escapeAttr = escapeHtml;

  function productUrl(p) { return 'product.html?p=' + encodeURIComponent(p.slug); }

  const FLAG_NEW   = '<span class="flag">New</span>';
  const FLAG_LIMIT = '<span class="flag flag--camel">Limited</span>';
  const FLAG_LOVED = '<span class="flag flag--ink">Most loved</span>';

  /**
   * Build a product card.
   * @param {object} p        product
   * @param {object} opts     { eager:boolean, priority:boolean }
   */
  function cardHTML(p, opts) {
    opts = opts || {};
    const wish = Wishlist.has(p.slug);
    const altImg = p.images[1] || null;

    const flags = [];
    if (p.newArrival) flags.push(FLAG_NEW);
    if (p.stockNote) flags.push(FLAG_LIMIT);
    if (p.instagramLikes >= 13) flags.push(FLAG_LOVED);

    const swatches = (p.colors && p.colors.length)
      ? '<div class="card__swatches" aria-hidden="true">' +
          p.colors.map(c => `<span class="swatch-dot" style="background:${escapeAttr(c.hex)}"></span>`).join('') +
        '</div>'
      : '';

    const sizes = (p.sizes && p.sizes.length)
      ? `<p class="card__sizes">Sizes ${escapeHtml(p.sizes.join(' · '))}</p>`
      : '';

    const priceCls = isPriced(p) ? 'card__price' : 'card__price card__price--enq';

    return `
      <article class="card reveal" data-product="${escapeAttr(p.slug)}">
        <div class="card__media">
          <a href="${productUrl(p)}" aria-label="${escapeAttr(p.name)}">
            <img class="card__img card__img--base" src="${p.images[0]}" alt="${escapeAttr(p.alt || p.name)}"
                 width="1000" height="1333" decoding="async"
                 ${opts.eager ? 'fetchpriority="high"' : 'loading="lazy"'}>
            ${altImg ? `<img class="card__img card__img--alt" src="${altImg}" alt="" width="1000" height="1333" loading="lazy" decoding="async" aria-hidden="true">` : ''}
          </a>
          ${flags.length ? `<div class="card__flags">${flags.join('')}</div>` : ''}
          <button class="card__wish${wish ? ' is-active' : ''}" type="button"
                  data-wish="${escapeAttr(p.slug)}"
                  aria-pressed="${wish}"
                  aria-label="${wish ? 'Remove from' : 'Add to'} wishlist: ${escapeAttr(p.name)}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.7 4.2 13a4.8 4.8 0 0 1 0-6.8 4.8 4.8 0 0 1 6.8 0l1 1 1-1a4.8 4.8 0 0 1 6.8 0 4.8 4.8 0 0 1 0 6.8Z"/></svg>
          </button>
          <button class="card__quick" type="button" data-quickview="${escapeAttr(p.slug)}">Quick view</button>
        </div>
        <div class="card__body">
          <p class="card__cat">${escapeHtml(p.pieceType || '')}</p>
          <h3 class="card__name"><a href="${productUrl(p)}">${escapeHtml(p.name)}</a></h3>
          ${p.subtitle ? `<p class="card__sub">${escapeHtml(p.subtitle)}</p>` : ''}
          <p class="${priceCls}">${isPriced(p) ? escapeHtml(priceLabel(p)) : 'Price on request'}</p>
          ${swatches}
          ${sizes}
        </div>
      </article>`;
  }

  function renderCards(target, list, opts) {
    if (!target) return;
    if (!list.length) {
      target.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-state__mark"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></div>
          <h2>No pieces found</h2>
          <p>${escapeHtml((opts && opts.emptyText) || 'Nothing matches those filters yet. Try clearing one or two.')}</p>
          <a class="btn btn--ghost" href="shop.html">Browse everything</a>
        </div>`;
      return;
    }
    target.innerHTML = list.map((p, i) => cardHTML(p, { eager: (opts && opts.eagerFirst && i < 4) })).join('');
    observeReveal();
  }

  /* ===========================================================================
     QUICK VIEW
  =========================================================================== */
  let qvState = { slug: null, size: null, color: null };

  function openQuickView(slug) {
    const p = getProduct(slug);
    if (!p) return;
    qvState = { slug: slug, size: null, color: null };
    const modal = $('#quickview');
    if (!modal) return;
    modal.innerHTML = `
      <div class="modal__scrim" data-modal-close></div>
      <div class="modal__dialog modal--narrow" role="document">
        <div class="qv" style="grid-template-columns:1fr">
          <div class="qv__media"><img src="${p.images[0]}" alt="${escapeAttr(p.alt || p.name)}" width="1000" height="1333" loading="lazy" decoding="async"></div>
          <div class="qv__body">
            <p class="eyebrow">${escapeHtml(p.pieceType || '')}</p>
            <h2 class="qv__title" id="qv-title">${escapeHtml(p.name)}</h2>
            ${p.subtitle ? `<p class="muted">${escapeHtml(p.subtitle)}</p>` : ''}
            <p class="${isPriced(p) ? 'pdp__price' : 'pdp__price pdp__price--enq'}">${isPriced(p) ? escapeHtml(priceLabel(p)) : 'Price on request'}</p>
            ${p.sizes && p.sizes.length ? `
              <div>
                <div class="opt__head"><span class="opt__label">Size</span>
                  <button type="button" class="opt__help" data-sizeguide>Size guide</button></div>
                <div class="size-set" role="group" aria-label="Choose a size">
                  ${p.sizes.map(s => `<button type="button" class="size-btn" data-qv-size="${escapeAttr(s)}" aria-pressed="false">${escapeHtml(s)}</button>`).join('')}
                </div>
                <p class="opt__error" hidden data-qv-size-error>Please choose a size first.</p>
              </div>` : ''}
            <div class="wish-actions">
              <button class="btn btn--block" type="button" data-qv-add>Add to Bag</button>
            </div>
            <a class="link" href="${productUrl(p)}">View full details<span class="link__arrow">&rarr;</span></a>
          </div>
        </div>
        <button class="modal__close" type="button" data-modal-close data-autofocus aria-label="Close quick view">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>`;
    modal.setAttribute('aria-label', p.name);
    Modal.open(modal);
  }

  /* ===========================================================================
     SIZE GUIDE
  =========================================================================== */
  const SIZE_GUIDE_ROWS = [
    ['XS', '32', '30–31', '34–35', '52'],
    ['S',  '34', '32–33', '36–37', '53'],
    ['M',  '36', '34–35', '38–39', '54'],
    ['L',  '38', '36–38', '40–42', '55'],
    ['XL', '40', '39–41', '43–45', '56']
  ];
  function openSizeGuide() {
    let modal = $('#sizeguide');
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'modal modal--narrow';
      modal.id = 'sizeguide';
      modal.setAttribute('aria-hidden', 'true');
      modal.innerHTML = `
        <div class="modal__scrim" data-modal-close></div>
        <div class="modal__dialog" role="document" style="padding:clamp(1.5rem,1rem+2vw,2.5rem)">
          <h2 style="font-size:1.7rem;margin-bottom:.5rem">Size guide</h2>
          <p class="muted" style="font-size:.88rem;margin-bottom:1.25rem">
            Approximate body measurements in inches. Sizes listed on a product are the sizes that
            product is actually available in.
          </p>
          <table class="size-table">
            <caption>Measurements are a general guide for stitched eastern wear.</caption>
            <thead><tr><th scope="col">Size</th><th scope="col">Bust</th><th scope="col">Waist</th><th scope="col">Hip</th><th scope="col">Length</th></tr></thead>
            <tbody>${SIZE_GUIDE_ROWS.map(r => `<tr><th scope="row">${r[0]}</th>${r.slice(1).map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
          </table>
          <p class="muted" style="font-size:.8rem;margin-top:1rem">
            Between sizes, or unsure about a particular piece? Message us on Instagram before ordering.
          </p>
          <button class="modal__close" type="button" data-modal-close data-autofocus aria-label="Close size guide">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>`;
      document.body.appendChild(modal);
    }
    Modal.open(modal);
  }

  /* ===========================================================================
     HEADER / SHARED CHROME
  =========================================================================== */
  function syncCounts() {
    $$('[data-cart-count]').forEach(el => {
      const n = Cart.count();
      el.textContent = n > 99 ? '99+' : String(n);
      el.hidden = n === 0;
      const parent = el.closest('.icon-btn');
      if (parent) {
        let sr = parent.querySelector('.sr-only[data-count-sr]');
        if (!sr) { sr = document.createElement('span'); sr.className = 'sr-only'; sr.setAttribute('data-count-sr',''); parent.appendChild(sr); }
        sr.textContent = n === 1 ? '1 item in bag' : n + ' items in bag';
      }
    });
    $$('[data-wish-count]').forEach(el => {
      const n = Wishlist.slugs.length;
      el.textContent = n > 99 ? '99+' : String(n);
      el.hidden = n === 0;
    });
    $$('[data-wish-toggle]').forEach(btn => {
      const slug = btn.getAttribute('data-wish-toggle');
      const on = Wishlist.has(slug);
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', String(on));
    });
    $$('[data-wish][data-product-page]').forEach(btn => {
      const on = Wishlist.has(btn.getAttribute('data-wish'));
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', String(on));
      const label = btn.querySelector('[data-wish-label]');
      if (label) label.textContent = on ? 'Saved to Wishlist' : 'Add to Wishlist';
    });
  }

  function initAnnouncement() {
    const bar = $('#announce');
    if (!bar) return;
    const text = (BRAND.announcement || '').trim();
    const dismissed = store.get(KEY_ANNC, false);
    if (!text || dismissed) { bar.hidden = true; return; }
    bar.hidden = false;
    const span = bar.querySelector('[data-announce-text]');
    if (span) span.textContent = text;
  }

  /* Use a real logo file when one is present; otherwise keep the typeset
     wordmark. Replace assets/logo/logo.png with your own artwork and it is
     picked up automatically — no code change needed. */
  function initBrandLogo() {
    $$('.brand').forEach(wrap => {
      const img = wrap.querySelector('.brand__img');
      const mark = wrap.querySelector('.brand__mark');
      if (!img || !mark) return;
      img.hidden = true;
      const probe = new Image();
      probe.onload = function () { img.hidden = false; mark.hidden = true; };
      probe.onerror = function () { img.hidden = true; mark.hidden = false; };
      probe.src = img.getAttribute('src');
    });
  }

  function initHeader() {
    const header = $('#site-header');
    if (header) {
      const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 8);
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
    /* mark current nav item */
    const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    $$('.nav__link, .drawer-nav__link').forEach(a => {
      const href = (a.getAttribute('href') || '').toLowerCase();
      if (href === here || (here === '' && href === 'index.html')) {
        a.setAttribute('aria-current', 'page');
      }
    });
  }

  function initToTop() {
    const btn = $('#to-top');
    if (!btn) return;
    const onScroll = () => btn.classList.toggle('is-visible', window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* Reveal-on-scroll */
  let revealObserver = null;

  /* Some overlays are authored inside <main> for convenience. They are
     anchored to the viewport, so they belong as direct children of <body> —
     a transformed or clipped ancestor would otherwise capture them. */
  function liftOverlays() {
    const main = document.getElementById('main');
    if (!main) return;
    $$('#filter-drawer, .modal, .toasts, .tf-cursor').forEach(el => {
      if (el && el.closest('main') && el.parentElement !== document.body) {
        document.body.appendChild(el);
      }
    });
  }

  function observeReveal() {
    if (revealObserver) {
      $$('.reveal:not(.is-in)').forEach(el => revealObserver.observe(el));
      return;
    }
    if (!('IntersectionObserver' in window)) {
      $$('.reveal').forEach(el => el.classList.add('is-in'));
      return;
    }
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); revealObserver.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    $$('.reveal').forEach(el => revealObserver.observe(el));
  }

  /* ===========================================================================
     BAG DRAWER CONTENTS
  =========================================================================== */
  function renderBagDrawer() {
    const host = $('#bag-drawer-body');
    if (!host) return;
    const foot = $('#bag-drawer-foot');
    if (!Cart.items.length) {
      host.innerHTML = '<p class="muted" style="text-align:center;padding:2rem 0">Your bag is empty.</p>';
      if (foot) foot.hidden = true;
      return;
    }
    if (foot) foot.hidden = false;
    host.innerHTML = Cart.items.map(it => {
      const key = Cart.keyOf(it);
      const price = typeof it.unitPrice === 'number' ? formatMoney(it.unitPrice * it.qty) : 'Price on request';
      return `
        <div class="mini-item">
          <img src="${it.image}" alt="${escapeAttr(it.name)}" width="76" height="101" loading="lazy" decoding="async">
          <div>
            <a class="mini-item__name" href="product.html?p=${encodeURIComponent(it.slug)}">${escapeHtml(it.name)}</a>
            <p class="mini-item__meta">${escapeHtml([it.size, it.color].filter(Boolean).join(' · ') || 'One size')} &middot; Qty ${it.qty}</p>
            <p class="mini-item__meta">${escapeHtml(price)}</p>
          </div>
          <button class="mini-item__remove" type="button" data-cart-remove="${escapeAttr(key)}" aria-label="Remove ${escapeAttr(it.name)}">Remove</button>
        </div>`;
    }).join('');
  }

  /* ===========================================================================
     GLOBAL EVENT WIRING (delegation — works for dynamically rendered nodes)
  =========================================================================== */
  function addToBag(slug, size, color, qty) {
    const p = getProduct(slug);
    if (!p) return false;
    if (p.sizes && p.sizes.length && !size) return 'need-size';
    Cart.add({
      slug: p.slug, name: p.name, image: p.images[0],
      size: size || null, color: color || null,
      unitPrice: p.price, qty: qty || 1
    });
    return true;
  }

  document.addEventListener('click', (e) => {
    const t = e.target;

    /* --- menu / drawers --- */
    const menuBtn = t.closest('[data-menu-open]');
    if (menuBtn) { e.preventDefault(); openDrawer($('#drawer-nav')); return; }

    const drawerClose = t.closest('[data-drawer-close]');
    if (drawerClose) { e.preventDefault(); closeDrawer(drawerClose.closest('.drawer-nav, .bag-drawer, .filter-drawer')); return; }

    /* --- search --- */
    const searchOpen = t.closest('[data-search-open]');
    if (searchOpen) { e.preventDefault(); closeAllDrawers(); toggleSearch(true); return; }
    const searchClose = t.closest('[data-search-close]');
    if (searchClose) { e.preventDefault(); toggleSearch(false); return; }
    if (t.id === 'scrim') { closeAllDrawers(); return; }

    /* --- modals --- */
    const modalClose = t.closest('[data-modal-close]');
    if (modalClose) { e.preventDefault(); Modal.close(modalClose.closest('.modal')); return; }
    if (t.classList && t.classList.contains('modal__scrim')) { Modal.close(t.closest('.modal')); return; }

    /* --- wishlist --- */
    const wishBtn = t.closest('[data-wish]');
    if (wishBtn && !wishBtn.hasAttribute('data-wish-clear')) {
      e.preventDefault();
      const slug = wishBtn.getAttribute('data-wish');
      const p = getProduct(slug);
      const added = Wishlist.toggle(slug);
      syncCounts();
      renderBagDrawer();
      toast(added
        ? 'Saved to your wishlist — ' + escapeHtml(p ? p.name : '')
        : 'Removed from your wishlist');
      return;
    }

    /* --- quick view --- */
    const qvBtn = t.closest('[data-quickview]');
    if (qvBtn) { e.preventDefault(); openQuickView(qvBtn.getAttribute('data-quickview')); return; }

    const sgBtn = t.closest('[data-sizeguide]');
    if (sgBtn) { e.preventDefault(); openSizeGuide(); return; }

    /* --- quick view internals --- */
    const qvSize = t.closest('[data-qv-size]');
    if (qvSize) {
      e.preventDefault();
      $$('[data-qv-size]').forEach(b => b.setAttribute('aria-pressed', String(b === qvSize)));
      qvState.size = qvSize.getAttribute('data-qv-size');
      const err = $('[data-qv-size-error]');
      if (err) err.hidden = true;
      return;
    }
    const qvAdd = t.closest('[data-qv-add]');
    if (qvAdd) {
      e.preventDefault();
      const p = getProduct(qvState.slug);
      if (!p) return;
      const needsSize = p.sizes && p.sizes.length;
      if (needsSize && !qvState.size) {
        const err = $('[data-qv-size-error]');
        if (err) err.hidden = false;
        const set = $('.size-set');
        if (set && set.firstElementChild) set.firstElementChild.focus();
        return;
      }
      addToBag(p.slug, qvState.size, qvState.color, 1);
      Modal.close($('#quickview'));
      toast('Added to your bag — ' + escapeHtml(p.name) +
            ' <a href="cart.html">View bag</a>');
      return;
    }

    /* --- bag drawer --- */
    const bagOpen = t.closest('[data-bag-open]');
    if (bagOpen) { e.preventDefault(); renderBagDrawer(); openDrawer($('#bag-drawer')); return; }

    const cartRemove = t.closest('[data-cart-remove]');
    if (cartRemove) {
      e.preventDefault();
      Cart.remove(cartRemove.getAttribute('data-cart-remove'));
      renderBagDrawer();
      syncCounts();
      if (window.TF && window.TF.onCartChange) window.TF.onCartChange();
      toast('Removed from your bag');
      return;
    }

    /* --- announcement --- */
    const annc = t.closest('[data-announce-close]');
    if (annc) { e.preventDefault(); store.set(KEY_ANNC, true); const bar = $('#announce'); if (bar) bar.hidden = true; return; }
  });

  /* ===========================================================================
     PUBLIC API
  =========================================================================== */
  window.TF = {
    $, $$, store,
    Cart, Wishlist, Modal,
    toast, escapeHtml, escapeAttr,
    formatMoney, priceLabel, isPriced, isCatalogueMode,
    cardHTML, renderCards, productUrl,
    addToBag, syncCounts, renderBagDrawer,
    openQuickView, openSizeGuide, closeDrawer, openDrawer,
    toggleSearch, searchProducts, renderSearchResults,
    observeReveal,
    ICON_CHECK, ICON_INFO
  };

  /* ===========================================================================
     BOOT
  =========================================================================== */
  function boot() {
    document.documentElement.classList.remove('no-js');

    liftOverlays();

    Cart.load();
    Wishlist.load();
    initAnnouncement();
    initBrandLogo();
    initHeader();
    initToTop();
    syncCounts();
    renderBagDrawer();
    observeReveal();

    document.addEventListener('tf:cartchange', () => { syncCounts(); renderBagDrawer(); });
    document.addEventListener('tf:wishchange', () => { syncCounts(); });

    /* search input */
    const si = $('#search-input');
    if (si) {
      let t = null;
      si.addEventListener('input', () => {
        clearTimeout(t);
        t = setTimeout(() => renderSearchResults(si.value), 140);
      });
      si.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const q = si.value.trim();
          if (q) location.href = 'shop.html?q=' + encodeURIComponent(q);
        }
      });
    }

    /* shop toolbar search field on the shop page itself */
    const ss = $('#shop-search');
    if (ss) {
      let t = null;
      ss.addEventListener('input', () => {
        clearTimeout(t);
        t = setTimeout(() => {
          if (window.TF.applyShopFilters) window.TF.applyShopFilters();
        }, 180);
      });
    }

    /* smooth anchor offset handled by scroll-padding-top */

    /* year stamps */
    $$('[data-year]').forEach(el => el.textContent = String(new Date().getFullYear()));

    /* inject brand contact details wherever placeholders exist */
    $$('[data-brand-email]').forEach(el => {
      el.textContent = BRAND.email || 'not published yet';
      if (BRAND.email) el.setAttribute('href', 'mailto:' + BRAND.email);
    });
    $$('[data-brand-phone]').forEach(el => {
      el.textContent = BRAND.phone || 'not published yet';
      if (BRAND.phone) el.setAttribute('href', 'tel:' + BRAND.phone.replace(/\s+/g, ''));
    });
    $$('[data-brand-instagram]').forEach(el => {
      el.setAttribute('href', BRAND.instagramUrl);
      if (!el.textContent.trim()) el.textContent = BRAND.handle;
    });
    $$('[data-brand-whatsapp]').forEach(el => {
      if (BRAND.whatsapp) {
        el.setAttribute('href', 'https://wa.me/' + BRAND.whatsapp.replace(/\D/g, ''));
        el.hidden = false;
      } else {
        el.hidden = true;
      }
    });
    $$('[data-brand-address]').forEach(el => {
      const parts = [BRAND.address, BRAND.city, BRAND.country].filter(Boolean);
      el.textContent = parts.length ? parts.join(', ') : 'Address to be added';
    });
    $$('[data-brand-name]').forEach(el => el.textContent = BRAND.name);
    $$('[data-brand-strapline]').forEach(el => el.textContent = BRAND.strapline);
    $$('[data-brand-tagline]').forEach(el => el.textContent = BRAND.tagline);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
