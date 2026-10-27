/* =============================================================================
   TANHA'S FASHION — PRODUCT CATALOGUE  (single source of truth)
   -----------------------------------------------------------------------------
   Every product below was transcribed from a real public post on
   https://www.instagram.com/tanhas.fashion/  (account name: "Tanha's_clothing",
   bio: "Elegant Wear for Every Woman ✨ / Premium • Modern • Timeless").

   NOTHING IN THIS FILE IS INVENTED.
     • Names, descriptions and detail lines are the brand's own caption copy.
     • Sizes appear ONLY where the caption states them.
     • Colours appear ONLY where the caption names them.
     • Prices are `null` because no price has ever been published on the account
       (customers are told to DM for price). See PRICE MODE below.
     • Stock notes quote the caption ("Limited stock available"). Nothing is
       marked out of stock, because nothing has been confirmed sold out.

   -----------------------------------------------------------------------------
   HOW TO ADD A PRODUCT
     1. Copy any block below, change the id / slug / name.
     2. Put your photographs in assets/products/ named  <slug>-1.jpg, -2.jpg ...
        and list them in `images`. Delete the number to drop an image.
     3. Add the slug's categories from CATEGORIES below.
   -----------------------------------------------------------------------------
   HOW TO ADD PRICES  ->  see PRICE MODE in this file.
   ========================================================================== */

/* -----------------------------------------------------------------------------
   BRAND — editable, one place.
   Contact details are EMPTY ON PURPOSE: the Instagram account publishes no
   email, phone or address. Fill them in and every page, form and checkout
   confirmation will start using them automatically.
----------------------------------------------------------------------------- */
const BRAND = {
  name: "Tanha's Fashion",
  shortName: 'Tanhas',
  handle: '@tanhas.fashion',
  instagramUrl: 'https://www.instagram.com/tanhas.fashion/',

  /* Verified from the Instagram bio / caption sign-offs */
  tagline: 'Elegant Wear for Every Woman',
  strapline: 'Elegance in Every Stitch',
  positioning: ['Premium', 'Modern', 'Timeless'],

  /* ---------- EDIT ME: real business contact details ---------- */
  email: '',          // e.g. 'hello@tanhasfashion.com'
  phone: '',          // e.g. '+92 300 1234567'
  whatsapp: '',       // digits only, international format, e.g. '923001234567'
  address: '',        // street / shop address
  city: '',
  country: 'Pakistan',

  /* ---------- EDIT ME: announcement bar (leave '' to hide the bar) ---------- */
  announcement: '',   // e.g. 'Complimentary delivery on orders over Rs. 8,000'

  /* ---------- Money ---------- */
  currency: 'PKR',
  currencySymbol: 'Rs.',
  currencyCode: 'PKR',

  /* ---------------------------------------------------------------------------
     PRICE MODE  —  'enquiry'  |  'catalogue'

     'enquiry'   (default, and the honest setting today)
        Every product price is null, so the storefront shows
        "Price on request" and an enquiry button instead of a number.
        Price filters and price sorting switch themselves off automatically.

     'catalogue'
        Set `price` on each product below (a plain number, no commas, no
        symbols) and flip this to 'catalogue'. Prices, price filters,
        price sorting, cart subtotals and checkout totals all switch on.
  --------------------------------------------------------------------------- */
  priceMode: 'enquiry',

  /* ---------- EDIT ME: delivery (used by cart + checkout) ---------- */
  delivery: {
    standard: { label: 'Standard delivery', fee: null },   // null = "calculated at confirmation"
    express:  { label: 'Express delivery',  fee: null },
    freeOver: null                                          // e.g. 8000
  }
};

