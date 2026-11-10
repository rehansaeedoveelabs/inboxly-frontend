import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import {
  PageHeader,
  Button,
  Tabs,
  SearchInput,
  Table,
  Badge,
  MetricCard,
  EmptyState,
  Modal,
} from '../../components/ui'
import { getCampaignStats, getCampaigns } from '../../mock'
import { formatDateTime, statusLabel, statusTone } from '../../lib/format'

export function CampaignsPage() {
  const navigate = useNavigate()
  const stats = getCampaignStats()
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)

  const rows = useMemo(() => {
    return getCampaigns().filter((campaign) => {
      const matchesTab = tab === 'all' ? true : campaign.status === tab
      const matchesQuery = campaign.name.toLowerCase().includes(query.trim().toLowerCase())
      return matchesTab && matchesQuery
    })
  }, [query, tab])

  const columns = [
    {
      key: 'name',
      label: 'Campaign',
      render: (row) => (
        <Link to={`/campaigns/${row.id}`} className="font-medium text-ink hover:text-electric">
          {row.name}
        </Link>
      ),
    },
    {
      key: 'channel',
      label: 'Channel',
      render: (row) => <Badge tone="info">{row.channel.toUpperCase()}</Badge>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge tone={statusTone(row.status)}>{statusLabel(row.status)}</Badge>,
    },
    { key: 'audience', label: 'Audience' },
    {
      key: 'scheduledAt',
      label: 'Send time',
      render: (row) => formatDateTime(row.sentAt || row.scheduledAt),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Campaigns"
        description="Email and SMS campaign listing with local filters. Sending is not connected."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Create campaign
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total" value={stats.total} />
        <MetricCard label="Sent" value={stats.sent} />
        <MetricCard label="Scheduled" value={stats.scheduled} />
        <MetricCard label="Drafts" value={stats.draft} />
      </div>

      <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { value: 'all', label: 'All' },
            { value: 'draft', label: 'Draft' },
            { value: 'scheduled', label: 'Scheduled' },
            { value: 'sent', label: 'Sent' },
          ]}
        />
        <SearchInput
          className="w-full sm:w-72"
          placeholder="Search campaigns"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No campaigns match"
          description="Create an email or SMS campaign to get started."
          actionLabel="Create campaign"
          onAction={() => setCreateOpen(true)}
        />
      ) : (
        <Table columns={columns} rows={rows} />
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Choose campaign type"
        footer={
          <Button variant="ghost" onClick={() => setCreateOpen(false)}>
            Cancel
          </Button>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className="rounded-lg border border-line bg-midnight p-4 text-left hover:border-electric"
            onClick={() => navigate('/campaigns/new/email')}
          >
            <p className="font-semibold text-ink">Email campaign</p>
            <p className="mt-1 text-sm text-muted">Subject, content, audience and schedule.</p>
          </button>
          <button
            type="button"
            className="rounded-lg border border-line bg-midnight p-4 text-left hover:border-cantaloupe"
            onClick={() => navigate('/campaigns/new/sms')}
          >
            <p className="font-semibold text-ink">SMS campaign</p>
            <p className="mt-1 text-sm text-muted">Short message, audience and send time.</p>
          </button>
        </div>
      </Modal>
    </div>
  )
}
