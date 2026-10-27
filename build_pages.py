#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generates the static HTML for the Tanha's Fashion storefront.
Authoring tool only — the output is plain, dependency-free static HTML.
"""
import os

ROOT = "/home/user/tanhas-fashion"

# ----------------------------------------------------------------------------- icons
ICON_SEARCH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>'
ICON_HEART  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M12 20.7 4.2 13a4.8 4.8 0 0 1 0-6.8 4.8 4.8 0 0 1 6.8 0l1 1 1-1a4.8 4.8 0 0 1 6.8 0 4.8 4.8 0 0 1 0 6.8Z"/></svg>'
ICON_BAG    = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M6 8h12l1 12H5L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>'
ICON_CLOSE  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>'
ICON_UP     = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>'
ICON_GRID   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="3.5" y="3.5" width="7" height="7"/><rect x="13.5" y="3.5" width="7" height="7"/><rect x="3.5" y="13.5" width="7" height="7"/><rect x="13.5" y="13.5" width="7" height="7"/></svg>'
ICON_MENU   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10"/></svg>'
ICON_IG     = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.2.05 1.8.25 2.2.42.6.22 1 .48 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c0 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2 0-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c0-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.1 0-3.5 0-4.7.07-1.1.05-1.7.23-2.1.39-.5.2-.9.44-1.3.83-.4.4-.63.8-.83 1.3-.16.4-.34 1-.39 2.1C2.6 8.5 2.6 8.9 2.6 12s0 3.5.07 4.7c.05 1.1.23 1.7.39 2.1.2.5.44.9.83 1.3.4.4.8.63 1.3.83.4.16 1 .34 2.1.39 1.2.07 1.6.07 4.7.07s3.5 0 4.7-.07c1.1-.05 1.7-.23 2.1-.39.5-.2.9-.44 1.3-.83.4-.4.63-.8.83-1.3.16-.4.34-1 .39-2.1.07-1.2.07-1.6.07-4.7s0-3.5-.07-4.7c-.05-1.1-.23-1.7-.39-2.1-.2-.5-.44-.9-.83-1.3-.4-.4-.8-.63-1.3-.83-.4-.16-1-.34-2.1-.39-1.2-.07-1.6-.07-4.7-.07Zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8Zm0 1.8a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2Zm5.1-2.9a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3Z"/></svg>'
ICON_WA     = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 1.8a8.2 8.2 0 1 1 0 16.4c-1.4 0-2.7-.35-3.85-1L4.6 20l.8-2.45A8.2 8.2 0 0 1 12 3.8Zm-3.1 4.3c.2 0 .35.03.45.07.15.05.3.25.45.55l.55 1.2c.1.25.05.45-.1.7l-.3.4c-.1.15-.15.25-.05.45.45.85 1.15 1.5 2 1.9.2.1.35.05.5-.05l.5-.55c.15-.2.35-.25.6-.15l1.2.5c.25.1.4.2.45.35.05.15 0 .5-.2.9-.2.4-.55.65-.95.7-.3.05-1.05.1-2.4-.55-1.6-.8-2.65-2.4-2.8-2.75-.15-.35-.8-1.6-.8-3 0-1.4.7-2.1 1-2.4.2-.2.5-.35.8-.35Z"/></svg>'
ICON_HEART_S = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.7 4.2 13a4.8 4.8 0 0 1 0-6.8 4.8 4.8 0 0 1 6.8 0l1 1 1-1a4.8 4.8 0 0 1 6.8 0 4.8 4.8 0 0 1 0 6.8Z"/></svg>'
ICON_BAG_S   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true"><path d="M6 8h12l1 12H5L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>'

# ----------------------------------------------------------------------------- head
def head(title, desc, extra_og="", scripts=(), body_class=""):
    og_image = "https://YOUR-DOMAIN.com/assets/og-image.jpg"
    og_url   = "https://YOUR-DOMAIN.com/"
    return f"""<!DOCTYPE html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">

<!-- ┌───────────────────────────────────────────────────────────────┐
     │ BEFORE GOING LIVE: replace YOUR-DOMAIN.com below with your     │
     │ real domain (og:url, og:image and the canonical link).         │
     └───────────────────────────────────────────────────────────────┘ -->
<link rel="canonical" href="{og_url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Tanha's Fashion">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{og_image}">
<meta property="og:url" content="{og_url}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{og_image}">
<meta name="theme-color" content="#1C1917">

<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="icon" href="assets/favicon.png" type="image/png" sizes="512x512">
<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">

<link rel="preload" href="assets/fonts/jost-400-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/cormorant-garamond-300-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="css/fonts.css">
<link rel="stylesheet" href="css/style.css">
<link rel="stylesheet" href="css/motion.css">
{extra_og}
</head>
<body class="{body_class}">"""

# ----------------------------------------------------------------------------- header
HEADER = f"""
<a class="skip-link" href="#main">Skip to content</a>

<div class="announce" id="announce" hidden>
  <span data-announce-text></span>
  <button class="announce__close" type="button" data-announce-close aria-label="Dismiss announcement">{ICON_CLOSE}</button>
</div>

<header class="header" id="site-header">
  <div class="wrap header__inner">
    <button class="icon-btn menu-btn" type="button" data-menu-open aria-label="Open menu" aria-controls="drawer-nav" aria-expanded="false">
      <span class="menu-btn__bars" aria-hidden="true"><span></span><span></span><span></span></span>
    </button>

    <nav class="nav" aria-label="Main navigation">
      <ul class="nav__list">
        <li><a class="nav__link" href="shop.html">Shop</a></li>
        <li><a class="nav__link" href="shop.html?c=new-arrivals">New Arrivals</a></li>
        <li><a class="nav__link" href="shop.html?c=best-sellers">Best Sellers</a></li>
        <li><a class="nav__link" href="index.html#collections">Collections</a></li>
        <li><a class="nav__link" href="about.html">About Us</a></li>
        <li><a class="nav__link" href="contact.html">Contact</a></li>
      </ul>
    </nav>

    <a class="brand" href="index.html" aria-label="Tanha's Fashion — home">
      <img class="brand__img" src="assets/logo/logo.png" alt="Tanha's Fashion" width="538" height="165">
      <span class="brand__mark">Tanha&rsquo;s<em>Fashion</em></span>
    </a>

    <div class="actions">
      <button class="icon-btn" type="button" data-search-open aria-label="Search" aria-controls="search-panel" aria-expanded="false">{ICON_SEARCH}</button>
      <a class="icon-btn" href="wishlist.html" aria-label="Wishlist">{ICON_HEART}<span class="icon-btn__count" data-wish-count hidden>0</span></a>
      <button class="icon-btn" type="button" data-bag-open aria-label="Shopping bag" aria-controls="bag-drawer" aria-expanded="false">{ICON_BAG}<span class="icon-btn__count" data-cart-count hidden>0</span></button>
    </div>
  </div>
</header>

