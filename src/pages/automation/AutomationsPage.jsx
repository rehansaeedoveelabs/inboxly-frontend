import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Workflow } from 'lucide-react'
import {
  PageHeader,
  Button,
  SearchInput,
  Table,
  Badge,
  Tabs,
  EmptyState,
} from '../../components/ui'
import { getAutomations } from '../../mock'
import { formatCurrency, formatDateTime, formatNumber, statusLabel, statusTone } from '../../lib/format'

export function AutomationsPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState('all')

  const rows = useMemo(() => {
    return getAutomations().filter((item) => {
      const matchesTab = tab === 'all' ? true : item.status === tab
      const matchesQuery = item.name.toLowerCase().includes(query.trim().toLowerCase())
      return matchesTab && matchesQuery
    })
  }, [query, tab])

  const columns = [
    {
      key: 'name',
      label: 'Automation',
      render: (row) => (
        <Link to={`/automation/${row.id}`} className="font-medium text-ink hover:text-electric">
          {row.name}
        </Link>
      ),
    },
    { key: 'trigger', label: 'Trigger' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge tone={statusTone(row.status)}>{statusLabel(row.status)}</Badge>,
    },
    {
      key: 'enrolled',
      label: 'Enrolled',
      render: (row) => formatNumber(row.enrolled),
    },
    {
      key: 'revenue',
      label: 'Revenue',
      render: (row) => formatCurrency(row.revenue),
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
        title="Automation"
        description="Workflow listing and templates. The canvas is a frontend prototype only."
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate('/automation/templates')}>
              Explore templates
            </Button>
            <Button onClick={() => navigate('/automation/new')}>
              <Plus className="size-4" />
              Create workflow
            </Button>
          </>
        }
      />

      <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { value: 'all', label: 'All' },
            { value: 'active', label: 'Active' },
            { value: 'paused', label: 'Paused' },
          ]}
        />
        <SearchInput
          className="w-full sm:w-72"
          placeholder="Search automations"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={Workflow}
          title="No automations in this view"
          description="Start from a template or create a blank workflow canvas."
          actionLabel="Explore templates"
          onAction={() => navigate('/automation/templates')}
        />
      ) : (
        <Table columns={columns} rows={rows} />
      )}
    </div>
  )
}
