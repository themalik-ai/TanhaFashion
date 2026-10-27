/* =============================================================================
   TANHA'S FASHION — shop.js
   Product listing: filters, sorting, search, chips, mobile filter drawer.
   Every control is built from the real catalogue so nothing is offered that
   does not exist (e.g. the price filter hides itself while PRICE MODE is
   'enquiry', because no prices have been published).
   ========================================================================== */
(function () {
  'use strict';

  const grid = document.getElementById('shop-grid');

  /* The home page re-uses this file for its two listings. */
  const homeNewGrid = document.getElementById('new-arrivals-grid');
  const homeIgGrid  = document.getElementById('ig-grid');
  const isHome = !!homeNewGrid || !!homeIgGrid;

  if (!grid && !isHome) return;

  const filtersForm  = document.getElementById('filters');
  const drawerBody   = document.getElementById('filter-drawer-body');
  const chipsHost    = document.getElementById('active-chips');
  const countEl      = document.getElementById('result-count');
  const sortSelect   = document.getElementById('sort-select');
  const searchInput  = document.getElementById('shop-search');
  const priceGroup   = document.getElementById('f-price-group');
  const titleEl      = document.getElementById('shop-title');
  const blurbEl      = document.getElementById('shop-blurb');
  const crumbEl      = document.getElementById('crumb-current');

  const state = {
    categories: new Set(),
    sizes: new Set(),
    colors: new Set(),
    min: null,
    max: null,
    q: '',
    sort: 'featured'
  };

  /* =========================================================================
     BUILD THE FILTER CONTROLS
  ========================================================================== */
  function checkbox(id, name, value, label, count, suffix) {
    return `
      <label class="choice" for="${id}">
        <input type="checkbox" id="${id}" name="${name}" value="${TF.escapeAttr(value)}"
               data-filter="${name}" data-value="${TF.escapeAttr(value)}">
        <span class="choice__box" aria-hidden="true"></span>
        <span>${TF.escapeHtml(label)}</span>
        ${count == null ? '' : `<span class="choice__count">${count}</span>`}
      </label>`;
  }

  function panelMarkup(group, suffix) {
    switch (group) {
      case 'category':
        return CATEGORIES.map(c =>
          checkbox('fc-' + c.slug + suffix, 'category', c.slug, c.name,
                   productsIn(c.slug).length, suffix)
        ).join('');

      case 'size':
        return allSizes().map(s =>
          checkbox('fs-' + s + suffix, 'size', s, s,
                   PRODUCTS.filter(p => p.sizes.includes(s)).length, suffix)
        ).join('');

      case 'color':
        return allColors().map(c =>
          checkbox('fcol-' + c.name.replace(/\W+/g, '') + suffix, 'color', c.name, c.name,
                   PRODUCTS.filter(p => p.colors.some(x => x.name === c.name)).length, suffix)
        ).join('');

      case 'price': {
        const range = priceRange();
        if (!range) {
          return `<p class="filters__note">Prices are confirmed on request, so there is nothing to
                  filter by yet. Add prices in <code>js/products.js</code> and this filter appears
                  automatically.</p>`;
        }
        return `
          <div class="range-row">
            <div>
              <label class="sr-only" for="fmin${suffix}">Minimum price</label>
              <input type="number" id="fmin${suffix}" min="0" step="100"
                     placeholder="Min ${TF.escapeAttr(TF.formatMoney(range.min))}"
                     data-filter="min" inputmode="numeric">
            </div>
            <div>
              <label class="sr-only" for="fmax${suffix}">Maximum price</label>
              <input type="number" id="fmax${suffix}" min="0" step="100"
                     placeholder="Max ${TF.escapeAttr(TF.formatMoney(range.max))}"
                     data-filter="max" inputmode="numeric">
            </div>
          </div>`;
      }
      default:
        return '';
    }
  }

  function fillFilters(root, suffix) {
    if (!root) return;
    root.querySelectorAll('[data-group]').forEach(panel => {
      panel.innerHTML = panelMarkup(panel.getAttribute('data-group'), suffix);
    });
  }

  /** Duplicate the sidebar filter form into the mobile drawer. */
  function buildDrawerClone() {
    if (!filtersForm || !drawerBody) return;
    const clone = filtersForm.cloneNode(true);
    clone.removeAttribute('id');
    clone.setAttribute('data-filter-clone', '1');
    /* de-duplicate every id / aria-controls so labels stay correct */
    clone.querySelectorAll('[id]').forEach(el => el.id = el.id + '-d');
    clone.querySelectorAll('[for]').forEach(el => {
      const f = el.getAttribute('for');
      if (f) el.setAttribute('for', f + '-d');
    });
    clone.querySelectorAll('[aria-controls]').forEach(el => {
      const a = el.getAttribute('aria-controls');
      if (a) el.setAttribute('aria-controls', a + '-d');
    });
    /* the clone must not contain a second "Clear all" outside the drawer foot */
    const clearBtn = clone.querySelector('[data-clear-filters]');
    if (clearBtn) clearBtn.closest('div').remove();
    drawerBody.innerHTML = '';
    drawerBody.appendChild(clone);
    fillFilters(clone, '-d');
  }

  /* =========================================================================
     APPLY
  ========================================================================== */
  function matchesSearch(p, q) {
    if (!q) return true;
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const hay = [
      p.name, p.subtitle, p.description, p.pieceType, p.fabric, p.includes,
      (p.details || []).join(' '), p.categories.join(' '),
      (p.colors || []).map(c => c.name).join(' ')
    ].join(' ').toLowerCase();
    return words.every(w => hay.includes(w));
  }

  function filterProducts() {
    return PRODUCTS.filter(p => {
      if (state.categories.size &&
          !p.categories.some(c => state.categories.has(c))) return false;
      if (state.sizes.size &&
          !p.sizes.some(s => state.sizes.has(s))) return false;
      if (state.colors.size &&
          !p.colors.some(c => state.colors.has(c.name))) return false;

      if (TF.isPriced(p)) {
        if (state.min != null && p.price < state.min) return false;
        if (state.max != null && p.price > state.max) return false;
      } else if (state.min != null || state.max != null) {
        /* a price range was asked for but this piece has no published price */
        return false;
      }

      return matchesSearch(p, state.q);
    });
  }

  function sortProducts(list) {
    const out = [...list];
    switch (state.sort) {
      case 'newest':
        out.sort((a, b) => (a.postedOn < b.postedOn ? 1 : a.postedOn > b.postedOn ? -1 : 0));
        break;
      case 'price-asc':
        out.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
        break;
      case 'price-desc':
        out.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
        break;
      case 'name-asc':
        out.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default: /* featured */
        out.sort((a, b) =>
          (Number(b.featured) - Number(a.featured)) ||
          (Number(b.newArrival) - Number(a.newArrival)) ||
          (b.instagramLikes - a.instagramLikes));
    }
    return out;
  }

  /* Each control carries a singular `data-filter` name; state holds plural Sets.
     Map between them in one place. */
  const STATE_KEYS = { category: 'categories', size: 'sizes', color: 'colors' };
  function stateKey(kind) { return STATE_KEYS[kind] || kind; }

  function renderChips() {
    if (!chipsHost) return;
    const chips = [];
    state.categories.forEach(c => {
      const cat = CATEGORIES.find(x => x.slug === c);
      chips.push(chip('category', c, cat ? cat.name : c));
    });
    state.sizes.forEach(s => chips.push(chip('size', s, 'Size ' + s)));
    state.colors.forEach(c => chips.push(chip('color', c, c)));
    if (state.min != null) chips.push(chip('min', state.min, 'From ' + TF.formatMoney(state.min)));
    if (state.max != null) chips.push(chip('max', state.max, 'Up to ' + TF.formatMoney(state.max)));

    if (!chips.length) { chipsHost.innerHTML = ''; return; }

    chipsHost.innerHTML = chips.join('') +
      '<button class="chips__clear" type="button" data-clear-filters>Clear all</button>';
  }

  function chip(kind, value, label) {
    return `<button class="chip" type="button" data-remove-filter="${TF.escapeAttr(kind)}"
             data-value="${TF.escapeAttr(value)}">
             ${TF.escapeHtml(label)} <span class="chip__x" aria-hidden="true">&times;</span>
             <span class="sr-only">Remove filter</span>
           </button>`;
  }

  function syncControls() {
    /* reflect state onto both copies of the controls */
    document.querySelectorAll('[data-filter][type="checkbox"]').forEach(cb => {
      const set = state[stateKey(cb.getAttribute('data-filter'))];
      if (set) cb.checked = set.has(cb.value);
    });
    document.querySelectorAll('[data-filter="min"]').forEach(i => {
      i.value = state.min == null ? '' : state.min;
    });
    document.querySelectorAll('[data-filter="max"]').forEach(i => {
      i.value = state.max == null ? '' : state.max;
    });

    const n = state.categories.size + state.sizes.size + state.colors.size +
              (state.min != null ? 1 : 0) + (state.max != null ? 1 : 0);
    document.querySelectorAll('[data-active-count]').forEach(el => {
      el.textContent = String(n);
      el.hidden = n === 0;
    });
    if (sortSelect) sortSelect.value = state.sort;
  }

  function render() {
    const list = sortProducts(filterProducts());
    TF.renderCards(grid, list, {
      eagerFirst: true,
      emptyText: 'No pieces match these filters. Try removing one, or browse everything.'
    });
    if (countEl) {
      countEl.textContent = list.length === PRODUCTS.length
        ? 'Showing all ' + PRODUCTS.length + ' pieces'
        : 'Showing ' + list.length + ' of ' + PRODUCTS.length + ' pieces';
    }
    renderChips();
    syncControls();
    updateURL();
  }

  let urlTimer = null;
  function updateURL() {
    clearTimeout(urlTimer);
    urlTimer = setTimeout(() => {
      const params = new URLSearchParams();
      if (state.categories.size) params.set('c', [...state.categories].join(','));
      if (state.sizes.size) params.set('size', [...state.sizes].join(','));
      if (state.colors.size) params.set('color', [...state.colors].join(','));
      if (state.q) params.set('q', state.q);
      if (state.sort !== 'featured') params.set('sort', state.sort);
      const qs = params.toString();
      history.replaceState(null, '', qs ? '?' + qs : location.pathname);
    }, 220);
  }

  /* =========================================================================
     READ STATE FROM THE URL
  ========================================================================== */
  function readURL() {
    const p = new URLSearchParams(location.search);

    const cats = (p.get('c') || '').split(',').filter(Boolean)
      .filter(c => CATEGORIES.some(x => x.slug === c));
    cats.forEach(c => state.categories.add(c));

    (p.get('size') || '').split(',').filter(Boolean)
      .filter(s => allSizes().includes(s))
      .forEach(s => state.sizes.add(s));

    (p.get('color') || '').split(',').filter(Boolean)
      .forEach(c => state.colors.add(c));

    const min = p.get('min'), max = p.get('max');
    if (min && isFinite(+min)) state.min = +min;
    if (max && isFinite(+max)) state.max = +max;

    state.q = p.get('q') || '';
    if (searchInput) searchInput.value = state.q;

    const sort = p.get('sort');
    if (sort && sortSelect && Array.from(sortSelect.options).some(o => o.value === sort)) {
      state.sort = sort;
    }

    /* heading reflects the first selected collection */
    if (state.categories.size) {
      const cat = CATEGORIES.find(x => x.slug === [...state.categories][0]);
      if (cat) {
        if (titleEl) titleEl.textContent = cat.name;
        if (blurbEl) blurbEl.textContent = cat.blurb;
        if (crumbEl) crumbEl.textContent = cat.name;
        document.title = cat.name + ' — Tanha\'s Fashion';
      }
    } else if (state.q) {
      if (titleEl) titleEl.textContent = 'Search results';
      if (blurbEl) blurbEl.textContent = 'Results for “' + state.q + '”.';
      if (crumbEl) crumbEl.textContent = 'Search';
      document.title = 'Search results — Tanha\'s Fashion';
    }
  }

  /* =========================================================================
     SORT OPTIONS — disable price sorting while nothing is priced
  ========================================================================== */
  function syncSortOptions() {
    if (!sortSelect) return;
    const priced = pricedProducts().length > 0;
    Array.from(sortSelect.options).forEach(o => {
      if (o.value === 'price-asc' || o.value === 'price-desc') {
        o.disabled = !priced;
        o.textContent = o.value === 'price-asc'
          ? 'Price: low to high' + (priced ? '' : ' (no prices yet)')
          : 'Price: high to low' + (priced ? '' : ' (no prices yet)');
      }
    });
    if (!priced && (state.sort === 'price-asc' || state.sort === 'price-desc')) {
      state.sort = 'featured';
    }
  }

  function syncPriceGroup() {
    if (!priceGroup) return;
    priceGroup.hidden = pricedProducts().length === 0;
  }

  /* =========================================================================
     EVENTS
  ========================================================================== */
  document.addEventListener('change', (e) => {
    const cb = e.target.closest('[data-filter][type="checkbox"]');
    if (cb) {
      const set = state[stateKey(cb.getAttribute('data-filter'))];
      if (!set) return;
      if (cb.checked) set.add(cb.value); else set.delete(cb.value);
      render();
      return;
    }
    const num = e.target.closest('[data-filter="min"], [data-filter="max"]');
    if (num) {
      const kind = num.getAttribute('data-filter');
      const v = num.value.trim() === '' ? null : Number(num.value);
      state[kind] = (v != null && isFinite(v) && v >= 0) ? v : null;
      render();
      return;
    }
    if (e.target === sortSelect) {
      state.sort = sortSelect.value;
      render();
    }
  });

  /* price inputs: update as you type, but gently */
  document.addEventListener('input', (e) => {
    const num = e.target.closest('[data-filter="min"], [data-filter="max"]');
    if (!num) return;
    const kind = num.getAttribute('data-filter');
    const v = num.value.trim() === '' ? null : Number(num.value);
    state[kind] = (v != null && isFinite(v) && v >= 0) ? v : null;
    clearTimeout(num._t);
    num._t = setTimeout(render, 350);
  });

  document.addEventListener('click', (e) => {
    const rm = e.target.closest('[data-remove-filter]');
    if (rm) {
      const kind = rm.getAttribute('data-remove-filter');
      const value = rm.getAttribute('data-value');
      if (kind === 'min' || kind === 'max') state[kind] = null;
      else {
        const set = state[stateKey(kind)];
        if (set) set.delete(value);
      }
      render();
      return;
    }
    if (e.target.closest('[data-clear-filters]')) {
      state.categories.clear(); state.sizes.clear(); state.colors.clear();
      state.min = null; state.max = null; state.q = '';
      if (searchInput) searchInput.value = '';
      render();
      TF.toast('Filters cleared');
      return;
    }
    if (e.target.closest('[data-filter-open]')) {
      const d = document.getElementById('filter-drawer');
      if (d) TF.openDrawer(d);
      return;
    }
    /* collapsible filter groups */
    const legend = e.target.closest('.filters__legend');
    if (legend) {
      const target = document.getElementById(legend.getAttribute('aria-controls'));
      const open = legend.getAttribute('aria-expanded') === 'true';
      legend.setAttribute('aria-expanded', String(!open));
      if (target) target.hidden = open;
    }
  });

  /* apply the shop toolbar search field */
  window.TF.applyShopFilters = function () {
    state.q = searchInput ? searchInput.value.trim() : '';
    render();
  };

  /* =========================================================================
     HOME PAGE LISTINGS
     New Arrivals and the Instagram gallery are built from the same catalogue.
  ========================================================================== */
  const HEART_SVG =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.7 4.2 13a4.8 4.8 0 0 1 0-6.8 ' +
    '4.8 4.8 0 0 1 6.8 0l1 1 1-1a4.8 4.8 0 0 1 6.8 0 4.8 4.8 0 0 1 0 6.8Z"/></svg>';

  function renderHomeNewArrivals() {
    if (!homeNewGrid) return;
    const list = newArrivals();
    TF.renderCards(homeNewGrid, list, { eagerFirst: true });
  }

  function renderInstagramGrid() {
    if (!homeIgGrid) return;
    const posts = [...PRODUCTS].sort((a, b) => (a.postedOn < b.postedOn ? 1 : -1));
    const cells = posts.map((p, i) => `
      <a class="ig-item reveal" href="${TF.escapeAttr(p.instagramUrl)}" target="_blank"
         rel="noopener noreferrer"
         aria-label="${TF.escapeAttr(p.name)} — open the original Instagram post">
        <img src="${TF.escapeAttr(p.images[0])}" alt="${TF.escapeAttr(p.alt || p.name)}"
             width="1000" height="1333" loading="${i < 3 ? 'eager' : 'lazy'}" decoding="async">
        <span class="ig-item__overlay">
          <span class="ig-item__likes">${HEART_SVG}${p.instagramLikes}</span>
        </span>
      </a>`);

    cells.push(`
      <a class="ig-item ig-item--follow reveal" href="${TF.escapeAttr(BRAND.instagramUrl)}"
         target="_blank" rel="noopener noreferrer">
        <span class="ig-item__follow-inner">
          <span class="eyebrow" style="color:var(--camel)">Follow us</span>
          <span class="ig-item__handle">${TF.escapeHtml(BRAND.handle)}</span>
          <span class="link__arrow" aria-hidden="true">&rarr;</span>
        </span>
      </a>`);

    homeIgGrid.innerHTML = cells.join('');
    TF.observeReveal();
  }

  /* =========================================================================
     BOOT
  ========================================================================== */
  function boot() {
    if (isHome) {
      renderHomeNewArrivals();
      renderInstagramGrid();
    }
    if (!grid) return;
    syncPriceGroup();
    fillFilters(filtersForm, '');
    buildDrawerClone();
    syncSortOptions();
    readURL();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