<main id="main">"""

# ----------------------------------------------------------------------------- chrome
CHROME = f"""
<!-- ============ mobile navigation drawer ============ -->
<div class="drawer-nav" id="drawer-nav" aria-hidden="true" aria-label="Menu">
  <div class="drawer-nav__head">
    <span class="eyebrow">Menu</span>
    <button class="icon-btn" type="button" data-drawer-close data-autofocus aria-label="Close menu">{ICON_CLOSE}</button>
  </div>
  <div class="drawer-nav__body">
    <a class="drawer-nav__link" href="shop.html">Shop All</a>
    <a class="drawer-nav__link" href="shop.html?c=new-arrivals">New Arrivals</a>
    <a class="drawer-nav__link" href="shop.html?c=best-sellers">Best Sellers</a>
    <a class="drawer-nav__link" href="index.html#collections">Collections</a>
    <a class="drawer-nav__link" href="shop.html?c=winter-collection">Winter Collection</a>
    <a class="drawer-nav__link" href="shop.html?c=summer-collection">Summer Collection</a>
    <a class="drawer-nav__link" href="about.html">About Us</a>
    <a class="drawer-nav__link" href="contact.html">Contact</a>
    <a class="drawer-nav__link" href="wishlist.html">Wishlist</a>
    <div class="drawer-nav__foot">
      <a class="link" href="https://www.instagram.com/tanhas.fashion/" target="_blank" rel="noopener noreferrer">Follow on Instagram <span class="link__arrow">&rarr;</span></a>
    </div>
  </div>
</div>

<!-- ============ shopping bag drawer ============ -->
<div class="bag-drawer" id="bag-drawer" aria-hidden="true" aria-label="Shopping bag">
  <div class="bag-drawer__head">
    <span class="bag-drawer__title">Your Bag</span>
    <button class="icon-btn" type="button" data-drawer-close data-autofocus aria-label="Close bag">{ICON_CLOSE}</button>
  </div>
  <div class="bag-drawer__body" id="bag-drawer-body"></div>
  <div class="bag-drawer__foot" id="bag-drawer-foot" hidden>
    <a class="btn btn--ghost btn--block" href="cart.html">View Bag</a>
    <a class="btn btn--block" href="checkout.html">Checkout</a>
  </div>
</div>

<!-- ============ search panel ============ -->
<div class="search-panel" id="search-panel" aria-hidden="true">
  <div class="wrap search-panel__inner">
    <form class="search-form" role="search" onsubmit="return false;">
      <label class="sr-only" for="search-input">Search for a piece</label>
      <input id="search-input" type="search" placeholder="Search — try &ldquo;linen&rdquo;, &ldquo;sheesha silk&rdquo;, &ldquo;frock&rdquo;" autocomplete="off">
      <button class="icon-btn" type="button" data-search-close aria-label="Close search">{ICON_CLOSE}</button>
    </form>
    <div class="search-results" id="search-results"></div>
  </div>
</div>

<div class="scrim" id="scrim" hidden-until-open></div>

<!-- ============ quick view modal (populated by JS) ============ -->
<div class="modal" id="quickview" aria-hidden="true" role="dialog" aria-modal="true"></div>

<!-- ============ toasts ============ -->
<div class="toasts" role="status" aria-live="polite"></div>

<button class="to-top" id="to-top" type="button" aria-label="Back to top">{ICON_UP}</button>

<!-- ============ scroll progress ============ -->
<div class="scroll-progress" aria-hidden="true"><span id="scroll-progress-bar"></span></div>

<!-- ============ mobile tab bar (thumb-reachable navigation) ============ -->
<nav class="tabbar" aria-label="Quick navigation">
  <a class="tabbar__item" href="shop.html" data-tab="shop">
    <span class="tabbar__ico" aria-hidden="true">{ICON_GRID}</span>
    <span class="tabbar__label">Shop</span>
  </a>
  <button class="tabbar__item" type="button" data-search-open aria-label="Search">
    <span class="tabbar__ico" aria-hidden="true">{ICON_SEARCH}</span>
    <span class="tabbar__label">Search</span>
  </button>
  <a class="tabbar__item" href="wishlist.html" data-tab="wishlist">
    <span class="tabbar__ico" aria-hidden="true">{ICON_HEART}</span>
    <span class="tabbar__label">Saved</span>
    <span class="tabbar__badge" data-wish-count hidden>0</span>
  </a>
  <button class="tabbar__item" type="button" data-bag-open aria-label="Shopping bag">
    <span class="tabbar__ico" aria-hidden="true">{ICON_BAG}</span>
    <span class="tabbar__label">Bag</span>
    <span class="tabbar__badge" data-cart-count hidden>0</span>
  </button>
  <button class="tabbar__item" type="button" data-menu-open aria-label="Menu">
    <span class="tabbar__ico" aria-hidden="true">{ICON_MENU}</span>
    <span class="tabbar__label">Menu</span>
  </button>
</nav>
"""

# ----------------------------------------------------------------------------- newsletter
NEWSLETTER = """
<section class="section newsletter" aria-labelledby="nl-title">
  <div class="wrap">
    <div class="newsletter__inner">
      <div>
        <p class="eyebrow">Stay in touch</p>
        <h2 id="nl-title" style="margin-top:.5rem">Be first to see new arrivals</h2>
        <p class="lede" style="margin-top:.75rem">
          New pieces are announced on Instagram first. Leave your email and we&rsquo;ll send the
          season&rsquo;s drops your way.
        </p>
      </div>
      <form class="newsletter__form" id="newsletter-form" data-form="newsletter" novalidate>
        <div class="field">
          <label class="field__label" for="nl-email">Email address</label>
          <input class="field__input" id="nl-email" name="email" type="email" inputmode="email"
                 autocomplete="email" placeholder="you@example.com" required
                 aria-describedby="nl-email-err">
          <span class="field__error" id="nl-email-err">Please enter a valid email address.</span>
        </div>
        <button class="btn" type="submit">Subscribe</button>
      </form>
      <p class="form-status" id="newsletter-status" hidden></p>
    </div>
  </div>
</section>
"""

# ----------------------------------------------------------------------------- footer
FOOTER = f"""
<footer class="footer">
  <div class="wrap">
    <div class="footer__grid">
      <div class="footer__brand">
        <a class="brand" href="index.html" aria-label="Tanha's Fashion — home">
          <img class="brand__img" src="assets/logo/logo-light.png" alt="Tanha's Fashion" width="538" height="165">
          <span class="brand__mark">Tanha&rsquo;s<em>Fashion</em></span>
        </a>
        <p class="footer__tag">
          <span data-brand-tagline>Elegant Wear for Every Woman</span>.
          Ready-to-wear eastern wear — two- and three-piece suits, coordinated sets and long frocks.
        </p>
        <div class="footer__social">
          <a href="https://www.instagram.com/tanhas.fashion/" target="_blank" rel="noopener noreferrer" aria-label="Tanha's Fashion on Instagram">{ICON_IG}</a>
          <a href="https://wa.me/" data-brand-whatsapp hidden target="_blank" rel="noopener noreferrer" aria-label="Message Tanha's Fashion on WhatsApp">{ICON_WA}</a>
        </div>
      </div>

      <div class="footer__col">
        <h4>Shop</h4>
        <ul class="footer__list">
          <li><a href="shop.html">All Products</a></li>
          <li><a href="shop.html?c=new-arrivals">New Arrivals</a></li>
          <li><a href="shop.html?c=best-sellers">Best Sellers</a></li>
          <li><a href="shop.html?c=winter-collection">Winter Collection</a></li>
          <li><a href="shop.html?c=summer-collection">Summer Collection</a></li>
          <li><a href="shop.html?c=formal-wear">Formal &amp; Festive</a></li>
        </ul>
      </div>

      <div class="footer__col">
        <h4>Customer Care</h4>
        <ul class="footer__list">
          <li><a href="contact.html">Contact Us</a></li>
          <li><a href="policies/shipping.html">Shipping Policy</a></li>
          <li><a href="policies/returns.html">Returns &amp; Exchanges</a></li>
          <li><a href="wishlist.html">Wishlist</a></li>
          <li><a href="cart.html">Shopping Bag</a></li>
        </ul>
      </div>

      <div class="footer__col">
        <h4>Information</h4>
        <ul class="footer__list">
          <li><a href="about.html">About Us</a></li>
          <li><a href="policies/privacy.html">Privacy Policy</a></li>
          <li><a href="policies/terms.html">Terms &amp; Conditions</a></li>
          <li><a href="https://www.instagram.com/tanhas.fashion/" target="_blank" rel="noopener noreferrer">Instagram</a></li>
        </ul>
      </div>
    </div>

    <div class="footer__bottom">
      <p>&copy; <span data-year>2026</span> Tanha&rsquo;s Fashion. All rights reserved.</p>
      <!-- REMOVE THIS LINE once a real payment provider is connected: -->
      <p>Demonstration storefront — no payment is taken online. Prices are confirmed on request.</p>
    </div>
  </div>
