/**
 * Built-in SMS template gallery.
 * Merge tags: {{shop_name}}, {{first_name}}, {{discount_code}}, {{short_url}}
 */

export const SMS_TEMPLATE_CATEGORIES = [
  { id: 'all', label: 'All templates' },
  { id: 'seasonal', label: 'seasonal' },
  { id: 're_engagement', label: 're engagement' },
  { id: 'loyalty', label: 'loyalty' },
  { id: 'promo', label: 'promo' },
  { id: 'abandoned_cart', label: 'abandoned cart' },
  { id: 'welcome', label: 'welcome' },
]

export const SMS_CATEGORY_LABELS = {
  seasonal: 'seasonal',
  re_engagement: 're engagement',
  loyalty: 'loyalty',
  promo: 'promo',
  abandoned_cart: 'abandoned cart',
  welcome: 'welcome',
  general: 'general',
}

export const BUILTIN_SMS_TEMPLATES = [
  {
    "id": "sms-summer-sale",
    "name": "Summer sale",
    "category": "seasonal",
    "body": "Summer sale at {{shop_name}}: cool deals up to 40% off, {{first_name}}: {{short_url}}"
  },
  {
    "id": "sms-ramadan",
    "name": "Ramadan",
    "category": "seasonal",
    "body": "Ramadan Kareem, {{first_name}}. Exclusive savings at {{shop_name}} all month: {{short_url}}"
  },
  {
    "id": "sms-new-year",
    "name": "New Year",
    "category": "seasonal",
    "body": "New year, new look. Start fresh with 25% off at {{shop_name}}, {{first_name}}: {{short_url}}"
  },
  {
    "id": "sms-black-friday",
    "name": "Black Friday",
    "category": "seasonal",
    "body": "BLACK FRIDAY at {{shop_name}} is LIVE: up to 50% off. Doors close soon: {{short_url}}"
  },
  {
    "id": "sms-eid",
    "name": "Eid offer",
    "category": "seasonal",
    "body": "Eid Mubarak from {{shop_name}}, {{first_name}}! Celebrate with 25% off. Code EID25: {{short_url}}"
  },
  {
    "id": "sms-see-new",
    "name": "See what is new",
    "category": "re_engagement",
    "body": "Lots has changed at {{shop_name}}, {{first_name}}. Come see what is new plus 15% off: {{short_url}}"
  },
  {
    "id": "sms-winback",
    "name": "Win-back 30%",
    "category": "re_engagement",
    "body": "{{first_name}}, it has been a while! Enjoy 30% off your next {{shop_name}} order: {{short_url}}"
  },
  {
    "id": "sms-miss-you",
    "name": "We miss you",
    "category": "re_engagement",
    "body": "We miss you, {{first_name}}. Here is 20% off to come back to {{shop_name}}. Code MISSYOU20: {{short_url}}"
  },
  {
    "id": "sms-bday",
    "name": "Birthday reward",
    "category": "loyalty",
    "body": "Happy birthday, {{first_name}}! Enjoy 25% off at {{shop_name}}, our gift to you. Code BDAY25: {{short_url}}"
  },
  {
    "id": "sms-points",
    "name": "Points expiring",
    "category": "loyalty",
    "body": "{{first_name}}, your {{shop_name}} reward points expire soon. Redeem them before they are gone: {{short_url}}"
  },
  {
    "id": "sms-vip",
    "name": "VIP early access",
    "category": "loyalty",
    "body": "VIP early access, {{first_name}}: shop the {{shop_name}} sale 24h before everyone else: {{short_url}}"
  },
  {
    "id": "sms-clearance-tonight",
    "name": "Clearance ends tonight",
    "category": "promo",
    "body": "Last chance, {{first_name}}: clearance ends tonight at {{shop_name}}. Grab yours: {{short_url}}"
  },
  {
    "id": "sms-clearance",
    "name": "Clearance",
    "category": "promo",
    "body": "FINAL CLEARANCE at {{shop_name}}: up to 70% off. When it is gone, it is gone: {{short_url}}"
  },
  {
    "id": "sms-free-ship-over",
    "name": "Free shipping over",
    "category": "promo",
    "body": "Free delivery at {{shop_name}} on orders over Rs 2,500. Treat yourself, {{first_name}}: {{short_url}}"
  },
  {
    "id": "sms-free-ship-day",
    "name": "Free shipping day",
    "category": "promo",
    "body": "FREE shipping on everything at {{shop_name}} today, {{first_name}}. No minimum: {{short_url}}"
  },
  {
    "id": "sms-trending",
    "name": "Trending now",
    "category": "promo",
    "body": "Trending now at {{shop_name}}: see what everyone is buying this week, {{first_name}}: {{short_url}}"
  },
  {
    "id": "sms-back-stock",
    "name": "Back in stock",
    "category": "promo",
    "body": "Back in stock! The {{shop_name}} piece you wanted is available again. Grab it: {{short_url}}"
  },
  {
    "id": "sms-new-collection",
    "name": "New collection",
    "category": "promo",
    "body": "Just dropped at {{shop_name}}: the new collection is live. Be first to shop, {{first_name}}: {{short_url}}"
  },
  {
    "id": "sms-cart-low",
    "name": "Cart low stock",
    "category": "abandoned_cart",
    "body": "Hurry {{first_name}}, items in your {{shop_name}} cart are almost gone. Checkout now: {{short_url}}"
  },
  {
    "id": "sms-cart-discount",
    "name": "Cart plus discount",
    "category": "abandoned_cart",
    "body": "Still deciding, {{first_name}}? Here is 10% off to finish your {{shop_name}} order. Code BACK10: {{short_url}}"
  },
  {
    "id": "sms-cart-reminder",
    "name": "Cart reminder",
    "category": "abandoned_cart",
    "body": "{{first_name}}, you left something at {{shop_name}}. Complete your order before it sells out: {{short_url}}"
  },
  {
    "id": "sms-bundle",
    "name": "Bundle and save",
    "category": "promo",
    "body": "Bundle and save at {{shop_name}}: mix any 3 for Rs 2,999. Limited time: {{short_url}}"
  },
  {
    "id": "sms-bogo",
    "name": "Buy one get one",
    "category": "promo",
    "body": "Buy 1 Get 1 FREE at {{shop_name}} today only, {{first_name}}. Stock up now: {{short_url}}"
  },
  {
    "id": "sms-app",
    "name": "App exclusive",
    "category": "promo",
    "body": "App exclusive for you, {{first_name}}: an extra 10% off at {{shop_name}} today: {{short_url}}"
  },
  {
    "id": "sms-free-gift",
    "name": "Free gift",
    "category": "promo",
    "body": "Free gift on every order over Rs 5,000 at {{shop_name}} today, {{first_name}}: {{short_url}}"
  },
  {
    "id": "sms-weekend",
    "name": "Weekend deal",
    "category": "promo",
    "body": "Weekend deal at {{shop_name}}: spend Rs 3,000 and save Rs 600. This weekend only: {{short_url}}"
  },
  {
    "id": "sms-percent",
    "name": "Percent-off offer",
    "category": "promo",
    "body": "{{first_name}}, get 20% off your favourites at {{shop_name}}. Use code SAVE20: {{short_url}}"
  },
  {
    "id": "sms-doorbusters",
    "name": "Doorbusters",
    "category": "promo",
    "body": "Doorbusters are live at {{shop_name}}: limited stock, biggest savings of the season. Hurry: {{short_url}}"
  },
  {
    "id": "sms-final-hours",
    "name": "Final hours",
    "category": "promo",
    "body": "Final hours, {{first_name}}! Your 30% off at {{shop_name}} ends at 11:59pm. Do not miss out: {{short_url}}"
  },
  {
    "id": "sms-tonight",
    "name": "Tonight only",
    "category": "promo",
    "body": "{{first_name}}, tonight only at {{shop_name}}: up to 40% off your favourites. Be quick: {{short_url}}"
  },
  {
    "id": "sms-flash",
    "name": "24-hour flash sale",
    "category": "promo",
    "body": "24-HOUR FLASH SALE at {{shop_name}}: 25% off everything. Ends midnight tonight. Shop now: {{short_url}}"
  },
  {
    "id": "sms-welcome-vip",
    "name": "Welcome VIP access",
    "category": "welcome",
    "body": "You are in, {{first_name}}! Get early access to {{shop_name}} drops plus 10% off: {{short_url}}"
  },
  {
    "id": "sms-welcome-ship",
    "name": "Welcome free shipping",
    "category": "welcome",
    "body": "Thanks for joining {{shop_name}}, {{first_name}}! Your first order ships FREE today. Start here: {{short_url}}"
  },
  {
    "id": "sms-welcome-offer",
    "name": "Welcome offer",
    "category": "welcome",
    "body": "Welcome to {{shop_name}}, {{first_name}}! Enjoy 15% off your first order with code WELCOME15. Shop now: {{short_url}}"
  }
]