/* -----------------------------------------------------------------------------
   CATEGORIES — taken from the collections the account actually posts about
   (New Arrivals / Winter / Summer / Eastern / Formal / Festive / Everyday /
   Best Sellers).
----------------------------------------------------------------------------- */
const CATEGORIES = [
  { slug: 'new-arrivals',      name: 'New Arrivals',      blurb: 'The most recent pieces added to the rails.',                 sort: 1 },
  { slug: 'winter-collection', name: 'Winter Collection', blurb: 'Linen, marina and khaddar-weight pieces for the cold months.', sort: 2 },
  { slug: 'summer-collection', name: 'Summer Collection', blurb: 'Breathable lawn and lightweight cottons.',                  sort: 3 },
  { slug: 'eastern-wear',      name: 'Eastern Wear',      blurb: 'Shalwar kameez, kurtis and coordinated separates.',         sort: 4 },
  { slug: 'formal-wear',       name: 'Formal Wear',       blurb: 'Considered pieces for events, Eid and special occasions.',  sort: 5 },
  { slug: 'festive-collection',name: 'Festive Collection',blurb: 'Lace, embroidery and occasion dressing.',                   sort: 6 },
  { slug: 'everyday-wear',     name: 'Everyday Wear',     blurb: 'Comfortable, classy looks for daily wear.',                 sort: 7 },
  { slug: 'best-sellers',      name: 'Best Sellers',      blurb: 'The most-loved posts on our Instagram.',                    sort: 8 }
];

/* Instagram engagement (likes) is used to order Best Sellers only, because no
   sales data was supplied. Documented in README. */

