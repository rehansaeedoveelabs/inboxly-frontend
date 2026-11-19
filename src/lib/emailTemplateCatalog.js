/**
 * Built-in email template gallery for merchants.
 * Documents use the same block schema as store EmailTemplate rows.
 * Placeholders: {{shop_name}}, {{first_name}}, {{discount_code}}
 */

let blockSeq = 0

function bid(prefix = 'blk') {
  blockSeq += 1
  return `${prefix}_${blockSeq}`
}

/**
 * Premium multi-section email document.
 * @param {{
 *   background?: string,
 *   accent?: string,
 *   surface?: string,
 *   ink?: string,
 *   muted?: string,
 *   shopLabel?: string,
 *   eyebrow?: string,
 *   headline: string,
 *   subhead?: string,
 *   body: string,
 *   highlight?: string,
 *   ctaLabel: string,
 *   ctaHref?: string,
 *   footer?: string,
 *   align?: 'left' | 'center',
 * }} opts
 */
export function buildEmailDocument(opts) {
  const {
    background = '#f7f5f2',
    accent = '#0f3d2e',
    surface = '#ffffff',
    ink = '#141414',
    muted = '#5c5c5c',
    shopLabel = '{{shop_name}}',
    eyebrow = '',
    headline,
    subhead = '',
    body,
    highlight = '',
    ctaLabel,
    ctaHref = 'https://example.com',
    footer = '{{shop_name}} · {{address}}, {{city}}, {{country}}<br>Unsubscribe · Email preferences',
    align = 'center',
  } = opts

  const bannerHtml =
    `<div style="background:${accent};color:#ffffff;padding:36px 32px;text-align:${align};">` +
    `<p style="margin:0 0 14px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;opacity:0.88;">${shopLabel}</p>` +
    (eyebrow
      ? `<p style="margin:0 0 10px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.9;">${eyebrow}</p>`
      : '') +
    `<p style="margin:0;font-size:28px;line-height:1.25;font-weight:700;letter-spacing:-0.02em;">${headline}</p>` +
    (subhead
      ? `<p style="margin:14px 0 0;font-size:15px;line-height:1.5;opacity:0.92;">${subhead}</p>`
      : '') +
    `</div>`

  const bodyHtml =
    `<div style="background:${surface};padding:8px 8px 0;text-align:${align};color:${ink};">` +
    `<p style="margin:0;font-size:15px;line-height:1.65;color:${muted};">${body}</p>` +
    `</div>`

  const blocks = [
    { id: bid('hdr'), type: 'header', props: { html: bannerHtml, align } },
    { id: bid('sp1'), type: 'spacer', props: { height: 24 } },
    { id: bid('txt'), type: 'text', props: { html: bodyHtml, align } },
  ]

  if (highlight) {
    blocks.push(
      { id: bid('sp2'), type: 'spacer', props: { height: 16 } },
      {
        id: bid('hi'),
        type: 'text',
        props: {
          html:
            `<div style="background:${surface};border:1px solid ${accent}22;border-radius:10px;padding:18px 20px;text-align:center;">` +
            `<p style="margin:0;font-size:14px;line-height:1.55;color:${ink};">${highlight}</p>` +
            `</div>`,
          align: 'center',
        },
      },
    )
  }

  blocks.push(
    { id: bid('sp3'), type: 'spacer', props: { height: 20 } },
    { id: bid('btn'), type: 'button', props: { label: ctaLabel, href: ctaHref } },
    { id: bid('sp4'), type: 'spacer', props: { height: 12 } },
    { id: bid('div'), type: 'divider', props: {} },
    {
      id: bid('ftr'),
      type: 'footer',
      props: {
        html: `<p style="margin:0;color:${muted};font-size:12px;line-height:1.6;">${footer}</p>`,
        align: 'center',
      },
    },
  )

  return {
    version: 1,
    settings: { width: 600, background },
    blocks,
  }
}

