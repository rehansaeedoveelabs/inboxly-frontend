/**
 * Inboxly Phase 7 — original plain-text starter messages for the campaign wizard.
 * Frontend-only presets. No HTML templates, merge tags, or external services.
 */

export const STARTER_CATEGORIES = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'promotions', label: 'Promotions' },
  { id: 'product_launches', label: 'Product launches' },
  { id: 'announcements', label: 'Announcements' },
  { id: 'newsletters', label: 'Newsletters' },
]

/** @typedef {'email' | 'sms'} StarterChannel */
/** @typedef {'welcome' | 'promotions' | 'product_launches' | 'announcements' | 'newsletters'} StarterCategory */

/**
 * @typedef {{
 *   id: string,
 *   channel: StarterChannel,
 *   category: StarterCategory,
 *   label: string,
 *   name: string,
 *   subject: string | null,
 *   previewText: string | null,
 *   body: string,
 * }} StarterMessage
 */

/** @type {StarterMessage[]} */
export const STARTER_MESSAGES = [
  {
    id: 'email-welcome-hello',
    channel: 'email',
    category: 'welcome',
    label: 'Welcome hello',
    name: 'Welcome hello',
    subject: "Welcome — we're glad you're here",
    previewText: 'A short hello from the team',
    body:
      "Hi there,\n\nThanks for joining us. We're happy to have you.\n\nTake a look around whenever you're ready — if you need anything, just reply to this email.\n\n— The team",
  },
  {
    id: 'email-welcome-start',
    channel: 'email',
    category: 'welcome',
    label: 'Welcome get started',
    name: 'Welcome get started',
    subject: 'Your next step starts here',
    previewText: 'A simple way to settle in',
    body:
      "Hi,\n\nWelcome aboard. Here are two easy next steps:\n\n1. Explore what's new in the shop\n2. Save your favorites so you can find them later\n\nWe're here if you have questions.\n\n— The team",
  },
  {
    id: 'email-promo-weekend',
    channel: 'email',
    category: 'promotions',
    label: 'Weekend offer',
    name: 'Weekend offer',
    subject: 'This weekend only',
    previewText: 'A short window to save',
    body:
      "Hi,\n\nThis weekend we're running a limited offer for subscribers.\n\nShop your favorites before Sunday night — when the weekend ends, the offer does too.\n\nThanks for being here.\n\n— The team",
  },
  {
    id: 'email-promo-members',
    channel: 'email',
    category: 'promotions',
    label: 'Subscriber thank-you offer',
    name: 'Subscriber thank-you offer',
    subject: 'A thank-you offer for subscribers',
    previewText: 'Exclusive for our list',
    body:
      "Hi,\n\nAs a thank-you for staying subscribed, here's a subscriber-only offer.\n\nUse it on your next order while it's available — we won't keep it open forever.\n\nGlad you're with us.\n\n— The team",
  },
  {
    id: 'email-launch-new',
    channel: 'email',
    category: 'product_launches',
    label: 'New arrival launch',
    name: 'New arrival launch',
    subject: "It's here — meet what's new",
    previewText: 'First look at the drop',
    body:
      "Hi,\n\nSomething new just landed.\n\nTake a first look, see what stands out, and grab it while stock lasts.\n\nWe can't wait to hear what you think.\n\n— The team",
  },
  {
    id: 'email-announce-update',
    channel: 'email',
    category: 'announcements',
    label: 'Store update',
    name: 'Store update',
    subject: 'A quick update from our store',
    previewText: 'What changed and why it matters',
    body:
      "Hi,\n\nA short update from our side.\n\nWe've made a few changes to improve how you shop with us. Nothing you need to do — we just wanted you to know.\n\nThanks for reading.\n\n— The team",
  },
  {
    id: 'email-news-weekly',
    channel: 'email',
    category: 'newsletters',
    label: 'This week with us',
    name: 'This week with us',
    subject: 'This week with us',
    previewText: 'Picks, notes, and what is next',
    body:
      "Hi,\n\nHere's a quick roundup from this week:\n\n• A few favorites worth another look\n• What's coming next\n• One note from the team\n\nThanks for reading — see you next time.\n\n— The team",
  },
  {
    id: 'sms-welcome-hello',
    channel: 'sms',
    category: 'welcome',
    label: 'Welcome SMS',
    name: 'Welcome SMS',
    subject: null,
    previewText: null,
    body: 'Welcome to Inboxly Demo. Glad you joined — reply HELP for support or STOP to opt out.',
  },
  {
    id: 'sms-promo-flash',
    channel: 'sms',
    category: 'promotions',
    label: 'Flash offer SMS',
    name: 'Flash offer SMS',
    subject: null,
    previewText: null,
    body: 'Inboxly Demo: weekend offer is live. Shop soon — limited time. Reply STOP to opt out.',
  },
  {
    id: 'sms-launch-drop',
    channel: 'sms',
    category: 'product_launches',
    label: 'New drop SMS',
    name: 'New drop SMS',
    subject: null,
    previewText: null,
    body: 'Inboxly Demo: new arrivals are in. Take a first look today. Reply STOP to opt out.',
  },
  {
    id: 'sms-announce-notice',
    channel: 'sms',
    category: 'announcements',
    label: 'Store notice SMS',
    name: 'Store notice SMS',
    subject: null,
    previewText: null,
    body: 'Inboxly Demo: quick store update for you. Details are in your inbox. Reply STOP to opt out.',
  },
  {
    id: 'sms-news-tip',
    channel: 'sms',
    category: 'newsletters',
    label: 'Weekly tip SMS',
    name: 'Weekly tip SMS',
    subject: null,
    previewText: null,
    body: 'Inboxly Demo weekly tip: check what is new this week. Reply STOP to opt out.',
  },
]

