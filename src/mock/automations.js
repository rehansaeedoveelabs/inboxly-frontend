/** Automation workflows and templates — frontend prototype only. */

export const automationTemplates = [
  {
    id: 'tpl_001',
    name: 'Abandoned cart',
    description: 'Recover carts with timed email and SMS reminders.',
    goal: 'Abandoned Cart',
    channels: ['email', 'sms'],
    badge: 'High conversion',
  },
  {
    id: 'tpl_002',
    name: 'Welcome journey',
    description: 'Introduce your brand and first-purchase offer.',
    goal: 'Welcome',
    channels: ['email'],
    badge: 'Popular',
  },
  {
    id: 'tpl_003',
    name: 'Browse abandonment',
    description: 'Follow up when shoppers view products but leave.',
    goal: 'Product Abandonment',
    channels: ['email'],
    badge: 'Recommended',
  },
  {
    id: 'tpl_004',
    name: 'Winback',
    description: 'Re-engage customers who have not ordered recently.',
    goal: 'Reactivate Customers',
    channels: ['email', 'sms'],
    badge: 'Loyalty',
  },
  {
    id: 'tpl_005',
    name: 'Birthday reward',
    description: 'Send a personal offer around a contact birthday.',
    goal: 'Build loyalty',
    channels: ['email'],
    badge: 'Seasonal',
  },
]

export const automations = [
  {
    id: 'auto_001',
    name: 'Abandoned cart',
    status: 'active',
    templateId: 'tpl_001',
    trigger: 'Cart abandoned',
    channels: ['email', 'sms'],
    enrolled: 128,
    revenue: 6420,
    updatedAt: '2026-11-09T14:20:00Z',
    nodes: [
      { id: 'n1', type: 'trigger', label: 'Cart abandoned', x: 80, y: 40, config: { waitMinutes: 0 } },
      { id: 'n2', type: 'delay', label: 'Wait 1 hour', x: 80, y: 140, config: { waitMinutes: 60 } },
      { id: 'n3', type: 'action', label: 'Send email #1', x: 80, y: 240, config: { channel: 'email', subject: 'You left something behind' } },
      { id: 'n4', type: 'condition', label: 'Purchased?', x: 80, y: 340, config: { field: 'orderPlaced', equals: true } },
      { id: 'n5', type: 'delay', label: 'Wait 1 day', x: 260, y: 340, config: { waitMinutes: 1440 } },
      { id: 'n6', type: 'action', label: 'Send SMS reminder', x: 260, y: 440, config: { channel: 'sms', subject: '' } },
      { id: 'n7', type: 'action', label: 'Exit — converted', x: -100, y: 440, config: { channel: 'system' } },
    ],
    edges: [
      { from: 'n1', to: 'n2' },
      { from: 'n2', to: 'n3' },
      { from: 'n3', to: 'n4' },
      { from: 'n4', to: 'n7', label: 'Yes' },
      { from: 'n4', to: 'n5', label: 'No' },
      { from: 'n5', to: 'n6' },
    ],
  },
  {
    id: 'auto_002',
    name: 'Welcome journey',
    status: 'active',
    templateId: 'tpl_002',
    trigger: 'Signup form submitted',
    channels: ['email'],
    enrolled: 86,
    revenue: 2180,
    updatedAt: '2026-11-08T10:05:00Z',
    nodes: [
      { id: 'n1', type: 'trigger', label: 'Form submitted', x: 120, y: 40, config: {} },
      { id: 'n2', type: 'action', label: 'Send welcome email', x: 120, y: 150, config: { channel: 'email', subject: 'Welcome to Oveelab' } },
      { id: 'n3', type: 'delay', label: 'Wait 2 days', x: 120, y: 260, config: { waitMinutes: 2880 } },
      { id: 'n4', type: 'action', label: 'Send tips email', x: 120, y: 370, config: { channel: 'email', subject: '3 ways to get started' } },
    ],
    edges: [
      { from: 'n1', to: 'n2' },
      { from: 'n2', to: 'n3' },
      { from: 'n3', to: 'n4' },
    ],
  },
  {
    id: 'auto_003',
    name: 'Browse abandonment',
    status: 'paused',
    templateId: 'tpl_003',
    trigger: 'Product viewed',
    channels: ['email'],
    enrolled: 12,
    revenue: 310,
    updatedAt: '2026-11-07T19:40:00Z',
    nodes: [
      { id: 'n1', type: 'trigger', label: 'Product viewed', x: 100, y: 40, config: {} },
      { id: 'n2', type: 'delay', label: 'Wait 4 hours', x: 100, y: 150, config: { waitMinutes: 240 } },
      { id: 'n3', type: 'condition', label: 'Added to cart?', x: 100, y: 260, config: { field: 'addedToCart', equals: true } },
      { id: 'n4', type: 'action', label: 'Send browse email', x: 260, y: 260, config: { channel: 'email', subject: 'Still thinking it over?' } },
    ],
    edges: [
      { from: 'n1', to: 'n2' },
      { from: 'n2', to: 'n3' },
      { from: 'n3', to: 'n4', label: 'No' },
    ],
  },
]

export function getAutomations() {
  return automations
}

export function getAutomationById(id) {
  return automations.find((item) => item.id === id) || null
}

export function getAutomationTemplates() {
  return automationTemplates
}

export function getAutomationTemplateById(id) {
  return automationTemplates.find((item) => item.id === id) || null
}
