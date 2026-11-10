import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import {
  PageHeader,
  MetricCard,
  SearchInput,
  Table,
  Tabs,
  Badge,
  Button,
  EmptyState,
} from '../../components/ui'
import { formatContactName, getContactStats, getContacts } from '../../mock'
import { formatDate, statusLabel, statusTone } from '../../lib/format'

export function ContactsPage() {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState('all')
  const [selected, setSelected] = useState([])
  const stats = getContactStats()
  const allContacts = getContacts()

  const rows = useMemo(() => {
    return allContacts.filter((contact) => {
      const haystack = `${contact.firstName} ${contact.lastName} ${contact.email} ${contact.phone}`.toLowerCase()
      const matchesQuery = haystack.includes(query.trim().toLowerCase())
      if (!matchesQuery) return false
      if (tab === 'email') return contact.emailStatus === 'subscribed'
      if (tab === 'sms') return contact.smsStatus === 'subscribed'
      return true
    })
  }, [allContacts, query, tab])

  const toggle = (id) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  const columns = [
    {
      key: 'select',
      label: '',
      render: (row) => (
        <input
          type="checkbox"
          checked={selected.includes(row.id)}
          onChange={() => toggle(row.id)}
          aria-label={`Select ${formatContactName(row)}`}
        />
      ),
    },
    {
      key: 'name',
      label: 'Name',
      render: (row) => (
        <Link to={`/audience/contacts/${row.id}`} className="font-medium text-ink hover:text-electric">
          {formatContactName(row)}
        </Link>
      ),
    },
    { key: 'email', label: 'Email', render: (row) => row.email || '—' },
    { key: 'phone', label: 'Phone', render: (row) => row.phone || '—' },
    {
      key: 'emailStatus',
      label: 'Email',
      render: (row) => <Badge tone={statusTone(row.emailStatus)}>{statusLabel(row.emailStatus)}</Badge>,
    },
    {
      key: 'smsStatus',
      label: 'SMS',
      render: (row) => <Badge tone={statusTone(row.smsStatus)}>{statusLabel(row.smsStatus)}</Badge>,
    },
    {
      key: 'createdAt',
      label: 'Date added',
      render: (row) => formatDate(row.createdAt),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Contacts"
        description="Search and filter your audience. Selection changes stay local to this prototype."
        actions={
          <Button onClick={() => alert('Prototype only — no contacts were saved.')}>
            <UserPlus className="size-4" />
            Add or update contacts
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total contacts" value={stats.total} />
        <MetricCard label="Email subscribers" value={stats.emailSubscribers} />
        <MetricCard label="SMS subscribers" value={stats.smsSubscribers} />
        <MetricCard label="Push subscribers" value={stats.pushSubscribers} />
      </div>

      <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { value: 'all', label: 'All' },
            { value: 'email', label: 'Email subscribed' },
            { value: 'sms', label: 'SMS subscribed' },
          ]}
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <p className="text-xs text-muted">{selected.length} of {rows.length} selected</p>
          <SearchInput
            className="w-full sm:w-72"
            placeholder="Search email or phone"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No contacts match"
          description="Try clearing search or switching tabs. Prototype data only."
          actionLabel="Clear filters"
          onAction={() => {
            setQuery('')
            setTab('all')
          }}
        />
      ) : (
        <Table columns={columns} rows={rows} />
      )}
    </div>
  )
}
