from playwright.sync_api import sync_playwright

JS = r"""
() => {
  const lum = (r,g,b) => { const a=[r,g,b].map(v=>{v/=255; return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});
    return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2]; };
  const parse = c => (c.match(/[\d.]+/g)||[]).map(Number);
  const bgOf = el => { let n=el; while(n && n!==document.documentElement){ const c=getComputedStyle(n).backgroundColor;
      const p=parse(c); if(p.length>=3 && (p[3]===undefined||p[3]>0.5)) return p; n=n.parentElement; } return [255,255,255]; };
  const out=[];
  document.querySelectorAll('h1,h2,h3,h4,p,a,span,button,label,li,dd,dt,td,th,em,strong,small').forEach(el=>{
    const t=(el.textContent||'').trim();
    if(!t || el.offsetParent===null) return;
    // text sitting on a photographic scrim is verified separately
    if(el.closest('.coll-tile__body') || el.closest('.ig-item__overlay')) return;
    if(el.children.length && !Array.from(el.childNodes).some(n=>n.nodeType===3&&n.textContent.trim())) return;
    const cs=getComputedStyle(el);
    if(cs.visibility==='hidden') return;
    const fg=parse(cs.color), bgc=bgOf(el);
    if(fg[3]===0) return;
    // fold any element opacity into the effective foreground
    let op=1, n=el; while(n && n!==document.documentElement){ op*=parseFloat(getComputedStyle(n).opacity); n=n.parentElement; }
    if(op < 0.05) return;            // not visible yet (scroll-reveal)
    const eff = fg.slice(0,3).map((v,i)=> v*op + bgc[i]*(1-op));
    const L1=lum(eff[0],eff[1],eff[2]), L2=lum(bgc[0],bgc[1],bgc[2]);
    const ratio=(Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);
    const size=parseFloat(cs.fontSize), weight=parseInt(cs.fontWeight)||400;
    const large = size>=24 || (size>=18.66 && weight>=700);
    const need = large?3:4.5;
    if(ratio < need) out.push({tag:el.tagName, cls:(el.className||'').toString().slice(0,44),
      text:t.slice(0,40), ratio:+ratio.toFixed(2), need, size:+size.toFixed(1)});
  });
  return out;
}
"""

def worst_case_overlay():
    """Verify the scrim math for text over photography (lightest possible photo)."""
    def lin(v):
        v/=255.0
        return v/12.92 if v<=0.03928 else ((v+0.055)/1.055)**2.4
    def L(rgb): return 0.2126*lin(rgb[0])+0.7152*lin(rgb[1])+0.0722*lin(rgb[2])
    def ratio(a,b):
        la,lb=L(a),L(b); hi,lo=max(la,lb),min(la,lb); return (hi+0.05)/(lo+0.05)
    ink=(28,25,23); white=(255,255,255); ivory=(251,248,244)
    def comp(alpha, photo=white):  # ink scrim over photo
        return tuple(alpha*ink[i]+(1-alpha)*photo[i] for i in range(3))
    print("\n  Text over photography — worst case (pure-white photo):")
    for label, alpha in [("collection tile, title row (bottom ~8%)", 0.84),
                         ("collection tile, blurb row (bottom ~28%)", 0.75),
                         ("instagram like pill", 0.82)]:
        bg = comp(alpha)
        r = ratio(ivory, bg)
        flag = "PASS" if r >= 4.5 else "FAIL"
        print(f"    {flag}  scrim {alpha:.2f} → ivory contrast {r:.2f}:1  ({label})")

with sync_playwright() as pw:
    b=pw.chromium.launch(); total=0
    for w,name in [(1440,"desktop"),(390,"mobile")]:
        p=b.new_context(viewport={"width":w,"height":900}).new_page()
        print(f"\n===== {name} ({w}px) =====")
        for url in ["index.html","shop.html","product.html?p=marina-long-frock","cart.html",
                    "checkout.html","wishlist.html","about.html","contact.html",
                    "policies/shipping.html","policies/returns.html","policies/privacy.html"]:
            p.goto("http://localhost:8000/"+url, wait_until="networkidle")
            p.evaluate("""async () => { for (let y=0; y<document.body.scrollHeight; y+=500) {
                window.scrollTo(0,y); await new Promise(r=>setTimeout(r,30)); } window.scrollTo(0,0); }""")
            p.wait_for_timeout(700)
            bad = p.evaluate(JS); total += len(bad)
            if bad:
                print(f"  {url}: {len(bad)} below AA")
                seen=set()
                for x in bad:
                    k=(x['tag'],x['cls'],x['ratio'])
                    if k in seen: continue
                    seen.add(k)
                    print(f"     {x['ratio']:>5} (need {x['need']}) {x['tag']}.{x['cls']} {x['size']}px — “{x['text']}”")
            else:
                print(f"  {url}: OK")
    worst_case_overlay()
    print(f"\nTOTAL below AA: {total}")
    b.close()
