/* =============================================================================
   TANHA'S FASHION — checkout.js
   A DEMONSTRATION checkout.

   It validates the form, builds an order request in the browser and shows a
   confirmation — but it takes no payment and sends nothing anywhere. Card
   details are never collected. See README.md → "Connecting real services"
   for where to plug in Stripe / PayPal / JazzCash / Easypaisa and an order API.

   EDITABLE: the payment methods below are yours to change.
   ========================================================================== */
(function () {
  'use strict';

  const wrap = document.getElementById('checkout-wrap');
  if (!wrap) return;

  const form        = document.getElementById('checkout-form');
  const layoutEl    = document.getElementById('checkout-layout');
  const emptyEl     = document.getElementById('checkout-empty');
  const demoNotice  = document.getElementById('demo-notice');
  const linesHost   = document.getElementById('order-lines');
  const totalsHost  = document.getElementById('order-totals');
  const delivHost   = document.getElementById('delivery-options');
  const payHost     = document.getElementById('payment-options');
  const payErr      = document.getElementById('co-payment-err');
  const statusEl    = document.getElementById('checkout-status');
  const confirmEl   = document.getElementById('confirmation');

  /* ---------------------------------------------------------------- config */
  const PAYMENT_METHODS = [
    { id: 'cod',       name: 'Cash on delivery',                        desc: 'Pay the courier when your parcel arrives.' },
    { id: 'transfer',  name: 'Bank transfer / Easypaisa / JazzCash',    desc: 'We send you the details and confirm payment before dispatch.' },
    { id: 'card',      name: 'Card payment',                            desc: 'We send you a secure payment link — card details are never entered on this website.' },
    { id: 'instagram', name: 'Confirm on Instagram',                    desc: 'Finish the order by DM at ' + BRAND.handle + '.' }
  ];

  /* ==================================================================== render */
  function renderOrderSummary() {
    const items = TF.Cart.items;

    if (!items.length) {
      if (emptyEl) emptyEl.hidden = false;
      if (layoutEl) layoutEl.hidden = true;
      if (demoNotice) demoNotice.hidden = true;
      return;
    }
    if (emptyEl) emptyEl.hidden = true;
    if (layoutEl) layoutEl.hidden = false;
    if (demoNotice) demoNotice.hidden = false;

    linesHost.innerHTML = items.map(it => {
      const variant = [it.size, it.color].filter(Boolean).join(' · ') || 'One size';
      const price = typeof it.unitPrice === 'number'
        ? TF.formatMoney(it.unitPrice * it.qty) : 'Price on request';
      return `
        <div class="order-line">
          <img src="${TF.escapeAttr(it.image)}" alt="${TF.escapeAttr(it.name)}" width="1000" height="1333" loading="lazy" decoding="async">
          <div>
            <div>${TF.escapeHtml(it.name)}</div>
            <div class="order-line__meta">${TF.escapeHtml(variant)} &middot; Qty ${it.qty}</div>
          </div>
          <div>${TF.escapeHtml(price)}</div>
        </div>`;
    }).join('');

    const sub = TF.Cart.subtotal();
    const priced = typeof sub === 'number';
    const d = BRAND.delivery || {};
    let fee = (d.standard && typeof d.standard.fee === 'number') ? d.standard.fee : null;
    if (priced && d.freeOver != null && sub >= d.freeOver) fee = 0;
    const total = priced && typeof fee === 'number' ? sub + fee : null;

    const row = (label, value, muted) => `
      <div class="summary__row${muted ? ' summary__row--muted' : ''}">
        <span>${label}</span><span>${value}</span>
      </div>`;

    totalsHost.innerHTML =
      row('Subtotal', priced ? TF.escapeHtml(TF.formatMoney(sub)) : 'Confirmed on request') +
      row('Delivery', typeof fee === 'number'
            ? (fee === 0 ? '<strong>Free</strong>' : TF.escapeHtml(TF.formatMoney(fee)))
            : 'Calculated at confirmation', true) +
      `<div class="summary__row summary__row--total">
         <span>Total</span>
         <span>${typeof total === 'number' ? TF.escapeHtml(TF.formatMoney(total)) : 'To be confirmed'}</span>
       </div>`;
  }

  function renderDeliveryOptions() {
    const d = BRAND.delivery || {};
    const opts = [];
    if (d.standard) opts.push({ id: 'standard', ...d.standard });
    if (d.express)  opts.push({ id: 'express',  ...d.express });
    if (!opts.length) {
      opts.push({ id: 'standard', label: 'Standard delivery', fee: null });
    }
    delivHost.innerHTML = opts.map((o, i) => `
      <label class="pay-option" for="del-${o.id}">
        <input type="radio" id="del-${o.id}" name="delivery" value="${o.id}" ${i === 0 ? 'checked' : ''}>
        <span class="choice__box" aria-hidden="true"></span>
        <span class="pay-option__body">
          <span class="pay-option__name">${TF.escapeHtml(o.label)}</span>
          <span class="pay-option__desc">${typeof o.fee === 'number'
            ? TF.escapeHtml(TF.formatMoney(o.fee))
            : 'Charge confirmed with you before dispatch'}</span>
        </span>
      </label>`).join('');
  }

  function renderPaymentOptions() {
    payHost.innerHTML = PAYMENT_METHODS.map((m, i) => `
      <label class="pay-option" for="pay-${m.id}">
        <input type="radio" id="pay-${m.id}" name="payment" value="${m.id}" ${i === 0 ? 'checked' : ''}>
        <span class="choice__box" aria-hidden="true"></span>
        <span class="pay-option__body">
          <span class="pay-option__name">${TF.escapeHtml(m.name)}</span>
          <span class="pay-option__desc">${TF.escapeHtml(m.desc)}</span>
        </span>
      </label>`).join('');
  }

  /* ================================================================== confirm */
  function makeRef() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
    return 'TF-' + String(d.getFullYear()).slice(2) + p(d.getMonth() + 1) + p(d.getDate()) + '-' + rnd;
  }

  function orderSummaryText(order) {
    const lines = order.items.map(it =>
      '• ' + it.name +
      (it.size || it.color ? ' (' + [it.size, it.color].filter(Boolean).join(', ') + ')' : '') +
      ' × ' + it.qty +
      (typeof it.unitPrice === 'number' ? ' — ' + TF.formatMoney(it.unitPrice * it.qty) : ' — price on request')
    );
    return [
      'Order ' + order.ref,
      '',
      ...lines,
      '',
      'Name: ' + order.name,
      'Phone: ' + order.phone,
      'Email: ' + order.email,
      'Address: ' + [order.address, order.city, order.postcode].filter(Boolean).join(', '),
      'Payment: ' + order.paymentName,
      order.notes ? 'Notes: ' + order.notes : ''
    ].filter(Boolean).join('\n');
  }

  function showConfirmation(order) {
    wrap.hidden = true;
    confirmEl.hidden = false;

    const copy = document.getElementById('confirm-copy');
    if (copy) {
      copy.innerHTML = 'We have prepared your order request for ' +
        '<strong>' + TF.escapeHtml(order.name) + '</strong>. Nothing has been charged and nothing ' +
        'has been sent to Tanha&rsquo;s Fashion yet — this storefront is still a front-end demo. ' +
        'Use the buttons below to send the order to us directly.';
    }
    const ref = document.getElementById('confirm-ref');
    if (ref) ref.textContent = 'Reference ' + order.ref;

    const actions = document.getElementById('confirm-actions');
    if (actions) {
      const text = orderSummaryText(order);
      const wa = BRAND.whatsapp
        ? `<a class="btn" href="https://wa.me/${BRAND.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(text)}"
              target="_blank" rel="noopener noreferrer">Send order on WhatsApp</a>`
        : '';
      actions.innerHTML = wa + `
        <a class="btn btn--ghost" href="${BRAND.instagramUrl}" target="_blank" rel="noopener noreferrer">Send by Instagram DM</a>
        <button class="btn btn--ghost" type="button" id="copy-order">Copy order summary</button>`;

      const copyBtn = document.getElementById('copy-order');
      if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(text);
            TF.toast('Order summary copied to your clipboard');
          } catch (_) {
            /* clipboard blocked — fall back to a selectable textarea */
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0';
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); TF.toast('Order summary copied'); }
            catch (__) { TF.toast('Copy failed — please select the text manually', { tone: 'info' }); }
            ta.remove();
          }
        });
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ==================================================================== submit */
  function submit(e) {
    e.preventDefault();
    if (!TF.Cart.items.length) {
      TF.toast('Your bag is empty — add a piece before checking out.', { tone: 'info' });
      return;
    }

    const res = TF.validateForm(form);
    const payment = form.querySelector('input[name="payment"]:checked');

    if (payErr) payErr.style.display = payment ? 'none' : 'block';

    if (!res.ok) {
      if (res.firstInvalid) res.firstInvalid.focus();
      TF.setFormStatus(statusEl, 'Please complete the highlighted fields.', 'err');
      return;
    }
    if (!payment) {
      const firstPay = form.querySelector('input[name="payment"]');
      if (firstPay) firstPay.focus();
      TF.setFormStatus(statusEl, 'Please choose a payment method.', 'err');
      return;
    }

    const method = PAYMENT_METHODS.find(m => m.id === payment.value);
    const order = {
      ref: makeRef(),
      items: JSON.parse(JSON.stringify(TF.Cart.items)),
      name: (document.getElementById('co-name') || {}).value || '',
      email: (document.getElementById('co-email') || {}).value || '',
      phone: (document.getElementById('co-phone') || {}).value || '',
      address: (document.getElementById('co-address') || {}).value || '',
      city: (document.getElementById('co-city') || {}).value || '',
      postcode: (document.getElementById('co-postcode') || {}).value || '',
      notes: (document.getElementById('co-notes') || {}).value || '',
      delivery: (form.querySelector('input[name="delivery"]:checked') || {}).value || 'standard',
      payment: payment.value,
      paymentName: method ? method.name : payment.value,
      placedAt: new Date().toISOString()
    };

    /* ---- INTEGRATION POINT -------------------------------------------------
       Send `order` to your backend here, e.g.
         fetch('/api/orders', { method:'POST', headers:{'Content-Type':'application/json'},
                                body: JSON.stringify(order) })
       …then redirect to your payment provider's hosted checkout and let a
       server-side webhook mark the order paid. Never trust the browser for
       price or payment state.
    ------------------------------------------------------------------------ */

    TF.store.set('tanhas.lastOrder', order);
    TF.Cart.clear();
    TF.syncCounts();
    showConfirmation(order);
  }

  /* ====================================================================== boot */
  function boot() {
    renderDeliveryOptions();
    renderPaymentOptions();
    renderOrderSummary();
    TF.wireLiveValidation(form);
    form.addEventListener('submit', submit);

    document.addEventListener('tf:cartchange', renderOrderSummary);

    /* payment radios clear their own error as soon as one is chosen */
    form.addEventListener('change', (e) => {
      if (e.target.name === 'payment' && payErr) payErr.style.display = 'none';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
