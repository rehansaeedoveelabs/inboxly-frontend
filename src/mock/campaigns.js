/** Campaign mock records — fictional performance numbers. */

export const campaigns = [
  {
    id: 'camp_001',
    name: 'Spring launch — email',
    channel: 'email',
    status: 'sent',
    subject: 'New season essentials are here',
    previewText: 'Fresh drops, free shipping over $50',
    audience: 'VIP buyers',
    audienceCount: 420,
    scheduledAt: '2026-11-08T14:00:00Z',
    sentAt: '2026-11-08T14:20:00Z',
    createdAt: '2026-11-06T09:00:00Z',
    content:
      'Hi {{first_name}},\n\nDiscover our spring collection with limited-time bundles.\n\nShop now →',
    stats: { delivered: 412, opens: 198, clicks: 64, revenue: 3120, unsubscribes: 2 },
  },
  {
    id: 'camp_002',
    name: 'Flash sale — SMS',
    channel: 'sms',
    status: 'scheduled',
    subject: '',
    previewText: '',
    audience: 'SMS reachable',
    audienceCount: 180,
    scheduledAt: '2026-11-12T09:00:00Z',
    sentAt: null,
    createdAt: '2026-11-09T16:20:00Z',
    content: 'Inboxly Demo: 20% off today only. Use FLASH20. Reply STOP to opt out.',
    stats: { delivered: 0, opens: 0, clicks: 0, revenue: 0, unsubscribes: 0 },
  },
  {
    id: 'camp_003',
    name: 'Restock alert — email',
    channel: 'email',
    status: 'sent',
    subject: 'Your waitlist item is back',
    previewText: 'Sizes are limited — grab yours',
    audience: 'Engaged last 30 days',
    audienceCount: 260,
    scheduledAt: '2026-11-02T11:00:00Z',
    sentAt: '2026-11-02T11:05:00Z',
    createdAt: '2026-11-01T18:40:00Z',
    content: 'Good news — the item you saved is back in stock for a short window.',
    stats: { delivered: 251, opens: 141, clicks: 73, revenue: 4330, unsubscribes: 1 },
  },
  {
    id: 'camp_004',
    name: 'Winback series',
    channel: 'email',
    status: 'draft',
    subject: 'We saved something for you',
    previewText: 'A little incentive to come back',
    audience: 'All contacts',
    audienceCount: 0,
    scheduledAt: null,
    sentAt: null,
    createdAt: '2026-11-09T11:05:00Z',
    content: 'Draft body — offer placeholder and product recommendations.',
    stats: { delivered: 0, opens: 0, clicks: 0, revenue: 0, unsubscribes: 0 },
  },
  {
    id: 'camp_005',
    name: 'Holiday teaser — SMS',
    channel: 'sms',
    status: 'draft',
    subject: '',
    previewText: '',
    audience: 'SMS reachable',
    audienceCount: 180,
    scheduledAt: null,
    sentAt: null,
    createdAt: '2026-11-10T07:55:00Z',
    content: 'Holiday previews drop Friday. Be first in line.',
    stats: { delivered: 0, opens: 0, clicks: 0, revenue: 0, unsubscribes: 0 },
  },
]

export function getCampaigns() {
  return campaigns
}

export function getCampaignById(id) {
  return campaigns.find((campaign) => campaign.id === id) || null
}

export function getCampaignStats() {
  const list = campaigns
  return {
    total: list.length,
    sent: list.filter((c) => c.status === 'sent').length,
    scheduled: list.filter((c) => c.status === 'scheduled').length,
    draft: list.filter((c) => c.status === 'draft').length,
  }
}
