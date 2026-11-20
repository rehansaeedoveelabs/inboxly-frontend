import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  PageHeader,
  MetricCard,
  ChartContainer,
  Tabs,
  Table,
  Badge,
  Card,
  LoadingState,
  EmptyState,
  ErrorState,
} from '../../components/ui'
import { ApiError } from '../../lib/api'
import { getStoreInsightsOverview } from '../../lib/insightsApi'
import { formatNumber, statusLabel, statusTone } from '../../lib/format'
import { useActiveStore } from '../../store/useActiveStore'
import { useTheme } from '../../theme/useTheme'
import { getChartThemeColors } from '../../theme/theme'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
} from 'recharts'

export function AnalyticsPage() {
  const { activeStore, status: storeStatus } = useActiveStore()
  const storeId = activeStore?.id
  const [reportTab, setReportTab] = useState('campaigns')
  const { resolved } = useTheme()
  const chart = getChartThemeColors()

  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!storeId) {
      setOverview(null)
      return
    }
    setLoading(true)
    setError('')
    try {
      setOverview(await getStoreInsightsOverview(storeId))
    } catch (err) {
      setOverview(null)
      setError(err instanceof ApiError ? err.message : 'Unable to load analytics.')
    } finally {
      setLoading(false)
    }
  }, [storeId])

  useEffect(() => {
    if (storeStatus === 'loading') return
    load()
  }, [storeStatus, load])

  if (storeStatus === 'loading' || loading) {
    return <LoadingState label="Loading analytics…" />
  }

  if (!storeId) {
    return (
      <EmptyState
        title="Select a store"
        description="Analytics are scoped to the active store."
      />
    )
  }

  if (error) {
    return (
      <ErrorState title="Unable to load analytics" description={error} onRetry={load} />
    )
  }

  const campaigns = overview?.campaigns || {}
  const automations = overview?.automations || {}
  const engagement = overview?.engagement || {}
  const series = (overview?.audience_series || []).map((row) => ({
    label: row.label,
    contacts: row.contacts,
    email: row.email,
    sms: row.sms,
  }))
  const channelBars = [
    { channel: 'Email', subscribers: overview?.email_subscribers || 0 },
    { channel: 'SMS', subscribers: overview?.sms_subscribers || 0 },
  ]
  const recentCampaigns = overview?.recent_campaigns || []
  const recentAutomations = overview?.recent_automations || []

  const campaignColumns = [
    {
      key: 'name',
      label: 'Campaign',
      render: (row) => (
        <Link to={`/campaigns/${row.id}`} className="text-ink hover:text-electric">
          {row.name}
        </Link>
      ),
    },
    {
      key: 'channel',
      label: 'Channel',
      render: (row) => <Badge tone="info">{row.channel}</Badge>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge tone={statusTone(row.status)}>{statusLabel(row.status)}</Badge>,
    },
  ]

  const automationColumns = [
    {
      key: 'name',
      label: 'Automation',
      render: (row) => (
        <Link to={`/automation/${row.id}`} className="text-ink hover:text-electric">
          {row.name}
        </Link>
      ),
    },
    {
      key: 'enrollments_count',
      label: 'Enrolled',
      render: (row) => formatNumber(row.enrollments_count || 0),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge tone={statusTone(row.status)}>{statusLabel(row.status)}</Badge>,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Analytics"
        description={`Live audience and campaign metrics for ${activeStore.name}. Revenue attribution is not available yet.`}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Contacts" value={formatNumber(overview?.contacts_total || 0)} hint="Store audience" />
        <MetricCard label="Email subscribers" value={formatNumber(overview?.email_subscribers || 0)} hint="Subscribed consent" />
        <MetricCard label="SMS subscribers" value={formatNumber(overview?.sms_subscribers || 0)} hint="Subscribed consent" />
        <MetricCard label="Campaigns sent" value={formatNumber(campaigns.sent || 0)} hint={`${campaigns.total || 0} total`} />
        <MetricCard
          label="Open rate"
          value={`${engagement.open_rate ?? 0}%`}
          hint={`${formatNumber(engagement.emails_opened || 0)} of ${formatNumber(engagement.emails_sent || 0)} sent`}
        />
        <MetricCard
          label="Click rate"
          value={`${engagement.click_rate ?? 0}%`}
          hint={`${formatNumber(engagement.emails_clicked || 0)} of ${formatNumber(engagement.emails_sent || 0)} sent`}
        />
        <MetricCard label="Active automations" value={formatNumber(automations.active || 0)} hint={`${automations.total || 0} total`} />
        <MetricCard
          label="Automation enrollments"
          value={formatNumber(automations.enrollments_total || 0)}
          hint="All time"
        />
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        <ChartContainer title="Audience growth (weekly)">
          <ResponsiveContainer width="100%" height="100%" key={`growth-${resolved}`}>
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

        <ChartContainer title="Subscribers by channel">
          <ResponsiveContainer width="100%" height="100%" key={`channel-${resolved}`}>
            <BarChart data={channelBars}>
              <CartesianGrid stroke={chart.grid} vertical={false} />
              <XAxis dataKey="channel" stroke={chart.axis} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={chart.axis} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: chart.tooltipBg,
                  border: `1px solid ${chart.tooltipBorder}`,
                  borderRadius: 8,
                  color: chart.tooltipText,
                }}
              />
              <Bar dataKey="subscribers" fill={chart.electric} radius={[4, 4, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <Card className="mt-4" padding={false}>
        <div className="flex flex-col gap-3 border-b border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-semibold text-ink">Recent activity</h3>
          <Tabs
            value={reportTab}
            onChange={setReportTab}
            items={[
              { value: 'campaigns', label: 'Campaigns' },
              { value: 'automations', label: 'Automations' },
            ]}
          />
        </div>
        <div className="p-4">
          {reportTab === 'campaigns' ? (
            <Table columns={campaignColumns} rows={recentCampaigns} />
          ) : (
            <Table columns={automationColumns} rows={recentAutomations} />
          )}
        </div>
      </Card>
    </div>
  )
}
