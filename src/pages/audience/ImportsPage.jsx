import { useState } from 'react'
import { Upload } from 'lucide-react'
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
import { getImports } from '../../mock'
import { formatDateTime, statusLabel, statusTone } from '../../lib/format'

export function ImportsPage() {
  const [imports, setImports] = useState(getImports())
  const [filter, setFilter] = useState('all')
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('CSV import')
  const [source, setSource] = useState('csv')

  const rows = imports.filter((item) => (filter === 'all' ? true : item.status === filter))

  const columns = [
    { key: 'name', label: 'Import name' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge tone={statusTone(row.status)}>{statusLabel(row.status)}</Badge>,
    },
    {
      key: 'importedAt',
      label: 'Import date',
      render: (row) => formatDateTime(row.importedAt),
    },
    { key: 'newContacts', label: 'New contacts' },
    { key: 'updatedContacts', label: 'Updated contacts' },
  ]

  return (
    <div>
      <PageHeader
        title="Imports"
        description="Visual import wizard only — files are not uploaded or processed."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Upload className="size-4" />
            Add or update contacts
          </Button>
        }
      />

      <div className="mb-3 flex justify-end">
        <Select className="w-40" value={filter} onChange={(event) => setFilter(event.target.value)}>
          <option value="all">All imports</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </Select>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={Upload}
          title="No imports in sight"
          description="Start a mock import to populate this history."
          actionLabel="Start import"
          onAction={() => setOpen(true)}
        />
      ) : (
        <Table columns={columns} rows={rows} />
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Import contacts"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setImports((current) => [
                  {
                    id: `imp_${Date.now()}`,
                    name: `${name} (${source})`,
                    status: 'completed',
                    importedAt: new Date().toISOString(),
                    newContacts: 0,
                    updatedContacts: 0,
                  },
                  ...current,
                ])
                setOpen(false)
              }}
            >
              Run mock import
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <FormField label="Import name">
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </FormField>
          <FormField label="Source">
            <Select value={source} onChange={(event) => setSource(event.target.value)}>
              <option value="csv">CSV file</option>
              <option value="shopify">Shopify sync (mock)</option>
            </Select>
          </FormField>
          <div className="rounded-md border border-dashed border-line bg-midnight px-4 py-8 text-center text-sm text-muted">
            Drop a file here — visual prototype only. No upload occurs.
          </div>
        </div>
      </Modal>
    </div>
  )
}
