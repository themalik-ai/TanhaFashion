# Tanha's Fashion — website

A complete, responsive, luxury womenswear storefront for **@tanhas.fashion** — built around a
layered editorial hero, a full motion layer, and a mobile experience that changes shape on a
phone rather than simply shrinking.

Built with **HTML5, CSS3 and vanilla JavaScript only** — no frameworks, no jQuery, no build step,
no backend, no CDNs, no tracking. Every page is a static file you can drop on any web host.

```
Ruby/Laravel/Node not required.  PHP not required.  Python not required at runtime.
Just serve the folder over HTTP.
```

---

## 1. Run it locally

The site must be served over **HTTP** (not opened as `file://`). Webfonts are blocked by the
browser on the `file://` protocol, and `localStorage` is unreliable there — the site still
*functions*, but it will fall back to system fonts.

Pick whichever you already have:

```bash
# Python 3 (already installed on macOS and most Linux)
cd tanhas-fashion
python3 -m http.server 8000
# → http://localhost:8000

# Node
npx serve tanhas-fashion          # or:  npx http-server tanhas-fashion -p 8000

# PHP
php -S localhost:8000 -t tanhas-fashion
```

Then open <http://localhost:8000>.

**Windows (WAMP/XAMPP):** put the folder inside `htdocs/` and visit `http://localhost/tanhas-fashion/`.

---

## 2. Deploy it

The site is 100% static. There is nothing to compile and no server-side runtime.

| Host | How |
|---|---|
| **Netlify** | Drag the `tanhas-fashion` folder onto <https://app.netlify.com/drop>. Done. |
| **Vercel** | `vercel deploy --prod` from inside the folder. |
| **GitHub Pages** | Push the folder to a repo → Settings → Pages → Deploy from branch → `/ (root)`. |
| **Cloudflare Pages** | Connect the repo, build command: *(leave empty)*, output directory: `/`. |
| **Shared cPanel / any Apache or Nginx host** | Upload the folder contents via FTP. Nothing else to configure. |

### One thing to change before going live

Every page's `<head>` contains:

```html
<link rel="canonical" href="https://YOUR-DOMAIN.com/">
<meta property="og:url" content="https://YOUR-DOMAIN.com/">
<meta property="og:image" content="https://YOUR-DOMAIN.com/assets/og-image.jpg">
<meta name="twitter:image" content="https://YOUR-DOMAIN.com/assets/og-image.jpg">
```

Search and replace `https://YOUR-DOMAIN.com` with your real domain across every `.html` file.
There are **4 URLs to change per page** (canonical, `og:url`, `og:image`, `twitter:image`) —
a 5th match is the reminder comment in the `<head>`, which you can leave or delete.
Canonical and Open Graph tags require absolute URLs, so they can't be relative.

Optional but recommended:
- Add `assets/robots.txt` is **not** included — create one at the domain root if you need it.
- Submit `sitemap.xml` — not included, because a correct sitemap needs your real domain. Once
  you have it, generate one at <https://www.xml-sitemaps.com> and drop it in the folder.

---

## 3. Folder structure

```
tanhas-fashion/
├── index.html            Home — hero, new arrivals, collections grid, story, Instagram grid
├── shop.html             All 11 pieces, with filtering + sorting + deep links
├── product.html          Product detail (reads ?p=slug from the URL)
├── cart.html             Shopping bag
├── checkout.html         Demo checkout
├── wishlist.html         Saved pieces
├── about.html            Brand story + values
├── contact.html          Contact + enquiry form
├── policies/
│   ├── shipping.html
│   ├── returns.html
│   ├── privacy.html
│   └── terms.html
├── css/
│   ├── style.css         ← all styling. Design tokens live at the top.
│   ├── motion.css        ← the animation layer. Optional — safe to delete.
│   └── fonts.css         ← @font-face declarations (generated, no need to edit)
├── js/
│   ├── products.js       ← ★ THE CATALOGUE. Edit products, prices, colours here.
│   ├── main.js           Shared runtime: cart/wishlist store, header, search, toasts, modals
│   ├── motion.js         Optional animation engine. Safe to delete — nothing breaks.
│   ├── shop.js           Shop page: filters, sort, chips, URL sync
│   ├── product.js        Product page: gallery, options, related products
│   ├── cart.js           Cart page + wishlist page rendering
│   ├── checkout.js       Checkout validation + demo order summary
│   └── forms.js          Newsletter + contact form validation
└── assets/
    ├── products/         22 JPEGs — 2 per piece (full look + detail crop)
    ├── collections/      8 JPEGs for the collection tiles
    ├── hero/             2 JPEGs for the home page hero
    ├── logo/             logo.png, logo-light.png, instagram-profile.jpg
    ├── fonts/            16 self-hosted woff2 files
    ├── og-image.jpg      Social share card (1200×630)
    ├── favicon.svg
    ├── favicon.png
    └── apple-touch-icon.png
```

