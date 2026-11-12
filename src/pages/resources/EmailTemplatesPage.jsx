import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FileText, Plus } from 'lucide-react'
import {
  PageHeader,
  Button,
  Table,
  Badge,
  EmptyState,
  LoadingState,
  ErrorState,
  SearchInput,
  Select,
} from '../../components/ui'
import { ApiError } from '../../lib/api'
import {
  createStoreEmailTemplate,
  duplicateEmailTemplate,
  emptyEmailDocument,
  listStoreEmailTemplates,
} from '../../lib/emailTemplatesApi'
import { formatDateTime, statusLabel, statusTone } from '../../lib/format'
import { useActiveStore } from '../../store/useActiveStore'

const PAGE_LIMIT = 25

export function EmailTemplatesPage() {
  const navigate = useNavigate()
  const { activeStore, status: storeStatus } = useActiveStore()
  const storeId = activeStore?.id

  const [templates, setTemplates] = useState([])
  const [nextCursor, setNextCursor] = useState(null)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [listLoading, setListLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [creating, setCreating] = useState(false)
  const [refreshNonce, setRefreshNonce] = useState(0)
  const listRequestId = useRef(0)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 250)
    return () => window.clearTimeout(timer)
  }, [query])

  const reload = useCallback(() => setRefreshNonce((n) => n + 1), [])

  useEffect(() => {
    if (storeStatus === 'loading' || !storeId) return undefined

    const requestId = ++listRequestId.current
    setListLoading(true)
    setLoadError('')

    listStoreEmailTemplates(storeId, {
      q: debouncedQuery || null,
      status: statusFilter || null,
      limit: PAGE_LIMIT,
    })
      .then((page) => {
        if (listRequestId.current !== requestId) return
        setTemplates(page.data)
        setNextCursor(page.nextCursor)
      })
      .catch((error) => {
        if (listRequestId.current !== requestId) return
        setTemplates([])
        setNextCursor(null)
        setLoadError(error instanceof ApiError ? error.message : 'Unable to load templates.')
      })
      .finally(() => {
        if (listRequestId.current === requestId) setListLoading(false)
      })

    return undefined
  }, [storeId, storeStatus, debouncedQuery, statusFilter, refreshNonce])

  const createTemplate = async () => {
    if (!storeId || creating) return
    setCreating(true)
    setActionError('')
    try {
      const template = await createStoreEmailTemplate(storeId, {
        name: 'Untitled template',
        category: 'general',
        status: 'draft',
        document: emptyEmailDocument(),
      })
      navigate(`/resources/templates/${template.id}`)
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'Unable to create template.')
    } finally {
      setCreating(false)
    }
  }

  const duplicate = async (templateId) => {
    setActionError('')
    try {
      const copy = await duplicateEmailTemplate(templateId)
      setTemplates((current) => [copy, ...current])
      navigate(`/resources/templates/${copy.id}`)
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'Unable to duplicate.')
    }
  }

  const loadMore = async () => {
    if (!storeId || !nextCursor || loadingMore) return
    setLoadingMore(true)
    try {
      const page = await listStoreEmailTemplates(storeId, {
        q: debouncedQuery || null,
        status: statusFilter || null,
        cursor: nextCursor,
        limit: PAGE_LIMIT,
      })
      setTemplates((current) => [...current, ...page.data])
      setNextCursor(page.nextCursor)
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'Unable to load more.')
    } finally {
      setLoadingMore(false)
    }
  }

  if (storeStatus === 'loading') {
    return <LoadingState label="Loading store…" />
  }

  if (!storeId) {
    return (
      <EmptyState
        title="Select a store"
        description="Email templates are scoped to a store."
        actionLabel="Go to Store settings"
        onAction={() => navigate('/settings/store')}
      />
    )
  }

  return (
    <div>
      <PageHeader
        title="Email templates"
        description="Block-based HTML templates you can apply to email campaigns."
        actions={
          <Button disabled={creating} onClick={createTemplate}>
            <Plus className="size-4" />
            {creating ? 'Creating…' : 'New template'}
          </Button>
        }
      />

      {actionError ? (
        <p className="mb-3 text-sm text-danger" role="alert">
          {actionError}
        </p>
      ) : null}

      <div className="mb-3 flex flex-wrap gap-3">
        <div className="min-w-[220px] flex-1 max-w-md">
          <SearchInput
            placeholder="Search templates"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="w-40"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </Select>
      </div>

      {listLoading ? (
        <LoadingState label="Loading templates…" />
      ) : loadError ? (
        <ErrorState title="Unable to load templates" description={loadError} onRetry={reload} />
      ) : templates.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No email templates yet"
          description="Create a block document, preview sanitized HTML, then apply it in a campaign."
          actionLabel="New template"
          onAction={createTemplate}
        />
      ) : (
        <>
          <Table
            columns={[
              {
                key: 'name',
                label: 'Name',
                render: (row) => (
                  <Link
                    to={`/resources/templates/${row.id}`}
                    className="font-medium text-ink hover:text-electric"
                  >
                    {row.name}
                  </Link>
                ),
              },
              {
                key: 'category',
                label: 'Category',
                render: (row) => row.category || 'general',
              },
              {
                key: 'status',
                label: 'Status',
                render: (row) => (
                  <Badge tone={statusTone(row.status)}>{statusLabel(row.status)}</Badge>
                ),
              },
              {
                key: 'updated',
                label: 'Updated',
                render: (row) => formatDateTime(row.updated_at),
              },
              {
                key: 'actions',
                label: '',
                render: (row) => (
                  <Button variant="ghost" onClick={() => duplicate(row.id)}>
                    Duplicate
                  </Button>
                ),
              },
            ]}
            rows={templates}
          />
          {nextCursor ? (
            <div className="mt-4">
              <Button variant="secondary" disabled={loadingMore} onClick={loadMore}>
                {loadingMore ? 'Loading…' : 'Load more'}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
