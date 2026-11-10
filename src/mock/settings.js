/** Settings and storefront integration — clearly labelled prototype data. */

export const storeSettings = {
  storeName: 'Oveelab Demo',
  domain: 'oveelab-demo.myshopify.com',
  brandId: 'brand_demo_1042',
  timezone: 'America/Los_Angeles',
  currency: 'USD',
  connectedAt: '2026-11-10T05:00:00Z',
  lastImportAt: '2026-11-10T05:12:00Z',
  importedContacts: 42,
  importedProducts: 49,
  syncTagsToShopify: true,
  allowAdminSignIn: false,
  trackingMode: 'before_consent',
}

export const storefrontIntegration = {
  appEmbedEnabled: false,
  storeConnected: true,
  storefrontTracking: 'inactive',
  signupFormsStatus: 'ready_but_blocked',
  popupStatus: 'ready_but_blocked',
  themeName: 'Dawn (demo)',
  lastCheckedAt: '2026-11-10T12:45:00Z',
  themeEditorUrl: 'https://admin.shopify.com/store/oveelab-demo/themes/current/editor?context=apps',
  notes: 'Prototype only — no real Shopify Theme App Extension connection.',
}

export const channelSettings = {
  email: {
    fromName: 'Oveelab Demo',
    fromEmail: 'hello@oveelab.demo',
    replyTo: 'support@oveelab.demo',
    footerAddress: '100 Market St, San Francisco, CA',
    verified: true,
  },
  sms: {
    senderId: 'OVEELAB',
    complianceText: 'Msg & data rates may apply. Reply STOP to opt out.',
    enabled: true,
  },
  webPush: {
    enabled: false,
    promptDelaySeconds: 12,
    iconLabel: 'Inboxly Demo',
  },
}

export const accountSettings = {
  workspaceName: 'Oveelab Demo Workspace',
  user: {
    name: 'Rehan Saeed',
    email: 'rehan@oveelab.demo',
    role: 'Admin',
  },
  preferences: {
    emailDigest: true,
    productUpdates: true,
    weeklyReport: false,
  },
  members: [
    { id: 'mem_1', name: 'Rehan Saeed', email: 'rehan@oveelab.demo', role: 'Admin' },
    { id: 'mem_2', name: 'Alex Morgan', email: 'alex@oveelab.demo', role: 'Marketer' },
  ],
}

export function getStoreSettings() {
  return storeSettings
}

export function getStorefrontIntegration() {
  return storefrontIntegration
}

export function getChannelSettings() {
  return channelSettings
}

export function getAccountSettings() {
  return accountSettings
}