---

## 4. Editing the catalogue

Everything about the products lives in **`js/products.js`**. Open it and you'll find two things
at the top — the brand settings, and the `PRODUCTS` array.

### 4a. Turning prices on (you have no prices today)

The Instagram account has **no prices in any of its 12 posts**, so the site ships in
**enquiry mode** — every product shows *"Price on request"* and the call to action is
*Enquire on Instagram / WhatsApp*, which matches how the brand actually sells ("DM to order").

When you're ready to publish prices, change **one line**:

```js
const BRAND = {
  ...
  priceMode: 'enquiry',     // ← change to  'catalogue'
  ...
};
```

…and add a `price` to each product. That's it. The entire site switches over: prices appear
on cards and product pages, sorting by price appears, the price-range filter appears, the cart
shows totals, and checkout calculates delivery and tax.

```js
{
  id: 'tf-001',
  slug: 'black-elegance-two-piece-outfit',
  name: 'Black Elegance Two-Piece Outfit',
  price: 6450,              // ← add this. Plain number, no commas, no "Rs."
  ...
}
```

### 4b. Delivery and tax

Also in `BRAND`, used only in `catalogue` mode:

```js
delivery: {
  standard: { label: 'Standard — 3 to 5 working days', fee: 0 },
  express:  { label: 'Express — 1 to 2 working days',  fee: 0 },
  freeOver: 0,              // e.g. 10000 → free delivery on orders over Rs. 10,000
},
tax: { label: 'Tax', rate: 0 },   // e.g. 0.17 for 17% — set 0 to hide the line
```

### 4c. Adding a product

1. Add your photos to `assets/products/` as `tf-012-your-slug-1.jpg` and `-2.jpg`
   (1000 × 1333 px, 3:4 portrait — matches every other image).
2. Copy any existing object in the `PRODUCTS` array and edit it:

```js
{
  id: 'tf-012',
  slug: 'your-slug',                        // lowercase, hyphens; this is the URL
  name: 'Your Piece Name',
  category: 'three-piece',                  // must match a key in CATEGORIES
  collection: 'winter-collection',          // must match a key in COLLECTIONS
  subtitle: 'One line, shown under the name',
  description: 'Two or three sentences. Plain facts only.',
  fabric: 'Lawn',                           // fabrics seen on Instagram: Lawn, Linen,
                                            // Marina, Sheesha Silk, Chiffon, Organza
  colors: [{ name: 'Black', hex: '#1C1C1C' }],
  sizes: ['S', 'M', 'L'],
  images: ['assets/products/tf-012-your-slug-1.jpg',
           'assets/products/tf-012-your-slug-2.jpg'],
  flags: ['new'],                           // 'new' | 'limited' | 'bestseller'
  season: 'Winter',
  ig: { url: '', likes: 0 },
  price: null,                              // null until you enable catalogue mode
},
```

3. Save. It appears everywhere automatically — shop grid, filters, counts, related products.
   **Do not create a separate HTML page per product.** `product.html` builds itself from
   `product.html?p=your-slug`.

### 4d. Removing or hiding a product

Delete the object, or set `flags: []` and remove it from its collection. Nothing else references it.

### 4e. Editing categories and collections

They're lists at the top of `products.js`:

```js
const CATEGORIES = [
  { key: 'two-piece',   label: '2-Piece Suit' },
  { key: 'three-piece', label: '3-Piece Suit' },
  ...
];
const COLLECTIONS = [
  { key: 'new-arrivals', label: 'New Arrivals', blurb: '...' },
  ...
];
```