</footer>
"""

def scripts(extra=()):
    base = ['<script src="js/products.js"></script>',
            '<script src="js/main.js"></script>',
            '<script src="js/motion.js"></script>',
            '<script src="js/forms.js"></script>']
    return "\n".join(base + list(extra))


def relocate(html, prefix):
    """Prefix every relative src/href so pages inside sub-folders still resolve."""
    if not prefix:
        return html
    import re as _re
    def rep(m):
        attr, url = m.group(1), m.group(2)
        if url.startswith(("http", "mailto:", "tel:", "//", "#", "data:")):
            return m.group(0)
        return f'{attr}="{prefix}{url}"'
    return _re.sub(r'(src|href)="([^"]+)"', rep, html)


def page(title, desc, body, extra_scripts=(), body_class="", extra_og="", depth=0):
    doc = "\n".join([
        head(title, desc, extra_og=extra_og, body_class=body_class),
        HEADER,
        body,
        "</main>",
        NEWSLETTER,
        FOOTER,
        CHROME,
        scripts(extra_scripts),
        "</body>\n</html>\n"
    ])
    return relocate(doc, "../" * depth)


# ============================================================== PAGE: index.html
COLLECTIONS = [
    ("new-arrivals",       "New Arrivals",      "The most recent pieces added to the rails."),
    ("winter-collection",  "Winter Collection", "Linen, marina and embroidered suits for the cold months."),
    ("eastern-wear",       "Eastern Wear",      "Shalwar kameez, kurtis and coordinated separates."),
    ("formal-wear",        "Formal Wear",       "Considered pieces for events, Eid and special occasions."),
    ("festive-collection", "Festive Collection","Lace, embroidery and occasion dressing."),
    ("best-sellers",       "Best Sellers",      "The most-loved posts on our Instagram."),
    ("everyday-wear",      "Everyday Wear",     "Comfortable, classy looks for daily wear."),
    ("summer-collection",  "Summer Collection", "Breathable lawn and lightweight cottons."),
]

def index_body():
    tiles = "\n".join(f"""
      <a class="coll-tile reveal" href="shop.html?c={slug}">
        <div class="coll-tile__media">
          <img src="assets/collections/{slug}.jpg" alt="{name} — Tanha's Fashion" width="800" height="1000" loading="lazy" decoding="async">
        </div>
        <span class="coll-tile__veil" aria-hidden="true"></span>
        <div class="coll-tile__body">
          <h3 class="coll-tile__name">{name}</h3>
          <p class="coll-tile__blurb">{blurb}</p>
          <span class="coll-tile__cta">Shop now <span aria-hidden="true">&rarr;</span></span>
        </div>
      </a>""" for slug, name, blurb in COLLECTIONS)

    return f"""
<!-- ============================ HERO ============================ -->
<section class="hero" aria-labelledby="hero-title">
  <span class="hero__ghost" aria-hidden="true">Elegance</span>
  <span class="hero__grain" aria-hidden="true"></span>

  <div class="wrap hero__inner">
    <div class="hero__copy">
      <p class="eyebrow hero__eyebrow" data-anim="fade" data-anim-d="0">
        Elegant Wear for Every Woman
      </p>

      <h1 class="hero__title" id="hero-title">
        <span class="ln" data-anim="line" data-anim-d="1"><span>Elegance in</span></span>
        <span class="ln" data-anim="line" data-anim-d="2"><span><em>every</em> stitch</span></span>
      </h1>

      <p class="hero__text" data-anim="fade" data-anim-d="4">
        Ready-to-wear eastern pieces in printed linen, marina, sheesha silk and lawn —
        finished with the lace and embroidery details that make an outfit feel complete.
      </p>

      <div class="btn-row hero__actions" data-anim="fade" data-anim-d="5">
        <a class="btn" href="shop.html" data-magnetic>Explore the collection</a>
        <a class="btn btn--ghost" href="shop.html?c=new-arrivals" data-magnetic>New arrivals</a>
      </div>

      <ul class="hero__meta" data-anim="fade" data-anim-d="6">
        <li>Ready to wear</li>
        <li>Sizes XS&ndash;XL on selected pieces</li>
        <li>Order by Instagram DM</li>
      </ul>
    </div>

    <div class="hero__stack">
      <figure class="hero__frame hero__frame--primary" data-parallax="-0.07" data-anim="rise" data-anim-d="2">
        <img src="assets/hero/hero-main.jpg"
             alt="Tanha&#39;s Fashion marina long frock with a floral print and gold lace detailing"
             width="1400" height="1750" fetchpriority="high" decoding="async">
      </figure>

      <figure class="hero__frame hero__frame--secondary" data-parallax="0.13" data-anim="rise" data-anim-d="5">
        <img src="assets/hero/hero-editorial.jpg"
             alt="Tanha&#39;s Fashion printed linen three-piece suit with a chiffon dupatta"
             width="1400" height="1750" decoding="async">
        <figcaption class="hero__plate">
          <span class="hero__plate-k">Printed Linen</span>
          <span class="hero__plate-v">Three-Piece Suit</span>
        </figcaption>
      </figure>

      <div class="hero__seal" data-parallax="0.2" data-anim="fade" data-anim-d="7" aria-hidden="true">
        <svg viewBox="0 0 200 200" class="hero__seal-svg">
          <defs>
            <path id="tf-seal-arc" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0"/>
          </defs>
          <text><textPath href="#tf-seal-arc" startOffset="0">
            Tanhas Collection &middot; Elegance in every stitch &middot;&nbsp;
          </textPath></text>
        </svg>
        <span class="hero__seal-dot"></span>
      </div>
    </div>
  </div>

  <a class="hero__cue" href="#collections" data-anim="fade" data-anim-d="9">
    <span class="hero__cue-t">Scroll</span>
    <span class="hero__cue-line" aria-hidden="true"></span>
  </a>
</section>