/* -----------------------------------------------------------------------------
   PRODUCTS
----------------------------------------------------------------------------- */
const PRODUCTS = [

  /* ------------------------------------------------------------------ */
  {
    id: 'tf-001',
    slug: 'black-elegance-two-piece-outfit',
    name: 'Black Elegance Two-Piece Outfit',
    subtitle: 'Black kurti with a printed palazzo',
    price: null,
    categories: ['new-arrivals', 'eastern-wear', 'everyday-wear'],
    pieceType: '2-Piece Suit',
    fabric: null,
    includes: 'Kurti + printed palazzo',
    colors: [{ name: 'Black', hex: '#17161a' }],
    sizes: ['S', 'M', 'L'],
    inStock: true,
    stockNote: null,
    featured: true,
    newArrival: true,
    instagramLikes: 6,
    postedOn: '2026-10-12',
    instagramUrl: 'https://www.instagram.com/p/DeaM1lmo7Se/',
    images: [
      'assets/products/tf-001-black-elegance-two-piece-outfit-1.jpg',
      'assets/products/tf-001-black-elegance-two-piece-outfit-2.jpg'
    ],
    alt: "Tanha's Fashion black kurti paired with a black and white printed palazzo",
    description:
      'Elegant black kurti with a trendy printed palazzo. A beautiful black kurti styled with a ' +
      'black and white printed palazzo for a comfortable and classy look. Perfect for casual wear, ' +
      'outings and everyday elegance.',
    details: [
      'Black kurti',
      'Black and white printed palazzo',
      'Comfortable and classy look',
      'Perfect for casual wear, outings and everyday elegance'
    ],
    care: null
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'tf-002',
    slug: 'navy-blue-floral-co-ord-set',
    name: 'Navy Blue Floral Co-Ord Set',
    subtitle: 'Floral Winter Collection',
    price: null,
    categories: ['new-arrivals', 'winter-collection', 'everyday-wear'],
    pieceType: 'Co-Ord Set',
    fabric: null,
    includes: 'Co-ordinated set',
    colors: [{ name: 'Navy Blue', hex: '#2c2f45' }],
    sizes: ['S', 'M', 'L'],
    inStock: true,
    stockNote: null,
    featured: true,
    newArrival: true,
    instagramLikes: 9,
    postedOn: '2026-10-09',
    instagramUrl: 'https://www.instagram.com/p/DeSEM5woKEF/',
    images: [
      'assets/products/tf-002-navy-blue-floral-co-ord-set-1.jpg',
      'assets/products/tf-002-navy-blue-floral-co-ord-set-2.jpg'
    ],
    alt: "Tanha's Fashion navy blue floral co-ord set with lace detailing",
    description:
      'An elegant navy blue floral co-ord set with a beautiful floral print and elegant lace ' +
      'details. Perfect for a stylish winter look.',
    details: [
      'Navy blue floral co-ord set',
      'Beautiful floral print with elegant lace details',
      'Perfect for a stylish winter look'
    ],
    care: null
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'tf-003',
    slug: 'premium-beige-black-two-piece-suit',
    name: 'Premium Beige & Black Two-Piece Suit',
    subtitle: 'Embroidered winter suit',
    price: null,
    categories: ['new-arrivals', 'winter-collection', 'eastern-wear', 'formal-wear'],
    pieceType: '2-Piece Suit',
    fabric: null,
    includes: 'Embroidered shirt + trousers + dupatta',
    colors: [{ name: 'Beige & Black', hex: '#c8ab86' }],
    sizes: ['S', 'M', 'L'],
    inStock: true,
    stockNote: null,
    featured: true,
    newArrival: true,
    instagramLikes: 5,
    postedOn: '2026-10-09',
    instagramUrl: 'https://www.instagram.com/p/DeSDvxJIL5I/',
    images: [
      'assets/products/tf-003-premium-beige-black-two-piece-suit-1.jpg',
      'assets/products/tf-003-premium-beige-black-two-piece-suit-2.jpg'
    ],
    alt: "Tanha's Fashion beige shirt with black embroidery, black trousers and a black dupatta",
    description:
      'An elegant beige shirt with beautiful black embroidery, paired with black trousers and a ' +
      'graceful black dupatta. Perfect for a classy winter look.',
    details: [
      'Beige shirt with black embroidery',
      'Black trousers',
      'Graceful black dupatta',
      'Season: Winter Collection',
      'Style: Elegant and sophisticated'
    ],
    care: null
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'tf-004',
    slug: 'sheesha-silk-three-piece-suit-formal',
    name: 'Sheesha Silk Three-Piece Suit',
    subtitle: 'Formal Collection, with chiffon dupatta',
    price: null,
    categories: ['formal-wear', 'festive-collection', 'eastern-wear'],
    pieceType: '3-Piece Suit',
    fabric: 'Sheesha Silk',
    includes: 'Short shirt + trouser + chiffon dupatta',
    colors: [],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    inStock: true,
    stockNote: 'Limited stock available',
    featured: false,
    newArrival: false,
    instagramLikes: 13,
    postedOn: '2026-08-30',
    instagramUrl: 'https://www.instagram.com/p/DcrDFFEjsk2/',
    images: [
      'assets/products/tf-004-sheesha-silk-three-piece-suit-formal-1.jpg',
      'assets/products/tf-004-sheesha-silk-three-piece-suit-formal-2.jpg'
    ],
    alt: "Tanha's Fashion sheesha silk three-piece formal suit with a chiffon dupatta",
    description:
      'An elegant and trendy Sheesha Silk three-piece suit with a chiffon dupatta, perfect for ' +
      'girls and women. Lightweight, breathable and stylish — best for events and outings.',
    details: [
      'Fabric: Sheesha Silk',
      'Dupatta: Chiffon',
      'Very beautiful short shirt',
      'Soft and breathable fabric',
      'Lightweight and comfortable wear',
      'Best for events and outings'
    ],
    care: null
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'tf-005',
    slug: 'timeless-three-piece-linen-suit',
    name: 'Timeless Three-Piece Linen Suit',
    subtitle: 'Printed kameez with a chiffon dupatta',
    price: null,
    categories: ['winter-collection', 'eastern-wear', 'festive-collection'],
    pieceType: '3-Piece Suit',
    fabric: 'Linen (kameez & shalwar), chiffon dupatta',
    includes: 'Kameez + shalwar + chiffon dupatta',
    colors: [],
    sizes: [],
    inStock: true,
    stockNote: null,
    featured: true,
    newArrival: false,
    instagramLikes: 11,
    postedOn: '2026-08-26',
    instagramUrl: 'https://www.instagram.com/p/DcgX_nHoPS0/',
    images: [
      'assets/products/tf-005-timeless-three-piece-linen-suit-1.jpg',
      'assets/products/tf-005-timeless-three-piece-linen-suit-2.jpg'
    ],
    alt: "Tanha's Fashion printed linen shalwar kameez with black shalwar and a chiffon dupatta",
    description:
      'A statement three-piece linen shalwar kameez featuring a striking printed kameez paired ' +
      'with a classic black shalwar and a graceful chiffon dupatta. Finished with vibrant red ' +
      'lace detailing for the perfect touch of elegance and sophistication.',
    details: [
      'Fabric: Linen kameez and shalwar, chiffon dupatta',
      'Type: 3-Piece suit',
      'Includes: Kameez + shalwar + chiffon dupatta',
      'Red lace detailing',
      'Perfect for winter wear, festive gatherings and everyday looks'
    ],
    care: null
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'tf-006',
    slug: 'printed-linen-two-piece-suit',
    name: 'Printed Linen Two-Piece Suit',
    subtitle: 'Floral kameez with wide-leg trousers',
    price: null,
    categories: ['winter-collection', 'eastern-wear', 'everyday-wear'],
    pieceType: '2-Piece Suit',
    fabric: 'Printed Linen',
    includes: 'Printed kameez + printed linen trousers',
    colors: [],
    sizes: [],
    inStock: true,
    stockNote: null,
    featured: false,
    newArrival: false,
    instagramLikes: 12,
    postedOn: '2026-08-26',
    instagramUrl: 'https://www.instagram.com/p/DcgXfImoNFW/',
    images: [
      'assets/products/tf-006-printed-linen-two-piece-suit-1.jpg',
      'assets/products/tf-006-printed-linen-two-piece-suit-2.jpg'
    ],
    alt: "Tanha's Fashion printed linen two-piece suit with wide-leg trousers",
    description:
      'A beautiful printed linen two-piece suit featuring a graceful floral-print kameez paired ' +
      'with matching wide-leg printed linen trousers. Finished with delicate lace detailing on ' +
      'the sleeves and hem for an effortlessly elegant look.',
    details: [
      'Fabric: Printed linen',
      'Type: 2-Piece suit',
      'Includes: Printed kameez + printed linen trousers',
      'Lace detailing on sleeves and hem',
      'Perfect for comfortable, stylish everyday wear'
    ],
    care: null
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'tf-007',
    slug: 'marina-long-frock',
    name: 'Marina Long Frock',
    subtitle: 'Floral print with gold lace',
    price: null,
    categories: ['winter-collection', 'formal-wear', 'festive-collection'],
    pieceType: 'Long Frock',
    fabric: 'Marina',
    includes: 'Long frock',
    colors: [],
    sizes: [],
    inStock: true,
    stockNote: null,
    featured: false,
    newArrival: false,
    instagramLikes: 11,
    postedOn: '2026-08-26',
    instagramUrl: 'https://www.instagram.com/p/DcgXQvXoBaT/',
    images: [
      'assets/products/tf-007-marina-long-frock-1.jpg',
      'assets/products/tf-007-marina-long-frock-2.jpg'
    ],
    alt: "Tanha's Fashion marina long frock with a floral print and gold lace detailing",
    description:
      'A graceful marina long frock featuring an elegant floral print and a beautifully flowing ' +
      'silhouette. Finished with delicate gold-coloured lace detailing on the sleeves and hem, ' +
      'adding a refined touch to this timeless look.',
    details: [
      'Fabric: Marina',
      'Style: Long frock',
      'Gold lace on sleeves and hem',
      'Perfect for winter gatherings, festive occasions and everyday elegance'
    ],
    care: null
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'tf-008',
    slug: 'linen-two-piece-suit',
    name: 'Linen Two-Piece Suit',
    subtitle: 'Solid kameez with a printed shalwar',
    price: null,
    categories: ['summer-collection', 'eastern-wear', 'everyday-wear'],
    pieceType: '2-Piece Suit',
    fabric: 'Linen',
    includes: 'Solid kameez + printed linen shalwar',
    colors: [],
    sizes: [],
    inStock: true,
    stockNote: null,
    featured: false,
    newArrival: false,
    instagramLikes: 10,
    postedOn: '2026-08-26',
    instagramUrl: 'https://www.instagram.com/p/DcgW2FYoCN8/',
    images: [
      'assets/products/tf-008-linen-two-piece-suit-1.jpg',
      'assets/products/tf-008-linen-two-piece-suit-2.jpg'
    ],
    alt: "Tanha's Fashion linen two-piece suit with a solid kameez and printed shalwar",
    description:
      'A chic two-piece linen suit featuring a sophisticated solid-coloured kameez paired with a ' +
      'stylish printed linen shalwar. The perfect blend of simplicity and statement style — ' +
      'comfortable, elegant and effortlessly graceful for everyday wear.',
    details: [
      'Fabric: Linen',
      'Type: 2-Piece suit',
      'Includes: Solid kameez + printed linen shalwar',
      'Comfortable, elegant and gracefully simple'
    ],
    care: null
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'tf-009',
    slug: 'floral-lawn-two-piece-suit',
    name: 'Floral Lawn Two-Piece Suit',
    subtitle: 'Orange floral print with a flared pajama',
    price: null,
    categories: ['summer-collection', 'eastern-wear', 'everyday-wear'],
    pieceType: '2-Piece Suit',
    fabric: 'Lawn',
    includes: 'Long straight shirt + straight flared pajama',
    colors: [{ name: 'Orange', hex: '#d08a45' }],
    sizes: [],
    inStock: true,
    stockNote: null,
    featured: false,
    newArrival: false,
    instagramLikes: 13,
    postedOn: '2026-08-09',
    instagramUrl: 'https://www.instagram.com/p/Db0k6FLovJX/',
    images: [
      'assets/products/tf-009-floral-lawn-two-piece-suit-1.jpg',
      'assets/products/tf-009-floral-lawn-two-piece-suit-2.jpg'
    ],
    alt: "Tanha's Fashion orange floral lawn two-piece suit with a straight flared pajama",
    description:
      'A beautiful long straight shirt featuring a delicate orange floral print, finished with ' +
      'elegant orange lace detailing on the sleeves and hem. Paired with a straight flared pajama ' +
      'for a graceful and comfortable summer look.',
    details: [
      'Long straight shirt',
      'Delicate orange floral print',
      'Orange lace detailing on sleeves and hem',
      'Straight flared pajama',
      'Made for your everyday summer wardrobe'
    ],
    care: null
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'tf-010',
    slug: 'premium-lawn-three-piece-suit',
    name: 'Premium Lawn Three-Piece Suit',
    subtitle: 'Summer collection, with a chiffon dupatta',
    price: null,
    categories: ['summer-collection', 'eastern-wear', 'festive-collection'],
    pieceType: '3-Piece Suit',
    fabric: 'Lawn (shirt & trouser), chiffon dupatta with lace border',
    includes: 'Shirt + trouser + chiffon dupatta',
    colors: [],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    inStock: true,
    stockNote: 'Limited stock available',
    featured: false,
    newArrival: false,
    instagramLikes: 15,
    postedOn: '2026-08-06',
    instagramUrl: 'https://www.instagram.com/p/DbtuqsjIuvR/',
    images: [
      'assets/products/tf-010-premium-lawn-three-piece-suit-1.jpg',
      'assets/products/tf-010-premium-lawn-three-piece-suit-2.jpg'
    ],
    alt: "Tanha's Fashion premium lawn three-piece suit with a chiffon dupatta",
    description:
      'An elegant and trendy lawn three-piece suit with a premium summer lawn shirt, matching lawn ' +
      'trouser and a soft, flowing chiffon dupatta finished with a lace border. Beautiful lace ' +
      'detailing on the shirt and trouser with elegant organza patchwork for a premium look.',
    details: [
      'Fabric: Lawn (shirt and trouser)',
      'Dupatta: Chiffon with lace border',
      'Lace detailing on shirt and trouser',
      'Elegant organza patchwork',
      'Lightweight, soft and breathable',
      'Fine stitching and guaranteed premium quality'
    ],
    care: null
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'tf-011',
    slug: 'sheesha-silk-three-piece-suit-premium',
    name: 'Sheesha Silk Three-Piece Suit',
    subtitle: 'Premium Collection — two colours available',
    price: null,
    categories: ['formal-wear', 'festive-collection', 'eastern-wear'],
    pieceType: '3-Piece Suit',
    fabric: 'Sheesha Silk (long shirt & trouser), chiffon dupatta',
    includes: 'Long shirt + straight trouser + chiffon dupatta',
    colors: [],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    inStock: true,
    stockNote: 'Limited stock available',
    featured: false,
    newArrival: false,
    instagramLikes: 15,
    postedOn: '2026-08-06',
    instagramUrl: 'https://www.instagram.com/p/Dbttrjzo95C/',
    images: [
      'assets/products/tf-011-sheesha-silk-three-piece-suit-premium-1.jpg',
      'assets/products/tf-011-sheesha-silk-three-piece-suit-premium-2.jpg'
    ],
    alt: "Tanha's Fashion sheesha silk three-piece suit from the premium collection",
    description:
      'An elegant and timeless Sheesha Silk three-piece suit with a premium long shirt, matching ' +
      'straight trouser and a soft, flowing chiffon dupatta. Elegant and minimal in design. ' +
      'Two colours available.',
    details: [
      'Fabric: Sheesha Silk (long shirt and trouser)',
      'Dupatta: Chiffon',
      'Elegant and minimal design',
      'Soft, comfortable and premium quality fabric',
      'Perfect for office wear, casual gatherings, Eid and special occasions',
      'Two colours available'
    ],
    care: null
  }
];