/**
 * @param {StarterChannel} channel
 * @returns {StarterMessage[]}
 */
export function startersForChannel(channel) {
  return STARTER_MESSAGES.filter((item) => item.channel === channel)
}

/**
 * @param {{
 *   channel: StarterChannel,
 *   category?: string | null,
 *   query?: string | null,
 * }} options
 * @returns {StarterMessage[]}
 */
export function filterStarterMessages({ channel, category = null, query = null }) {
  const needle = typeof query === 'string' ? query.trim().toLowerCase() : ''
  const categoryId = typeof category === 'string' && category !== '' && category !== 'all' ? category : null

  return startersForChannel(channel).filter((item) => {
    if (categoryId && item.category !== categoryId) return false
    if (!needle) return true
    const haystack = [item.label, item.name, item.subject, item.previewText, item.body]
      .filter((value) => typeof value === 'string' && value !== '')
      .join(' ')
      .toLowerCase()
    return haystack.includes(needle)
  })
}

/**
 * Map a starter into wizard form fields. SMS never sets email-only fields.
 *
 * @param {StarterMessage} starter
 * @returns {{ name: string, subject: string, previewText: string, body: string }}
 */
export function starterToFormFields(starter) {
  if (starter.channel === 'sms') {
    return {
      name: starter.name,
      subject: '',
      previewText: '',
      body: starter.body,
    }
  }

  return {
    name: starter.name,
    subject: starter.subject || '',
    previewText: starter.previewText || '',
    body: starter.body,
  }
}

/**
 * Empty content fields for "Start from scratch".
 *
 * @param {StarterChannel} channel
 * @returns {{ name: string, subject: string, previewText: string, body: string }}
 */
export function scratchFormFields(channel) {
  return {
    name: channel === 'sms' ? 'New SMS campaign' : 'New email campaign',
    subject: '',
    previewText: '',
    body: '',
  }
}

/**
 * True when content fields look user-filled (not empty scratch).
 *
 * @param {{ name?: string, subject?: string, previewText?: string, body?: string }} form
 * @param {StarterChannel} channel
 */
export function hasWritableCampaignContent(form, channel) {
  const body = typeof form?.body === 'string' ? form.body.trim() : ''
  if (body !== '') return true

  if (channel === 'email') {
    const subject = typeof form?.subject === 'string' ? form.subject.trim() : ''
    const previewText = typeof form?.previewText === 'string' ? form.previewText.trim() : ''
    if (subject !== '' || previewText !== '') return true
  }

  const name = typeof form?.name === 'string' ? form.name.trim() : ''
  const defaultName = channel === 'sms' ? 'New SMS campaign' : 'New email campaign'
  return name !== '' && name !== defaultName
}

/**
 * @param {string} categoryId
 */
export function starterCategoryLabel(categoryId) {
  return STARTER_CATEGORIES.find((item) => item.id === categoryId)?.label || categoryId
}