<!-- ========================== MARQUEE STRIP ========================== -->
<div class="marquee" aria-hidden="true">
  <div class="marquee__track">
    <span class="marquee__set">
      <span>Lawn</span><i>&middot;</i><span>Linen</span><i>&middot;</i><span>Marina</span><i>&middot;</i>
      <span>Sheesha Silk</span><i>&middot;</i><span>Chiffon</span><i>&middot;</i><span>Organza</span><i>&middot;</i>
      <span>Ready to Wear</span><i>&middot;</i><span>New Collection</span><i>&middot;</i>
    </span>
    <span class="marquee__set">
      <span>Lawn</span><i>&middot;</i><span>Linen</span><i>&middot;</i><span>Marina</span><i>&middot;</i>
      <span>Sheesha Silk</span><i>&middot;</i><span>Chiffon</span><i>&middot;</i><span>Organza</span><i>&middot;</i>
      <span>Ready to Wear</span><i>&middot;</i><span>New Collection</span><i>&middot;</i>
    </span>
  </div>
</div>

<!-- ======================= SHOP BY COLLECTION ==================== -->
<section class="section" id="collections" aria-labelledby="collections-title">
  <div class="wrap">
    <div class="sec-head sec-head--split">
      <div>
        <p class="eyebrow">Shop by collection</p>
        <h2 class="sec-head__title" id="collections-title">Find your occasion</h2>
        <p class="sec-head__text">
          Every collection below is drawn from what we actually make and photograph — no filler.
        </p>
      </div>
      <div class="sec-head__aside">
        <a class="link" href="shop.html">View all products <span class="link__arrow" aria-hidden="true">&rarr;</span></a>
      </div>
    </div>
    <div class="coll-grid">
      {tiles}
    </div>
  </div>
</section>

<!-- ========================= NEW ARRIVALS ======================== -->
<section class="section section--porcelain" aria-labelledby="na-title">
  <div class="wrap">
    <div class="sec-head sec-head--split">
      <div>
        <p class="eyebrow">New arrivals</p>
        <h2 class="sec-head__title" id="na-title">Just landed</h2>
      </div>
      <div class="sec-head__aside">
        <a class="link" href="shop.html?c=new-arrivals">Shop new arrivals <span class="link__arrow" aria-hidden="true">&rarr;</span></a>
      </div>
    </div>
    <div class="prod-grid" id="new-arrivals-grid"><!-- filled by main.js --></div>
  </div>
</section>

<!-- ======================= FEATURED COLLECTION =================== -->
<section class="editorial" aria-labelledby="ed-title">
  <div class="editorial__grid">
    <div class="editorial__media">
      <img src="assets/hero/hero-editorial.jpg" alt="Tanha's Fashion printed linen three-piece suit with a chiffon dupatta"
           width="1400" height="1750" loading="lazy" decoding="async">
    </div>
    <div class="editorial__content">
      <p class="eyebrow">Featured collection</p>
      <h2 class="editorial__title" id="ed-title">The Winter Edit</h2>
      <p class="editorial__text">
        Our winter pieces are built around fabric first — printed linen, marina and soft
        embroidered suits, chosen to layer beautifully and to wear well past one season.
      </p>
      <ul class="editorial__list">
        <li>Printed linen two- and three-piece suits with chiffon dupattas</li>
        <li>Marina long frocks finished with gold lace</li>
        <li>Embroidered beige and black winter suits</li>
        <li>Sizes Small to Large, and XS to XL on our formal suits</li>
      </ul>
      <div class="btn-row">
        <a class="btn btn--onlight" href="shop.html?c=winter-collection">Discover the Collection</a>
      </div>
    </div>
  </div>
</section>

<!-- ========================== BRAND STORY ======================== -->
<section class="section" aria-labelledby="story-title">
  <div class="wrap split split--story">
    <div class="story__media reveal">
      <img src="assets/products/tf-011-sheesha-silk-three-piece-suit-premium-1.jpg"
           alt="Tanha's Fashion sheesha silk three-piece suit from the premium collection"
           width="1000" height="1333" loading="lazy" decoding="async">
      <div class="story__seal"><span data-brand-strapline>Elegance in Every Stitch</span></div>
    </div>
    <div class="reveal">
      <p class="eyebrow">Our story</p>
      <h2 id="story-title" style="font-size:var(--fs-h2);margin:.5rem 0 1rem">A label built on a simple promise</h2>
      <p class="lede">
        <span data-brand-name>Tanha&rsquo;s Fashion</span> is a women&rsquo;s wear label built around one
        idea: elegant wear for every woman. Premium, modern and timeless — the three words
        we use to describe every piece we put our name to.
      </p>
      <p style="color:var(--ink-2);margin-top:1rem">
        Our collections follow the season. Lightweight lawn and soft cottons through the summer
        months; printed linen, marina and embroidered suits when the weather turns. Everything is
        ready to wear, so nothing sits in your wardrobe waiting to be stitched.
      </p>
      <dl class="story__facts">
        <div class="story__fact"><dt>What we make</dt><dd>Ready-to-wear eastern wear — two- and three-piece suits, coordinated sets, kurtis and long frocks.</dd></div>
        <div class="story__fact"><dt>Fabrics</dt><dd>Lawn, linen, marina, sheesha silk and chiffon.</dd></div>
        <div class="story__fact"><dt>Sizes</dt><dd>Small to Large, and XS to XL depending on the piece. Each product lists the sizes it is actually available in.</dd></div>
        <div class="story__fact"><dt>How to order</dt><dd>Message us on Instagram. We confirm availability, price and delivery with you directly.</dd></div>
      </dl>
      <div class="btn-row" style="margin-top:2rem">
        <a class="btn btn--ghost" href="about.html">More about us</a>
      </div>
    </div>
  </div>
</section>

<!-- ========================= INSTAGRAM =========================== -->
<section class="section section--porcelain" aria-labelledby="ig-title">
  <div class="wrap">
    <div class="sec-head sec-head--split">
      <div>
        <p class="eyebrow">@tanhas.fashion</p>
        <h2 class="sec-head__title" id="ig-title">As seen on Instagram</h2>
        <p class="sec-head__text">
          Every photograph on this site comes from our own feed. Tap any image to open the
          original post.
        </p>
      </div>
      <div class="sec-head__aside">
        <a class="link" href="https://www.instagram.com/tanhas.fashion/" target="_blank" rel="noopener noreferrer">
          Follow us on Instagram <span class="link__arrow" aria-hidden="true">&rarr;</span>
        </a>
      </div>
    </div>
    <div class="ig-grid" id="ig-grid"><!-- filled by main.js --></div>
  </div>
</section>
"""


# ============================================================== PAGE: shop.html
def shop_body():
    return """
<section class="page-hero">
  <div class="wrap">
    <nav aria-label="Breadcrumb">
      <ol class="crumbs">
        <li><a href="index.html">Home</a></li>
        <li><span id="crumb-current">Shop</span></li>
      </ol>
    </nav>
    <h1 class="page-hero__title" id="shop-title">Shop All</h1>
    <p class="page-hero__text" id="shop-blurb">
      Every piece currently on our rails. Use the filters to narrow by collection, size or colour.
    </p>
  </div>
</section>

