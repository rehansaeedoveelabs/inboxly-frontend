import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Plus, Tags, Trash2 } from 'lucide-react'
import {
  PageHeader,
  Button,
  SearchInput,
  Table,
  Modal,
  FormField,
  Input,
  Select,
  LoadingState,
  ErrorState,
  EmptyState,
} from '../../components/ui'
import { ApiError } from '../../lib/api'
import { formatDateTime } from '../../lib/format'
import { createStoreTag, deleteTag, listStoreTags, updateTag } from '../../lib/tagsApi'
import { filterTags, firstFieldError } from '../../lib/tagsUi'
import { useActiveStore } from '../../store/useActiveStore'

export function TagsPage() {
  const navigate = useNavigate()
  const { activeStore, status: storeStatus } = useActiveStore()
  const storeId = activeStore?.id

  const [tags, setTags] = useState([])
  const [loadError, setLoadError] = useState('')
  /** Store id the current `tags` / error belong to — used to derive loading without sync setState in effects. */
  const [loadedStoreId, setLoadedStoreId] = useState(null)
  const [failedStoreId, setFailedStoreId] = useState(null)
  const [refreshNonce, setRefreshNonce] = useState(0)

  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('any')
  const [selected, setSelected] = useState([])

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const [name, setName] = useState('')
  const [formError, setFormError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [actionError, setActionError] = useState('')

  const reloadTags = useCallback(() => {
    setActionError('')
    setLoadedStoreId(null)
    setFailedStoreId(null)
    setRefreshNonce((value) => value + 1)
  }, [])

  useEffect(() => {
    if (storeStatus === 'loading' || !storeId) return undefined

    let cancelled = false

    listStoreTags(storeId)
      .then((data) => {
        if (cancelled) return
        setTags(data)
        setSelected([])
        setLoadError('')
        setFailedStoreId(null)
        setLoadedStoreId(storeId)
      })
      .catch((error) => {
        if (cancelled) return
        setTags([])
        setSelected([])
        setLoadedStoreId(null)
        setFailedStoreId(storeId)
        setLoadError(error instanceof ApiError ? error.message : 'Unable to load tags.')
      })

    return () => {
      cancelled = true
    }
  }, [storeId, storeStatus, refreshNonce])

  const visibleTags = storeId && loadedStoreId === storeId ? tags : []
  const visibleLoadStatus = !storeId
    ? 'idle'
    : failedStoreId === storeId
      ? 'error'
      : loadedStoreId === storeId
        ? 'ready'
        : 'loading'

  const rows = useMemo(() => {
    if (!storeId || loadedStoreId !== storeId) return []
    return filterTags(tags, { query, typeFilter })
  }, [storeId, loadedStoreId, tags, query, typeFilter])

  const editingTag = useMemo(() => {
    if (selected.length !== 1 || loadedStoreId !== storeId) return null
    return tags.find((tag) => tag.id === selected[0]) ?? null
  }, [selected, tags, loadedStoreId, storeId])

  const resetForm = () => {
    setName('')
    setFormError('')
    setFieldErrors({})
  }

  const openCreate = () => {
    resetForm()
    setCreateOpen(true)
  }

  const openEdit = () => {
    if (!editingTag) return
    resetForm()
    setName(editingTag.name || '')
    setEditOpen(true)
  }

  const handleCreate = async () => {
    if (!storeId) return
    setFormError('')
    setFieldErrors({})

    const trimmed = name.trim()
    if (!trimmed) {
      setFieldErrors({ name: ['Enter a tag name.'] })
      return
    }

    setSubmitting(true)
    try {
      await createStoreTag(storeId, { name: trimmed })
      setCreateOpen(false)
      resetForm()
      reloadTags()
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message)
        setFieldErrors(error.errors ?? {})
      } else {
        setFormError('Unable to create the tag right now.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingTag) return
    setFormError('')
    setFieldErrors({})

    const trimmed = name.trim()
    if (!trimmed) {
      setFieldErrors({ name: ['Enter a tag name.'] })
      return
    }

    setSubmitting(true)
    try {
      await updateTag(editingTag.id, { name: trimmed })
      setEditOpen(false)
      resetForm()
      reloadTags()
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message)
        setFieldErrors(error.errors ?? {})
      } else {
        setFormError('Unable to update the tag right now.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!storeId || selected.length === 0) return

    setSubmitting(true)
    setActionError('')
    try {
      for (const tagId of selected) {
        await deleteTag(tagId)
      }
      setConfirmOpen(false)
      setSelected([])
      reloadTags()
    } catch (error) {
      setConfirmOpen(false)
      setActionError(
        error instanceof ApiError ? error.message : 'Unable to delete the selected tag(s).',
      )
      reloadTags()
    } finally {
      setSubmitting(false)
    }
  }

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
    {
      key: 'name',
      label: 'Tag name',
      render: (row) => (
        <span className="inline-flex items-center gap-2">
          {row.color ? (
            <span
              className="inline-block size-2.5 shrink-0 rounded-full border border-line"
              style={{ backgroundColor: row.color }}
              aria-hidden
            />
          ) : null}
          <span>{row.name}</span>
        </span>
      ),
    },
    { key: 'slug', label: 'Slug' },
    {
      key: 'created_at',
      label: 'Created',
      render: (row) => formatDateTime(row.created_at),
    },
  ]

  const storesLoading = storeStatus === 'loading'
  const missingStore = !storesLoading && !storeId
  const showToolbar = Boolean(storeId) && visibleLoadStatus === 'ready'

  return (
    <div>
      <PageHeader
        title="Tags"
        description={
          activeStore
            ? `Labels for contacts in ${activeStore.name}.`
            : 'Organize contacts with labels for the active store.'
        }
        actions={
          <Button onClick={openCreate} disabled={!storeId || visibleLoadStatus === 'loading'}>
            <Plus className="size-4" />
            Create tag
          </Button>
        }
      />

      {actionError ? (
        <div
          className="mb-3 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
          role="alert"
        >
          {actionError}
        </div>
      ) : null}

      {storesLoading ? <LoadingState label="Loading store…" /> : null}

      {missingStore ? (
        <EmptyState
          icon={Tags}
          title="Select a store"
          description="Tags are scoped to a store. Choose or create a store before managing tags."
          actionLabel="Go to Store settings"
          onAction={() => navigate('/settings/store')}
        />
      ) : null}

      {storeId && visibleLoadStatus === 'loading' ? (
        <LoadingState label="Loading tags…" />
      ) : null}

      {storeId && visibleLoadStatus === 'error' ? (
        <ErrorState title="Unable to load tags" description={loadError} onRetry={reloadTags} />
      ) : null}

      {storeId && visibleLoadStatus === 'ready' && visibleTags.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="No tags yet"
          description="Create a tag to organize contacts in this store."
          actionLabel="Create tag"
          onAction={openCreate}
        />
      ) : null}

      {showToolbar && visibleTags.length > 0 ? (
        <>
          <div className="mb-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="danger"
                size="sm"
                disabled={selected.length === 0 || submitting}
                onClick={() => setConfirmOpen(true)}
              >
                <Trash2 className="size-4" />
                Delete
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={!editingTag || submitting}
                onClick={openEdit}
              >
                <Pencil className="size-4" />
                Rename
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
        </>
      ) : null}

      <Modal
        open={createOpen}
        onClose={() => {
          if (!submitting) {
            setCreateOpen(false)
            resetForm()
          }
        }}
        title="Create tag"
        footer={
          <>
            <Button
              variant="ghost"
              disabled={submitting}
              onClick={() => {
                setCreateOpen(false)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={submitting || !storeId}>
              {submitting ? 'Creating…' : 'Create tag'}
            </Button>
          </>
        }
      >
        {formError ? (
          <p className="mb-3 text-sm text-danger" role="alert">
            {formError}
          </p>
        ) : null}
        <FormField label="Tag name" htmlFor="tag-name" error={firstFieldError(fieldErrors, 'name')}>
          <Input
            id="tag-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. newsletter"
            disabled={submitting}
            autoFocus
          />
        </FormField>
      </Modal>

      <Modal
        open={editOpen}
        onClose={() => {
          if (!submitting) {
            setEditOpen(false)
            resetForm()
          }
        }}
        title="Rename tag"
        footer={
          <>
            <Button
              variant="ghost"
              disabled={submitting}
              onClick={() => {
                setEditOpen(false)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={submitting || !editingTag}>
              {submitting ? 'Saving…' : 'Save'}
            </Button>
          </>
        }
      >
        {formError ? (
          <p className="mb-3 text-sm text-danger" role="alert">
            {formError}
          </p>
        ) : null}
        {editingTag?.slug ? (
          <p className="mb-3 text-xs text-muted">
            Slug stays <span className="font-medium text-ink">{editingTag.slug}</span> (used by
            segments).
          </p>
        ) : null}
        <FormField
          label="Tag name"
          htmlFor="tag-rename"
          error={firstFieldError(fieldErrors, 'name')}
        >
          <Input
            id="tag-rename"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={submitting}
            autoFocus
          />
        </FormField>
      </Modal>

      <Modal
        open={confirmOpen}
        onClose={() => {
          if (!submitting) setConfirmOpen(false)
        }}
        title="Delete tags?"
        footer={
          <>
            <Button variant="ghost" disabled={submitting} onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" disabled={submitting} onClick={handleDelete}>
              {submitting ? 'Deleting…' : 'Delete'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          Permanently remove {selected.length} selected tag(s) from this store.
        </p>
      </Modal>
    </div>
  )
}
