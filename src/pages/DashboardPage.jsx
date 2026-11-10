import { useState } from 'react'
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

const revenueSeries = [
  { label: 'W1', revenue: 4200, orders: 38 },
  { label: 'W2', revenue: 5100, orders: 44 },
  { label: 'W3', revenue: 4700, orders: 41 },
  { label: 'W4', revenue: 6200, orders: 52 },
]

const audienceSeries = [
  { label: 'W1', email: 1180, sms: 240 },
  { label: 'W2', email: 1240, sms: 255 },
  { label: 'W3', email: 1310, sms: 268 },
  { label: 'W4', email: 1395, sms: 290 },
]

export function DashboardPage() {
  const [range, setRange] = useState('30d')
  const [chartTab, setChartTab] = useState('revenue')

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
        <MetricCard label="Marketing revenue" value="$18,200" trend="+12.4%" hint="Campaigns + automation" />
        <MetricCard label="Campaign revenue" value="$7,450" trend="+4.1%" hint="Email & SMS sends" />
        <MetricCard label="Automation revenue" value="$10,750" trend="+18.2%" hint="Active workflows" />
        <MetricCard label="Audience growth" value="+215" trend="+8.6%" hint="Net new subscribers" />
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
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueSeries}>
              <CartesianGrid stroke="#2E3648" vertical={false} />
              <XAxis dataKey="label" stroke="#A4ADBF" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#A4ADBF" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: '#191E2B',
                  border: '1px solid #2E3648',
                  borderRadius: 8,
                }}
              />
              <Bar
                dataKey={chartTab}
                fill="#2878FF"
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer className="xl:col-span-2" title="Audience growth">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={audienceSeries}>
              <CartesianGrid stroke="#2E3648" vertical={false} />
              <XAxis dataKey="label" stroke="#A4ADBF" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#A4ADBF" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: '#191E2B',
                  border: '1px solid #2E3648',
                  borderRadius: 8,
                }}
              />
              <Line type="monotone" dataKey="email" stroke="#2878FF" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="sms" stroke="#FFA66B" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">Recent campaigns</h3>
            <Badge tone="neutral">Shell preview</Badge>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between rounded-md border border-line bg-midnight px-3 py-2">
              <span>Spring launch — email</span>
              <Badge tone="success">Sent</Badge>
            </li>
            <li className="flex items-center justify-between rounded-md border border-line bg-midnight px-3 py-2">
              <span>Flash sale — SMS</span>
              <Badge tone="info">Scheduled</Badge>
            </li>
            <li className="flex items-center justify-between rounded-md border border-line bg-midnight px-3 py-2">
              <span>Winback series</span>
              <Badge tone="warning">Draft</Badge>
            </li>
          </ul>
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">Recent automations</h3>
            <Badge tone="neutral">Shell preview</Badge>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between rounded-md border border-line bg-midnight px-3 py-2">
              <span>Abandoned cart</span>
              <Badge tone="success">Active</Badge>
            </li>
            <li className="flex items-center justify-between rounded-md border border-line bg-midnight px-3 py-2">
              <span>Welcome journey</span>
              <Badge tone="success">Active</Badge>
            </li>
            <li className="flex items-center justify-between rounded-md border border-line bg-midnight px-3 py-2">
              <span>Browse abandonment</span>
              <Badge tone="warning">Paused</Badge>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