<section class="section--tight">
  <div class="wrap">
    <div class="shop-layout">
      <!-- ---------------- filters (sidebar on desktop) ---------------- -->
      <form class="filters" id="filters" aria-label="Product filters">
        <div class="filters__group">
          <button class="filters__legend" type="button" aria-expanded="true" aria-controls="f-cat">
            Collection <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          <div class="filters__panel" id="f-cat" data-group="category"></div>
        </div>
        <div class="filters__group">
          <button class="filters__legend" type="button" aria-expanded="true" aria-controls="f-size">
            Size <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          <div class="filters__panel" id="f-size" data-group="size"></div>
        </div>
        <div class="filters__group">
          <button class="filters__legend" type="button" aria-expanded="true" aria-controls="f-color">
            Colour <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          <div class="filters__panel" id="f-color" data-group="color"></div>
        </div>
        <div class="filters__group" id="f-price-group">
          <button class="filters__legend" type="button" aria-expanded="true" aria-controls="f-price">
            Price <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          <div class="filters__panel" id="f-price" data-group="price"></div>
        </div>
        <div style="padding-top:1.25rem">
          <button class="btn btn--ghost btn--block btn--sm" type="button" data-clear-filters>Clear all filters</button>
        </div>
      </form>

      <!-- ---------------- results ---------------- -->
      <div>
        <div class="shop-toolbar">
          <button class="btn btn--ghost btn--sm filter-btn" type="button" data-filter-open aria-controls="filter-drawer" aria-expanded="false">
            Filters <span class="filter-btn__n" data-active-count hidden>0</span>
          </button>
          <div class="field" style="flex:1 1 200px;max-width:320px">
            <label class="sr-only" for="shop-search">Search products</label>
            <input class="field__input" id="shop-search" type="search" placeholder="Search this page&hellip;" autocomplete="off">
          </div>
          <p class="shop-toolbar__count" id="result-count" role="status" aria-live="polite"></p>
          <div class="shop-toolbar__spacer"></div>
          <div class="shop-toolbar__sort">
            <label for="sort-select">Sort</label>
            <select id="sort-select">
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="name-asc">Name: A&ndash;Z</option>
            </select>
          </div>
        </div>

        <div class="chips" id="active-chips"></div>

        <div class="prod-grid" id="shop-grid" style="margin-top:.5rem"></div>
      </div>
    </div>
  </div>
</section>

<!-- ---------------- filter drawer (mobile / tablet) ---------------- -->
<div class="filter-drawer" id="filter-drawer" aria-hidden="true" aria-label="Filters">
  <div class="filter-drawer__head">
    <span class="bag-drawer__title">Filters</span>
    <button class="icon-btn" type="button" data-drawer-close data-autofocus aria-label="Close filters">ICON_CLOSE_SVG</button>
  </div>
  <div class="filter-drawer__body" id="filter-drawer-body"></div>
  <div class="filter-drawer__foot">
    <button class="btn btn--ghost btn--block" type="button" data-clear-filters>Clear</button>
    <button class="btn btn--block" type="button" data-drawer-close>Apply</button>
  </div>
</div>
""".replace("ICON_CLOSE_SVG", ICON_CLOSE)


# ============================================================= PAGE: product.html
def product_body():
    return """
<section class="section--tight">
  <div class="wrap">
    <nav aria-label="Breadcrumb" style="margin-bottom:1.5rem">
      <ol class="crumbs">
        <li><a href="index.html">Home</a></li>
        <li><a href="shop.html">Shop</a></li>
        <li><span id="pdp-crumb">Product</span></li>
      </ol>
    </nav>

    <div id="pdp-root">
      <noscript>
        <div class="empty-state">
          <h2>JavaScript is required</h2>
          <p>This product page builds itself from the catalogue in <code>js/products.js</code>.
             Please enable JavaScript, or browse the <a href="shop.html">full shop</a>.</p>
        </div>
      </noscript>
    </div>

    <!-- ---------------- related products ---------------- -->
    <section class="section" id="related-section" hidden aria-labelledby="related-title">
      <div class="sec-head sec-head--split">
        <div>
          <p class="eyebrow">You may also like</p>
          <h2 class="sec-head__title" id="related-title">Styled with it</h2>
        </div>
      </div>
      <div class="prod-grid" id="related-grid"></div>
    </section>
  </div>
</section>
"""


# ============================================================== PAGE: cart.html
def cart_body():
    return """
<section class="section--tight">
  <div class="wrap">
    <nav aria-label="Breadcrumb" style="margin-bottom:1.5rem">
      <ol class="crumbs">
        <li><a href="index.html">Home</a></li>
        <li><span>Shopping Bag</span></li>
      </ol>
    </nav>

    <h1 style="font-size:clamp(2rem,1.4rem+2vw,3rem);margin-bottom:.5rem">Shopping Bag</h1>
    <p class="muted" style="margin-bottom:2rem">
      Nothing is charged here. We confirm availability and price with you before anything is sent out.
    </p>

    <div class="cart-layout">
      <div>
        <div id="cart-lines" class="cart-lines"></div>
        <div id="cart-empty" class="empty-state" hidden>
          <div class="empty-state__mark">BAG_SVG</div>
          <h2>Your bag is empty</h2>
          <p>Have a look at what&rsquo;s new, or browse everything we have on the rails.</p>
          <div class="btn-row" style="justify-content:center">
            <a class="btn" href="shop.html">Start shopping</a>
            <a class="btn btn--ghost" href="shop.html?c=new-arrivals">New arrivals</a>
          </div>
        </div>
        <div style="margin-top:2rem">
          <a class="link" href="shop.html"><span aria-hidden="true">&larr;</span> Continue shopping</a>
        </div>
      </div>

      <aside class="summary" id="cart-summary" aria-labelledby="sum-title">
        <h2 class="summary__title" id="sum-title">Order summary</h2>
        <div id="summary-rows"></div>
        <div class="summary__actions">
          <a class="btn btn--block" href="checkout.html">Proceed to Checkout</a>
        </div>
        <p class="summary__note" id="summary-note"></p>
      </aside>
    </div>
  </div>
</section>
""".replace("BAG_SVG", ICON_BAG_S)


# =========================================================== PAGE: checkout.html
def checkout_body():
    return """
