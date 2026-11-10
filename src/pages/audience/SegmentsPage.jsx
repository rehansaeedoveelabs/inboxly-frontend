import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import {
  PageHeader,
  Button,
  Tabs,
  SearchInput,
  Table,
  Badge,
  Modal,
  FormField,
  Input,
  Select,
  EmptyState,
} from '../../components/ui'
import { getSegments } from '../../mock'
import { formatDateTime } from '../../lib/format'

export function SegmentsPage() {
  const initial = getSegments()
  const [segments, setSegments] = useState(initial)
  const [tab, setTab] = useState('active')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState({
    name: '',
    field: 'emailStatus',
    operator: 'equals',
    value: 'subscribed',
  })

  const rows = useMemo(() => {
    return segments.filter((segment) => {
      const matchesTab = tab === 'archived' ? segment.status === 'archived' : segment.status === 'active'
      const matchesQuery = segment.name.toLowerCase().includes(query.trim().toLowerCase())
      return matchesTab && matchesQuery
    })
  }, [segments, tab, query])

  const columns = [
    { key: 'name', label: 'Segment name' },
    { key: 'contactCount', label: 'Contacts' },
    {
      key: 'updatedAt',
      label: 'Last edited',
      render: (row) => formatDateTime(row.updatedAt),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge tone={row.status === 'active' ? 'success' : 'neutral'}>{row.status}</Badge>,
    },
  ]

  const createSegment = () => {
    if (!draft.name.trim()) return
    setSegments((current) => [
      {
        id: `seg_${Date.now()}`,
        name: draft.name.trim(),
        contactCount: 0,
        status: 'active',
        updatedAt: new Date().toISOString(),
        rules: [{ field: draft.field, operator: draft.operator, value: draft.value }],
      },
      ...current,
    ])
    setOpen(false)
    setDraft({ name: '', field: 'emailStatus', operator: 'equals', value: 'subscribed' })
  }

  return (
    <div>
      <PageHeader
        title="Segments"
        description="Create audience groups with local prototype rules. Not saved to a backend."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Create segment
          </Button>
        }
      />

      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { value: 'active', label: 'Active' },
            { value: 'archived', label: 'Archived' },
          ]}
        />
        <SearchInput
          className="w-full sm:w-72"
          placeholder="Search segments"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No segments in this view"
          description="Create a segment or switch tabs. Recommended starters appear after you add one."
          actionLabel="Create segment"
          onAction={() => setOpen(true)}
        />
      ) : (
        <Table columns={columns} rows={rows} />
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create segment"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createSegment}>Create (local only)</Button>
          </>
        }
      >
        <div className="space-y-3">
          <FormField label="Segment name" htmlFor="segment-name">
            <Input
              id="segment-name"
              value={draft.name}
              onChange={(event) => setDraft((value) => ({ ...value, name: event.target.value }))}
              placeholder="e.g. High intent browsers"
            />
          </FormField>
          <div className="grid gap-3 sm:grid-cols-3">
            <FormField label="Field">
              <Select
                value={draft.field}
                onChange={(event) => setDraft((value) => ({ ...value, field: event.target.value }))}
              >
                <option value="emailStatus">Email status</option>
                <option value="smsStatus">SMS status</option>
                <option value="totalSpent">Total spent</option>
              </Select>
            </FormField>
            <FormField label="Operator">
              <Select
                value={draft.operator}
                onChange={(event) => setDraft((value) => ({ ...value, operator: event.target.value }))}
              >
                <option value="equals">Equals</option>
                <option value="greater_than">Greater than</option>
                <option value="within_days">Within days</option>
              </Select>
            </FormField>
            <FormField label="Value">
              <Input
                value={draft.value}
                onChange={(event) => setDraft((value) => ({ ...value, value: event.target.value }))}
              />
            </FormField>
          </div>
          <p className="text-xs text-muted">Prototype rule builder — does not evaluate real contacts.</p>
        </div>
      </Modal>
    </div>
  )
}