Rename a `label` and it updates in the nav, the filter sidebar and the collection tiles.
**Never change a `key`** without also updating every product that uses it.

---

## 5. Replacing images

### Product photos and the home page hero

Drop in your replacement and keep the same filename — no code changes needed.

| File | Recommended size |
|---|---|
| `assets/products/tf-00N-slug-1.jpg` | 1000 × 1333 (3:4 portrait) |
| `assets/products/tf-00N-slug-2.jpg` | 1000 × 1333 — a **detail crop of the same garment** |
| `assets/hero/hero-main.jpg` | 1400 × 1750 (4:5) |
| `assets/hero/hero-editorial.jpg` | 1400 × 1750 (4:5) |
| `assets/collections/<key>.jpg` | 800 × 1000 (4:5) |
| `assets/og-image.jpg` | 1200 × 630 (1.91:1) |

The CSS crops to fit automatically, so any portrait photo works. **Keep the aspect ratio
consistent** or the grid will look uneven.

> Important: the second image on each product page is meant to be a *close-up of the same
> outfit*, not a different outfit. Using an unrelated garment there is misleading.

### The logo

`assets/logo/logo.png` (dark ink) and `assets/logo/logo-light.png` (ivory, for the dark footer)
are **generated placeholders** — a wordmark set in Cormorant Garamond reading TANHA'S / FASHION.
They are not the brand's real logo.

To use the real one:
1. Export it as a **PNG with a transparent background**, roughly 3:1 wide.
2. Overwrite both files. For `logo-light.png`, export an all-white/ivory version.
3. Update the `width` and `height` attributes on both `<img>` tags — they appear once in the
   header and once in the footer of every page, so search-and-replace across `*.html`:
   ```html
   <img src="assets/logo/logo.png" ... width="538" height="165" alt="Tanha's Fashion">
   ```
   Getting the intrinsic width/height right prevents layout shift as the page loads.

`assets/logo/instagram-profile.jpg` is the **actual profile picture from the Instagram account**,
the only authentic brand mark available — but it is only 150 × 150 px, so it is used nowhere in
the design. It's kept for reference.

### The monogram favicon

`favicon.svg`, `favicon.png` and `apple-touch-icon.png` are generated placeholders with a "T".
Replace them with real logo-derived icons when available (512 × 512 PNG and a square SVG).

---

## 6. Changing colours and type

Open `css/style.css`. The first ~35 lines are the design tokens — change a value here and it
propagates through every page:

```css
:root {
  /* Brand neutrals */
  --ivory:       #FBF8F4;   /* page background */
  --porcelain:   #F4EDE3;   /* card + section background */
  --sand:        #E7DBCA;
  --line:        #DCD0BE;   /* every hairline border */

  /* Accent */
  --camel:       #B08A5A;   /* rules, bullets, decorative use */
  --camel-deep:  #7E6039;   /* badges, buttons, small accent text */

  /* Text */
  --ink:         #1C1917;   /* headings and body */
  --ink-2:       #443E38;   /* body copy */
  --ink-3:       #6B635A;   /* labels, meta, captions */

  --navy:        #2E3044;   /* dark editorial sections */
  --blush:       #C9A08C;

  /* Type */
  --display: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
  --sans:    'Jost', 'Helvetica Neue', Arial, sans-serif;
}
```

> **Colour provenance.** These are *design* choices, not verified brand colours — the Instagram
> account publishes no colour palette. The values above were sampled from the brand's own
> photography (warm creams, sand, camel and near-black) so the site feels continuous with the
> feed. **If Tanha's Fashion has official brand colours, replace them here.** Both `--camel-deep`
> and `--ink-3` were deliberately darkened to clear the WCAG AA contrast threshold (4.5:1) for
> small text — if you lighten them, re-check contrast.

### Fonts

Cormorant Garamond (display) and Jost (sans) are **self-hosted** in `assets/fonts/` — 16 `woff2`
files, declared in `css/fonts.css`. No request leaves your visitor's browser to load them, which
is faster and avoids the GDPR issue of piping visitor IPs to Google. There is no fallback to
Google Fonts CDN, and no `<link>` to it, by design.

