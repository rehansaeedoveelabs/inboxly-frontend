import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, FormInput } from 'lucide-react'
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
import { getFormStats, getForms } from '../../mock'
import { formatDateTime, formatNumber, statusLabel, statusTone } from '../../lib/format'

export function FormsPage() {
  const navigate = useNavigate()
  const stats = getFormStats()
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)

  const rows = useMemo(() => {
    return getForms().filter((form) => {
      const matchesTab =
        tab === 'all' ? true : tab === 'popup' || tab === 'embedded' ? form.type === tab : form.status === tab
      const matchesQuery = form.name.toLowerCase().includes(query.trim().toLowerCase())
      return matchesTab && matchesQuery
    })
  }, [query, tab])

  const columns = [
    {
      key: 'name',
      label: 'Form',
      render: (row) => (
        <Link to={`/forms/${row.id}`} className="font-medium text-ink hover:text-electric">
          {row.name}
        </Link>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (row) => <Badge tone="info">{row.type}</Badge>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge tone={statusTone(row.status)}>{statusLabel(row.status)}</Badge>,
    },
    {
      key: 'submissions',
      label: 'Submissions',
      render: (row) => formatNumber(row.submissions),
    },
    {
      key: 'conversionRate',
      label: 'Conv. %',
      render: (row) => `${row.conversionRate}%`,
    },
    {
      key: 'updatedAt',
      label: 'Updated',
      render: (row) => formatDateTime(row.updatedAt),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Forms"
        description="Popup and embedded signup forms. Publishing is a local prototype action."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Create form
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <MetricCard label="Total forms" value={stats.total} />
        <MetricCard label="Enabled" value={stats.enabled} />
        <MetricCard label="Drafts" value={stats.draft} />
      </div>

      <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { value: 'all', label: 'All' },
            { value: 'popup', label: 'Popup' },
            { value: 'embedded', label: 'Embedded' },
            { value: 'enabled', label: 'Enabled' },
            { value: 'draft', label: 'Draft' },
          ]}
        />
        <SearchInput
          className="w-full sm:w-72"
          placeholder="Search forms"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={FormInput}
          title="No forms match"
          description="Create a popup or embedded form to collect subscribers."
          actionLabel="Create form"
          onAction={() => setCreateOpen(true)}
        />
      ) : (
        <Table columns={columns} rows={rows} />
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create form"
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
            onClick={() => navigate('/forms/new?type=popup')}
          >
            <p className="font-semibold text-ink">Popup form</p>
            <p className="mt-1 text-sm text-muted">Overlay on storefront pages.</p>
          </button>
          <button
            type="button"
            className="rounded-lg border border-line bg-midnight p-4 text-left hover:border-cantaloupe"
            onClick={() => navigate('/forms/new?type=embedded')}
          >
            <p className="font-semibold text-ink">Embedded form</p>
            <p className="mt-1 text-sm text-muted">Inline block for pages or footer.</p>
          </button>
        </div>
      </Modal>
    </div>
  )
}