export function smsCategoryLabel(category) {
  return SMS_CATEGORY_LABELS[category] || category || 'general'
}

/** Merge tags shown in the SMS template editor. */
export const SMS_MERGE_TAG_GROUPS = [
  {
    id: 'recipient',
    label: 'Recipient',
    tags: ['first_name', 'last_name', 'customer_name', 'phone'],
  },
  {
    id: 'store',
    label: 'Store',
    tags: [
      'shop_name',
      'shop_phone',
      'shop_email',
      'website_url',
      'shop_url',
      'privacy_url',
      'terms_url',
    ],
  },
  {
    id: 'offer',
    label: 'Offer & links',
    tags: [
      'short_url',
      'discount_code',
      'discount_percent',
      'sale_name',
      'occasion',
      'product_name',
      'sale_price',
      'reward',
      'unsubscribe_url',
    ],
  },
  {
    id: 'social',
    label: 'Social',
    tags: ['facebook_url', 'instagram_url', 'x_url', 'youtube_url', 'tiktok_url'],
  },
]

/** @param {string} tag */
export function smsMergeTagToken(tag) {
  return `{{${tag}}}`
}

/**
 * Sample values used for live preview (not stored on the template).
 * @param {{ shopName?: string }} [vars]
 */
export function smsPreviewSampleVars(vars = {}) {
  const shop = vars.shopName || 'Acme Store'
  const domain = 'https://acme.pk'
  return {
    first_name: 'Ayesha',
    last_name: 'Khan',
    customer_name: 'Ayesha Khan',
    phone: '+92 300 1234567',
    shop_name: shop,
    shop_phone: '+92 21 111000111',
    shop_email: 'hello@acme.pk',
    website_url: domain,
    shop_url: domain,
    privacy_url: `${domain}/privacy`,
    terms_url: `${domain}/terms`,
    short_url: domain,
    sale_url: `${domain}/sale`,
    discount_code: 'EID25',
    discount_percent: '25',
    sale_name: 'Eid sale',
    occasion: 'Eid',
    product_name: 'Everyday tee',
    sale_price: 'Rs 2,999',
    reward: '100 points',
    unsubscribe_url: `${domain}/unsub`,
    facebook_url: 'facebook.com/acme',
    instagram_url: 'instagram.com/acme',
    x_url: 'x.com/acme',
    youtube_url: 'youtube.com/acme',
    tiktok_url: 'tiktok.com/@acme',
  }
}

