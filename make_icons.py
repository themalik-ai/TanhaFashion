#!/usr/bin/env python3
"""Generate a simple monogram favicon + SVG for Tanha's Fashion."""
from PIL import Image, ImageDraw

IVORY = (251, 248, 244)
INK   = (28, 25, 23)

def monogram(size=512):
    img = Image.new("RGB", (size, size), IVORY)
    d = ImageDraw.Draw(img)
    # thin frame
    m = int(size * 0.075)
    d.rectangle([m, m, size - m, size - m], outline=INK, width=max(2, size // 128))

    # geometric serif "T": crossbar + stem, with small serif feet
    u = size
    bar_w  = int(u * 0.44)
    bar_h  = int(u * 0.075)
    stem_w = int(u * 0.082)
    stem_h = int(u * 0.40)
    cx = u // 2
    top = int(u * 0.30)

    d.rectangle([cx - bar_w // 2, top, cx + bar_w // 2, top + bar_h], fill=INK)          # crossbar
    d.rectangle([cx - stem_w // 2, top, cx + stem_w // 2, top + stem_h + bar_h], fill=INK)  # stem
    # serifs
    d.rectangle([cx - bar_w // 2 - int(u*0.02), top + bar_h,
                 cx - bar_w // 2 + int(u*0.03), top + bar_h + int(u*0.045)], fill=INK)
    d.rectangle([cx + bar_w // 2 - int(u*0.03), top + bar_h,
                 cx + bar_w // 2 + int(u*0.02), top + bar_h + int(u*0.045)], fill=INK)
    foot_y = top + bar_h + stem_h
    d.rectangle([cx - stem_w // 2 - int(u*0.035), foot_y,
                 cx + stem_w // 2 + int(u*0.035), foot_y + int(u*0.035)], fill=INK)
    return img

if __name__ == "__main__":
    base = "/home/user/tanhas-fashion/assets"
    img = monogram(512)
    img.save(f"{base}/favicon.png", "PNG", optimize=True)
    img.resize((180, 180), Image.LANCZOS).save(f"{base}/apple-touch-icon.png", "PNG", optimize=True)
    print("favicon.png + apple-touch-icon.png written")

    svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Tanha's Fashion">
  <rect width="64" height="64" fill="#FBF8F4"/>
  <rect x="5" y="5" width="54" height="54" fill="none" stroke="#1C1917" stroke-width="2"/>
  <g fill="#1C1917">
    <rect x="18" y="19" width="28" height="5"/>
    <rect x="28.5" y="19" width="5" height="27"/>
    <rect x="16" y="24" width="5" height="3"/>
    <rect x="43" y="24" width="5" height="3"/>
    <rect x="24.5" y="46" width="13" height="2.5"/>
  </g>
</svg>
'''
    open(f"{base}/favicon.svg", "w").write(svg)
    print("favicon.svg written")