<section class="section--tight">
  <div class="wrap">
    <nav aria-label="Breadcrumb" style="margin-bottom:1.5rem">
      <ol class="crumbs">
        <li><a href="index.html">Home</a></li>
        <li><a href="cart.html">Shopping Bag</a></li>
        <li><span>Checkout</span></li>
      </ol>
    </nav>

    <div id="checkout-wrap">
      <h1 style="font-size:clamp(2rem,1.4rem+2vw,3rem);margin-bottom:1rem">Checkout</h1>

      <div class="notice" id="demo-notice" style="margin-bottom:2rem">
        <strong>This is a demonstration checkout.</strong>
        No payment is taken and no card details are collected or stored anywhere. Submitting this
        form prepares an order request in your browser only. To take real orders, connect a payment
        provider (Stripe, PayPal, JazzCash, Easypaisa) and an order-processing backend — see
        <code>README.md</code> for the integration point.
      </div>

      <div id="checkout-empty" class="empty-state" hidden>
        <div class="empty-state__mark">BAG_SVG</div>
        <h2>Your bag is empty</h2>
        <p>Add a piece to your bag before checking out.</p>
        <a class="btn" href="shop.html">Start shopping</a>
      </div>

      <div class="checkout-layout" id="checkout-layout">
        <!-- ---------------- form ---------------- -->
        <form class="checkout-form" id="checkout-form" data-form="checkout" novalidate>
          <div class="checkout-block" style="border-top:0;padding-top:0">
            <h2 class="checkout-block__title">Contact details</h2>
            <div class="field-row field-row--2">
              <div class="field">
                <label class="field__label" for="co-name">Full name <span class="req" aria-hidden="true">*</span></label>
                <input class="field__input" id="co-name" name="name" type="text" autocomplete="name" required aria-describedby="co-name-err">
                <span class="field__error" id="co-name-err">Please enter your full name.</span>
              </div>
              <div class="field">
                <label class="field__label" for="co-email">Email address <span class="req" aria-hidden="true">*</span></label>
                <input class="field__input" id="co-email" name="email" type="email" inputmode="email" autocomplete="email" required aria-describedby="co-email-err">
                <span class="field__error" id="co-email-err">Please enter a valid email address.</span>
              </div>
            </div>
            <div class="field">
              <label class="field__label" for="co-phone">Phone number <span class="req" aria-hidden="true">*</span></label>
              <input class="field__input" id="co-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required aria-describedby="co-phone-err">
              <span class="field__error" id="co-phone-err">Please enter a contact number (at least 7 digits).</span>
            </div>
          </div>

          <div class="checkout-block">
            <h2 class="checkout-block__title">Delivery address</h2>
            <div class="field">
              <label class="field__label" for="co-address">Delivery address <span class="req" aria-hidden="true">*</span></label>
              <input class="field__input" id="co-address" name="address" type="text" autocomplete="street-address" required aria-describedby="co-address-err">
              <span class="field__error" id="co-address-err">Please enter your delivery address.</span>
            </div>
            <div class="field-row field-row--2">
              <div class="field">
                <label class="field__label" for="co-city">City <span class="req" aria-hidden="true">*</span></label>
                <input class="field__input" id="co-city" name="city" type="text" autocomplete="address-level2" required aria-describedby="co-city-err">
                <span class="field__error" id="co-city-err">Please enter your city.</span>
              </div>
              <div class="field">
                <label class="field__label" for="co-postcode">Postcode</label>
                <input class="field__input" id="co-postcode" name="postcode" type="text" autocomplete="postal-code">
              </div>
            </div>
            <div class="field">
              <label class="field__label" for="co-notes">Delivery notes</label>
              <textarea class="field__textarea" id="co-notes" name="notes" placeholder="Landmark, preferred delivery time, anything else we should know."></textarea>
            </div>
          </div>

          <div class="checkout-block">
            <h2 class="checkout-block__title">Delivery method</h2>
            <div class="pay-options" id="delivery-options"></div>
          </div>

          <div class="checkout-block">
            <h2 class="checkout-block__title">Payment method</h2>
            <div class="notice" style="margin-bottom:.5rem">
              Card details are never entered on this site. Pick how you would like to pay and we
              will confirm the payment step with you directly.
            </div>
            <div class="pay-options" id="payment-options"></div>
            <span class="field__error" id="co-payment-err">Please choose a payment method.</span>
          </div>

          <div class="field">
            <label class="choice">
              <input type="checkbox" id="co-terms" name="terms" required>
              <span class="choice__box" aria-hidden="true"></span>
              <span>I have read and agree to the
                <a href="policies/terms.html" target="_blank" rel="noopener">terms &amp; conditions</a> and
                <a href="policies/privacy.html" target="_blank" rel="noopener">privacy policy</a>.</span>
            </label>
            <span class="field__error" id="co-terms-err">Please accept the terms and conditions.</span>
          </div>

          <button class="btn btn--block" type="submit" style="margin-top:1.25rem">Place Order Request</button>
          <p class="form-note" style="margin-top:.85rem">
            Submitting creates an order request in this browser. No payment is processed.
          </p>
          <p class="form-status" id="checkout-status" hidden></p>
        </form>

        <!-- ---------------- summary ---------------- -->
        <aside class="checkout__aside">
          <div class="summary">
            <h2 class="summary__title">Order summary</h2>
            <div class="order-lines" id="order-lines"></div>
            <div id="order-totals"></div>
            <p class="summary__note">
              Prices are confirmed with you before dispatch. Delivery charges are set in
              <code>js/products.js</code> under <code>BRAND.delivery</code>.
            </p>
          </div>
        </aside>
      </div>
    </div>

    <!-- ---------------- confirmation ---------------- -->
    <div id="confirmation" hidden>
      <div class="confirmation">
        <div class="confirmation__mark" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>
        </div>
        <p class="eyebrow">Order request received</p>
        <h2 style="margin:.6rem 0 1rem">Thank you — we have your order</h2>
        <p class="muted" id="confirm-copy"></p>
        <p class="confirmation__ref" id="confirm-ref"></p>

        <div class="btn-row" style="justify-content:center;margin-top:2rem" id="confirm-actions"></div>

        <div class="notice" style="margin-top:2.5rem;text-align:left">
          <strong>No payment has been taken.</strong>
          This is a demonstration storefront. Your order request has been saved in this browser and
          is not visible to Tanha&rsquo;s Fashion until a checkout backend is connected.
        </div>

        <div style="margin-top:2rem">
          <a class="link" href="shop.html">Continue shopping <span class="link__arrow" aria-hidden="true">&rarr;</span></a>
        </div>
      </div>
    </div>
  </div>
</section>
""".replace("BAG_SVG", ICON_BAG_S)


# ============================================================ PAGE: wishlist.html
def wishlist_body():
    return """
<section class="section--tight">
  <div class="wrap">
    <nav aria-label="Breadcrumb" style="margin-bottom:1.5rem">
      <ol class="crumbs">
        <li><a href="index.html">Home</a></li>
        <li><span>Wishlist</span></li>
      </ol>
    </nav>

    <div class="sec-head sec-head--split">
      <div>
        <h1 class="page-hero__title" style="margin-top:.4rem">Wishlist</h1>
        <p class="muted" id="wish-count-text" style="margin-top:.5rem"></p>
      </div>
      <div class="sec-head__aside">
        <button class="btn btn--ghost btn--sm" type="button" id="wish-clear" hidden>Clear wishlist</button>
      </div>
    </div>

    <div class="prod-grid" id="wish-grid"></div>

    <div class="empty-state" id="wish-empty" hidden>
      <div class="empty-state__mark">HEART_SVG</div>
      <h2>Your wishlist is empty</h2>
      <p>Tap the heart on any piece to save it here. Your wishlist stays in this browser.</p>
      <a class="btn" href="shop.html">Browse the collection</a>
    </div>
  </div>
</section>
""".replace("HEART_SVG", ICON_HEART_S)


# =============================================================== PAGE: about.html
def about_body():
    return """
<section class="page-hero">
  <div class="wrap">
    <nav aria-label="Breadcrumb">
      <ol class="crumbs"><li><a href="index.html">Home</a></li><li><span>About Us</span></li></ol>
    </nav>
    <h1 class="page-hero__title">About Tanha&rsquo;s Fashion</h1>
    <p class="page-hero__text">
      <span data-brand-tagline>Elegant Wear for Every Woman</span> &mdash;
      <span data-brand-strapline>Elegance in Every Stitch</span>.
    </p>
  </div>
</section>