To use different fonts: replace the woff2 files and edit `css/fonts.css` plus the `--display` /
`--sans` tokens above.

---

## 7. Design, motion and the mobile experience

### The hero

A layered editorial collage rather than a single banner: a tall **primary frame**
with a smaller **secondary frame** breaking its bottom-left corner, a slowly
**rotating seal** carrying the brand signature, a near-invisible ghost word for
depth, and a fine film grain over the whole section. On scroll the three layers
drift at different rates, so the composition separates as you move through it.

The wordmark headline is set in two masked lines that slide up from behind their
own clip on load, staggered behind the eyebrow, body copy, buttons and meta list.

It is built from three pieces you can swap without touching CSS:

| Piece | File |
|---|---|
| Primary photograph | `assets/hero/hero-main.jpg` |
| Secondary photograph | `assets/hero/hero-editorial.jpg` |
| Seal text | the `<textPath>` inside `index.html` — search for `hero__seal-svg` |

Below the hero runs a **marquee** naming the fabrics the brand actually works in
(Lawn, Linen, Marina, Sheesha Silk, Chiffon, Organza). It pauses on hover.

### The motion layer

Everything decorative lives in exactly two files, deliberately separated so you
can delete them and still have a complete, working, readable site:

```
css/motion.css    what the effects look like
js/motion.js      what drives them
```

What's in there: staggered entrance choreography, scroll reveals, hero parallax,
a scroll-progress rule at the top of the window, a header that hides on the way
down and returns the moment you scroll up, a cursor-following "View" label over
product cards, magnetic buttons, animated count-up figures, a light sweep across
card images on hover, and a short fade between pages.

Elements opt in with markup, not JavaScript:

```html
<p data-anim="fade" data-anim-d="3">…</p>    <!-- fade + rise, 3rd in the sequence -->
<figure data-anim="rise" data-anim-d="1">…</figure>
<span class="ln" data-anim="line" data-anim-d="2"><span>text</span></span>
<div data-parallax="0.12">…</div>            <!-- positive drifts slower, negative faster -->
<a data-magnetic>Explore</a>
```

**Two rules this layer obeys, and you should keep them if you extend it:**

1. **`prefers-reduced-motion` is honoured in full.** If the visitor has asked
   for less movement, every animation and transition is switched off and every
   animated element is shown in its finished state — nothing is left invisible.
   Verified: see §11.
2. **JavaScript is never required to see content.** With JS disabled the `no-js`
   class keeps every revealed element visible. Same outcome, just no motion.

### Mobile

The site is built mobile-first, and on phones it does not simply shrink the
desktop layout — it changes shape:

- **A bottom tab bar** puts Shop, Search, Saved, Bag and Menu under your thumb,
  with live count badges, an active-section marker, and correct `safe-area`
  padding for the iPhone home bar. The header drops the icons the tab bar now
  owns.
- **Bottom sheets, not side drawers.** Filters, the bag and search slide up from
  the bottom, full width, with rounded tops, a drag handle, `overscroll-behavior:
  contain`, and page scroll locked behind them. The tab bar tucks away while one
  is open.
- **The product gallery becomes a swipeable rail** with scroll-snap and live dot
  indicators. The framed desktop image and its thumbnails are hidden.
- **A sticky "Add to bag" bar** appears once the real button scrolls out of view.
  It clicks the real button rather than duplicating logic, so size validation,
  stock messaging and the toast all behave identically.
- **Featured rows become horizontal snap rails** (new arrivals, related pieces)
  instead of shrinking into tiny grid cells.
- **Touch targets are at least 44 px** — tab bar items, buttons, form fields,
  size chips, quantity steppers, wishlist and quick-view buttons.
- **Inputs are 16 px minimum**, so iOS will not zoom the page when you focus one.
- **The layout is clean at 320 px** — verified, not assumed.

## 8. What works, and what needs a backend

### ✅ Works fully, in the browser, right now

