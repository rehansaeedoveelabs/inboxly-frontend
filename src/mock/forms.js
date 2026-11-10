/** Signup forms mock data — visual editor prototype only. */

export const forms = [
  {
    id: 'form_001',
    name: 'Welcome discount popup',
    type: 'popup',
    status: 'enabled',
    submissions: 148,
    conversionRate: 6.4,
    updatedAt: '2026-11-08T13:20:00Z',
    headline: 'GET 10% OFF YOUR FIRST ORDER',
    subheadline: 'Join the list for new drops and exclusive offers.',
    buttonLabel: 'GET 10% OFF',
    fields: [
      { id: 'f_email', type: 'email', label: 'Email', required: true },
      { id: 'f_consent', type: 'consent', label: 'I agree to receive marketing emails', required: true },
    ],
    theme: {
      accent: '#2878FF',
      background: '#FFFFFF',
      text: '#10131C',
    },
    behavior: {
      display: 'After 8 seconds',
      devices: 'Desktop & mobile',
      frequency: 'Once every 14 days',
    },
  },
  {
    id: 'form_002',
    name: 'Footer embed signup',
    type: 'embedded',
    status: 'enabled',
    submissions: 62,
    conversionRate: 3.1,
    updatedAt: '2026-11-06T09:50:00Z',
    headline: 'Stay in the loop',
    subheadline: 'Product news and occasional offers.',
    buttonLabel: 'Subscribe',
    fields: [
      { id: 'f_email', type: 'email', label: 'Email', required: true },
    ],
    theme: {
      accent: '#FFA66B',
      background: '#191E2B',
      text: '#F3F5FA',
    },
    behavior: {
      display: 'Always visible',
      devices: 'Desktop & mobile',
      frequency: 'N/A',
    },
  },
  {
    id: 'form_003',
    name: 'SMS capture flyout',
    type: 'popup',
    status: 'draft',
    submissions: 0,
    conversionRate: 0,
    updatedAt: '2026-11-10T07:10:00Z',
    headline: 'Text deals to your phone',
    subheadline: 'Get restock alerts and flash offers.',
    buttonLabel: 'Sign me up',
    fields: [
      { id: 'f_phone', type: 'phone', label: 'Phone number', required: true },
      { id: 'f_consent', type: 'consent', label: 'I agree to receive SMS marketing', required: true },
    ],
    theme: {
      accent: '#2878FF',
      background: '#FFFFFF',
      text: '#10131C',
    },
    behavior: {
      display: 'On exit intent',
      devices: 'Desktop only',
      frequency: 'Once per session',
    },
  },
]

export function getForms() {
  return forms
}

export function getFormById(id) {
  return forms.find((form) => form.id === id) || null
}

export function getFormStats() {
  return {
    total: forms.length,
    enabled: forms.filter((f) => f.status === 'enabled').length,
    draft: forms.filter((f) => f.status === 'draft').length,
  }
}