<section class="section">
  <div class="wrap split split--story">
    <div class="reveal">
      <p class="eyebrow">Who we are</p>
      <h2 style="font-size:var(--fs-h2);margin:.5rem 0 1rem">Premium. Modern. Timeless.</h2>
      <p class="lede">
        Tanha&rsquo;s Fashion is a women&rsquo;s wear label built around a simple promise: elegant
        wear for every woman.
      </p>
      <p style="color:var(--ink-2);margin-top:1rem">
        Our collections follow the season. Lightweight lawn and soft cottons through the summer
        months; printed linen, marina and embroidered suits when the weather turns. Everything we
        sell is ready to wear, so nothing sits in your wardrobe waiting to be stitched.
      </p>
      <p style="color:var(--ink-2)">
        We photograph every piece ourselves, in our own light, with no borrowed stock imagery.
        What you see on this site is the garment we send you.
      </p>
      <div class="btn-row" style="margin-top:2rem">
        <a class="btn" href="shop.html">Shop the collection</a>
        <a class="btn btn--ghost" href="contact.html">Get in touch</a>
      </div>
    </div>
    <div class="story__media reveal">
      <img src="assets/products/tf-007-marina-long-frock-1.jpg"
           alt="Tanha's Fashion marina long frock with a floral print and gold lace detailing"
           width="1000" height="1333" loading="lazy" decoding="async">
    </div>
  </div>
</section>

<section class="section section--porcelain">
  <div class="wrap">
    <div class="sec-head">
      <p class="eyebrow">What guides us</p>
      <h2 class="sec-head__title">How we work</h2>
    </div>
    <div class="values-grid">
      <div class="value reveal">
        <h3>Fabric first</h3>
        <p>Every collection starts with the cloth — lawn, linen, marina, sheesha silk and chiffon —
           chosen for how it wears in this climate, not just how it photographs.</p>
      </div>
      <div class="value reveal">
        <h3>Ready to wear</h3>
        <p>Our suits arrive stitched and finished, with dupattas, trousers and lace detailing
           included as described on each product.</p>
      </div>
      <div class="value reveal">
        <h3>Honest sizing</h3>
        <p>Each product lists only the sizes it is genuinely available in. If a size is not listed,
           it is not available.</p>
      </div>
      <div class="value reveal">
        <h3>Direct and personal</h3>
        <p>Orders are confirmed person to person. Message us and we will tell you honestly what is
           in stock, what it costs and when it will reach you.</p>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap wrap--narrow prose">
    <h2>Add your brand history here</h2>
    <div class="placeholder">
      <strong>Placeholder — replace before publishing</strong>
      We have deliberately not written a founding story, named a founder, described a manufacturing
      process or made any sustainability claim, because none of that was supplied. Add your own
      wording in <code>about.html</code> under this section.
    </div>
  </div>
</section>
"""


# ============================================================= PAGE: contact.html
def contact_body():
    return """
<section class="page-hero">
  <div class="wrap">
    <nav aria-label="Breadcrumb">
      <ol class="crumbs"><li><a href="index.html">Home</a></li><li><span>Contact Us</span></li></ol>
    </nav>
    <h1 class="page-hero__title">Contact Us</h1>
    <p class="page-hero__text">
      Questions about sizing, availability or delivery? Message us — we answer every enquiry
      personally.
    </p>
  </div>
</section>

<section class="section">
  <div class="wrap contact-grid">
    <div>
      <h2 style="font-size:var(--fs-h3);margin-bottom:1.25rem">Send us a message</h2>
      <form id="contact-form" data-form="contact" novalidate>
        <div class="field-row field-row--2">
          <div class="field">
            <label class="field__label" for="ct-name">Full name <span class="req" aria-hidden="true">*</span></label>
            <input class="field__input" id="ct-name" name="name" type="text" autocomplete="name" required aria-describedby="ct-name-err">
            <span class="field__error" id="ct-name-err">Please enter your name.</span>
          </div>
          <div class="field">
            <label class="field__label" for="ct-email">Email address <span class="req" aria-hidden="true">*</span></label>
            <input class="field__input" id="ct-email" name="email" type="email" inputmode="email" autocomplete="email" required aria-describedby="ct-email-err">
            <span class="field__error" id="ct-email-err">Please enter a valid email address.</span>
          </div>
        </div>
        <div class="field">
          <label class="field__label" for="ct-subject">Subject</label>
          <input class="field__input" id="ct-subject" name="subject" type="text">
        </div>
        <div class="field">
          <label class="field__label" for="ct-message">Message <span class="req" aria-hidden="true">*</span></label>
          <textarea class="field__textarea" id="ct-message" name="message" required aria-describedby="ct-message-err" placeholder="Tell us which piece you are interested in, your size, and your city."></textarea>
          <span class="field__error" id="ct-message-err">Please write a short message.</span>
        </div>
        <button class="btn" type="submit" style="margin-top:1.25rem">Send message</button>
        <p class="form-status" id="contact-status" hidden></p>
        <p class="form-note" style="margin-top:.85rem">
          This form is a frontend demonstration. It is not connected to an email service, so nothing
          is delivered. Connect a form endpoint (Formspree, EmailJS, Netlify Forms or your own API)
          to receive real enquiries — see <code>README.md</code>.
        </p>
      </form>
    </div>

    <div>
      <h2 style="font-size:var(--fs-h3);margin-bottom:1.25rem">Details</h2>
      <dl class="contact-list">
        <div class="contact-item">
          <dt>Instagram</dt>
          <dd><a class="link" href="https://www.instagram.com/tanhas.fashion/" data-brand-instagram target="_blank" rel="noopener noreferrer">@tanhas.fashion <span class="link__arrow" aria-hidden="true">&rarr;</span></a>
            <p class="muted" style="font-size:.85rem;margin-top:.35rem">The fastest way to reach us. DM for orders, prices and availability.</p>
          </dd>
        </div>
        <div class="contact-item">
          <dt>Email</dt>
          <dd><a data-brand-email href="#">&mdash;</a></dd>
        </div>
        <div class="contact-item">
          <dt>Phone / WhatsApp</dt>
          <dd><a data-brand-phone href="#">&mdash;</a>
            <p class="muted" style="font-size:.85rem;margin-top:.35rem">
              Add your number to <code>BRAND.phone</code> and <code>BRAND.whatsapp</code> in
              <code>js/products.js</code>.
            </p>
          </dd>
        </div>
        <div class="contact-item">
          <dt>Address</dt>
          <dd><span data-brand-address>&mdash;</span></dd>
        </div>
      </dl>

      <div class="notice" style="margin-top:2rem">
        <strong>Why prices are not listed.</strong>
        Tanha&rsquo;s Fashion confirms price, availability and delivery directly with each customer,
        which is why this storefront shows &ldquo;Price on request&rdquo;. To publish prices instead,
        see <em>PRICE MODE</em> in <code>js/products.js</code>.
      </div>
    </div>
  </div>
</section>
"""


# ============================================================ policy pages
def policy_page(title, crumb, intro, sections, extra_note=None):
    secs = []
    for h, body in sections:
        secs.append(f"<h2>{h}</h2>\n{body}")
    note = f"\n      {extra_note}\n" if extra_note else ""
    return f"""
<section class="page-hero">
  <div class="wrap">
    <nav aria-label="Breadcrumb">
      <ol class="crumbs"><li><a href="index.html">Home</a></li><li><span>{crumb}</span></li></ol>
    </nav>
    <h1 class="page-hero__title">{crumb}</h1>
    <p class="page-hero__text">{intro}</p>
  </div>