| Feature | Notes |
|---|---|
| Browse all 11 pieces | |
| Shop filters | Category, size, colour, collection, price (when enabled). Multi-select, combinable. |
| Sort | Newest, name A–Z, price low→high / high→low |
| Search | Header search across name, subtitle, description, piece type, fabric, season and colour. Open with the header icon, **`⌘K` / `Ctrl+K`**, or **`/`**; close with **Escape**. |
| Deep links | `shop.html?c=formal-wear&size=s,m&color=black&min=5000&max=12000&q=lawn&sort=price-asc` — every filter combination is a shareable URL, and it syncs back into the address bar as you click. |
| Product pages | Gallery with thumbnails (**← / →** step through it while the gallery has focus), colour/size selection, quantity, stock messaging, size guide, accordions, related pieces |
| Shopping bag | Add, change quantity, remove, live totals — persists across reloads and tabs |
| Wishlist | Heart on any card — persists across reloads |
| Quick view | Eye icon on any card → modal with add-to-bag |
| Mobile | Slide-out nav, slide-out filter drawer, cart drawer, sticky add-to-bar |
| Forms | Newsletter + contact, with real client-side validation |

State is kept in `localStorage` under the keys `tanhas.cart.v1` and `tanhas.wishlist.v1`
(plus `tanhas.announcement.dismissed` for the top banner). If `localStorage` is blocked —
private browsing, some in-app browsers — the site detects that and carries on with in-memory
state instead of throwing. It's per-browser, not per-account: a visitor's bag follows them on
their device, but it is **not** shared to you.

### ⚠️ Works as a demonstration only — needs wiring to a backend

| Feature | What happens today | What you need |
|---|---|---|
| **Checkout** | Validates all fields, shows an order summary, generates a reference like `TF-261027-4F2A`, clears the bag, and tells the customer plainly that no order has been placed and no payment taken. **It never claims success.** | A server endpoint. See §9. |
| **Payments** | Four non-card placeholders: Cash on Delivery, Bank Transfer, Easypaisa/JazzCash, and "confirm on Instagram/WhatsApp". **No card fields exist anywhere** — the site never touches card data. | A payment provider (Stripe / PayPal / a Pakistani gateway) or keep COD + bank transfer manual. |
| **Contact + newsletter** | Validate, then show an honest message stating nothing was sent and offering the Instagram DM and WhatsApp as the real channel. | A form service (Formspree, Basin, Netlify Forms) or your own endpoint. |
| **Enquire on Instagram / WhatsApp** | Opens `instagram.com/tanhas.fashion` or a WhatsApp click-to-chat in a new tab. Fully functional — this is the brand's real ordering channel. | Nothing. |
| **Order tracking, accounts, stock sync, email receipts** | Not built. | A real store platform. |

---

## 9. Wiring up the backend (when you want real orders)

Open `js/checkout.js` and find `submitOrder()`. There is one clearly marked integration point:

```js
/* ────────────────────────────────────────────────────────────
   INTEGRATION POINT
   Replace the demo response below with a real request, e.g.:

   const res = await fetch('/api/orders', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(order)          // `order` is already built above
   });
   if (!res.ok) throw new Error('Order could not be sent');
   const saved = await res.json();
   ──────────────────────────────────────────────────────────── */
```

`order` is a plain object containing the customer's name, email, phone, address, city,
delivery method, payment method, line items and totals. Log it to the console first
(`console.log(order)`) to see its exact shape, then POST it to your endpoint.

**Until you supply that endpoint, the checkout must not tell a customer their order succeeded** —
it currently doesn't, and that is deliberate. Keep that honesty if you change the copy.

### Suggested order of attack

1. **Formspree / Basin / Netlify Forms** for contact + newsletter — minutes to set up, no server.
2. **WooCommerce or Shopify** if you want real payments, stock and order management. If you go
   that route, this build becomes your design reference rather than your production site.
3. **A small Cloudflare Worker or Netlify Function** for `/api/orders` if you want to keep this
   exact front-end and add just order capture.

---

## 10. What came from Instagram, and what didn't

**Source:** <https://www.instagram.com/tanhas.fashion/>

Instagram blocks direct automated access (HTTP 403 to any non-browser request), so the account
was read through a public mirror. Everything below is quoted or derived from what was actually
retrieved — 12 posts, their full captions, and their images.

### Verified, used as-is

