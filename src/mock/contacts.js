/** Audience contacts and related records — consistent fictional IDs. */

export const contacts = [
  {
    id: 'ct_001',
    firstName: 'Amina',
    lastName: 'Hassan',
    email: 'amina.hassan@example.com',
    phone: '+1 415 555 0142',
    emailStatus: 'subscribed',
    smsStatus: 'subscribed',
    pushStatus: 'non_subscribed',
    tags: ['vip', 'source: shopify'],
    segmentIds: ['seg_001', 'seg_003'],
    createdAt: '2026-10-02T10:15:00Z',
    lastActiveAt: '2026-11-09T16:40:00Z',
    orders: 6,
    totalSpent: 842.5,
    location: 'San Francisco, CA',
    consent: { email: true, sms: true, push: false },
    activity: [
      { id: 'act_1', type: 'order', label: 'Placed order #1042', at: '2026-11-09T16:40:00Z' },
      { id: 'act_2', type: 'email', label: 'Opened Spring launch', at: '2026-11-08T15:02:00Z' },
      { id: 'act_3', type: 'form', label: 'Submitted popup form', at: '2026-10-02T10:15:00Z' },
    ],
  },
  {
    id: 'ct_002',
    firstName: 'Noah',
    lastName: 'Patel',
    email: 'noah.patel@example.com',
    phone: '+1 646 555 0198',
    emailStatus: 'subscribed',
    smsStatus: 'non_subscribed',
    pushStatus: 'non_subscribed',
    tags: ['source: form'],
    segmentIds: ['seg_002'],
    createdAt: '2026-10-18T08:22:00Z',
    lastActiveAt: '2026-11-07T12:10:00Z',
    orders: 2,
    totalSpent: 128.0,
    location: 'Brooklyn, NY',
    consent: { email: true, sms: false, push: false },
    activity: [
      { id: 'act_4', type: 'email', label: 'Clicked Flash sale', at: '2026-11-07T12:10:00Z' },
      { id: 'act_5', type: 'browse', label: 'Viewed Winter jacket', at: '2026-11-06T19:30:00Z' },
    ],
  },
  {
    id: 'ct_003',
    firstName: 'Sofia',
    lastName: 'Reyes',
    email: 'sofia.reyes@example.com',
    phone: '+1 312 555 0177',
    emailStatus: 'unsubscribed',
    smsStatus: 'subscribed',
    pushStatus: 'subscribed',
    tags: ['possible-duplicate'],
    segmentIds: ['seg_003'],
    createdAt: '2026-09-12T14:05:00Z',
    lastActiveAt: '2026-11-01T09:18:00Z',
    orders: 1,
    totalSpent: 54.2,
    location: 'Chicago, IL',
    consent: { email: false, sms: true, push: true },
    activity: [
      { id: 'act_6', type: 'sms', label: 'Received restock alert', at: '2026-11-01T09:18:00Z' },
    ],
  },
  {
    id: 'ct_004',
    firstName: 'Liam',
    lastName: 'Chen',
    email: 'liam.chen@example.com',
    phone: '+1 206 555 0111',
    emailStatus: 'subscribed',
    smsStatus: 'subscribed',
    pushStatus: 'non_subscribed',
    tags: ['vip', 'loyalty'],
    segmentIds: ['seg_001', 'seg_002'],
    createdAt: '2026-08-21T11:44:00Z',
    lastActiveAt: '2026-11-10T08:05:00Z',
    orders: 11,
    totalSpent: 1640.75,
    location: 'Seattle, WA',
    consent: { email: true, sms: true, push: false },
    activity: [
      { id: 'act_7', type: 'order', label: 'Placed order #1108', at: '2026-11-10T08:05:00Z' },
      { id: 'act_8', type: 'automation', label: 'Entered Welcome journey', at: '2026-08-21T11:50:00Z' },
    ],
  },
  {
    id: 'ct_005',
    firstName: 'Maya',
    lastName: 'Okoro',
    email: 'maya.okoro@example.com',
    phone: '',
    emailStatus: 'non_subscribed',
    smsStatus: 'non_subscribed',
    pushStatus: 'non_subscribed',
    tags: ['source: shopify'],
    segmentIds: [],
    createdAt: '2026-11-05T17:28:00Z',
    lastActiveAt: '2026-11-05T17:28:00Z',
    orders: 0,
    totalSpent: 0,
    location: 'Austin, TX',
    consent: { email: false, sms: false, push: false },
    activity: [
      { id: 'act_9', type: 'import', label: 'Imported from Shopify', at: '2026-11-05T17:28:00Z' },
    ],
  },
  {
    id: 'ct_006',
    firstName: 'Elena',
    lastName: 'Brooks',
    email: 'elena.brooks@example.com',
    phone: '+1 617 555 0133',
    emailStatus: 'subscribed',
    smsStatus: 'unsubscribed',
    pushStatus: 'non_subscribed',
    tags: ['loyalty'],
    segmentIds: ['seg_001'],
    createdAt: '2026-07-03T09:12:00Z',
    lastActiveAt: '2026-11-04T20:15:00Z',
    orders: 4,
    totalSpent: 390.0,
    location: 'Boston, MA',
    consent: { email: true, sms: false, push: false },
    activity: [
      { id: 'act_10', type: 'email', label: 'Opened Winback draft preview', at: '2026-11-04T20:15:00Z' },
    ],
  },
]