</section>

<section class="section">
  <div class="wrap wrap--narrow prose">
    <div class="placeholder">
      <strong>Placeholder policy — replace before publishing</strong>
      This page is a structure, not a policy. Tanha&rsquo;s Fashion has not supplied the wording, so
      no delivery promise, refund window or legal commitment has been invented. Fill in each section
      below with your real terms.{note}
    </div>
    {''.join(secs)}
    <p class="muted" style="margin-top:3rem;font-size:.85rem">
      Last updated: not yet published. Add a date once these terms are confirmed.
    </p>
  </div>
</section>
"""


PH = '<div class="placeholder"><strong>Fill this in</strong>Replace this box with your own wording.</div>'

SHIPPING = [
    ("Order processing", "<p>How quickly do you dispatch an order after it is confirmed?</p>" + PH),
    ("Delivery within Pakistan", "<p>Which cities do you deliver to, and in how many working days?</p>" + PH),
    ("International delivery", "<p>Do you ship outside Pakistan? Which countries, and with which courier?</p>" + PH),
    ("Delivery charges", "<p>What does delivery cost? Is it free above a certain order value? Set the amounts in <code>BRAND.delivery</code> inside <code>js/products.js</code> and this site will use them in the bag and checkout.</p>" + PH),
    ("Tracking", "<p>Do customers receive a tracking number? How is it shared — SMS, WhatsApp, email?</p>" + PH),
    ("Delays", "<p>What happens if a parcel is delayed or lost?</p>" + PH),
]

RETURNS = [
    ("Return window", "<p>How many days does a customer have to request a return or exchange?</p>" + PH),
    ("Condition of returns", "<p>Must the item be unworn, unwashed, with tags attached? Is the original packaging required?</p>" + PH),
    ("Exchanges", "<p>Can customers exchange for a different size or a different piece? Who pays return postage?</p>" + PH),
    ("Non-returnable items", "<p>Are sale items, custom orders or stitched-to-measure pieces excluded?</p>" + PH),
    ("Refunds", "<p>How are refunds issued — bank transfer, store credit, cash on delivery reversal — and how long do they take?</p>" + PH),
    ("Damaged or wrong items", "<p>What should a customer do if the wrong or a faulty piece arrives?</p>" + PH),
]

PRIVACY = [
    ("What we collect", "<p>List the data this site gathers. On the current build: nothing is sent to a server. The shopping bag and wishlist are stored only in your own browser via <code>localStorage</code>.</p>" + PH),
    ("How we use it", "<p>Explain each purpose — order fulfilment, delivery, marketing.</p>" + PH),
    ("Cookies and analytics", "<p>This site currently sets no cookies and loads no third-party analytics or advertising scripts. Update this section if you add any.</p>" + PH),
    ("Sharing with third parties", "<p>Name any courier, payment provider or email service that receives customer data.</p>" + PH),
    ("Your rights", "<p>How can a customer access, correct or delete their data?</p>" + PH),
    ("Contact", "<p>Who should customers write to about privacy?</p>" + PH),
]

TERMS = [
    ("Using this website", "<p>Set out the basic terms of use.</p>" + PH),
    ("Product information", "<p>Describe how products, sizes, colours and availability are presented, and what happens if something is listed incorrectly.</p>" + PH),
    ("Prices and payment", "<p>State how prices are confirmed and which payment methods you accept.</p>" + PH),
    ("Orders and cancellation", "<p>When is an order considered confirmed, and how can it be cancelled?</p>" + PH),
    ("Intellectual property", "<p>Photography and branding ownership.</p>" + PH),
    ("Governing law", "<p>Which country&rsquo;s laws apply?</p>" + PH),
]


# ============================================================== WRITE
def write(rel, content):
    path = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  wrote {rel}  ({len(content)/1024:.1f} KB)")


def main():
    print("Building pages…")

    write("index.html", page(
        "Tanha's Fashion — Elegant Wear for Every Woman",
        "Tanha's Fashion — ready-to-wear eastern wear. Printed linen, marina, sheesha silk and lawn "
        "suits, coordinated sets and long frocks. Order by Instagram DM.",
        index_body(),
        extra_scripts=['<script src="js/shop.js"></script>'],
    ))

    write("shop.html", page(
        "Shop — Tanha's Fashion",
        "Browse every Tanha's Fashion piece. Filter by collection, size and colour; sort by newest or price.",
        shop_body(),
        extra_scripts=['<script src="js/shop.js"></script>'],
    ))

    write("product.html", page(
        "Product — Tanha's Fashion",
        "Product details, sizes, colours and delivery information for this Tanha's Fashion piece.",
        product_body(),
        extra_scripts=['<script src="js/product.js"></script>'],
    ))

    write("cart.html", page(
        "Shopping Bag — Tanha's Fashion",
        "Review the pieces in your Tanha's Fashion shopping bag before checkout.",
        cart_body(),
        extra_scripts=['<script src="js/cart.js"></script>'],
    ))

    write("checkout.html", page(
        "Checkout — Tanha's Fashion",
        "Complete your Tanha's Fashion order request. Demonstration checkout — no payment is taken online.",
        checkout_body(),
        extra_scripts=['<script src="js/checkout.js"></script>'],
    ))

    write("wishlist.html", page(
        "Wishlist — Tanha's Fashion",
        "The Tanha's Fashion pieces you have saved.",
        wishlist_body(),
        extra_scripts=['<script src="js/cart.js"></script>'],
    ))

    write("about.html", page(
        "About Us — Tanha's Fashion",
        "Tanha's Fashion is a women's wear label built on one promise: elegant wear for every woman. "
        "Premium, modern, timeless.",
        about_body(),
    ))

    write("contact.html", page(
        "Contact Us — Tanha's Fashion",
        "Contact Tanha's Fashion for sizing, availability and delivery questions.",
        contact_body(),
    ))

    write("policies/shipping.html", page(
        "Shipping Policy — Tanha's Fashion",
        "Delivery timeframes and charges for Tanha's Fashion orders.",
        policy_page("Shipping", "Shipping Policy",
                    "How and when your order reaches you.", SHIPPING), depth=1,
    ))

    write("policies/returns.html", page(
        "Returns & Exchanges — Tanha's Fashion",
        "How to return or exchange a Tanha's Fashion order.",
        policy_page("Returns", "Returns & Exchanges",
                    "What to do if a piece is not right.", RETURNS), depth=1,
    ))

    write("policies/privacy.html", page(
        "Privacy Policy — Tanha's Fashion",
        "How Tanha's Fashion handles customer data.",
        policy_page("Privacy", "Privacy Policy",
                    "What we collect, why, and what we do with it.", PRIVACY,
                    extra_note="Note: do not claim GDPR, CCPA or any other regulatory compliance "
                               "without taking appropriate legal advice."), depth=1,
    ))

    write("policies/terms.html", page(
        "Terms & Conditions — Tanha's Fashion",
        "The terms that govern use of the Tanha's Fashion website and purchases from it.",
        policy_page("Terms", "Terms & Conditions",
                    "The terms that govern this website and any order placed through it.", TERMS), depth=1,
    ))

    print("Done.")


if __name__ == "__main__":
    main()
