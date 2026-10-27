/* =============================================================================
   TANHA'S FASHION — cart.js
   Drives two pages:
     • cart.html      — line items, quantity, remove, totals
     • wishlist.html  — saved pieces
   All state lives in localStorage via TF.Cart / TF.Wishlist.
   ========================================================================== */
(function () {
  'use strict';

  const isCartPage     = !!document.getElementById('cart-lines');
  const isWishlistPage = !!document.getElementById('wish-grid');

  if (!isCartPage && !isWishlistPage) return;

  const Cart = TF.Cart;
  const Wish = TF.Wishlist;

  /* ==========================================================================
     CART PAGE
  ========================================================================== */
  const linesHost = document.getElementById('cart-lines');
  const emptyEl   = document.getElementById('cart-empty');
  const summaryEl = document.getElementById('cart-summary');
  const rowsHost  = document.getElementById('summary-rows');
  const noteEl    = document.getElementById('summary-note');

  function deliveryLabel() {
    const d = BRAND.delivery || {};
    if (d.standard && typeof d.standard.fee === 'number') return TF.formatMoney(d.standard.fee);
    return null;
  }

  function renderCart() {
    if (!isCartPage) return;

    const items = Cart.items;
    const hasItems = items.length > 0;

    if (emptyEl) emptyEl.hidden = hasItems;
    if (linesHost) linesHost.hidden = !hasItems;
    if (summaryEl) summaryEl.hidden = !hasItems;

    if (!hasItems) {
      if (linesHost) linesHost.innerHTML = '';
      return;
    }

    linesHost.innerHTML = items.map(it => {
      const key = Cart.keyOf(it);
      const variant = [it.size, it.color].filter(Boolean).join(' · ') || 'One size';
      const lineTotal = typeof it.unitPrice === 'number'
        ? TF.formatMoney(it.unitPrice * it.qty)
        : 'Price on request';
      const unit = typeof it.unitPrice === 'number'
        ? TF.formatMoney(it.unitPrice) + ' each'
        : 'Price on request';

      return `
        <div class="cart-line" data-line="${TF.escapeAttr(key)}">
          <a class="cart-line__media" href="product.html?p=${encodeURIComponent(it.slug)}">
            <img src="${TF.escapeAttr(it.image)}" alt="${TF.escapeAttr(it.name)}" width="1000" height="1333" loading="lazy" decoding="async">
          </a>
          <div>
            <div class="cart-line__top">
              <div>
                <h2 class="cart-line__name"><a href="product.html?p=${encodeURIComponent(it.slug)}">${TF.escapeHtml(it.name)}</a></h2>
                <p class="cart-line__variant">${TF.escapeHtml(variant)}</p>
              </div>
              <button class="cart-line__remove" type="button" data-cart-remove="${TF.escapeAttr(key)}">Remove</button>
            </div>

            <div class="cart-line__bottom">
              <div class="qty">
                <button type="button" data-line-qty="-1" aria-label="Decrease quantity" ${it.qty <= 1 ? 'disabled' : ''}>&minus;</button>
                <label class="sr-only" for="qty-${TF.escapeAttr(key)}">Quantity for ${TF.escapeAttr(it.name)}</label>
                <input id="qty-${TF.escapeAttr(key)}" type="number" value="${it.qty}" min="1" max="99" step="1" inputmode="numeric" data-line-qty-input>
                <button type="button" data-line-qty="1" aria-label="Increase quantity" ${it.qty >= 99 ? 'disabled' : ''}>&plus;</button>
              </div>
              <div class="cart-line__price">
                <div>${TF.escapeHtml(lineTotal)}</div>
                <div class="muted" style="font-size:.78rem">${TF.escapeHtml(unit)}</div>
              </div>
            </div>
          </div>
        </div>`;
    }).join('');

    renderTotals();
  }

  function renderTotals() {
    if (!rowsHost) return;
    const sub = Cart.subtotal();
    const priced = typeof sub === 'number';
    const d = BRAND.delivery || {};
    let fee = (d.standard && typeof d.standard.fee === 'number') ? d.standard.fee : null;
    let feeIsFree = false;

    if (priced && d.freeOver != null && sub >= d.freeOver) { fee = 0; feeIsFree = true; }

    const total = priced && typeof fee === 'number' ? sub + fee : null;

    const row = (label, value, muted) => `
      <div class="summary__row${muted ? ' summary__row--muted' : ''}">
        <span>${label}</span><span>${value}</span>
      </div>`;

    let html = row('Subtotal',
      priced ? TF.escapeHtml(TF.formatMoney(sub)) : 'Confirmed on request');

    if (d.freeOver != null && priced) {
      const away = d.freeOver - sub;
      html += row('Delivery',
        feeIsFree ? '<strong>Free</strong>'
                  : (typeof fee === 'number'
                      ? TF.escapeHtml(TF.formatMoney(fee))
                      : 'Calculated at confirmation'),
        true);
      if (!feeIsFree && away > 0) {
        html += `<p class="summary__note">Spend ${TF.escapeHtml(TF.formatMoney(away))} more for free delivery.</p>`;
      }
    } else {
      html += row('Delivery',
        typeof fee === 'number' ? TF.escapeHtml(TF.formatMoney(fee)) : 'Calculated at confirmation',
        true);
    }

    html += `<div class="summary__row summary__row--total">
               <span>Total</span>
               <span>${typeof total === 'number' ? TF.escapeHtml(TF.formatMoney(total)) : 'To be confirmed'}</span>
             </div>`;

    rowsHost.innerHTML = html;

    if (noteEl) {
      noteEl.innerHTML = priced
        ? 'Delivery charges are set in <code>BRAND.delivery</code> inside <code>js/products.js</code>.'
        : 'Prices are confirmed with you before dispatch, so no total is charged here. No payment is taken online.';
    }
  }

  /* ==========================================================================
     WISHLIST PAGE
  ========================================================================== */
  const wishGrid  = document.getElementById('wish-grid');
  const wishEmpty = document.getElementById('wish-empty');
  const wishClear = document.getElementById('wish-clear');
  const wishCount = document.getElementById('wish-count-text');

  function renderWishlist() {
    if (!isWishlistPage) return;
    const list = Wish.slugs.map(s => getProduct(s)).filter(Boolean);
    const has = list.length > 0;

    if (wishEmpty) wishEmpty.hidden = has;
    if (wishGrid) wishGrid.hidden = !has;
    if (wishClear) wishClear.hidden = !has;
    if (wishCount) {
      wishCount.textContent = has
        ? (list.length === 1 ? '1 saved piece' : list.length + ' saved pieces')
        : '';
    }
    if (!has) { if (wishGrid) wishGrid.innerHTML = ''; return; }
    TF.renderCards(wishGrid, list, { eagerFirst: true });
  }

  /* ==========================================================================
     EVENTS
  ========================================================================== */
  document.addEventListener('click', (e) => {
    const qtyBtn = e.target.closest('[data-line-qty]');
    if (qtyBtn) {
      const line = qtyBtn.closest('[data-line]');
      if (!line) return;
      const key = line.getAttribute('data-line');
      const item = Cart.items.find(i => Cart.keyOf(i) === key);
      if (!item) return;
      Cart.setQty(key, item.qty + Number(qtyBtn.getAttribute('data-line-qty')));
      renderCart();
      return;
    }
    if (e.target.closest('#wish-clear')) {
      Wish.clear();
      renderWishlist();
      TF.toast('Wishlist cleared');
    }
  });

  document.addEventListener('change', (e) => {
    const input = e.target.closest('[data-line-qty-input]');
    if (!input) return;
    const line = input.closest('[data-line]');
    if (!line) return;
    Cart.setQty(line.getAttribute('data-line'), input.value);
    renderCart();
  });

  /* main.js handles [data-cart-remove]; re-render afterwards */
  document.addEventListener('tf:cartchange', () => { if (isCartPage) renderCart(); });
  document.addEventListener('tf:wishchange', () => { if (isWishlistPage) renderWishlist(); });

  /* ==========================================================================
     BOOT
  ========================================================================== */
  function boot() {
    renderCart();
    renderWishlist();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
