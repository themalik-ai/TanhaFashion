/* =============================================================================
   TANHA'S FASHION — forms.js
   Shared, dependency-free form validation plus the submit handling for the
   newsletter and contact forms. Checkout re-uses TF.validateForm().

   Every success message here says plainly that nothing has been sent, because
   no email service is connected. See README.md → "Connecting real services".
   ========================================================================== */
(function () {
  'use strict';

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

  function digits(s) { return String(s || '').replace(/\D/g, ''); }

  /** Validate one control. Returns true when it passes. */
  function validateControl(el) {
    const type = (el.type || '').toLowerCase();
    const value = String(el.value || '').trim();
    const required = el.hasAttribute('required');

    if (type === 'checkbox') {
      return required ? el.checked : true;
    }
    if (!value) return !required;

    if (type === 'email' || el.getAttribute('inputmode') === 'email') {
      return EMAIL_RE.test(value);
    }
    if (type === 'tel' || el.getAttribute('inputmode') === 'tel') {
      return digits(value).length >= 7;
    }
    return true;
  }

  /** Clear the error state of one control. */
  function clearControl(el) {
    el.removeAttribute('aria-invalid');
    const field = el.closest('.field') || el.closest('.checkout-block') || el.parentElement;
    if (field) field.classList.remove('has-error');
  }

  /** Mark one control invalid. */
  function failControl(el) {
    el.setAttribute('aria-invalid', 'true');
    const field = el.closest('.field') || el.closest('.checkout-block') || el.parentElement;
    if (field) field.classList.add('has-error');
  }

  /**
   * Validate every required control inside a form.
   * @returns {{ok:boolean, firstInvalid:HTMLElement|null, invalid:HTMLElement[]}}
   */
  function validateForm(form) {
    if (!form) return { ok: false, firstInvalid: null, invalid: [] };
    const controls = Array.from(form.querySelectorAll(
      'input:not([type="hidden"]), select, textarea'
    )).filter(el => !el.disabled && el.offsetParent !== null);
    const invalid = [];

    controls.forEach(el => {
      clearControl(el);
      if (!validateControl(el)) {
        failControl(el);
        invalid.push(el);
      }
    });

    return {
      ok: invalid.length === 0,
      firstInvalid: invalid[0] || null,
      invalid: invalid
    };
  }

  /* ---------- wire live clearing: once a field is fixed, drop the error ----- */
  function wireLiveValidation(form) {
    if (!form || form.dataset.liveWired === '1') return;
    form.dataset.liveWired = '1';
    form.addEventListener('input', (e) => {
      const el = e.target;
      if (!(el.matches('input, select, textarea'))) return;
      if (el.getAttribute('aria-invalid') === 'true' && validateControl(el)) clearControl(el);
    });
    form.addEventListener('change', (e) => {
      const el = e.target;
      if (el.type === 'checkbox' && el.getAttribute('aria-invalid') === 'true' && el.checked) {
        clearControl(el);
      }
    });
    form.addEventListener('blur', (e) => {
      const el = e.target;
      if (!el.matches('input, select, textarea')) return;
      if (el.hasAttribute('required') || String(el.value || '').trim()) {
        if (validateControl(el)) clearControl(el); else failControl(el);
      }
    }, true);
  }

  function setStatus(el, message, tone) {
    if (!el) return;
    el.hidden = false;
    el.className = 'form-status ' + (tone === 'ok' ? 'form-status--ok' : 'form-status--err');
    el.innerHTML = message;
  }

  /* =========================================================================
     NEWSLETTER
  ========================================================================== */
  function initNewsletter() {
    const form = document.getElementById('newsletter-form');
    if (!form) return;
    wireLiveValidation(form);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const res = validateForm(form);
      const status = document.getElementById('newsletter-status');
      if (!res.ok) {
        if (res.firstInvalid) res.firstInvalid.focus();
        setStatus(status, 'Please enter a valid email address.', 'err');
        return;
      }
      const email = form.querySelector('input[type="email"]').value.trim();
      form.reset();
      setStatus(status,
        'Thank you &mdash; <strong>' + TF.escapeHtml(email) + '</strong> has been noted in this ' +
        'browser.<br>This demo form is not connected to an email service, so you have ' +
        '<strong>not</strong> been added to a mailing list. Connect Mailchimp, Klaviyo, ' +
        'ConvertKit or any form endpoint to make it live.', 'ok');
    });
  }

  /* =========================================================================
     CONTACT
  ========================================================================== */
  function initContact() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    wireLiveValidation(form);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const res = validateForm(form);
      const status = document.getElementById('contact-status');
      if (!res.ok) {
        if (res.firstInvalid) res.firstInvalid.focus();
        setStatus(status, 'Please complete the highlighted fields.', 'err');
        return;
      }
      const name = (form.querySelector('#ct-name') || {}).value || '';
      form.reset();
      setStatus(status,
        'Thank you, ' + TF.escapeHtml(String(name).trim()) + '. Your message has been checked and ' +
        'prepared in this browser &mdash; but it has <strong>not been sent</strong>.<br>' +
        'This demo form has no email service connected. Until you connect one, the fastest way to ' +
        'reach us is Instagram: ' +
        '<a href="' + BRAND.instagramUrl + '" target="_blank" rel="noopener noreferrer">' +
        BRAND.handle + '</a>.', 'ok');
    });
  }

  /* ---------- export ---------- */
  window.TF = window.TF || {};
  window.TF.validateForm = validateForm;
  window.TF.validateControl = validateControl;
  window.TF.wireLiveValidation = wireLiveValidation;
  window.TF.setFormStatus = setStatus;

  function boot() {
    initNewsletter();
    initContact();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