export const segments = [
  {
    id: 'seg_001',
    name: 'VIP buyers',
    contactCount: 2,
    status: 'active',
    updatedAt: '2026-11-08T10:00:00Z',
    rules: [
      { field: 'totalSpent', operator: 'greater_than', value: '500' },
      { field: 'emailStatus', operator: 'equals', value: 'subscribed' },
    ],
  },
  {
    id: 'seg_002',
    name: 'Engaged last 30 days',
    contactCount: 2,
    status: 'active',
    updatedAt: '2026-11-09T12:30:00Z',
    rules: [{ field: 'lastActiveAt', operator: 'within_days', value: '30' }],
  },
  {
    id: 'seg_003',
    name: 'SMS reachable',
    contactCount: 2,
    status: 'active',
    updatedAt: '2026-11-06T08:45:00Z',
    rules: [{ field: 'smsStatus', operator: 'equals', value: 'subscribed' }],
  },
]

export const tags = [
  { id: 'tag_001', name: 'vip', lastUsedAt: '2026-11-10T05:05:00Z', contactCount: 2 },
  { id: 'tag_002', name: 'source: shopify', lastUsedAt: '2026-11-10T05:05:00Z', contactCount: 2 },
  { id: 'tag_003', name: 'source: form', lastUsedAt: '2026-11-07T12:10:00Z', contactCount: 1 },
  { id: 'tag_004', name: 'loyalty', lastUsedAt: '2026-11-04T20:15:00Z', contactCount: 2 },
  { id: 'tag_005', name: 'possible-duplicate', lastUsedAt: '2026-11-01T09:18:00Z', contactCount: 1 },
]

export const imports = [
  {
    id: 'imp_001',
    name: 'Shopify sync — Nov 5',
    status: 'completed',
    importedAt: '2026-11-05T17:28:00Z',
    newContacts: 1,
    updatedContacts: 4,
  },
  {
    id: 'imp_002',
    name: 'CSV — VIP list',
    status: 'completed',
    importedAt: '2026-10-21T13:10:00Z',
    newContacts: 2,
    updatedContacts: 0,
  },
]

export const exportsList = [
  {
    id: 'exp_001',
    name: 'All subscribed emails',
    status: 'completed',
    exportedAt: '2026-11-03T09:40:00Z',
    contacts: 4,
  },
]

export function getContacts() {
  return contacts
}

export function getContactById(id) {
  return contacts.find((contact) => contact.id === id) || null
}

export function getContactStats() {
  return {
    total: contacts.length,
    emailSubscribers: contacts.filter((c) => c.emailStatus === 'subscribed').length,
    smsSubscribers: contacts.filter((c) => c.smsStatus === 'subscribed').length,
    pushSubscribers: contacts.filter((c) => c.pushStatus === 'subscribed').length,
  }
}

export function getSegments() {
  return segments
}

export function getSegmentById(id) {
  return segments.find((segment) => segment.id === id) || null
}

export function getTags() {
  return tags
}

export function getImports() {
  return imports
}

export function getExports() {
  return exportsList
}

export function formatContactName(contact) {
  return `${contact.firstName} ${contact.lastName}`.trim()
}
