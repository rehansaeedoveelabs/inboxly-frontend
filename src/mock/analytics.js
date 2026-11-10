/** Analytics and live activity mock data — fictional. */

export const analyticsOverview = {
  campaignRevenue: 7450,
  automationRevenue: 10750,
  emailOpenRate: 42.6,
  smsClickRate: 18.4,
  newSubscribers: 215,
  unsubscribes: 12,
}

export const campaignReportRows = [
  { id: 'camp_001', name: 'Spring launch — email', channel: 'email', sent: 412, opens: 198, clicks: 64, revenue: 3120 },
  { id: 'camp_003', name: 'Restock alert — email', channel: 'email', sent: 251, opens: 141, clicks: 73, revenue: 4330 },
  { id: 'camp_002', name: 'Flash sale — SMS', channel: 'sms', sent: 0, opens: 0, clicks: 0, revenue: 0 },
]

export const automationReportRows = [
  { id: 'auto_001', name: 'Abandoned cart', enrolled: 128, completed: 41, revenue: 6420, status: 'active' },
  { id: 'auto_002', name: 'Welcome journey', enrolled: 86, completed: 62, revenue: 2180, status: 'active' },
  { id: 'auto_003', name: 'Browse abandonment', enrolled: 12, completed: 3, revenue: 310, status: 'paused' },
]

export const channelPerformance = [
  { channel: 'Email', sent: 663, opens: 339, clicks: 137, revenue: 7450 },
  { channel: 'SMS', sent: 94, opens: 0, clicks: 17, revenue: 980 },
  { channel: 'Push', sent: 28, opens: 11, clicks: 4, revenue: 210 },
]

export const audienceGrowthSeries = [
  { label: 'Oct 20', total: 1180, subscribed: 1102, unsubscribed: 78 },
  { label: 'Oct 27', total: 1240, subscribed: 1158, unsubscribed: 82 },
  { label: 'Nov 3', total: 1310, subscribed: 1224, unsubscribed: 86 },
  { label: 'Nov 10', total: 1395, subscribed: 1301, unsubscribed: 94 },
]

export const liveEvents = [
  {
    id: 'live_001',
    type: 'viewed_product',
    contact: 'Amina Hassan',
    detail: 'Viewed Winter Jacket',
    at: '2026-11-10T12:42:00Z',
  },
  {
    id: 'live_002',
    type: 'added_to_cart',
    contact: 'Liam Chen',
    detail: 'Added Canvas Tote to cart',
    at: '2026-11-10T12:38:00Z',
  },
  {
    id: 'live_003',
    type: 'form_submit',
    contact: 'Noah Patel',
    detail: 'Submitted Welcome discount popup',
    at: '2026-11-10T12:21:00Z',
  },
  {
    id: 'live_004',
    type: 'placed_order',
    contact: 'Elena Brooks',
    detail: 'Placed order #1114 · $86.00',
    at: '2026-11-10T11:58:00Z',
  },
  {
    id: 'live_005',
    type: 'email_open',
    contact: 'Sofia Reyes',
    detail: 'Opened Restock alert',
    at: '2026-11-10T11:40:00Z',
  },
]

export function getAnalyticsOverview() {
  return analyticsOverview
}

export function getCampaignReportRows() {
  return campaignReportRows
}

export function getAutomationReportRows() {
  return automationReportRows
}

export function getChannelPerformance() {
  return channelPerformance
}

export function getAudienceGrowthSeries() {
  return audienceGrowthSeries
}

export function getLiveEvents() {
  return liveEvents
}