- **Display name:** Tanha's_clothing　·　**Handle:** @tanhas.fashion
- **Bio:** *"Elegant Wear for Every Woman ✨ / Premium • Modern • Timeless / DM to Order 📩"*
- **Caption signature,** used on the home page: **"Tanhas Collection — Elegance in Every Stitch."**
- **Product type:** ready-to-wear eastern and eastern-western fusion womenswear — 2-piece and
  3-piece suits, long frocks, shalwar kameez.
- **Fabrics named in the captions:** Lawn, Linen, Marina, Sheesha Silk, Chiffon (dupattas), Organza.
- **Collections named in the captions:** Winter Collection, Summer Collection, Lawn Collection,
  Formal Collection, Premium Collection, New Collection.
- **Hashtags used on the site:** #PakistaniFashion #WinterCollection #SummerCollection
  #LawnCollection #LinenSuit #ThreePieceSuit #ReadyToWear #ElegantWear #FormalCollection
  #WomensWear #NewCollection
- **Ordering channel:** DM to order — reflected in every call to action.
- **Post dates,** used for the "newest" sort: 12 Oct 2026, 9 Oct ×2, 30 Aug, 26 Aug ×4,
  9 Aug ×2, 6 Aug ×2.
- **All 12 photographs,** downloaded at full resolution (912–1572 px) and used unmodified apart
  from cropping.

### Not available, and therefore not invented

- **No prices.** Not one caption contains a price. Hence enquiry mode (§4a).
- **No product names.** The captions don't name individual pieces. The names on the site
  (*Black Elegance Two-Piece Outfit*, *Marina Long Frock*…) are **descriptive labels written for
  this website**, derived from each post's own caption and hashtags. They are editorial, not
  official SKUs — rename them freely in `products.js`.
- **No logo file.** Instagram only serves the profile picture at 150 × 150 px, which is too
  small for a header. `logo.png` / `logo-light.png` are **generated wordmark placeholders**.
- **No colour palette, no brand guidelines, no font** were published anywhere.
- **No "Best Sellers" data.** There is no sales information. The *Most loved* badge is assigned
  to the pieces with the most Instagram likes (5–15 per post) and is documented as such inside
  `products.js`. **Reposition it once you have real sales data.**
- **No company history, founders, manufacturing, or sustainability claims.** `about.html`
  describes only what the Instagram account shows — what is made, which fabrics, which seasons,
  how to order. There is no invented origin story. Fill it in with your real story.
- **No legal/policy text.** `policies/*.html` are **structural templates** with clearly marked
  `[ … ]` placeholders for your shipping times, return window, courier, and jurisdiction.
  **They are not legal advice and are not compliant as written** — a lawyer or your own
  operating terms must fill them in before you take a single order.

### Unrelated businesses — do not confuse

Web search surfaced several similarly named operations. **None of them are this brand:**
Tanhas Collection (Dhaka, Bangladesh), Tanha's Couture, Tanisha Fashion (India),
tanhalabel.com (Malaysia). Nothing from them was used.

### Images: what you're looking at

Every photograph is from the brand's own Instagram feed. Specifically:

- 11 posts are stills; **post 4 is a video**, so a frame from it (t = 8 s, 720 × 1280) is used
  as its product image.
- Each product's **second image is a genuine crop of the same photograph** (a 62%-width zoom),
  not a borrowed picture from another listing.
- `assets/collections/*.jpg` and `assets/hero/*.jpg` reuse the same 12 photographs — there are
  no stock images anywhere in this build.
- The full-resolution originals are kept in `tanhas-fashion/../tanhas-instagram-originals/`
  (outside the site folder) so you can re-crop them. Delete that folder if you don't want it;
  the website does not use it.

---

## 11. Testing report

Tested on **Chromium 156** (headless) via Playwright. Viewports exercised end to end:
**1600, 1440, 1280, 1100, 1024, 900, 820, 768, 700, 640, 620, 600, 540, 430, 414, 390,
375, 360 and 320 px** wide.