/** Replace merge tags in a string for live merchant preview. */
export function personalizeMergeTags(value, vars = {}) {
  if (typeof value !== 'string') return value
  const shopName = vars.shopName || 'Your shop'
  const firstName = vars.firstName || 'Alex'
  const discountCode = vars.discountCode || 'SAVE20'
  const address = vars.address || '123 Market Street'
  const city = vars.city || 'San Francisco'
  const country = vars.country || 'USA'

  const tag = (name) => new RegExp(`\\{\\{\\s*${name}\\s*\\}\\}`, 'gi')

  return value
    .replace(tag('shop_name'), shopName)
    .replace(tag('first_name'), firstName)
    .replace(tag('discount_code'), discountCode)
    .replace(tag('address'), address)
    .replace(tag('city'), city)
    .replace(tag('country'), country)
    .replaceAll('[shop_name]', shopName)
}

/** Clone document and replace merge tags for live merchant preview. */
export function personalizeEmailDocument(document, vars = {}) {
  const walk = (node) => {
    if (Array.isArray(node)) return node.map(walk)
    if (node && typeof node === 'object') {
      const out = {}
      for (const [key, value] of Object.entries(node)) {
        out[key] = walk(value)
      }
      return out
    }
    return personalizeMergeTags(node, vars)
  }

  return walk(structuredClone(document))
}

export const EMAIL_TEMPLATE_STYLES = [
  { id: 'standard', label: 'Standard', blurb: 'Clean and reliable' },
  { id: 'savvy', label: 'Savvy', blurb: 'Bold campaign energy' },
  { id: 'essential', label: 'Essential', blurb: 'Minimal & refined' },
  { id: 'premium', label: 'Premium', blurb: 'Luxe editorial look' },
]

export const EMAIL_TEMPLATE_CATEGORIES = [
  { id: 'all', label: 'All templates' },
  { id: 'yours', label: 'Your templates' },
  { id: 'welcome', label: 'Welcome & engage' },
  { id: 'post_purchase', label: 'Post-purchase' },
  { id: 'abandoned_cart', label: 'Abandoned cart' },
  { id: 'promotional', label: 'Promote products' },
  { id: 'winback', label: 'Win-back & retention' },
  { id: 'referral', label: 'Referral & loyalty' },
  { id: 'seasonal', label: 'Seasonal & occasions' },
  { id: 'feedback', label: 'Feedback & reviews' },
]

/**
 * @typedef {{
 *   id: string,
 *   name: string,
 *   style: 'standard' | 'savvy' | 'essential' | 'premium',
 *   category: string,
 *   accent: string,
 *   background: string,
 *   badge?: string,
 *   headline: string,
 *   teaser: string,
 *   document: object,
 * }} BuiltinEmailTemplate
 */

function tpl(partial) {
  const document = buildEmailDocument({
    accent: partial.accent,
    background: partial.background,
    surface: partial.surface,
    ink: partial.ink,
    muted: partial.muted,
    eyebrow: partial.eyebrow,
    headline: partial.headline,
    subhead: partial.subhead,
    body: partial.body,
    highlight: partial.highlight,
    ctaLabel: partial.ctaLabel,
    footer: partial.footer,
  })
  return {
    id: partial.id,
    name: partial.name,
    style: partial.style,
    category: partial.category,
    accent: partial.accent,
    background: partial.background,
    badge: partial.badge || null,
    headline: partial.headline,
    teaser: partial.teaser,
    document,
  }
}