/* -----------------------------------------------------------------------------
   Derived helpers — do not edit.
----------------------------------------------------------------------------- */
const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const PRODUCTS_BY_SLUG = PRODUCTS.reduce((m, p) => (m[p.slug] = p, m), {});
const PRODUCTS_BY_ID   = PRODUCTS.reduce((m, p) => (m[p.id] = p, m), {});

function getProduct(slugOrId) {
  return PRODUCTS_BY_SLUG[slugOrId] || PRODUCTS_BY_ID[slugOrId] || null;
}

/* Best Sellers = most-liked Instagram posts (no sales data was supplied). */
function bestSellers(limit) {
  const list = [...PRODUCTS].sort((a, b) => b.instagramLikes - a.instagramLikes);
  return limit ? list.slice(0, limit) : list;
}

function newArrivals(limit) {
  const list = [...PRODUCTS]
    .filter(p => p.newArrival)
    .sort((a, b) => (a.postedOn < b.postedOn ? 1 : -1));
  return limit ? list.slice(0, limit) : list;
}

function productsIn(categorySlug) {
  return PRODUCTS.filter(p => p.categories.includes(categorySlug));
}

function relatedTo(product, limit = 4) {
  if (!product) return [];
  const scored = PRODUCTS
    .filter(p => p.id !== product.id)
    .map(p => ({
      p,
      score: p.categories.filter(c => product.categories.includes(c)).length
    }))
    .sort((a, b) => b.score - a.score || b.p.instagramLikes - a.p.instagramLikes);
  return scored.slice(0, limit).map(s => s.p);
}

/* Prices actually present in the catalogue (empty while PRICE MODE = enquiry). */
function pricedProducts() {
  return PRODUCTS.filter(p => typeof p.price === 'number' && isFinite(p.price));
}
function priceRange() {
  const priced = pricedProducts().map(p => p.price);
  if (!priced.length) return null;
  return { min: Math.min(...priced), max: Math.max(...priced) };
}

/* All distinct sizes / colours that genuinely exist in the catalogue. */
function allSizes() {
  const set = new Set();
  PRODUCTS.forEach(p => p.sizes.forEach(s => set.add(s)));
  return SIZE_ORDER.filter(s => set.has(s));
}
function allColors() {
  const seen = new Map();
  PRODUCTS.forEach(p => p.colors.forEach(c => {
    if (!seen.has(c.name)) seen.set(c.name, c.hex);
  }));
  return [...seen].map(([name, hex]) => ({ name, hex }));
}
