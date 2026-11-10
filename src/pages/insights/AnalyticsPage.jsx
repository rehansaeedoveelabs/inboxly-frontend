import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  PageHeader,
  MetricCard,
  ChartContainer,
  DateRangeSelector,
  Tabs,
  Table,
  Badge,
  Card,
} from '../../components/ui'
import {
  getAnalyticsOverview,
  getAudienceGrowthSeries,
  getAutomationReportRows,
  getCampaignReportRows,
  getChannelPerformance,
} from '../../mock'
import { formatCurrency, formatNumber, statusLabel, statusTone } from '../../lib/format'
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
  const [range, setRange] = useState('30d')
  const [reportTab, setReportTab] = useState('campaigns')
  const { resolved } = useTheme()
  const chart = getChartThemeColors()
  const overview = getAnalyticsOverview()
  const growth = getAudienceGrowthSeries()
  const channels = getChannelPerformance()

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
    { key: 'sent', label: 'Sent', render: (row) => formatNumber(row.sent) },
    { key: 'opens', label: 'Opens', render: (row) => formatNumber(row.opens) },
    { key: 'clicks', label: 'Clicks', render: (row) => formatNumber(row.clicks) },
    { key: 'revenue', label: 'Revenue', render: (row) => formatCurrency(row.revenue) },
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
    { key: 'enrolled', label: 'Enrolled', render: (row) => formatNumber(row.enrolled) },
    { key: 'completed', label: 'Completed', render: (row) => formatNumber(row.completed) },
    { key: 'revenue', label: 'Revenue', render: (row) => formatCurrency(row.revenue) },
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
        description="Campaign, automation, audience and channel reports with mock figures."
        actions={
          <DateRangeSelector value={range} onChange={setRange} className="w-40" />
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Campaign revenue" value={formatCurrency(overview.campaignRevenue)} hint="Attributed sends" />
        <MetricCard label="Automation revenue" value={formatCurrency(overview.automationRevenue)} hint="Workflow attributed" />
        <MetricCard label="Email open rate" value={`${overview.emailOpenRate}%`} hint="Across sent campaigns" />
        <MetricCard label="SMS click rate" value={`${overview.smsClickRate}%`} hint="Tracked SMS links" />
        <MetricCard label="New subscribers" value={formatNumber(overview.newSubscribers)} hint="Net growth in range" />
        <MetricCard label="Unsubscribes" value={formatNumber(overview.unsubscribes)} hint="Email + SMS" />
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        <ChartContainer title="Audience growth">
          <ResponsiveContainer width="100%" height="100%" key={`growth-${resolved}`}>
            <LineChart data={growth}>
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
              <Line type="monotone" dataKey="subscribed" stroke={chart.electric} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="unsubscribed" stroke={chart.cantaloupe} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Channel performance (revenue)">
          <ResponsiveContainer width="100%" height="100%" key={`channel-${resolved}`}>
            <BarChart data={channels}>
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
              <Bar dataKey="revenue" fill={chart.electric} radius={[4, 4, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <Card className="mt-4" padding={false}>
        <div className="flex flex-col gap-3 border-b border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-semibold text-ink">Reports</h3>
          <Tabs
            value={reportTab}
            onChange={setReportTab}
            items={[
              { value: 'campaigns', label: 'Campaigns' },
              { value: 'automations', label: 'Automations' },
              { value: 'channels', label: 'Channels' },
            ]}
          />
        </div>
        <div className="p-4">
          {reportTab === 'campaigns' && (
            <Table columns={campaignColumns} rows={getCampaignReportRows()} />
          )}
          {reportTab === 'automations' && (
            <Table columns={automationColumns} rows={getAutomationReportRows()} />
          )}
          {reportTab === 'channels' && (
            <Table
              columns={[
                { key: 'channel', label: 'Channel' },
                { key: 'sent', label: 'Sent', render: (row) => formatNumber(row.sent) },
                { key: 'opens', label: 'Opens', render: (row) => formatNumber(row.opens) },
                { key: 'clicks', label: 'Clicks', render: (row) => formatNumber(row.clicks) },
                { key: 'revenue', label: 'Revenue', render: (row) => formatCurrency(row.revenue) },
              ]}
              rows={channels}
            />
          )}
        </div>
      </Card>
    </div>
  )
}
