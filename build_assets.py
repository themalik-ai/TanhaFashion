#!/usr/bin/env python3
"""
Tanhas Fashion — asset pipeline.
Takes the original Instagram photographs downloaded in scraped/ and produces
optimised, consistently-ratioed web assets in tanhas-fashion/assets/.
No image is invented: every output is a crop/resize of a real brand photograph.
"""
import os, shutil
from PIL import Image, ImageOps

SRC = "/home/user/scraped/full"
FRAMES = "/home/user/scraped/frames"
OUT = "/home/user/tanhas-fashion/assets"

PRODUCTS = [
    # (slug, source filename, second source or None for a generated detail crop)
    ("tf-001-noor-black-kurti-palazzo",  "p01.jpg", None),
    ("tf-002-sitara-navy-floral-coord",  "p02.jpg", None),
    ("tf-003-amira-beige-black-suit",    "p03.jpg", None),
    ("tf-004-roshni-sheesha-silk-3pc",   "p04.jpg", None),
    ("tf-005-mehreen-linen-3pc",         "p05.jpg", None),
    ("tf-006-gulnar-printed-linen-2pc",  "p06.jpg", None),
    ("tf-007-marina-long-frock",    "p07.jpg", None),
    ("tf-008-sana-linen-2pc",            "p08.jpg", None),
    ("tf-009-anaaya-floral-lawn-2pc",    "p09.jpg", "p10.jpg"),
    ("tf-010-hiba-premium-lawn-3pc",     "p11.jpg", None),
    ("tf-011-sheesha-silk-three-piece-suit-premium",    "p12.jpg", None),
]

COLLECTIONS = [
    ("new-arrivals",      "p01.jpg"),
    ("winter-collection", "p03.jpg"),
    ("eastern-wear",      "p05.jpg"),
    ("formal-wear",       "p12.jpg"),
    ("festive-collection","p07.jpg"),
    ("best-sellers",      "p11.jpg"),
    ("everyday-wear",     "p06.jpg"),
    ("summer-collection", "p09.jpg"),
]

HERO = [("hero-main", "p07.jpg"), ("hero-editorial", "p05.jpg")]

PW, PH = 1000, 1333          # product image 3:4
CW, CH = 800, 1000           # collection tile 4:5
HW, HH = 1400, 1750          # hero 4:5


def fit(im, w, h, anchor=(0.5, 0.35)):
    """Cover-crop to w:h, anchored so the subject stays in frame, then resize."""
    im = ImageOps.exif_transpose(im).convert("RGB")
    tw, th = im.size
    target = w / h
    if tw / th > target:                      # source too wide -> crop sides
        nw = int(round(th * target))
        x = int((tw - nw) * anchor[0])
        im = im.crop((x, 0, x + nw, th))
    else:                                      # source too tall -> crop height
        nh = int(round(tw / target))
        y = int((th - nh) * anchor[1])
        im = im.crop((0, y, tw, y + nh))
    return im.resize((w, h), Image.LANCZOS)


def detail(im, w, h):
    """A genuine close-up crop taken from the original photograph (no synthesis)."""
    im = ImageOps.exif_transpose(im).convert("RGB")
    tw, th = im.size
    target = w / h
    cw = int(tw * 0.62)                       # zoom to ~62% of the frame width
    ch = int(cw / target)
    if ch > th:
        ch = th
        cw = int(ch * target)
    x = int((tw - cw) * 0.5)
    y = int(th * 0.34)                        # bias toward the garment, not the floor/ceiling
    y = max(0, min(y, th - ch))
    return im.crop((x, y, x + cw, y + ch)).resize((w, h), Image.LANCZOS)


def save(im, path, quality=84):
    im.save(path, "JPEG", quality=quality, optimize=True, progressive=True)
    return os.path.getsize(path)


def main():
    for sub in ("products", "collections", "hero", "logo"):
        os.makedirs(f"{OUT}/{sub}", exist_ok=True)

    total = 0
    # --- products -------------------------------------------------------
    for slug, src, second in PRODUCTS:
        im = Image.open(f"{SRC}/{src}")
        total += save(fit(im, PW, PH), f"{OUT}/products/{slug}-1.jpg")
        if second:
            total += save(fit(Image.open(f"{SRC}/{second}"), PW, PH),
                          f"{OUT}/products/{slug}-2.jpg")
        else:
            total += save(detail(im, PW, PH), f"{OUT}/products/{slug}-2.jpg", 82)
        print(f"  product  {slug}")

    # --- collections ----------------------------------------------------
    for slug, src in COLLECTIONS:
        total += save(fit(Image.open(f"{SRC}/{src}"), CW, CH),
                      f"{OUT}/collections/{slug}.jpg", 83)
        print(f"  collection {slug}")

    # --- hero -----------------------------------------------------------
    for slug, src in HERO:
        total += save(fit(Image.open(f"{SRC}/{src}"), HW, HH, anchor=(0.5, 0.25)),
                      f"{OUT}/hero/{slug}.jpg", 86)
        print(f"  hero {slug}")

    # --- logo / profile -------------------------------------------------
    prof = Image.open("/home/user/scraped/full/profile.jpg").convert("RGB")
    prof = prof.resize((320, 320), Image.LANCZOS)
    total += save(prof, f"{OUT}/logo/instagram-profile.jpg", 92)
    print("  logo instagram-profile.jpg")

    # --- open graph -----------------------------------------------------
    og = fit(Image.open(f"{SRC}/p07.jpg"), 1200, 630, anchor=(0.5, 0.3))
    total += save(og, f"{OUT}/og-image.jpg", 82)
    print("  og-image.jpg")

    print(f"\nTOTAL {total/1024/1024:.2f} MB")


if __name__ == "__main__":
    main()
