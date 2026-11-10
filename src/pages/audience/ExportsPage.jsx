import { useState } from 'react'
import { Download } from 'lucide-react'
import {
  PageHeader,
  Button,
  Table,
  Badge,
  Modal,
  FormField,
  Input,
  Select,
  EmptyState,
} from '../../components/ui'
import { getExports } from '../../mock'
import { formatDateTime, statusLabel, statusTone } from '../../lib/format'

export function ExportsPage() {
  const [exportsList, setExportsList] = useState(getExports())
  const [filter, setFilter] = useState('all')
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('Audience export')
  const [audience, setAudience] = useState('all')

  const rows = exportsList.filter((item) => (filter === 'all' ? true : item.status === filter))

  const columns = [
    { key: 'name', label: 'Export name' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge tone={statusTone(row.status)}>{statusLabel(row.status)}</Badge>,
    },
    {
      key: 'exportedAt',
      label: 'Export date',
      render: (row) => formatDateTime(row.exportedAt),
    },
    { key: 'contacts', label: 'Contacts' },
  ]

  return (
    <div>
      <PageHeader
        title="Exports"
        description="Create mock exports. No files are generated or downloaded from a backend."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Download className="size-4" />
            New export
          </Button>
        }
      />

      <div className="mb-3 flex justify-end">
        <Select className="w-40" value={filter} onChange={(event) => setFilter(event.target.value)}>
          <option value="all">All exports</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </Select>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={Download}
          title="No exports yet"
          description="Create a mock export to see history here."
          actionLabel="New export"
          onAction={() => setOpen(true)}
        />
      ) : (
        <Table columns={columns} rows={rows} />
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New export"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setExportsList((current) => [
                  {
                    id: `exp_${Date.now()}`,
                    name: `${name} · ${audience}`,
                    status: 'completed',
                    exportedAt: new Date().toISOString(),
                    contacts: audience === 'all' ? 6 : 2,
                  },
                  ...current,
                ])
                setOpen(false)
              }}
            >
              Create mock export
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <FormField label="Export name">
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </FormField>
          <FormField label="Audience">
            <Select value={audience} onChange={(event) => setAudience(event.target.value)}>
              <option value="all">All contacts</option>
              <option value="email">Email subscribed</option>
              <option value="sms">SMS subscribed</option>
            </Select>
          </FormField>
        </div>
      </Modal>
    </div>
  )
}
