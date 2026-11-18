import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  PageHeader,
  MetricCard,
  ChartContainer,
  Card,
  Badge,
  EmptyState,
} from '../components/ui'
import { useActiveStore } from '../store/useActiveStore'
import { ApiError } from '../lib/api'
import { getStoreInsightsOverview } from '../lib/insightsApi'
import { formatNumber, statusLabel, statusTone } from '../lib/format'
import { useTheme } from '../theme/useTheme'
import { getChartThemeColors } from '../theme/theme'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export function DashboardPage() {
  const { activeStore, status: storeStatus } = useActiveStore()
  const storeId = activeStore?.id
  const { resolved } = useTheme()
  const chart = getChartThemeColors()

  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!storeId) {
      setOverview(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      setOverview(await getStoreInsightsOverview(storeId))
    } catch (err) {
      setOverview(null)
      setError(err instanceof ApiError ? err.message : 'Unable to load dashboard.')
    } finally {
      setLoading(false)
    }
  }, [storeId])

  useEffect(() => {
    load()
  }, [load])

  if (storeStatus === 'loading' || loading) {
    return <p className="text-sm text-muted">Loading dashboard…</p>
  }

  if (!storeId) {
    return (
      <EmptyState
        title="Select a store"
        description="Dashboard metrics are scoped to the active store."
      />
    )
  }

  if (error) {
    return (
      <EmptyState
        title="Unable to load dashboard"
        description={error}
        actionLabel="Retry"
        onAction={load}
      />
    )
  }

  const campaigns = overview?.campaigns || {}
  const automations = overview?.automations || {}
  const series = overview?.audience_series || []
  const recentCampaigns = overview?.recent_campaigns || []
  const recentAutomations = overview?.recent_automations || []

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`Live store metrics for ${activeStore.name}. Revenue analytics are not available yet.`}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Contacts" value={formatNumber(overview?.contacts_total ?? 0)} hint="Store audience" />
        <MetricCard
          label="Email subscribers"
          value={formatNumber(overview?.email_subscribers ?? 0)}
          hint="Subscribed email consent"
        />
        <MetricCard
          label="SMS subscribers"
          value={formatNumber(overview?.sms_subscribers ?? 0)}
          hint="Subscribed SMS consent"
        />
        <MetricCard
          label="Automation enrollments"
          value={formatNumber(automations.enrollments_total ?? 0)}
          hint="All-time enrollments"
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <MetricCard label="Campaigns sent" value={formatNumber(campaigns.sent ?? 0)} hint="Sent + partially sent" />
        <MetricCard label="Campaigns draft" value={formatNumber(campaigns.draft ?? 0)} />
        <MetricCard label="Automations active" value={formatNumber(automations.active ?? 0)} />
      </div>

      <div className="mt-4">
        <ChartContainer title="Audience activity (last 4 weeks)">
          <ResponsiveContainer width="100%" height="100%" key={`line-${resolved}`}>
            <LineChart data={series}>
              <CartesianGrid stroke={chart.grid} vertical={false} />
              <XAxis dataKey="label" stroke={chart.axis} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={chart.axis} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: chart.tooltipBg,
                  border: `1px solid ${chart.tooltipBorder}`,
                  borderRadius: 8,
                  color: chart.tooltipText,
                }}
              />
              <Line type="monotone" dataKey="contacts" stroke={chart.electric} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="email" stroke={chart.cantaloupe} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="sms" stroke={chart.axis} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">Recent campaigns</h3>
            <Link to="/campaigns" className="text-sm text-electric hover:underline">
              View all
            </Link>
          </div>
          {recentCampaigns.length === 0 ? (
            <p className="text-sm text-muted">No campaigns yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {recentCampaigns.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-line bg-midnight px-3 py-2"
                >
                  <Link to={`/campaigns/${item.id}`} className="truncate text-ink hover:text-electric">
                    {item.name}
                  </Link>
                  <Badge tone={statusTone(item.status)}>{statusLabel(item.status)}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">Recent automations</h3>
            <Link to="/automation" className="text-sm text-electric hover:underline">
              View all
            </Link>
          </div>
          {recentAutomations.length === 0 ? (
            <p className="text-sm text-muted">No automations yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {recentAutomations.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-line bg-midnight px-3 py-2"
                >
                  <Link to={`/automation/${item.id}`} className="truncate text-ink hover:text-electric">
                    {item.name}
                  </Link>
                  <Badge tone={statusTone(item.status)}>{statusLabel(item.status)}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
