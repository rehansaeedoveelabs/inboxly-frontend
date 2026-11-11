import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, UserPlus, Users } from 'lucide-react'
import {
  PageHeader,
  SearchInput,
  Table,
  Tabs,
  Badge,
  Button,
  EmptyState,
  LoadingState,
  ErrorState,
  Modal,
  ConfirmDialog,
  FormField,
  Input,
} from '../../components/ui'
import { ApiError } from '../../lib/api'
import {
  ContactDeletedConflictError,
  createStoreContact,
  deleteContact,
  listStoreContacts,
} from '../../lib/contactsApi'
import {
  appendUniqueById,
  consentEmailFilterForTab,
  consentStatus,
  formatConsentSummary,
  formatContactName,
} from '../../lib/contactsUi'
import { firstFieldError } from '../../lib/tagsUi'
import { formatDate, statusLabel, statusTone } from '../../lib/format'
import { useActiveStore } from '../../store/useActiveStore'

const PAGE_LIMIT = 25
const SEARCH_DEBOUNCE_MS = 300

export function ContactsPage() {
  const navigate = useNavigate()
  const { activeStore, status: storeStatus } = useActiveStore()
  const storeId = activeStore?.id

  const [queryInput, setQueryInput] = useState('')
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState('all')
  const [selected, setSelected] = useState([])

  const [contacts, setContacts] = useState([])
  const [nextCursor, setNextCursor] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [loadedStoreId, setLoadedStoreId] = useState(null)
  const [failedStoreId, setFailedStoreId] = useState(null)
  const [loadedFilterKey, setLoadedFilterKey] = useState(null)
  const [refreshNonce, setRefreshNonce] = useState(0)

  const [loadingMore, setLoadingMore] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState('')
  const loadMoreInFlight = useRef(false)
  const filterKeyRef = useRef('')

  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    email: '',
    phone: '',
    first_name: '',
    last_name: '',
  })
  const [formError, setFormError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [actionError, setActionError] = useState('')

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [restoreOpen, setRestoreOpen] = useState(false)
  const [pendingRestore, setPendingRestore] = useState(null)

  const filterKey = useMemo(() => {
    const consent = consentEmailFilterForTab(tab) ?? ''
    return `${query.trim()}|${consent}`
  }, [query, tab])

  useEffect(() => {
    filterKeyRef.current = filterKey
  }, [filterKey])

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setQuery(queryInput.trim())
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(handle)
  }, [queryInput])

  const reloadFirstPage = useCallback(() => {
    setLoadedStoreId(null)
    setFailedStoreId(null)
    setLoadMoreError('')
    setActionError('')
    setRefreshNonce((value) => value + 1)
  }, [])

  useEffect(() => {
    if (storeStatus === 'loading' || !storeId) return undefined

    let cancelled = false
    const consent_email = consentEmailFilterForTab(tab)
    const q = query.trim() || undefined

    listStoreContacts(storeId, {
      q,
      consent_email,
      limit: PAGE_LIMIT,
    })
      .then((page) => {
        if (cancelled) return
        setContacts(page.data)
        setNextCursor(page.nextCursor)
        setSelected([])
        setLoadError('')
        setLoadMoreError('')
        setFailedStoreId(null)
        setLoadedStoreId(storeId)
        setLoadedFilterKey(filterKey)
      })
      .catch((error) => {
        if (cancelled) return
        setContacts([])
        setNextCursor(null)
        setSelected([])
        setLoadedStoreId(null)
        setLoadedFilterKey(null)
        setFailedStoreId(storeId)
        setLoadError(error instanceof ApiError ? error.message : 'Unable to load contacts.')
      })

    return () => {
      cancelled = true
    }
  }, [storeId, storeStatus, tab, query, filterKey, refreshNonce])

  const listReady =
    Boolean(storeId) && loadedStoreId === storeId && loadedFilterKey === filterKey
  const listError = Boolean(storeId) && failedStoreId === storeId && !listReady
  const listLoading = Boolean(storeId) && !listReady && !listError

  const loadMore = async () => {
    if (!storeId || !nextCursor || loadingMore || loadMoreInFlight.current || !listReady) return

    loadMoreInFlight.current = true
    setLoadingMore(true)
    setLoadMoreError('')
    const cursor = nextCursor
    const requestFilterKey = filterKey
    const consent_email = consentEmailFilterForTab(tab)
    const q = query.trim() || undefined

    try {
      const page = await listStoreContacts(storeId, {
        cursor,
        q,
        consent_email,
        limit: PAGE_LIMIT,
      })
      if (filterKeyRef.current !== requestFilterKey) return
      setContacts((current) => appendUniqueById(current, page.data))
      setNextCursor(page.nextCursor)
    } catch (error) {
      if (filterKeyRef.current !== requestFilterKey) return
      setLoadMoreError(
        error instanceof ApiError ? error.message : 'Unable to load more contacts.',
      )
    } finally {
      loadMoreInFlight.current = false
      setLoadingMore(false)
    }
  }

  const toggle = (id) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  const openCreate = () => {
    setCreateForm({ email: '', phone: '', first_name: '', last_name: '' })
    setFormError('')
    setFieldErrors({})
    setCreateOpen(true)
  }

  const buildCreatePayload = () => ({
    email: createForm.email.trim() || null,
    phone: createForm.phone.trim() || null,
    first_name: createForm.first_name.trim() || null,
    last_name: createForm.last_name.trim() || null,
  })

  const handleCreate = async () => {
    if (!storeId) return
    setFormError('')
    setFieldErrors({})

    const email = createForm.email.trim()
    const phone = createForm.phone.trim()
    if (!email && !phone) {
      setFieldErrors({ email: ['Enter an email or a phone number.'] })
      return
    }

    const payload = buildCreatePayload()
    setSubmitting(true)
    try {
      await createStoreContact(storeId, payload)
      setCreateOpen(false)
      reloadFirstPage()
    } catch (error) {
      if (error instanceof ContactDeletedConflictError) {
        setPendingRestore({ contact: error.contact, payload })
        setCreateOpen(false)
        setRestoreOpen(true)
      } else if (error instanceof ApiError) {
        setFormError(error.message)
        setFieldErrors(error.errors ?? {})
      } else {
        setFormError('Unable to create the contact.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleRestoreConfirm = async () => {
    if (!storeId || !pendingRestore) return
    await createStoreContact(storeId, { ...pendingRestore.payload, restore: true })
    setPendingRestore(null)
    reloadFirstPage()
  }

  const handleDeleteSelected = async () => {
    if (!storeId || selected.length === 0) return
    setActionError('')
    try {
      for (const id of selected) {
        await deleteContact(id)
      }
      setSelected([])
      reloadFirstPage()
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'Unable to delete contacts.')
      reloadFirstPage()
      throw error instanceof Error ? error : new Error('Unable to delete contacts.')
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
          onChange={() => toggle(row.id)}
          aria-label={`Select ${formatContactName(row)}`}
        />
      ),
    },
    {
      key: 'name',
      label: 'Name',
      render: (row) => (
        <Link
          to={`/audience/contacts/${row.id}`}
          className="font-medium text-ink hover:text-electric"
        >
          {formatContactName(row)}
        </Link>
      ),
    },
    { key: 'email', label: 'Email', render: (row) => row.email || '—' },
    { key: 'phone', label: 'Phone', render: (row) => row.phone || '—' },
    {
      key: 'emailStatus',
      label: 'Email',
      render: (row) => {
        const status = consentStatus(row, 'email')
        return <Badge tone={statusTone(status)}>{statusLabel(status)}</Badge>
      },
    },
    {
      key: 'smsStatus',
      label: 'SMS',
      render: (row) => {
        const status = consentStatus(row, 'sms')
        return <Badge tone={statusTone(status)}>{statusLabel(status)}</Badge>
      },
    },
    {
      key: 'created_at',
      label: 'Date added',
      render: (row) => formatDate(row.created_at),
    },
  ]

  const storesLoading = storeStatus === 'loading'
  const missingStore = !storesLoading && !storeId
  const showTable = listReady && contacts.length > 0
  const showEmptyFilters = listReady && contacts.length === 0
  const conflictContact = pendingRestore?.contact

  return (
    <div>
      <PageHeader
        title="Contacts"
        description={
          activeStore
            ? `Audience for ${activeStore.name}. Search uses email prefix match.`
            : 'Search and filter your audience for the active store.'
        }
        actions={
          <Button onClick={openCreate} disabled={!storeId}>
            <UserPlus className="size-4" />
            Add contact
          </Button>
        }
      />

      {actionError ? (
        <p className="mb-3 text-sm text-danger" role="alert">
          {actionError}
        </p>
      ) : null}

      {storesLoading ? <LoadingState label="Loading store…" /> : null}

      {missingStore ? (
        <EmptyState
          icon={Users}
          title="Select a store"
          description="Contacts are scoped to a store. Choose or create a store before viewing contacts."
          actionLabel="Go to Store settings"
          onAction={() => navigate('/settings/store')}
        />
      ) : null}

      {storeId ? (
        <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Tabs
              value={tab}
              onChange={setTab}
              items={[
                { value: 'all', label: 'All' },
                { value: 'email', label: 'Email subscribed' },
                { value: 'email_nonsubscribed', label: 'Email nonsubscribed' },
              ]}
            />
            <Button
              variant="danger"
              size="sm"
              disabled={selected.length === 0 || submitting}
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <p className="text-xs text-muted">
              {selected.length} of {contacts.length} selected
              {nextCursor ? ' · more available' : ''}
            </p>
            <SearchInput
              className="w-full sm:w-72"
              placeholder="Search by email"
              value={queryInput}
              onChange={(event) => setQueryInput(event.target.value)}
            />
          </div>
        </div>
      ) : null}

      {listLoading ? <LoadingState label="Loading contacts…" /> : null}

      {listError ? (
        <ErrorState title="Unable to load contacts" description={loadError} onRetry={reloadFirstPage} />
      ) : null}

      {showEmptyFilters ? (
        <EmptyState
          icon={Users}
          title="No contacts match"
          description="Try clearing search or switching tabs."
          actionLabel="Clear filters"
          onAction={() => {
            setQueryInput('')
            setQuery('')
            setTab('all')
          }}
        />
      ) : null}

      {showTable ? (
        <>
          <Table columns={columns} rows={contacts} />
          {loadMoreError ? (
            <p className="mt-2 text-sm text-danger" role="alert">
              {loadMoreError}
            </p>
          ) : null}
          {nextCursor ? (
            <div className="mt-3 flex justify-center">
              <Button variant="secondary" disabled={loadingMore} onClick={loadMore}>
                {loadingMore ? 'Loading…' : 'Load more'}
              </Button>
            </div>
          ) : null}
        </>
      ) : null}

      <Modal
        open={createOpen}
        onClose={() => {
          if (!submitting) setCreateOpen(false)
        }}
        title="Add contact"
        footer={
          <>
            <Button variant="ghost" disabled={submitting} onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button disabled={submitting || !storeId} onClick={handleCreate}>
              {submitting ? 'Creating…' : 'Create contact'}
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
          <FormField label="Email" error={firstFieldError(fieldErrors, 'email')}>
            <Input
              value={createForm.email}
              onChange={(event) =>
                setCreateForm((current) => ({ ...current, email: event.target.value }))
              }
              disabled={submitting}
            />
          </FormField>
          <FormField label="Phone" error={firstFieldError(fieldErrors, 'phone')}>
            <Input
              value={createForm.phone}
              onChange={(event) =>
                setCreateForm((current) => ({ ...current, phone: event.target.value }))
              }
              disabled={submitting}
            />
          </FormField>
          <FormField label="First name" error={firstFieldError(fieldErrors, 'first_name')}>
            <Input
              value={createForm.first_name}
              onChange={(event) =>
                setCreateForm((current) => ({ ...current, first_name: event.target.value }))
              }
              disabled={submitting}
            />
          </FormField>
          <FormField label="Last name" error={firstFieldError(fieldErrors, 'last_name')}>
            <Input
              value={createForm.last_name}
              onChange={(event) =>
                setCreateForm((current) => ({ ...current, last_name: event.target.value }))
              }
              disabled={submitting}
            />
          </FormField>
          <p className="text-xs text-muted">
            Email or phone is required. New contacts start as nonsubscribed. Recreating a deleted
            contact restores prior consents and requires consent review before marketing.
          </p>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete contacts"
        description={`Delete ${selected.length} selected contact(s)? They can be restored later by recreating the same email or phone; prior consents are preserved and marketing stays blocked until review.`}
        confirmLabel="Delete"
        tone="danger"
        onConfirm={handleDeleteSelected}
      />

      <ConfirmDialog
        open={restoreOpen}
        onClose={() => {
          setRestoreOpen(false)
          setPendingRestore(null)
        }}
        title="Restore deleted contact?"
        description={
          conflictContact
            ? `A deleted contact already exists (${formatContactName(conflictContact)}). Prior consents will be preserved (${formatConsentSummary(conflictContact)}). Marketing stays blocked until you review consents on the contact page.`
            : 'Restore this deleted contact? Prior consents are preserved and marketing stays blocked until review.'
        }
        confirmLabel="Restore contact"
        onConfirm={handleRestoreConfirm}
      />
    </div>
  )
}
