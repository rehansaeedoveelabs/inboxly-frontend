import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import {
  PageHeader,
  Button,
  SearchInput,
  Table,
  Modal,
  ConfirmDialog,
  FormField,
  Input,
  Select,
  EmptyState,
  LoadingState,
  ErrorState,
  Card,
} from '../../components/ui'
import { ApiError } from '../../lib/api'
import {
  createStoreSegment,
  deleteSegment,
  listStoreSegments,
  previewSegment,
  updateSegment,
} from '../../lib/segmentsApi'
import {
  SEGMENT_FIELDS,
  defaultSegmentRules,
  filterSegments,
  opsForField,
  toApiRules,
  toDraftRules,
} from '../../lib/segmentsUi'
import { firstFieldError } from '../../lib/tagsUi'
import { formatContactName } from '../../lib/contactsUi'
import { formatDateTime, formatNumber } from '../../lib/format'
import { useActiveStore } from '../../store/useActiveStore'

function emptyDraft() {
  return {
    name: '',
    description: '',
    ...toDraftRules(defaultSegmentRules()),
  }
}

export function SegmentsPage() {
  const navigate = useNavigate()
  const { activeStore, status: storeStatus } = useActiveStore()
  const storeId = activeStore?.id

  const [segments, setSegments] = useState([])
  const [query, setQuery] = useState('')
  const [loadError, setLoadError] = useState('')
  const [loadedStoreId, setLoadedStoreId] = useState(null)
  const [failedStoreId, setFailedStoreId] = useState(null)
  const [refreshNonce, setRefreshNonce] = useState(0)

  const [open, setOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState(emptyDraft)
  const [formError, setFormError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const [selectedId, setSelectedId] = useState(null)
  const [preview, setPreview] = useState(null)
  const [previewError, setPreviewError] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)

  const reload = useCallback(() => {
    setLoadedStoreId(null)
    setFailedStoreId(null)
    setRefreshNonce((n) => n + 1)
  }, [])

  useEffect(() => {
    if (storeStatus === 'loading' || !storeId) return undefined
    let cancelled = false
    listStoreSegments(storeId)
      .then((data) => {
        if (cancelled) return
        setSegments(data)
        setLoadError('')
        setFailedStoreId(null)
        setLoadedStoreId(storeId)
      })
      .catch((error) => {
        if (cancelled) return
        setSegments([])
        setLoadedStoreId(null)
        setFailedStoreId(storeId)
        setLoadError(error instanceof ApiError ? error.message : 'Unable to load segments.')
      })
    return () => {
      cancelled = true
    }
  }, [storeId, storeStatus, refreshNonce])

  const rows = useMemo(() => {
    if (!storeId || loadedStoreId !== storeId) return []
    return filterSegments(segments, query)
  }, [storeId, loadedStoreId, segments, query])

  const ready = Boolean(storeId) && loadedStoreId === storeId
  const failed = Boolean(storeId) && failedStoreId === storeId && !ready
  const loading = Boolean(storeId) && !ready && !failed
  const missingStore = storeStatus !== 'loading' && !storeId

  const openCreate = () => {
    setEditingId(null)
    setDraft(emptyDraft())
    setFormError('')
    setFieldErrors({})
    setOpen(true)
  }

  const openEdit = (segment) => {
    setEditingId(segment.id)
    setDraft({
      name: segment.name || '',
      description: segment.description || '',
      ...toDraftRules(segment.rules),
    })
    setFormError('')
    setFieldErrors({})
    setOpen(true)
  }

  const updateCondition = (index, patch) => {
    setDraft((current) => ({
      ...current,
      conditions: current.conditions.map((condition, i) =>
        i === index ? { ...condition, ...patch } : condition,
      ),
    }))
  }

  const saveSegment = async () => {
    if (!storeId) return
    setFormError('')
    setFieldErrors({})
    if (!draft.name.trim()) {
      setFieldErrors({ name: ['Enter a segment name.'] })
      return
    }

    const payload = {
      name: draft.name.trim(),
      description: draft.description.trim() || null,
      rules: toApiRules(draft),
    }

    setSubmitting(true)
    try {
      if (editingId) {
        await updateSegment(editingId, payload)
      } else {
        await createStoreSegment(storeId, payload)
      }
      setOpen(false)
      reload()
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message)
        setFieldErrors(error.errors ?? {})
      } else {
        setFormError('Unable to save the segment.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const removeSegment = async () => {
    if (!deleteId) return
    const segmentId = deleteId
    try {
      await deleteSegment(segmentId)
      if (selectedId === segmentId) {
        setSelectedId(null)
        setPreview(null)
      }
      setDeleteId(null)
      reload()
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Unable to delete the segment.'
      setLoadError(message)
      throw error instanceof Error ? error : new Error(message)
    }
  }

  const runPreview = async (segmentId) => {
    setSelectedId(segmentId)
    setPreview(null)
    setPreviewError('')
    setPreviewLoading(true)
    try {
      const result = await previewSegment(segmentId)
      setPreview(result)
    } catch (error) {
      setPreviewError(error instanceof ApiError ? error.message : 'Unable to preview the segment.')
    } finally {
      setPreviewLoading(false)
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Segment name',
      render: (row) => (
        <button
          type="button"
          className="font-medium text-ink hover:text-electric"
          onClick={() => runPreview(row.id)}
        >
          {row.name}
        </button>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (row) => row.description || '—',
    },
    {
      key: 'updated_at',
      label: 'Last edited',
      render: (row) => formatDateTime(row.updated_at),
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => runPreview(row.id)}>
            Preview
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteId(row.id)} aria-label="Delete">
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Segments"
        description={
          activeStore
            ? `Rule-based audiences for ${activeStore.name}. Counts come from live preview only.`
            : 'Create audience groups with real backend rules.'
        }
        actions={
          <Button onClick={openCreate} disabled={!storeId}>
            <Plus className="size-4" />
            Create segment
          </Button>
        }
      />

      {storeStatus === 'loading' ? <LoadingState label="Loading store…" /> : null}

      {missingStore ? (
        <EmptyState
          title="Select a store"
          description="Segments are scoped to a store."
          actionLabel="Go to Store settings"
          onAction={() => navigate('/settings/store')}
        />
      ) : null}

      {storeId ? (
        <div className="mb-3 flex justify-end">
          <SearchInput
            className="w-full sm:w-72"
            placeholder="Search segments"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      ) : null}

      {loading ? <LoadingState label="Loading segments…" /> : null}
      {failed ? (
        <ErrorState title="Unable to load segments" description={loadError} onRetry={reload} />
      ) : null}

      {ready && rows.length === 0 ? (
        <EmptyState
          title="No segments yet"
          description="Create a segment with consent, tag, or profile rules."
          actionLabel="Create segment"
          onAction={openCreate}
        />
      ) : null}

      {ready && rows.length > 0 ? <Table columns={columns} rows={rows} /> : null}

      {selectedId ? (
        <Card className="mt-4">
          <h3 className="mb-2 text-sm font-semibold text-ink">Live preview</h3>
          {previewLoading ? <LoadingState label="Computing membership…" /> : null}
          {previewError ? <p className="text-sm text-danger">{previewError}</p> : null}
          {preview ? (
            <div className="space-y-3">
              <p className="text-sm text-muted">
                Matching contacts:{' '}
                <span className="font-semibold text-ink">{formatNumber(preview.count)}</span>
              </p>
              {preview.sample.length === 0 ? (
                <p className="text-sm text-muted">No sample contacts in this segment.</p>
              ) : (
                <ul className="space-y-2">
                  {preview.sample.map((contact) => (
                    <li
                      key={contact.id}
                      className="rounded-md border border-line bg-midnight px-3 py-2 text-sm"
                    >
                      <span className="font-medium text-ink">{formatContactName(contact)}</span>
                      <span className="text-muted"> · {contact.email || contact.phone || '—'}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </Card>
      ) : null}

      <Modal
        open={open}
        onClose={() => {
          if (!submitting) setOpen(false)
        }}
        title={editingId ? 'Edit segment' : 'Create segment'}
        className="max-w-2xl"
        footer={
          <>
            <Button variant="ghost" disabled={submitting} onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={submitting} onClick={saveSegment}>
              {submitting ? 'Saving…' : editingId ? 'Save' : 'Create segment'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {formError ? (
            <p className="text-sm text-danger" role="alert">
              {formError}
            </p>
          ) : null}
          <FormField label="Segment name" htmlFor="segment-name" error={firstFieldError(fieldErrors, 'name')}>
            <Input
              id="segment-name"
              value={draft.name}
              onChange={(event) => setDraft((value) => ({ ...value, name: event.target.value }))}
              disabled={submitting}
            />
          </FormField>
          <FormField label="Description" htmlFor="segment-description">
            <Input
              id="segment-description"
              value={draft.description}
              onChange={(event) =>
                setDraft((value) => ({ ...value, description: event.target.value }))
              }
              disabled={submitting}
            />
          </FormField>
          <FormField label="Match">
            <Select
              value={draft.operator}
              onChange={(event) => setDraft((value) => ({ ...value, operator: event.target.value }))}
              disabled={submitting}
            >
              <option value="and">All conditions (AND)</option>
              <option value="or">Any condition (OR)</option>
            </Select>
          </FormField>

          <div className="space-y-2">
            {draft.conditions.map((condition, index) => (
              <div key={index} className="grid gap-2 rounded-md border border-line p-3 sm:grid-cols-4">
                <Select
                  value={condition.field}
                  onChange={(event) => updateCondition(index, { field: event.target.value })}
                  disabled={submitting}
                >
                  {SEGMENT_FIELDS.map((field) => (
                    <option key={field.value} value={field.value}>
                      {field.label}
                    </option>
                  ))}
                </Select>
                <Select
                  value={condition.op}
                  onChange={(event) => updateCondition(index, { op: event.target.value })}
                  disabled={submitting}
                >
                  {opsForField(condition.field).map((op) => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </Select>
                <Input
                  className="sm:col-span-1"
                  value={condition.value}
                  onChange={(event) => updateCondition(index, { value: event.target.value })}
                  placeholder={condition.op === 'in' || condition.op === 'not_in' ? 'a, b, c' : 'Value'}
                  disabled={submitting || condition.op === 'is_null' || condition.op === 'is_not_null'}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={submitting || draft.conditions.length <= 1}
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      conditions: current.conditions.filter((_, i) => i !== index),
                    }))
                  }
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              variant="secondary"
              size="sm"
              disabled={submitting || draft.conditions.length >= 20}
              onClick={() =>
                setDraft((current) => ({
                  ...current,
                  conditions: [
                    ...current.conditions,
                    { field: 'email', op: 'contains', value: '' },
                  ],
                }))
              }
            >
              Add condition
            </Button>
          </div>
          {firstFieldError(fieldErrors, 'rules') ? (
            <p className="text-xs text-danger">{firstFieldError(fieldErrors, 'rules')}</p>
          ) : (
            <p className="text-xs text-muted">
              Fields and operators match the backend segment schema. Consent values:
              subscribed, unsubscribed, nonsubscribed.
            </p>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        title="Delete segment"
        description="Delete this segment? This cannot be undone."
        confirmLabel="Delete"
        tone="danger"
        onConfirm={removeSegment}
      />
    </div>
  )
}
