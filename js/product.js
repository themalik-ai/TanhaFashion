/* =============================================================================
   TANHA'S FASHION — product.js
   Builds the product detail view from ?p=<slug>.
   Gallery, colour/size selection, quantity, add-to-bag, wishlist, accordions
   and related products.
   ========================================================================== */
(function () {
  'use strict';

  const root = document.getElementById('pdp-root');
  if (!root) return;

  const params = new URLSearchParams(location.search);
  const slug = params.get('p') || params.get('product') || '';
  const product = getProduct(slug);

  if (!product) {
    root.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__mark">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        </div>
        <h2>We could not find that piece</h2>
        <p>The link may be out of date. Browse everything we currently have on the rails.</p>
        <a class="btn" href="shop.html">Browse the collection</a>
      </div>`;
    const crumb = document.getElementById('pdp-crumb');
    if (crumb) crumb.textContent = 'Not found';
    document.title = 'Product not found — Tanha\'s Fashion';
    return;
  }

  const state = {
    imageIndex: 0,
    size: null,
    color: product.colors.length ? product.colors[0].name : null,
    qty: 1
  };

  /* ---------------------------------------------------------------- helpers */
  const flags = [];
  if (product.newArrival) flags.push('<span class="flag">New arrival</span>');
  if (product.stockNote) flags.push('<span class="flag flag--camel">' + TF.escapeHtml(product.stockNote) + '</span>');
  if (product.instagramLikes >= 13) flags.push('<span class="flag flag--ink">Most loved</span>');

  const priced = TF.isPriced(product);
  const priceHTML = priced
    ? `<p class="pdp__price">${TF.escapeHtml(TF.priceLabel(product))}</p>`
    : `<p class="pdp__price pdp__price--enq">Price on request</p>`;

  /* ------------------------------------------------------------------ build */
  function galleryHTML() {
    const thumbs = product.images.length > 1
      ? `<div class="gallery__thumbs" role="group" aria-label="Product images">
           ${product.images.map((src, i) => `
             <button class="gallery__thumb" type="button" data-image-index="${i}"
                     aria-current="${i === 0}" aria-label="View image ${i + 1} of ${product.images.length}">
               <img src="${src}" alt="" width="72" height="96" loading="lazy" decoding="async">
             </button>`).join('')}
         </div>`
      : '';
    return `
      <div class="gallery">
        <div class="gallery__main">
          <img id="pdp-main" src="${product.images[0]}"
               alt="${TF.escapeAttr(product.alt || product.name)}"
               width="1000" height="1333" fetchpriority="high" decoding="async">
          ${flags.length ? `<div class="gallery__badges">${flags.join('')}</div>` : ''}
        </div>
        ${thumbs}

        <!-- Swipeable rail for touch devices. Desktop keeps the single
             framed image above; CSS decides which one is shown. -->
        <div class="gallery__rail" id="pdp-rail" role="group" aria-label="Product images">
          ${product.images.map((src, i) => `
            <img src="${src}"
                 alt="${i === 0 ? TF.escapeAttr(product.alt || product.name) : ''}"
                 width="1000" height="1333"
                 ${i === 0 ? '' : 'loading="lazy"'} decoding="async">`).join('')}
        </div>
      </div>
      <div class="gallery__dots" aria-hidden="true"></div>`;
  }

  function colorsHTML() {
    if (!product.colors.length) return '';
    return `
      <div>
        <div class="opt__head">
          <span class="opt__label">Colour</span>
          <span class="opt__value" id="pdp-color-value">${TF.escapeHtml(state.color || '')}</span>
        </div>
        <div class="color-set" role="group" aria-label="Choose a colour">
          ${product.colors.map((c, i) => `
            <button class="color-btn" type="button" data-color="${TF.escapeAttr(c.name)}"
                    data-color-index="${i}" aria-pressed="${c.name === state.color}">
              <i style="background:${TF.escapeAttr(c.hex)}" aria-hidden="true"></i>
              <span>${TF.escapeHtml(c.name)}</span>
            </button>`).join('')}
        </div>
      </div>`;
  }

  function sizesHTML() {
    if (!product.sizes.length) {
      return `
        <div>
          <div class="opt__head">
            <span class="opt__label">Size</span>
            <button type="button" class="opt__help" data-sizeguide>Size guide</button>
          </div>
          <p class="muted" style="font-size:.88rem">
            Sizes for this piece have not been published. Message us on
            <a href="${BRAND.instagramUrl}" target="_blank" rel="noopener noreferrer">Instagram</a>
            and we will confirm what is available before you order.
          </p>
        </div>`;
    }
    return `
      <div>
        <div class="opt__head">
          <span class="opt__label">Size <span class="req" style="color:var(--error)">*</span></span>
          <button type="button" class="opt__help" data-sizeguide>Size guide</button>
        </div>
        <div class="size-set" role="group" aria-label="Choose a size" id="pdp-sizes">
          ${product.sizes.map(s => `
            <button class="size-btn" type="button" data-size="${TF.escapeAttr(s)}"
                    aria-pressed="false">${TF.escapeHtml(s)}</button>`).join('')}
        </div>
        <p class="opt__error" id="pdp-size-error" hidden>Please choose a size before adding to your bag.</p>
      </div>`;
  }

  function infoHTML() {
    return `
      <div class="pdp__info">
        <p class="eyebrow">${TF.escapeHtml(product.pieceType || 'Ready to wear')}</p>
        <h1 class="pdp__title">${TF.escapeHtml(product.name)}</h1>
        ${product.subtitle ? `<p class="pdp__sub">${TF.escapeHtml(product.subtitle)}</p>` : ''}
        ${priceHTML}

        <p class="pdp__stock${product.stockNote ? ' pdp__stock--limited' : ''}">
          <span class="dot" aria-hidden="true"></span>
          ${product.stockNote
            ? TF.escapeHtml(product.stockNote) + ' &mdash; we confirm availability with you before dispatch.'
            : 'In stock &mdash; availability confirmed with you before dispatch.'}
        </p>

        <p class="pdp__desc">${TF.escapeHtml(product.description)}</p>

        ${colorsHTML()}
        ${sizesHTML()}

        <div>
          <div class="opt__head"><span class="opt__label">Quantity</span></div>
          <div class="qty">
            <button type="button" data-qty="-1" aria-label="Decrease quantity" disabled>&minus;</button>
            <label class="sr-only" for="pdp-qty">Quantity</label>
            <input id="pdp-qty" type="number" value="1" min="1" max="99" step="1" inputmode="numeric">
            <button type="button" data-qty="1" aria-label="Increase quantity">&plus;</button>
          </div>
        </div>

        <div class="pdp__actions">
          <button class="btn btn--block" type="button" id="pdp-add">Add to Bag</button>
          <button class="btn btn--ghost btn--block" type="button" data-wish="${TF.escapeAttr(product.slug)}"
                  data-product-page aria-pressed="false">
            <span data-wish-label>Add to Wishlist</span>
          </button>
        </div>

        <p class="summary__note">
          No payment is taken online. Add this piece to your bag and we will confirm availability,
          price and delivery with you directly.
        </p>

        <div class="accordion" id="pdp-accordion">
          <div class="accordion__item">
            <h3>
              <button class="accordion__btn" type="button" aria-expanded="true" aria-controls="acc-details">
                Product details
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
              </button>
            </h3>
            <div class="accordion__panel" id="acc-details">
              <dl class="spec-list">
                <div><dt>Type</dt><dd>${TF.escapeHtml(product.pieceType || '—')}</dd></div>
                ${product.fabric ? `<div><dt>Fabric</dt><dd>${TF.escapeHtml(product.fabric)}</dd></div>` : ''}
                ${product.includes ? `<div><dt>Includes</dt><dd>${TF.escapeHtml(product.includes)}</dd></div>` : ''}
                ${product.sizes.length ? `<div><dt>Sizes</dt><dd>${TF.escapeHtml(product.sizes.join(' · '))}</dd></div>` : ''}
                ${product.colors.length ? `<div><dt>Colours</dt><dd>${TF.escapeHtml(product.colors.map(c => c.name).join(' · '))}</dd></div>` : ''}
              </dl>
              ${(product.details && product.details.length) ? `<ul style="margin-top:1rem">${product.details.map(d => `<li>${TF.escapeHtml(d)}</li>`).join('')}</ul>` : ''}
            </div>
          </div>

          <div class="accordion__item">
            <h3>
              <button class="accordion__btn" type="button" aria-expanded="false" aria-controls="acc-delivery">
                Delivery
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
              </button>
            </h3>
            <div class="accordion__panel" id="acc-delivery" hidden>
              <p>
                Delivery timeframes and charges are listed in our
                <a href="policies/shipping.html">Shipping Policy</a>. Those pages currently hold
                editable placeholders &mdash; add your real timeframes and charges there, or set
                <code>BRAND.delivery</code> in <code>js/products.js</code>.
              </p>
            </div>
          </div>

          <div class="accordion__item">
            <h3>
              <button class="accordion__btn" type="button" aria-expanded="false" aria-controls="acc-returns">
                Returns &amp; care
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
              </button>
            </h3>
            <div class="accordion__panel" id="acc-returns" hidden>
              <p>
                Our returns and exchange terms are set out in the
                <a href="policies/returns.html">Returns &amp; Exchanges</a> policy.
              </p>
              ${product.care
                ? `<p style="margin-top:.75rem"><strong>Care:</strong> ${TF.escapeHtml(product.care)}</p>`
                : `<p style="margin-top:.75rem">
                     Care instructions for this piece have not been supplied yet. Add them to the
                     <code>care</code> field for <code>${TF.escapeHtml(product.id)}</code> in
                     <code>js/products.js</code>.
                   </p>`}
            </div>
          </div>

          <div class="accordion__item">
            <h3>
              <button class="accordion__btn" type="button" aria-expanded="false" aria-controls="acc-origin">
                Seen on Instagram
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
              </button>
            </h3>
            <div class="accordion__panel" id="acc-origin" hidden>
              <p>
                This piece was posted to our Instagram on
                <time datetime="${TF.escapeAttr(product.postedOn)}">${TF.escapeHtml(formatDate(product.postedOn))}</time>
                and has ${product.instagramLikes} likes.
              </p>
              <p style="margin-top:.75rem">
                <a class="link" href="${TF.escapeAttr(product.instagramUrl)}" target="_blank" rel="noopener noreferrer">
                  View the original post <span class="link__arrow" aria-hidden="true">&rarr;</span>
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>`;
  }

  function formatDate(iso) {
    const d = new Date(iso + 'T00:00:00');
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }


  /* A sticky "Add to bag" bar that appears once the real button scrolls away.
     It never duplicates logic — it clicks the real button, so validation,
     stock messaging and the toast all behave identically. */
  function mountBuyBar() {
    if (document.getElementById('pdp-buybar')) return;
    const addBtn = document.getElementById('pdp-add');
    if (!addBtn) return;

    const bar = document.createElement('div');
    bar.className = 'pdp__buybar';
    bar.id = 'pdp-buybar';
    const label = TF.isPriced(product) ? TF.escapeHtml(TF.priceLabel(product)) : 'Price on request';
    bar.innerHTML =
      '<div class="pdp__buybar-meta">' +
        '<p class="pdp__buybar-name">' + TF.escapeHtml(product.name) + '</p>' +
        '<p class="pdp__buybar-price">' + label + '</p>' +
      '</div>' +
      '<button class="btn" type="button" data-buybar-add>Add to bag</button>';
    document.body.appendChild(bar);

    bar.querySelector('[data-buybar-add]').addEventListener('click', () => {
      addBtn.click();
      /* if a size was required, pull the visitor back to the size selector */
      const err = document.getElementById('pdp-size-error');
      if (err && !err.hidden) {
        err.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    /* reveal it only while the real button is off-screen */
    if (!('IntersectionObserver' in window)) return;
    new IntersectionObserver((entries) => {
      entries.forEach(en => bar.classList.toggle('is-in', !en.isIntersecting));
    }, { rootMargin: '0px 0px -80px 0px', threshold: 0 }).observe(addBtn);
  }

  /* Left/Right arrows step through the gallery while it has focus */
  document.addEventListener('keydown', (e) => {
    if (product.images.length < 2) return;
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const gallery = document.querySelector('.gallery');
    if (!gallery || !gallery.contains(document.activeElement)) return;
    e.preventDefault();
    const n = product.images.length;
    setImage((state.imageIndex + (e.key === 'ArrowRight' ? 1 : -1) + n) % n);
    const active = document.querySelector(`[data-image-index="${state.imageIndex}"]`);
    if (active) active.focus();
  });

  /* ------------------------------------------------------------------ render */
  root.innerHTML = `<div class="pdp">${galleryHTML()}${infoHTML()}</div>`;

  const crumb = document.getElementById('pdp-crumb');
  if (crumb) crumb.textContent = product.name;
  document.title = product.name + ' — Tanha\'s Fashion';

  /* update Open Graph tags for this product */
  const setMeta = (attr, key, content) => {
    let el = document.querySelector(`meta[${attr}="${key}"]`);
    if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
    el.setAttribute('content', content);
  };
  setMeta('property', 'og:title', product.name + ' — Tanha\'s Fashion');
  setMeta('property', 'og:description', product.description.slice(0, 180));
  setMeta('property', 'og:type', 'product');
  setMeta('name', 'description', product.description.slice(0, 160));

  mountBuyBar();

  /* related */
  const rel = relatedTo(product, 4);
  const relSection = document.getElementById('related-section');
  const relGrid = document.getElementById('related-grid');
  if (rel.length && relGrid && relSection) {
    relSection.hidden = false;
    TF.renderCards(relGrid, rel);
  }

  /* The motion layer loads before this script, so it never saw the markup we
     just built. Invite it back to bind the gallery dots and parallax. */
  if (window.TF_MOTION && typeof window.TF_MOTION.refresh === 'function') {
    try { window.TF_MOTION.refresh(); } catch (_) {}
  }

  /* ------------------------------------------------------------- interactions */
  const mainImg = document.getElementById('pdp-main');

  function setImage(i) {
    state.imageIndex = i;
    if (mainImg) {
      mainImg.src = product.images[i];
      mainImg.alt = product.alt || product.name;
    }
    document.querySelectorAll('[data-image-index]').forEach(b =>
      b.setAttribute('aria-current', String(Number(b.getAttribute('data-image-index')) === i)));
  }

  function setQty(n) {
    state.qty = Math.max(1, Math.min(99, parseInt(n, 10) || 1));
    const input = document.getElementById('pdp-qty');
    if (input) input.value = state.qty;
    document.querySelectorAll('[data-qty]').forEach(b => {
      const d = Number(b.getAttribute('data-qty'));
      b.disabled = (d < 0 && state.qty <= 1) || (d > 0 && state.qty >= 99);
    });
  }

  document.addEventListener('click', (e) => {
    const thumb = e.target.closest('[data-image-index]');
    if (thumb) { setImage(Number(thumb.getAttribute('data-image-index'))); return; }

    const q = e.target.closest('[data-qty]');
    if (q) { setQty(state.qty + Number(q.getAttribute('data-qty'))); return; }

    const sizeBtn = e.target.closest('[data-size]');
    if (sizeBtn) {
      document.querySelectorAll('[data-size]').forEach(b =>
        b.setAttribute('aria-pressed', String(b === sizeBtn)));
      state.size = sizeBtn.getAttribute('data-size');
      const err = document.getElementById('pdp-size-error');
      if (err) err.hidden = true;
      return;
    }

    const colorBtn = e.target.closest('[data-color]');
    if (colorBtn) {
      state.color = colorBtn.getAttribute('data-color');
      document.querySelectorAll('[data-color]').forEach(b =>
        b.setAttribute('aria-pressed', String(b === colorBtn)));
      const label = document.getElementById('pdp-color-value');
      if (label) label.textContent = state.color;
      /* Swap the image only when the product actually ships a variant image. */
      const idx = Number(colorBtn.getAttribute('data-color-index'));
      if (product.colorImages && product.colorImages[idx] !== undefined) {
        setImage(product.colorImages[idx]);
      }
      return;
    }

    /* accordions */
    const acc = e.target.closest('.accordion__btn');
    if (acc) {
      const panel = document.getElementById(acc.getAttribute('aria-controls'));
      const open = acc.getAttribute('aria-expanded') === 'true';
      acc.setAttribute('aria-expanded', String(!open));
      if (panel) panel.hidden = open;
      return;
    }

    /* add to bag */
    if (e.target.closest('#pdp-add')) {
      if (product.sizes.length && !state.size) {
        const err = document.getElementById('pdp-size-error');
        if (err) err.hidden = false;
        const first = document.querySelector('[data-size]');
        if (first) first.focus();
        return;
      }
      TF.addToBag(product.slug, state.size, state.color, state.qty);
      TF.toast('Added to your bag — ' + TF.escapeHtml(product.name) +
               ' <a href="cart.html">View bag</a>');
      return;
    }
  });

  /* quantity input typing */
  const qtyInput = document.getElementById('pdp-qty');
  if (qtyInput) {
    qtyInput.addEventListener('input', () => setQty(qtyInput.value));
    qtyInput.addEventListener('blur', () => setQty(qtyInput.value));
  }

  setQty(1);
  TF.syncCounts();
  TF.observeReveal();
})();