/** @type {BuiltinEmailTemplate[]} */
export const BUILTIN_EMAIL_TEMPLATES = [
  // —— Welcome ——
  tpl({
    id: 'welcome-hello',
    name: 'Welcome — say hello',
    style: 'standard',
    category: 'welcome',
    accent: '#0f3d2e',
    background: '#f4f7f5',
    badge: 'Popular',
    eyebrow: 'Welcome series',
    headline: 'Welcome to {{shop_name}}, {{first_name}}',
    subhead: 'Your first order perk is waiting.',
    body: 'Thanks for joining us. We hand-picked a few favorites to get you started — and a little something for your first checkout.',
    highlight: 'Use code <strong>{{discount_code}}</strong> for 15% off your first order.',
    ctaLabel: 'Start shopping',
    teaser: 'Warm welcome with a first-purchase perk.',
  }),
  tpl({
    id: 'welcome-series-2',
    name: 'Welcome — our story',
    style: 'savvy',
    category: 'welcome',
    accent: '#16324f',
    background: '#eef3f8',
    eyebrow: 'Day 2',
    headline: 'What makes {{shop_name}} different',
    subhead: 'Crafted for people who care about the details.',
    body: 'Hi {{first_name}}, we built {{shop_name}} around quality you can feel and service that actually answers. Explore the pieces our customers reorder most.',
    ctaLabel: 'Meet the bestsellers',
    teaser: 'Brand story follow-up for day 2.',
  }),
  tpl({
    id: 'welcome-vip-perk',
    name: 'Welcome — VIP perk',
    style: 'essential',
    category: 'welcome',
    accent: '#1f2937',
    background: '#f8fafc',
    eyebrow: 'Member perk',
    headline: 'Your {{shop_name}} welcome gift',
    body: '{{first_name}}, unlock free shipping on your first order. No fuss — just a better start.',
    highlight: 'Code <strong>{{discount_code}}</strong> · free shipping',
    ctaLabel: 'Claim gift',
    teaser: 'Minimal welcome with exclusive perk.',
  }),
  tpl({
    id: 'welcome-editorial',
    name: 'Welcome — editorial',
    style: 'premium',
    category: 'welcome',
    accent: '#111111',
    background: '#f7f5f2',
    badge: 'Premium',
    eyebrow: 'New member',
    headline: '{{first_name}}, you are on the list',
    subhead: 'Early access, private drops, and considered recommendations.',
    body: 'Welcome to {{shop_name}}. Expect fewer emails — and better ones. Start with this season’s edit, curated for you.',
    highlight: 'Private welcome code: <strong>{{discount_code}}</strong>',
    ctaLabel: 'Enter the edit',
    teaser: 'Luxe editorial welcome for premium brands.',
  }),

  // —— Post-purchase ——
  tpl({
    id: 'order-thanks',
    name: 'Order thank you',
    style: 'standard',
    category: 'post_purchase',
    accent: '#0f3d2e',
    background: '#f4f7f5',
    eyebrow: 'Order confirmed',
    headline: 'Thanks for your order, {{first_name}}',
    body: 'We are preparing your {{shop_name}} package with care. You will hear from us again the moment it ships.',
    ctaLabel: 'View order',
    teaser: 'Confirm purchase and set expectations.',
  }),
  tpl({
    id: 'order-out-for-delivery',
    name: 'Out for delivery',
    style: 'savvy',
    category: 'post_purchase',
    accent: '#0c4a6e',
    background: '#eef8ff',
    eyebrow: 'Delivery day',
    headline: 'Your order is out for delivery',
    subhead: 'It should arrive today.',
    body: 'Hi {{first_name}}, keep an eye on the door — your {{shop_name}} package is on its way.',
    ctaLabel: 'Track package',
    teaser: 'Delivery-day excitement.',
  }),
  tpl({
    id: 'order-cross-sell',
    name: 'Post-purchase cross-sell',
    style: 'essential',
    category: 'post_purchase',
    accent: '#7c2d12',
    background: '#fff7ed',
    eyebrow: 'Pairs well with',
    headline: 'Complete the look',
    body: '{{first_name}}, customers who bought what you did also loved these picks from {{shop_name}}.',
    highlight: 'Take 10% off your next order with <strong>{{discount_code}}</strong>',
    ctaLabel: 'Shop matches',
    teaser: 'Suggest complementary products.',
  }),
  tpl({
    id: 'order-unboxing',
    name: 'Unboxing moment',
    style: 'premium',
    category: 'post_purchase',
    accent: '#1c1917',
    background: '#f5f5f4',
    badge: 'Premium',
    eyebrow: 'Arrived',
    headline: 'How does it feel, {{first_name}}?',
    subhead: 'A note from {{shop_name}} after delivery.',
    body: 'We hope the unboxing lived up to the wait. If anything is off, reply to this email — a real person will help.',
    ctaLabel: 'Share a photo',
    teaser: 'Premium post-delivery care note.',
  }),

  // —— Abandoned cart ——
  tpl({
    id: 'cart-reminder',
    name: 'Cart reminder',
    style: 'standard',
    category: 'abandoned_cart',
    accent: '#9f1239',
    background: '#fff1f2',
    badge: 'High converting',
    eyebrow: 'Still in your bag',
    headline: 'You left something behind, {{first_name}}',
    body: 'Your cart at {{shop_name}} is waiting. Finish checkout before favorites sell out.',
    ctaLabel: 'Return to cart',
    teaser: 'Friendly first cart reminder.',
  }),
  tpl({
    id: 'cart-social-proof',
    name: 'Cart — others are buying',
    style: 'savvy',
    category: 'abandoned_cart',
    accent: '#881337',
    background: '#ffffff',
    eyebrow: 'Almost gone',
    headline: 'Others are grabbing what you left',
    body: '{{first_name}}, popular items in your {{shop_name}} cart are moving fast. Secure yours now.',
    ctaLabel: 'Complete order',
    teaser: 'Urgency + social proof.',
  }),
  tpl({
    id: 'cart-incentive',
    name: 'Cart — incentive',
    style: 'essential',
    category: 'abandoned_cart',
    accent: '#9a3412',
    background: '#fff7ed',
    eyebrow: 'A little nudge',
    headline: 'Still thinking it over?',
    body: 'We saved your cart at {{shop_name}}. Here is a gentle nudge to finish what you started.',
    highlight: '<strong>{{discount_code}}</strong> · 10% off for the next 24 hours',
    ctaLabel: 'Checkout with discount',
    teaser: 'Discount to recover the cart.',
  }),
  tpl({
    id: 'cart-luxe-save',
    name: 'Cart — reserved for you',
    style: 'premium',
    category: 'abandoned_cart',
    accent: '#0f172a',
    background: '#f8fafc',
    badge: 'Premium',
    eyebrow: 'Reserved',
    headline: 'We held your selection, {{first_name}}',
    subhead: 'Your {{shop_name}} bag is ready when you are.',
    body: 'No pressure — just a reminder that the pieces you chose are still available. Complete checkout whenever it feels right.',
    ctaLabel: 'Resume checkout',
    teaser: 'Quiet, premium cart recovery.',
  }),

  // —— Promotional ——
  tpl({
    id: 'promo-summer',
    name: 'Summer fever',
    style: 'standard',
    category: 'promotional',
    accent: '#14532d',
    background: '#f0fdf4',
    eyebrow: 'Season edit',
    headline: 'The summer fever is live on {{shop_name}}',
    subhead: 'Hot deals. Cool finds.',
    body: '{{first_name}}, sunny picks are here — light layers, fresh colors, and limited runs.',
    highlight: 'Code <strong>{{discount_code}}</strong> before they melt away',
    ctaLabel: 'Shop summer',
    teaser: 'Seasonal promo blast.',
  }),
  tpl({
    id: 'promo-clearance',
    name: 'Clearance up to 75% off',
    style: 'savvy',
    category: 'promotional',
    accent: '#7f1d1d',
    background: '#fef2f2',
    eyebrow: 'Final call',
    headline: 'Clearance — up to 75% off',
    body: 'Final markdowns at {{shop_name}}. {{first_name}}, grab what is left while sizes last.',
    ctaLabel: 'Shop clearance',
    teaser: 'High-urgency clearance.',
  }),
  tpl({
    id: 'promo-new-arrivals',
    name: 'New arrivals',
    style: 'essential',
    category: 'promotional',
    accent: '#155e75',
    background: '#ecfeff',
    eyebrow: 'Just dropped',
    headline: 'Look what is new at {{shop_name}}',
    body: 'Hi {{first_name}}, fresh pieces just landed. Be first to browse the new arrival rack.',
    ctaLabel: 'See new arrivals',
    teaser: 'Fresh drops announcement.',
  }),
  tpl({
    id: 'promo-flash',
    name: 'Flash sale 24 hours',
    style: 'standard',
    category: 'promotional',
    accent: '#b91c1c',
    background: '#ffffff',
    eyebrow: '24 hours only',
    headline: 'Flash sale at {{shop_name}}',
    body: '{{first_name}}, for the next day only — extra savings on selected favorites.',
    highlight: 'Use <strong>{{discount_code}}</strong> at checkout',
    ctaLabel: 'Shop the flash',
    teaser: 'Short window promo.',
  }),
  tpl({
    id: 'promo-price-drop',
    name: 'Wishlist price drop',
    style: 'savvy',
    category: 'promotional',
    accent: '#854d0e',
    background: '#fefce8',
    eyebrow: 'Price drop',
    headline: 'Something on your list got better',
    body: 'Good news, {{first_name}} — an item you liked at {{shop_name}} just dropped in price.',
    ctaLabel: 'Buy now',
    teaser: 'Wishlist / browse abandonment.',
  }),
  tpl({
    id: 'promo-collection-launch',
    name: 'Collection launch',
    style: 'premium',
    category: 'promotional',
    accent: '#171717',
    background: '#fafaf9',
    badge: 'Premium',
    eyebrow: 'New collection',
    headline: 'Introducing the {{shop_name}} atelier edit',
    subhead: 'Quiet luxury, considered materials.',
    body: '{{first_name}}, the new collection is live. Limited quantities — designed to last beyond the season.',
    ctaLabel: 'Explore the collection',
    teaser: 'Premium collection launch announcement.',
  }),
  tpl({
    id: 'promo-announce-sale',
    name: 'Announce a sale',
    style: 'premium',
    category: 'promotional',
    accent: '#1e3a2f',
    background: '#f3f6f4',
    badge: 'Premium',
    eyebrow: 'Members first',
    headline: 'Private sale access for {{first_name}}',
    subhead: 'Up to 40% off before it opens to everyone.',
    body: 'As a {{shop_name}} insider, you get first look. Save your favorites before the public launch.',
    highlight: 'Early access code <strong>{{discount_code}}</strong>',
    ctaLabel: 'Shop the private sale',
    teaser: 'Premium early-access sale invite.',
  }),

  // —— Win-back ——
  tpl({
    id: 'winback-miss-you',
    name: 'We miss you',
    style: 'standard',
    category: 'winback',
    accent: '#3b0764',
    background: '#f5f3ff',
    eyebrow: 'It has been a while',
    headline: 'We miss you, {{first_name}}',
    body: 'Come back to {{shop_name}} and see what is new — we saved a welcome-back offer for you.',
    highlight: 'Code <strong>{{discount_code}}</strong> · 48 hours only',
    ctaLabel: 'Come back',
    teaser: 'Re-engagement soft touch.',
  }),
  tpl({
    id: 'winback-whats-new',
    name: 'Since you left',
    style: 'savvy',
    category: 'winback',
    accent: '#1e1b4b',
    background: '#ffffff',
    eyebrow: 'Catch up',
    headline: 'Look what is new since you left',
    body: '{{first_name}}, {{shop_name}} has been busy. Fresh arrivals and refreshed bestsellers are waiting.',
    ctaLabel: 'Explore updates',
    teaser: 'Product highlights for lapsed buyers.',
  }),
  tpl({
    id: 'winback-last-chance',
    name: 'Last chance offer',
    style: 'essential',
    category: 'winback',
    accent: '#9f1239',
    background: '#fff1f2',
    eyebrow: 'Last reminder',
    headline: '{{discount_code}} expires soon',
    body: '{{first_name}}, this is the last note from {{shop_name}} about your offer. Redeem before it disappears.',
    ctaLabel: 'Redeem now',
    teaser: 'Final win-back incentive.',
  }),
  tpl({
    id: 'winback-dont-lose-you',
    name: "We don't want to lose you",
    style: 'premium',
    category: 'winback',
    accent: '#292524',
    background: '#1c1917',
    badge: 'Premium',
    eyebrow: 'A personal note',
    headline: "We don't want to lose you, {{first_name}}",
    subhead: 'Our best offer yet — expires in 48 hours.',
    body: 'If {{shop_name}} drifted off your radar, this is our invitation back — no spam, just a sincere offer.',
    highlight: 'Exclusive return code <strong>{{discount_code}}</strong>',
    ctaLabel: 'Come home',
    footer:
      '{{shop_name}} · {{address}}, {{city}}, {{country}}<br><span style="color:#a8a29e;">Unsubscribe · Email preferences</span>',
    teaser: 'Dark premium win-back with urgency.',
  }),

  // —— Referral & loyalty ——
  tpl({
    id: 'referral-bonus',
    name: 'Referral bonus earned',
    style: 'standard',
    category: 'referral',
    accent: '#0f3d2e',
    background: '#ecfdf5',
    eyebrow: 'Reward unlocked',
    headline: 'You earned a referral bonus',
    body: 'Nice work, {{first_name}}! Your friend just shopped at {{shop_name}}.',
    highlight: 'Your bonus code is <strong>{{discount_code}}</strong>',
    ctaLabel: 'Use my bonus',
    teaser: 'Reward for sharing.',
  }),
  tpl({
    id: 'loyalty-points-expiring',
    name: 'Points expiring soon',
    style: 'savvy',
    category: 'referral',
    accent: '#b45309',
    background: '#fffbeb',
    eyebrow: 'Loyalty',
    headline: 'Your {{shop_name}} points are expiring',
    body: '{{first_name}}, redeem your points before they expire — treat yourself.',
    ctaLabel: 'Redeem points',
    teaser: 'Loyalty urgency.',
  }),
  tpl({
    id: 'loyalty-vip',
    name: 'VIP status unlocked',
    style: 'essential',
    category: 'referral',
    accent: '#422006',
    background: '#fafaf9',
    eyebrow: 'VIP',
    headline: 'You are officially a {{shop_name}} VIP',
    body: 'Congrats, {{first_name}}! Enjoy early access, exclusive drops, and member-only pricing.',
    highlight: 'VIP code <strong>{{discount_code}}</strong>',
    ctaLabel: 'See VIP perks',
    teaser: 'Tier upgrade celebration.',
  }),
  tpl({
    id: 'loyalty-inner-circle',
    name: 'Inner circle invite',
    style: 'premium',
    category: 'referral',
    accent: '#0a0a0a',
    background: '#fafafa',
    badge: 'Premium',
    eyebrow: 'By invitation',
    headline: 'Join the {{shop_name}} inner circle',
    subhead: 'Private previews · member pricing · concierge support',
    body: '{{first_name}}, you have been selected for our inner circle. Accept your invitation to unlock the next tier of {{shop_name}}.',
    ctaLabel: 'Accept invitation',
    teaser: 'Premium loyalty / VIP invite.',
  }),

  // —— Seasonal ——
  tpl({
    id: 'seasonal-black-friday',
    name: 'Black Friday',
    style: 'standard',
    category: 'seasonal',
    accent: '#0a0a0a',
    background: '#171717',
    eyebrow: 'BFCM',
    headline: 'Black Friday — up to 50% off',
    subhead: 'The biggest deals of the year.',
    body: '{{first_name}}, the {{shop_name}} Black Friday edit is live. Shop early for the best sizes.',
    highlight: 'Code <strong>{{discount_code}}</strong>',
    ctaLabel: 'Shop Black Friday',
    footer:
      '{{shop_name}} · {{address}}, {{city}}, {{country}}<br><span style="color:#a3a3a3;">Unsubscribe · Email preferences</span>',
    teaser: 'Dark high-contrast BFCM.',
  }),
  tpl({
    id: 'seasonal-eid',
    name: 'Eid Mubarak',
    style: 'savvy',
    category: 'seasonal',
    accent: '#14532d',
    background: '#f0fdf4',
    eyebrow: 'Eid Mubarak',
    headline: 'Eid Mubarak from {{shop_name}}',
    body: '{{first_name}}, celebrate with something special from our festive collection.',
    highlight: 'Festive code <strong>{{discount_code}}</strong>',
    ctaLabel: 'Shop the collection',
    teaser: 'Eid greeting + offer.',
  }),
  tpl({
    id: 'seasonal-new-year',
    name: 'Happy New Year',
    style: 'essential',
    category: 'seasonal',
    accent: '#1e3a8a',
    background: '#eff6ff',
    eyebrow: 'New year',
    headline: 'Happy New Year — 25% off',
    body: 'Start fresh with {{shop_name}}, {{first_name}}. A clean slate deserves a thoughtful reward.',
    highlight: '<strong>{{discount_code}}</strong> · 25% off selected items',
    ctaLabel: 'Start the year right',
    teaser: 'New year kickoff sale.',
  }),
  tpl({
    id: 'seasonal-birthday',
    name: 'Birthday gift',
    style: 'standard',
    category: 'seasonal',
    accent: '#9d174d',
    background: '#fdf2f8',
    eyebrow: 'Happy birthday',
    headline: 'Happy birthday, {{first_name}}',
    body: 'From all of us at {{shop_name}} — enjoy a birthday treat on us.',
    highlight: 'Birthday code <strong>{{discount_code}}</strong>',
    ctaLabel: 'Claim birthday gift',
    teaser: 'Birthday reward email.',
  }),
  tpl({
    id: 'seasonal-ramadan',
    name: 'Ramadan Kareem',
    style: 'premium',
    category: 'seasonal',
    accent: '#052e16',
    background: '#ecfdf5',
    badge: 'Premium',
    eyebrow: 'Ramadan Kareem',
    headline: 'A blessed season from {{shop_name}}',
    subhead: 'Thoughtful gifts for gathering and giving.',
    body: '{{first_name}}, explore our Ramadan edit — calm tones, generous packaging, and pieces meant to be shared.',
    highlight: 'Seasonal code <strong>{{discount_code}}</strong>',
    ctaLabel: 'Shop Ramadan edit',
    teaser: 'Premium Ramadan greeting + collection.',
  }),
  tpl({
    id: 'seasonal-holiday-gift',
    name: 'Holiday gift guide',
    style: 'premium',
    category: 'seasonal',
    accent: '#1c1917',
    background: '#fafaf9',
    badge: 'Premium',
    eyebrow: 'Gift guide',
    headline: 'Gifts worth wrapping from {{shop_name}}',
    subhead: 'For them · for you · for last-minute brilliance',
    body: '{{first_name}}, skip the guesswork. Our gift guide is sorted by personality, budget, and how fast you need it.',
    ctaLabel: 'Open the gift guide',
    teaser: 'Premium holiday gift guide.',
  }),

  // —— Feedback ——
  tpl({
    id: 'feedback-review',
    name: 'How did we do?',
    style: 'standard',
    category: 'feedback',
    accent: '#0f3d2e',
    background: '#ffffff',
    eyebrow: 'Quick review',
    headline: 'How did we do, {{first_name}}?',
    body: 'Your opinion helps {{shop_name}} improve. Rate your recent order — it only takes a minute.',
    ctaLabel: 'Leave a review',
    teaser: 'Post-purchase review ask.',
  }),
  tpl({
    id: 'feedback-improve',
    name: 'Tell us how to improve',
    style: 'savvy',
    category: 'feedback',
    accent: '#334155',
    background: '#f8fafc',
    eyebrow: 'Feedback',
    headline: 'Tell us how we can do better',
    body: 'We are always improving {{shop_name}}, {{first_name}}. Share what went well — and what we should fix.',
    ctaLabel: 'Share feedback',
    teaser: 'Open feedback survey.',
  }),
  tpl({
    id: 'feedback-nps',
    name: 'Quick score check',
    style: 'essential',
    category: 'feedback',
    accent: '#0c4a6e',
    background: '#f0f9ff',
    eyebrow: 'One question',
    headline: 'Would you recommend {{shop_name}}?',
    body: 'Hi {{first_name}}, on a scale of 0–10, how likely are you to recommend us to a friend?',
    ctaLabel: 'Answer in 10 seconds',
    teaser: 'Short NPS-style ask.',
  }),
  tpl({
    id: 'feedback-concierge',
    name: 'Concierge check-in',
    style: 'premium',
    category: 'feedback',
    accent: '#111827',
    background: '#f9fafb',
    badge: 'Premium',
    eyebrow: 'Personal check-in',
    headline: 'Did everything arrive as expected?',
    subhead: 'A note from the {{shop_name}} concierge desk.',
    body: '{{first_name}}, if anything needs attention — fit, finish, or timing — reply to this email and we will take care of it personally.',
    ctaLabel: 'Talk to concierge',
    teaser: 'Premium concierge-style follow-up.',
  }),
]

/**
 * @param {{ style?: string, category?: string, q?: string }} [filters]
 * @returns {BuiltinEmailTemplate[]}
 */
export function filterBuiltinEmailTemplates(filters = {}) {
  const style = filters.style || 'standard'
  const category = filters.category || 'all'
  const q = (filters.q || '').trim().toLowerCase()

  return BUILTIN_EMAIL_TEMPLATES.filter((item) => {
    if (item.style !== style) return false
    if (category !== 'all' && category !== 'yours' && item.category !== category) return false
    if (!q) return true
    const hay = `${item.name} ${item.headline} ${item.teaser} ${item.category} ${item.badge || ''}`.toLowerCase()
    return hay.includes(q)
  })
}

export function getBuiltinEmailTemplate(id) {
  return BUILTIN_EMAIL_TEMPLATES.find((item) => item.id === id) || null
}

export function emailTemplateCategoryLabel(categoryId) {
  return EMAIL_TEMPLATE_CATEGORIES.find((item) => item.id === categoryId)?.label || categoryId
}

export function emailTemplateStyleMeta(styleId) {
  return EMAIL_TEMPLATE_STYLES.find((item) => item.id === styleId) || null
}