/**
 * @param {{ shopName?: string, firstName?: string, discountCode?: string, saleUrl?: string } | Record<string, string>} [vars]
 */
export function personalizeSmsBody(body, vars = {}) {
  const samples = smsPreviewSampleVars({
    shopName: vars.shopName || vars.shop_name,
  })
  const merged = {
    ...samples,
    ...(vars.firstName ? { first_name: vars.firstName } : {}),
    ...(vars.discountCode ? { discount_code: vars.discountCode } : {}),
    ...(vars.saleUrl
      ? { sale_url: vars.saleUrl, short_url: vars.saleUrl }
      : {}),
    ...vars,
  }

  let out = String(body || '')
  for (const [key, value] of Object.entries(merged)) {
    if (typeof value !== 'string') continue
    out = out.replaceAll(`{{${key}}}`, value)
  }
  return out
}

const GSM7_BASIC =
  '@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ ÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà'
const GSM7_EXTENDED = '^{}\\[~]|€'

/**
 * Estimate SMS segments for a rendered (or raw) body.
 * @param {string} text
 * @returns {{ chars: number, segments: number, encoding: 'GSM-7' | 'UCS-2' }}
 */
export function smsLengthStats(text) {
  const value = String(text || '')
  const chars = [...value].length
  let gsmUnits = 0
  let isGsm = true

  for (const ch of value) {
    if (GSM7_BASIC.includes(ch)) {
      gsmUnits += 1
    } else if (GSM7_EXTENDED.includes(ch)) {
      gsmUnits += 2
    } else {
      isGsm = false
      break
    }
  }

  if (isGsm) {
    const segments = gsmUnits === 0 ? 0 : gsmUnits <= 160 ? 1 : Math.ceil(gsmUnits / 153)
    return { chars, segments: Math.max(segments, chars === 0 ? 0 : 1), encoding: 'GSM-7' }
  }

  const segments = chars === 0 ? 0 : chars <= 70 ? 1 : Math.ceil(chars / 67)
  return { chars, segments: Math.max(segments, chars === 0 ? 0 : 1), encoding: 'UCS-2' }
}

/**
 * @param {{ category?: string | null, query?: string }} [filters]
 */
export function filterBuiltinSmsTemplates(filters = {}) {
  const category = filters.category && filters.category !== 'all' ? filters.category : null
  const q = (filters.query || '').trim().toLowerCase()
  return BUILTIN_SMS_TEMPLATES.filter((row) => {
    if (category && row.category !== category) return false
    if (q) {
      const hay = `${row.name} ${row.body} ${row.category}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
}

export function getBuiltinSmsTemplate(id) {
  return BUILTIN_SMS_TEMPLATES.find((row) => row.id === id) || null
}