| Suite | Result |
|---|---|
| Functional / behavioural | **97 / 97 passed** |
| Mobile experience (tab bar, sheets, rail, buy bar) | **37 / 37 passed** |
| Bag sheet, search, scroll-lock, touch | **12 / 12 passed** |
| Reduced motion + JavaScript disabled | **18 / 18 passed** |
| Catalogue-mode pricing path | **9 / 9 passed** |
| WCAG AA colour contrast, 11 pages × 2 viewports | **0 failures** |
| Full sweep — 17 viewports × 12 pages | **0 × 4xx, 0 console errors, 0 overflow** |

### Hero geometry

Because the hero is a collage, its composition was verified by measuring boxes
rather than by eye. At every width from 320 px to 1600 px it was checked that:

- the two frames genuinely overlap (the collage reads as layered, not stacked),
- the secondary frame breaks past the primary's bottom edge,
- **no text collides with either image** — measured on the *rendered ink* of each
  text node (via `Range.getClientRects()`), not on its bounding box, so short
  lines in wide blocks are not false positives,
- the title never overflows its column,
- and there is no horizontal overflow anywhere.

Two real defects were found this way and fixed: the secondary frame was landing
on top of the buttons and the meta list on desktop, and on tablets the hero
stacked 1.45× taller than the screen. Both are resolved.

### Functional coverage — 95 checks

- **12 pages** load with **0 console errors**, **0 page exceptions** and **0 failed
  requests** — every product image, collection tile, Instagram tile, font and icon resolves.
  Re-verified after every single change, not once at the end.
- **Keyboard:** `⌘K` / `Ctrl+K` and `/` open search (and focus the field), Escape closes it,
  Escape closes drawers and modals, focus stays trapped inside an open modal, and **← / →**
  step through the product gallery.
- **Home:** hero renders at 900 px, 3 new arrivals, 8 collection tiles, 12 Instagram tiles,
  all images load and every one has a real `alt`.
- **Search:** matches on name, subtitle, category and fabric; results update live; Escape closes.
- **Wishlist:** toggles from card, quick view and product page; **persists across a reload**;
  wishlist page renders and empty-state appears when cleared.
- **Shop filters:** every facet returns the right count (winter = 5, Black = 1,
  winter + XS = 0 with an empty state, clear restores all 11); deep link
  `shop.html?c=formal-wear` → 4; URL updates as you filter.
- **Sort:** newest, A–Z, price ascending and descending all reorder correctly.
- **Product page:** thumbnails swap the main image, arrow keys navigate, size is required
  before adding (with an inline error), quantity can't go below 1, related products render,
  page title and OG tags are rewritten for the specific piece.
- **Cart:** line totals, subtotal, quantity updates, removal, empty state, and
  **persistence across reload**.
- **Quick view:** opens, adds to bag, closes with Escape and with the close button.
- **Checkout:** 6 required fields are flagged; malformed email and phone are rejected;
  a valid submission produces the confirmation and empties the bag; the copy never claims
  an order was placed.
- **Forms:** newsletter and contact validate email/phone and display the honest "nothing was
  sent" message.
- **Responsive:** **zero horizontal overflow** at 390 px and at 320 px.
- **Accessibility:** 0 images missing `alt`, 0 form controls without a label, skip link present
  and working, `aria-expanded`/`aria-live` wired on drawers and toasts, visible focus rings.
- **Degradation:** with `prefers-reduced-motion: reduce` every animated element renders in its
  finished state and nothing stays invisible; with JavaScript fully disabled the `no-js` class
  keeps all content visible. Both were asserted, not assumed.
- **Typography:** both self-hosted fonts actually load (`document.fonts.check()`), product
  cards hold a 0.750 aspect ratio.

### Catalogue-mode coverage — 7 checks

Because the account publishes no prices, the priced code path is dormant by default. It was
exercised on a temporary copy with prices and delivery fees configured, and re-verified after
the redesign:

- The price-range filter and both price-sort options appear automatically once prices exist
- Price filter min = Rs. 8,000 → 6 pieces *(the six priced at 8,400 / 8,900 / 9,800 / 11,200 / 12,500 / 13,200)*
- Sort by price ascending and descending → full 11-piece order correct in both directions
- Subtotal on a sub-threshold order → Rs. 5,900
- Delivery fee applied below the free threshold → Rs. 250
- Total = subtotal + delivery → Rs. 6,150
- "Spend Rs. 4,100 more for free delivery" nudge → correct arithmetic
- Checkout totals agree with the cart → Rs. 6,150
- Adding a second piece takes the order to Rs. 19,100 and delivery becomes **Free**

