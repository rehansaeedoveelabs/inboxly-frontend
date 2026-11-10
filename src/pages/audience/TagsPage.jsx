import { useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import {
  PageHeader,
  Button,
  SearchInput,
  Table,
  Modal,
  FormField,
  Input,
  Select,
  ConfirmDialog,
} from '../../components/ui'
import { getTags } from '../../mock'
import { formatDateTime } from '../../lib/format'

export function TagsPage() {
  const [tags, setTags] = useState(getTags())
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('any')
  const [selected, setSelected] = useState([])
  const [createOpen, setCreateOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [name, setName] = useState('')

  const rows = useMemo(() => {
    return tags.filter((tag) => {
      const matchesQuery = tag.name.toLowerCase().includes(query.trim().toLowerCase())
      const matchesType =
        typeFilter === 'any' ||
        (typeFilter === 'source' ? tag.name.startsWith('source:') : !tag.name.startsWith('source:'))
      return matchesQuery && matchesType
    })
  }, [tags, query, typeFilter])

  const columns = [
    {
      key: 'select',
      label: '',
      render: (row) => (
        <input
          type="checkbox"
          checked={selected.includes(row.id)}
          onChange={() =>
            setSelected((current) =>
              current.includes(row.id)
                ? current.filter((id) => id !== row.id)
                : [...current, row.id],
            )
          }
          aria-label={`Select ${row.name}`}
        />
      ),
    },
    { key: 'name', label: 'Tag name' },
    { key: 'contactCount', label: 'Contacts' },
    {
      key: 'lastUsedAt',
      label: 'Last used',
      render: (row) => formatDateTime(row.lastUsedAt),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Tags"
        description="Organize contacts with labels. Creates and deletes are local prototype actions."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Create tag
          </Button>
        }
      />

      <div className="mb-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="danger"
            size="sm"
            disabled={selected.length === 0}
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
          <p className="text-xs text-muted">
            {selected.length} of {rows.length} selected
          </p>
          <Select
            className="w-36"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            aria-label="Tag type"
          >
            <option value="any">Any type</option>
            <option value="source">Source tags</option>
            <option value="custom">Custom tags</option>
          </Select>
        </div>
        <SearchInput
          className="w-full sm:w-72"
          placeholder="Search for a tag"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <Table columns={columns} rows={rows} empty="No tags match your filters." />

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create tag"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!name.trim()) return
                setTags((current) => [
                  {
                    id: `tag_${Date.now()}`,
                    name: name.trim(),
                    lastUsedAt: new Date().toISOString(),
                    contactCount: 0,
                  },
                  ...current,
                ])
                setName('')
                setCreateOpen(false)
              }}
            >
              Create (local only)
            </Button>
          </>
        }
      >
        <FormField label="Tag name" htmlFor="tag-name">
          <Input
            id="tag-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. newsletter"
          />
        </FormField>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete tags?"
        description={`Remove ${selected.length} selected tag(s) from this prototype session.`}
        confirmLabel="Delete"
        tone="danger"
        onConfirm={() => {
          setTags((current) => current.filter((tag) => !selected.includes(tag.id)))
          setSelected([])
        }}
      />
    </div>
  )
}
