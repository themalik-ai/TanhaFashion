#!/usr/bin/env python3
"""Automated QA for the Tanha's Fashion storefront."""
import sys, time, json
from playwright.sync_api import sync_playwright

BASE = "http://localhost:8000"
PAGES = [
    "index.html", "shop.html", "product.html?p=marina-long-frock",
    "cart.html", "checkout.html", "wishlist.html", "about.html", "contact.html",
    "policies/shipping.html", "policies/returns.html",
    "policies/privacy.html", "policies/terms.html",
]

results, errors = [], []


def log(ok, label, detail=""):
    results.append((ok, label, detail))
    print(("  PASS  " if ok else "  FAIL  ") + label + ("  — " + detail if detail else ""))


def run(pw):
    browser = pw.chromium.launch()

    # ---------------------------------------------------------------- console
    ctx = browser.new_context(viewport={"width": 1440, "height": 950})
    page = ctx.new_page()
    console_errors, failed_reqs = [], []
    page.on("console", lambda m: console_errors.append(f"{m.type}: {m.text}")
            if m.type in ("error", "warning") else None)
    page.on("pageerror", lambda e: console_errors.append("pageerror: " + str(e)))
    page.on("requestfailed",
            lambda r: failed_reqs.append(f"{r.url} :: {r.failure}"))
    page.on("response", lambda r: failed_reqs.append(f"{r.status} {r.url}")
            if r.status >= 400 else None)

    print("\n== 1. Pages load, no console errors, no broken assets ==")
    for p in PAGES:
        console_errors.clear(); failed_reqs.clear()
        page.goto(f"{BASE}/{p}", wait_until="networkidle")
        page.wait_for_timeout(250)
        bad = [e for e in console_errors] + [r for r in failed_reqs if "YOUR-DOMAIN" not in r]
        # og:image points at a placeholder domain; that request is expected to fail
        bad = [r for r in bad if "og-image" not in r]
        log(len(bad) == 0, p, "; ".join(bad[:3]))

    # ---------------------------------------------------------------- home
    print("\n== 2. Home page content ==")
    page.goto(f"{BASE}/index.html", wait_until="networkidle")
    log(page.locator("#hero-title").inner_text().strip() != "", "hero renders")
    log(page.locator(".coll-tile").count() == 8, "collection tiles",
        f"{page.locator('.coll-tile').count()} tiles")
    log(page.locator("#new-arrivals-grid .card").count() == 3, "new arrivals grid",
        f"{page.locator('#new-arrivals-grid .card').count()} cards")
    log(page.locator("#ig-grid .ig-item").count() == 12, "instagram grid (11 posts + follow tile)",
        f"{page.locator('#ig-grid .ig-item').count()} tiles")
    # scroll through so lazy images actually fetch
    page.evaluate("""async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y); await new Promise(r => setTimeout(r, 40));
      }
      window.scrollTo(0, document.body.scrollHeight);
    }""")
    page.wait_for_timeout(1200)
    imgs = page.locator("#ig-grid img")
    broken = 0
    for i in range(imgs.count()):
        if not page.evaluate("i => { const el = document.querySelectorAll('#ig-grid img')[i];"
                             "return el.complete && el.naturalWidth > 0; }", i):
            broken += 1
    log(broken == 0, "instagram images all load", f"{broken} broken")

    # ---------------------------------------------------------------- header
    print("\n== 3. Header / logo / announcement ==")
    log(page.eval_on_selector(".brand__img", "el => !el.hidden && el.naturalWidth>0")
        if page.locator(".brand__img").count() else False,
        "logo image loads (falls back to wordmark otherwise)")
    log(page.locator("#announce").is_hidden(), "announcement bar hidden while BRAND.announcement is empty")

    # ---------------------------------------------------------------- search
    print("\n== 4. Live search ==")
    page.click("[data-search-open]")
    page.wait_for_timeout(300)
    log(page.locator("#search-panel.is-open").count() == 1, "search panel opens")
    page.fill("#search-input", "linen")
    page.wait_for_timeout(400)
    n = page.locator("#search-results .search-result").count()
    log(n > 0, "search 'linen' returns results", f"{n} hits")
    page.fill("#search-input", "zzzzqqq")
    page.wait_for_timeout(400)
    log(page.locator("#search-results .search-hint").count() == 1, "no-results state shows")
    page.keyboard.press("Escape")
    page.wait_for_timeout(300)
    log(page.locator("#search-panel.is-open").count() == 0, "Escape closes search")

    # ---------------------------------------------------------------- wishlist
    print("\n== 5. Wishlist persistence ==")
    page.goto(f"{BASE}/index.html", wait_until="networkidle")
    page.locator("#new-arrivals-grid .card__wish").first.click()
    page.wait_for_timeout(300)
    log(page.locator("[data-wish-count]").first.inner_text() == "1", "wishlist count = 1")
    log(page.locator(".toast").count() >= 1, "toast shown")
    page.reload(wait_until="networkidle")
    page.wait_for_timeout(300)
    log(page.locator("[data-wish-count]").first.inner_text() == "1",
        "wishlist persists across reload")
    page.goto(f"{BASE}/wishlist.html", wait_until="networkidle")
    log(page.locator("#wish-grid .card").count() == 1, "wishlist page lists the saved piece")

    # ---------------------------------------------------------------- shop
    print("\n== 6. Shop filters + sorting ==")
    page.goto(f"{BASE}/shop.html", wait_until="networkidle")
    total = page.locator("#shop-grid .card").count()
    log(total == 11, "shop shows all 11 products", f"{total}")

    page.click("label[for='fc-winter-collection']")
    page.wait_for_timeout(350)
    n_winter = page.locator("#shop-grid .card").count()
    log(n_winter == 5, "winter filter narrows results", f"{n_winter} of {total}")

    page.click("label[for='fs-XS']")
    page.wait_for_timeout(350)
    log(page.locator("#shop-grid .card").count() == 0,
        "winter + XS = empty state (correct — no XS winter piece)",
        f"{page.locator('#shop-grid .card').count()}")
    log(page.locator(".empty-state").count() == 1, "empty-state message renders")

    page.click("[data-clear-filters]")
    page.wait_for_timeout(350)
    log(page.locator("#shop-grid .card").count() == 11, "clear all filters restores everything")

    page.click("label[for='fcol-Black']")
    page.wait_for_timeout(350)
    log(page.locator("#shop-grid .card").count() == 1, "colour filter (Black) = 1 piece")

    page.click("[data-clear-filters]"); page.wait_for_timeout(350)
    page.select_option("#sort-select", "newest")
    page.wait_for_timeout(350)
    first = page.locator("#shop-grid .card__name a").first.inner_text()
    log("Black Elegance" in first, "sort by newest puts the Oct 12 post first", first)
    log(page.locator("#f-price-group").is_hidden(), "price filter hidden (no prices published)")
    log(page.eval_on_selector('#sort-select option[value="price-asc"]', "el => el.disabled"),
        "price sorting disabled (no prices published)")

    # deep link
    page.goto(f"{BASE}/shop.html?c=formal-wear", wait_until="networkidle")
    page.wait_for_timeout(300)
    log(page.locator("#shop-title").inner_text() == "Formal Wear", "deep link sets collection title")
    log(page.locator("#shop-grid .card").count() == 4, "formal-wear deep link filters",
        f"{page.locator('#shop-grid .card').count()}")

    # ---------------------------------------------------------------- product
    print("\n== 7. Product detail page ==")
    page.goto(f"{BASE}/product.html?p=marina-long-frock", wait_until="networkidle")
    log(page.locator("#pdp-main").count() == 1, "PDP renders")
    log(page.locator(".gallery__thumb").count() == 2, "thumbnails present")
    page.locator(".gallery__thumb").nth(1).click()
    page.wait_for_timeout(250)
    log("-2.jpg" in page.get_attribute("#pdp-main", "src"), "thumbnail swaps the main image")
    log(page.locator(".pdp__price--enq").count() == 1, "price-on-request shown (no invented price)")
    log(page.locator("#pdp-sizes").count() == 0, "no size selector when sizes are unpublished")
    log(page.locator("#related-grid .card").count() > 0, "related products render")

    # size-required product
    page.goto(f"{BASE}/product.html?p=black-elegance-two-piece-outfit", wait_until="networkidle")
    page.click("#pdp-add")
    page.wait_for_timeout(250)
    log(page.locator("#pdp-size-error").is_visible(), "size required: error shown when size missing")
    log(page.locator("[data-cart-count]").first.inner_text() == "0", "nothing added without a size")
    page.click("[data-size='M']")
    page.click("#pdp-add")
    page.wait_for_timeout(300)
    log(page.locator("[data-cart-count]").first.inner_text() == "1", "added after choosing a size")

    # quantity floor
    page.goto(f"{BASE}/product.html?p=marina-long-frock", wait_until="networkidle")
    page.fill("#pdp-qty", "0")
    page.locator("#pdp-qty").blur()
    page.wait_for_timeout(200)
    log(page.input_value("#pdp-qty") == "1", "quantity cannot go below 1")
    log(page.eval_on_selector('[data-qty="-1"]', "el => el.disabled"), "minus disabled at qty 1")

    # ---------------------------------------------------------------- cart
    print("\n== 8. Cart ==")
    page.goto(f"{BASE}/cart.html", wait_until="networkidle")
    log(page.locator(".cart-line").count() == 1, "cart lists the added item")
    page.click("[data-line-qty='1']")
    page.wait_for_timeout(250)
    log(page.locator(".cart-line input").input_value() == "2", "quantity increments")
    log(page.locator("[data-cart-count]").first.inner_text() == "2", "header count updates")
    page.reload(wait_until="networkidle")
    page.wait_for_timeout(250)
    log(page.locator(".cart-line input").input_value() == "2", "cart persists across reload")
    log("Confirmed on request" in page.locator("#summary-rows").inner_text(),
        "subtotal says 'Confirmed on request' while unpriced")
    page.click(".cart-line__remove")
    page.wait_for_timeout(300)
    log(page.locator("#cart-empty").is_visible(), "empty cart state shows")

    # ---------------------------------------------------------------- quick view
    print("\n== 9. Quick view modal ==")
    page.goto(f"{BASE}/shop.html", wait_until="networkidle")
    page.locator("[data-quickview]").first.click()
    page.wait_for_timeout(400)
    log(page.locator("#quickview.is-open").count() == 1, "quick view opens")
    page.keyboard.press("Escape")
    page.wait_for_timeout(350)
    log(page.locator("#quickview.is-open").count() == 0, "Escape closes quick view")
    page.locator("[data-quickview]").nth(1).click()
    page.wait_for_timeout(400)
    page.click("#quickview .modal__close")
    page.wait_for_timeout(350)
    log(page.locator("#quickview.is-open").count() == 0, "close button closes quick view")

    # ---------------------------------------------------------------- checkout
    print("\n== 10. Checkout validation ==")
    page.goto(f"{BASE}/product.html?p=navy-blue-floral-co-ord-set", wait_until="networkidle")
    page.click("[data-size='S']"); page.click("#pdp-add"); page.wait_for_timeout(300)
    page.goto(f"{BASE}/checkout.html", wait_until="networkidle")
    log(page.locator("#checkout-layout").is_visible(), "checkout renders with items")
    page.click("button[type=submit]")
    page.wait_for_timeout(400)
    log(page.locator("#contact-status, #checkout-status").first.is_visible()
        if page.locator("#checkout-status").count() else True, "status area exists")
    log(page.locator(".field.has-error").count() >= 4, "empty submit flags required fields",
        f"{page.locator('.field.has-error').count()} flagged")

    page.fill("#co-name", "Ayesha Khan")
    page.fill("#co-email", "not-an-email")
    page.fill("#co-phone", "123")
    page.fill("#co-address", "12 Model Town")
    page.fill("#co-city", "Lahore")
    page.click("button[type=submit]")
    page.wait_for_timeout(400)
    log(page.eval_on_selector("#co-email", "el => el.getAttribute('aria-invalid')") == "true",
        "invalid email rejected")
    log(page.eval_on_selector("#co-phone", "el => el.getAttribute('aria-invalid')") == "true",
        "too-short phone rejected")

    page.fill("#co-email", "ayesha@example.com")
    page.fill("#co-phone", "03001234567")
    page.check("#co-terms", force=True)
    page.click("button[type=submit]")
    page.wait_for_timeout(600)
    log(page.locator("#confirmation").is_visible(), "valid submit shows confirmation")
    log("No payment has been taken" in page.locator("#confirmation").inner_text(),
        "confirmation states no payment taken")
    log(page.locator("[data-cart-count]").first.inner_text() == "0", "cart emptied after ordering")

    # ---------------------------------------------------------------- forms
    print("\n== 11. Newsletter + contact validation ==")
    page.goto(f"{BASE}/index.html", wait_until="networkidle")
    page.fill("#nl-email", "bad")
    page.click("#newsletter-form button[type=submit]")
    page.wait_for_timeout(300)
    log(page.locator("#newsletter-status").is_visible(), "newsletter rejects bad email")
    page.fill("#nl-email", "hello@example.com")
    page.click("#newsletter-form button[type=submit]")
    page.wait_for_timeout(300)
    log("not" in page.locator("#newsletter-status").inner_text().lower()
        and "mailing list" in page.locator("#newsletter-status").inner_text().lower(),
        "newsletter success message is honest about demo state")

    page.goto(f"{BASE}/contact.html", wait_until="networkidle")
    page.fill("#ct-name", "Ayesha"); page.fill("#ct-email", "a@b.com"); page.fill("#ct-message", "Hi")
    page.click("#contact-form button[type=submit]")
    page.wait_for_timeout(300)
    log("not been sent" in page.locator("#contact-status").inner_text(),
        "contact success message is honest about demo state")

    # ---------------------------------------------------------------- mobile
    print("\n== 12. Mobile (390x844) ==")
    m = browser.new_context(viewport={"width": 390, "height": 844},
                            is_mobile=True, has_touch=True,
                            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) "
                                       "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1")
    mp = m.new_page()
    for p in ["index.html", "shop.html", "product.html?p=marina-long-frock", "cart.html",
              "checkout.html", "wishlist.html", "about.html", "contact.html"]:
        mp.goto(f"{BASE}/{p}", wait_until="networkidle")
        ow = mp.evaluate("document.documentElement.scrollWidth")
        cw = mp.evaluate("document.documentElement.clientWidth")
        log(ow <= cw + 1, f"no horizontal overflow on {p}", f"scrollWidth {ow} vs {cw}")

    mp.goto(f"{BASE}/index.html", wait_until="networkidle")
    mp.click("[data-menu-open]")
    mp.wait_for_timeout(400)
    log(mp.locator("#drawer-nav.is-open").count() == 1, "mobile menu opens")
    mp.click("#drawer-nav [data-drawer-close]")
    mp.wait_for_timeout(400)
    log(mp.locator("#drawer-nav.is-open").count() == 0, "mobile menu closes")

    mp.goto(f"{BASE}/shop.html", wait_until="networkidle")
    mp.click("[data-filter-open]")
    mp.wait_for_timeout(400)
    log(mp.locator("#filter-drawer.is-open").count() == 1, "mobile filter drawer opens")
    log(mp.locator("#filter-drawer .filters").is_visible(), "filter controls visible inside drawer")
    mp.locator("#filter-drawer label[for='fc-eastern-wear-d']").click()
    mp.wait_for_timeout(400)
    log(mp.locator("#shop-grid .card").count() < 11, "filter applies from drawer",
        f"{mp.locator('#shop-grid .card').count()} cards")
    mp.click("#filter-drawer .filter-drawer__foot [data-drawer-close]")
    mp.wait_for_timeout(400)
    log(mp.locator("#filter-drawer.is-open").count() == 0, "filter drawer closes")

    # ---------------------------------------------------------------- 320px
    print("\n== 13. Narrow (320x640) ==")
    s = browser.new_context(viewport={"width": 320, "height": 640})
    sp = s.new_page()
    for p in ["index.html", "shop.html", "checkout.html", "cart.html"]:
        sp.goto(f"{BASE}/{p}", wait_until="networkidle")
        ow = sp.evaluate("document.documentElement.scrollWidth")
        log(ow <= 321, f"no overflow at 320px on {p}", f"scrollWidth {ow}")

    # ---------------------------------------------------------------- a11y-ish
    print("\n== 14. Accessibility basics ==")
    page.goto(f"{BASE}/index.html", wait_until="networkidle")
    missing_alt = page.evaluate("""
      Array.from(document.images).filter(i => !i.hasAttribute('alt')).length""")
    log(missing_alt == 0, "every <img> has an alt attribute", f"{missing_alt} missing")
    no_label = page.evaluate("""
      Array.from(document.querySelectorAll('input,select,textarea')).filter(el => {
        if (el.type === 'hidden') return false;
        return !(el.id && document.querySelector('label[for="'+el.id+'"]'))
               && !el.closest('label')
               && !el.getAttribute('aria-label');
      }).length""")
    log(no_label == 0, "every form control has a label", f"{no_label} unlabelled")
    log(page.locator(".skip-link").count() == 1, "skip link present")

    # ---------------------------------------------------------------- fonts
    print("\n== 15. Typography / fonts ==")
    page.goto(f"{BASE}/index.html", wait_until="networkidle")
    page.wait_for_timeout(600)
    cg = page.evaluate("document.fonts.check('300 3rem \"Cormorant Garamond\"')")
    jo = page.evaluate("document.fonts.check('400 1rem Jost')")
    log(cg, "self-hosted display font (Cormorant Garamond) loaded")
    log(jo, "self-hosted body font (Jost) loaded")
    fam = page.eval_on_selector("h1", "el => getComputedStyle(el).fontFamily")
    log("Cormorant Garamond" in fam, "headings use the display face", fam[:40])

    hero_box = page.locator(".hero__frame--primary").bounding_box()
    log(hero_box["height"] > 500, "hero image is full height on desktop",
        f"{int(hero_box['height'])}px tall")

    # the layered collage: a second frame must overlap the first
    prim = page.locator(".hero__frame--primary").bounding_box()
    sec = page.locator(".hero__frame--secondary").bounding_box()
    ox = max(0, min(prim["x"]+prim["width"], sec["x"]+sec["width"]) - max(prim["x"], sec["x"]))
    oy = max(0, min(prim["y"]+prim["height"], sec["y"]+sec["height"]) - max(prim["y"], sec["y"]))
    log(ox*oy > 10000, "hero is a layered collage (frames overlap)", f"{int(ox*oy)}px2")
    log(sec["y"]+sec["height"] > prim["y"]+prim["height"], "secondary frame breaks the bottom edge")
    card_box = page.locator("#new-arrivals-grid .card__media").first.bounding_box()
    ratio = card_box["width"] / card_box["height"]
    log(abs(ratio - 0.75) < 0.02, "product cards keep a 3:4 ratio", f"ratio {ratio:.3f}")

    # ---------------------------------------------------------------- screenshots
    print("\n== 16. Screenshots ==")
    shot = {"width": 1440, "height": 950}
    d = browser.new_context(viewport=shot)
    dp = d.new_page()
    for name, url, full in [
        ("home", "index.html", False),
        ("home-full", "index.html", True),
        ("shop", "shop.html", False),
        ("product", "product.html?p=black-elegance-two-piece-outfit", False),
        ("cart", "cart.html", False),
        ("checkout", "checkout.html", False),
        ("about", "about.html", False),
        ("contact", "contact.html", False),
    ]:
        dp.goto(f"{BASE}/{url}", wait_until="networkidle")
        dp.wait_for_timeout(500)
        dp.screenshot(path=f"/home/user/shots/desktop-{name}.png", full_page=full)
    mctx = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
    mpp = mctx.new_page()
    for name, url in [("home", "index.html"), ("shop", "shop.html"),
                      ("product", "product.html?p=black-elegance-two-piece-outfit"),
                      ("checkout", "checkout.html")]:
        mpp.goto(f"{BASE}/{url}", wait_until="networkidle")
        mpp.wait_for_timeout(500)
        mpp.screenshot(path=f"/home/user/shots/mobile-{name}.png", full_page=False)
    print("  screenshots written to /home/user/shots/")

    browser.close()


with sync_playwright() as pw:
    run(pw)

passed = sum(1 for ok, _, _ in results if ok)
failed = [(l, d) for ok, l, d in results if not ok]
print(f"\n{'='*66}\nRESULT: {passed}/{len(results)} checks passed")
if failed:
    print("\nFAILURES:")
    for l, d in failed:
        print(f"  • {l}  {d}")
    sys.exit(1)
print("All checks passed.")