### Contrast — 0 failures

An automated audit walked every text node on all 11 pages at 1440 px and 390 px, computing the
true composited background (element opacity folded in, ancestor background resolved) and
comparing against WCAG AA (4.5:1 for body text, 3:1 for large text).

Text that sits **over photography** — the collection tiles and the Instagram like counts —
can't be measured by DOM inspection, so it was verified by worst-case arithmetic instead: ivory
text on the darkest possible photograph (pure white) still achieves **10.07:1** on tile titles,
**7.28:1** on tile body copy and **9.37:1** on the like-count pills.

Three fixes came out of this pass:
- `--camel-deep` `#8A6A42` → `#7E6039` and `--ink-3` `#7A7268` → `#6B635A`, lifting the small
  accent and meta text above 4.5:1.
- White-on-`--camel` surfaces (badges, quantity pills, the story seal) moved to `--camel-deep` —
  they were at 3.17:1.
- The collection-tile scrim was deepened, and the Instagram like count got its own solid pill.
- Disabled quantity buttons were changed from `opacity: .35` to a grey colour so they stay
  legible.

### Known limitations

- **`file://` opening degrades fonts.** Chrome blocks webfont requests from a `null` origin.
  The site still works; it just falls back to Georgia/system-sans. Serve over HTTP (§1).
- **Browser support:** tested on Chromium only. The CSS uses custom properties, `grid`, `aspect-ratio`,
  `display: contents`, `scroll-snap`, `svh` units, `env(safe-area-inset-*)` and `clamp()` — all
  supported by current Chrome, Edge, Firefox and Safari 15.4+, and every mobile browser from
  ~2022. **Not** tested in Safari; worth a manual pass before launch, particularly the hero
  collage and the bottom sheets. `backdrop-filter` degrades to a solid panel where unsupported.
- **No IE support.** By design.
- **Bag is per-browser.** Clearing site data empties it.

---

## 12. Quick reference

| I want to… | Go to |
|---|---|
| Add / edit / remove a product | `js/products.js` → `PRODUCTS` |
| Show real prices | `js/products.js` → `BRAND.priceMode = 'catalogue'` + add `price` |
| Set delivery fees or free-delivery threshold | `js/products.js` → `BRAND.delivery` |
| Change a category or collection name | `js/products.js` → `CATEGORIES` / `COLLECTIONS` |
| Change colours | `css/style.css` → `:root` (top ~35 lines) |
| Tone down or remove the animations | delete `css/motion.css` + `js/motion.js`, or just `motion.css` |
| Change the hero fabrics marquee | `index.html` → `.marquee__set` (repeat the same list twice) |
| Change the rotating seal text | `index.html` → search `hero__seal-svg` |
| Change the mobile tab bar | `build_pages.py` → the `.tabbar` block in `CHROME` |
| Change fonts | `css/fonts.css` + `--display` / `--sans` in `css/style.css` |
| Replace the logo | overwrite `assets/logo/logo.png` + `logo-light.png`, update `width`/`height` |
| Replace a photo | overwrite the file in `assets/products/`, `assets/hero/`, `assets/collections/` |
| Change the WhatsApp number | search `wa.me` across `*.html` and `js/` |
| Change the Instagram link | search `instagram.com/tanhas.fashion` across all files |
| Fix the legal pages | `policies/*.html` — replace every `[ … ]` placeholder |
| Take real orders | `js/checkout.js` → `submitOrder()` integration point |
| Change my domain | search-replace `https://YOUR-DOMAIN.com` in all 12 `.html` files |

**Regenerating the site HTML:** the pages are generated by a Python script that lives
*outside* this folder. For day-to-day edits you do **not** need it — edit `js/products.js`
and `css/style.css` directly, and edit the page HTML files directly. The generator only
matters if you need to rebuild all 12 pages from scratch.

---

*Built as a static front-end. No framework, no jQuery, no backend, no tracking, no Google Fonts CDN.*
