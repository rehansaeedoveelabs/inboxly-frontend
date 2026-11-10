/** Dashboard performance mock data — fictional. */

export const dashboardMetrics = {
  marketingRevenue: 18200,
  campaignRevenue: 7450,
  automationRevenue: 10750,
  storeRevenue: 42100,
  audienceGrowth: 215,
  emailSubscribers: 1395,
  smsSubscribers: 290,
  pushSubscribers: 64,
}

export const revenueSeries = [
  { label: 'W1', revenue: 4200, orders: 38 },
  { label: 'W2', revenue: 5100, orders: 44 },
  { label: 'W3', revenue: 4700, orders: 41 },
  { label: 'W4', revenue: 6200, orders: 52 },
]

export const audienceSeries = [
  { label: 'W1', email: 1180, sms: 240, push: 40 },
  { label: 'W2', email: 1240, sms: 255, push: 48 },
  { label: 'W3', email: 1310, sms: 268, push: 55 },
  { label: 'W4', email: 1395, sms: 290, push: 64 },
]

export const recentCampaignActivity = [
  { id: 'camp_001', name: 'Spring launch — email', channel: 'email', status: 'sent', at: '2026-11-08T14:20:00Z' },
  { id: 'camp_002', name: 'Flash sale — SMS', channel: 'sms', status: 'scheduled', at: '2026-11-12T09:00:00Z' },
  { id: 'camp_004', name: 'Winback series', channel: 'email', status: 'draft', at: '2026-11-09T11:05:00Z' },
]

export const recentAutomationActivity = [
  { id: 'auto_001', name: 'Abandoned cart', status: 'active', runs: 128 },
  { id: 'auto_002', name: 'Welcome journey', status: 'active', runs: 86 },
  { id: 'auto_003', name: 'Browse abandonment', status: 'paused', runs: 12 },
]

export function getDashboardMetrics() {
  return dashboardMetrics
}

export function getRevenueSeries() {
  return revenueSeries
}

export function getAudienceSeries() {
  return audienceSeries
}

export function getRecentCampaignActivity() {
  return recentCampaignActivity
}

export function getRecentAutomationActivity() {
  return recentAutomationActivity
}
