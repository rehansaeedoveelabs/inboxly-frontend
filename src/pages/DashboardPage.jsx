import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  PageHeader,
  MetricCard,
  ChartContainer,
  DateRangeSelector,
  Card,
  Badge,
  Tabs,
} from '../components/ui'
import {
  getAudienceSeries,
  getDashboardMetrics,
  getRecentAutomationActivity,
  getRecentCampaignActivity,
  getRevenueSeries,
} from '../mock'
import { formatCurrency, formatNumber, statusLabel, statusTone } from '../lib/format'
import { useTheme } from '../theme/useTheme'
import { getChartThemeColors } from '../theme/theme'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export function DashboardPage() {
  const [range, setRange] = useState('30d')
  const [chartTab, setChartTab] = useState('revenue')
  const { resolved } = useTheme()
  const chart = getChartThemeColors()
  const metrics = getDashboardMetrics()
  const revenueSeries = getRevenueSeries()
  const audienceSeries = getAudienceSeries()
  const campaigns = getRecentCampaignActivity()
  const automations = getRecentAutomationActivity()

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Performance overview with prototype metrics. Nothing is connected to a live store."
        actions={
          <div className="flex items-center gap-2">
            <Badge tone="accent">Mock data</Badge>
            <DateRangeSelector value={range} onChange={setRange} className="w-40" />
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Marketing revenue"
          value={formatCurrency(metrics.marketingRevenue)}
          trend="+12.4%"
          hint="Campaigns + automation"
        />
        <MetricCard
          label="Campaign revenue"
          value={formatCurrency(metrics.campaignRevenue)}
          trend="+4.1%"
          hint="Email & SMS sends"
        />
        <MetricCard
          label="Automation revenue"
          value={formatCurrency(metrics.automationRevenue)}
          trend="+18.2%"
          hint="Active workflows"
        />
        <MetricCard
          label="Audience growth"
          value={`+${formatNumber(metrics.audienceGrowth)}`}
          trend="+8.6%"
          hint="Net new subscribers"
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <MetricCard label="Email subscribers" value={formatNumber(metrics.emailSubscribers)} hint="Subscribed contacts" />
        <MetricCard label="SMS subscribers" value={formatNumber(metrics.smsSubscribers)} hint="Opted-in SMS" />
        <MetricCard label="Push subscribers" value={formatNumber(metrics.pushSubscribers)} hint="Web push enabled" />
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-5">
        <ChartContainer
          className="xl:col-span-3"
          title="Revenue performance"
          actions={
            <Tabs
              value={chartTab}
              onChange={setChartTab}
              items={[
                { value: 'revenue', label: 'Revenue' },
                { value: 'orders', label: 'Orders' },
              ]}
            />
          }
        >
          <ResponsiveContainer width="100%" height="100%" key={`bar-${resolved}`}>
            <BarChart data={revenueSeries}>
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
              <Bar dataKey={chartTab} fill={chart.electric} radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer className="xl:col-span-2" title="Audience growth">
          <ResponsiveContainer width="100%" height="100%" key={`line-${resolved}`}>
            <LineChart data={audienceSeries}>
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
              <Line type="monotone" dataKey="email" stroke={chart.electric} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="sms" stroke={chart.cantaloupe} strokeWidth={2} dot={false} />
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
          <ul className="space-y-2 text-sm">
            {campaigns.map((item) => (
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
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">Recent automations</h3>
            <Link to="/automation" className="text-sm text-electric hover:underline">
              View all
            </Link>
          </div>
          <ul className="space-y-2 text-sm">
            {automations.map((item) => (
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
        </Card>
      </div>
    </div>
  )
}
