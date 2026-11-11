import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Users, X } from 'lucide-react'
import {
  PageHeader,
  Card,
  Badge,
  Button,
  EmptyState,
  LoadingState,
  ErrorState,
  Modal,
  ConfirmDialog,
  FormField,
  Input,
  Select,
} from '../../components/ui'
import { ApiError } from '../../lib/api'
import {
  attachContactTags,
  deleteContact,
  detachContactTag,
  getContact,
  reviewContactConsents,
  updateContact,
  updateContactConsents,
} from '../../lib/contactsApi'
import {
  consentStatus,
  formatContactName,
  isMarketingEligible,
  requiresConsentReview,
} from '../../lib/contactsUi'
import { listStoreTags } from '../../lib/tagsApi'
import { firstFieldError } from '../../lib/tagsUi'
import { formatDateTime, statusLabel, statusTone } from '../../lib/format'
import { useActiveStore } from '../../store/useActiveStore'

const CONSENT_OPTIONS = ['subscribed', 'unsubscribed', 'nonsubscribed']
const CHANNELS = ['email', 'sms', 'push']

export function ContactDetailPage() {
  const { contactId } = useParams()
  const navigate = useNavigate()
  const { activeStore, status: storeStatus } = useActiveStore()
  const storeId = activeStore?.id

  const [contact, setContact] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [loadedContactId, setLoadedContactId] = useState(null)
  const [failedContactId, setFailedContactId] = useState(null)
  const [refreshNonce, setRefreshNonce] = useState(0)
  const [mismatchFor, setMismatchFor] = useState(null)

  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  })
  const [formError, setFormError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [actionError, setActionError] = useState('')

  const [consentDraft, setConsentDraft] = useState({
    email: 'nonsubscribed',
    sms: 'nonsubscribed',
    push: 'nonsubscribed',
  })

  const [storeTags, setStoreTags] = useState([])
  const [tagToAttach, setTagToAttach] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    if (storeStatus === 'loading' || !storeId || !contactId) return undefined

    let cancelled = false
    const scopeKey = `${storeId}|${contactId}`

    getContact(contactId)
      .then((data) => {
        if (cancelled) return
        if (data.store_id && data.store_id !== storeId) {
          setContact(null)
          setLoadedContactId(null)
          setFailedContactId(null)
          setMismatchFor(scopeKey)
          setLoadError('')
          return
        }
        setContact(data)
        setLoadError('')
        setFailedContactId(null)
        setLoadedContactId(contactId)
        setMismatchFor(null)
        setConsentDraft({
          email: consentStatus(data, 'email') || 'nonsubscribed',
          sms: consentStatus(data, 'sms') || 'nonsubscribed',
          push: consentStatus(data, 'push') || 'nonsubscribed',
        })
      })
      .catch((error) => {
        if (cancelled) return
        setContact(null)
        setLoadedContactId(null)
        setFailedContactId(contactId)
        setMismatchFor(null)
        setLoadError(error instanceof ApiError ? error.message : 'Unable to load the contact.')
      })

    return () => {
      cancelled = true
    }
  }, [contactId, storeId, storeStatus, refreshNonce])

  useEffect(() => {
    if (!storeId) return undefined
    let cancelled = false
    listStoreTags(storeId)
      .then((tags) => {
        if (!cancelled) setStoreTags(tags)
      })
      .catch(() => {
        if (!cancelled) setStoreTags([])
      })
    return () => {
      cancelled = true
    }
  }, [storeId])

  const storesLoading = storeStatus === 'loading'
  const missingStore = !storesLoading && !storeId
  const missingId = Boolean(storeId) && !contactId
  const notInStore = Boolean(storeId && contactId && mismatchFor === `${storeId}|${contactId}`)
  const ready = Boolean(contact) && loadedContactId === contactId && contactId
  const failed = Boolean(storeId) && failedContactId === contactId && !ready && !notInStore
  const loading =
    Boolean(storeId && contactId) && !ready && !failed && !notInStore && !missingStore

  const tags = Array.isArray(contact?.tags) ? contact.tags : []
  const attachedIds = new Set(tags.map((tag) => tag.id))
  const availableTags = storeTags.filter((tag) => !attachedIds.has(tag.id))

  const reload = () => {
    setLoadedContactId(null)
    setFailedContactId(null)
    setRefreshNonce((value) => value + 1)
  }

  const openEdit = () => {
    setEditForm({
      first_name: contact.first_name || '',
      last_name: contact.last_name || '',
      email: contact.email || '',
      phone: contact.phone || '',
    })
    setFormError('')
    setFieldErrors({})
    setEditOpen(true)
  }

  const saveEdit = async () => {
    setFormError('')
    setFieldErrors({})
    setSubmitting(true)
    try {
      const updated = await updateContact(contact.id, {
        first_name: editForm.first_name.trim() || null,
        last_name: editForm.last_name.trim() || null,
        email: editForm.email.trim() || null,
        phone: editForm.phone.trim() || null,
      })
      setContact(updated)
      setEditOpen(false)
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message)
        setFieldErrors(error.errors ?? {})
      } else {
        setFormError('Unable to update the contact.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const saveConsents = async () => {
    setActionError('')
    // Only send channels whose draft differs from the loaded status — never invent a subscribe.
    const consents = CHANNELS.map((channel) => ({
      channel,
      status: consentDraft[channel],
      source: 'manual',
    })).filter((entry) => entry.status !== (consentStatus(contact, entry.channel) || null))

    if (consents.length === 0) {
      setActionError('No consent changes to save.')
      return
    }

    setSubmitting(true)
    try {
      const updated = await updateContactConsents(contact.id, consents)
      setContact(updated)
      setConsentDraft({
        email: consentStatus(updated, 'email') || 'nonsubscribed',
        sms: consentStatus(updated, 'sms') || 'nonsubscribed',
        push: consentStatus(updated, 'push') || 'nonsubscribed',
      })
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'Unable to update consents.')
    } finally {
      setSubmitting(false)
    }
  }

  const applyContact = async (updated) => {
    // Detach response may omit tags (backend loads consents only) — refetch when needed.
    if (!Array.isArray(updated?.tags)) {
      setContact(await getContact(contact.id))
      return
    }
    setContact(updated)
  }

  const onAttachTag = async () => {
    if (!tagToAttach) return
    setActionError('')
    setSubmitting(true)
    try {
      const updated = await attachContactTags(contact.id, [tagToAttach])
      await applyContact(updated)
      setTagToAttach('')
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'Unable to attach the tag.')
    } finally {
      setSubmitting(false)
    }
  }

  const onDetachTag = async (tagId) => {
    setActionError('')
    setSubmitting(true)
    try {
      const updated = await detachContactTag(contact.id, tagId)
      await applyContact(updated)
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'Unable to remove the tag.')
    } finally {
      setSubmitting(false)
    }
  }

  const onDelete = async () => {
    setActionError('')
    try {
      await deleteContact(contact.id)
      navigate('/audience/contacts')
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Unable to delete the contact.'
      setActionError(message)
      throw error instanceof Error ? error : new Error(message)
    }
  }

  const onReviewConsents = async () => {
    setActionError('')
    setSubmitting(true)
    try {
      const updated = await reviewContactConsents(contact.id)
      setContact(updated)
      setConsentDraft({
        email: consentStatus(updated, 'email') || 'nonsubscribed',
        sms: consentStatus(updated, 'sms') || 'nonsubscribed',
        push: consentStatus(updated, 'push') || 'nonsubscribed',
      })
    } catch (error) {
      setActionError(
        error instanceof ApiError ? error.message : 'Unable to complete consent review.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const needsReview = requiresConsentReview(contact)

  if (storesLoading) {
    return <LoadingState label="Loading store…" />
  }

  if (missingStore) {
    return (
      <EmptyState
        icon={Users}
        title="Select a store"
        description="Choose a store before opening a contact."
        actionLabel="Go to Store settings"
        onAction={() => navigate('/settings/store')}
      />
    )
  }

  if (missingId || notInStore) {
    return (
      <EmptyState
        title="Contact not found"
        description={
          notInStore
            ? 'This contact belongs to a different store.'
            : 'This contact could not be found for the active store.'
        }
        actionLabel="Back to contacts"
        onAction={() => navigate('/audience/contacts')}
      />
    )
  }

  if (loading) {
    return <LoadingState label="Loading contact…" />
  }

  if (failed) {
    return (
      <ErrorState title="Unable to load contact" description={loadError} onRetry={reload} />
    )
  }

  if (!ready) {
    return null
  }

  return (
    <div>
      <div className="mb-3">
        <Link
          to="/audience/contacts"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Contacts
        </Link>
      </div>

      <PageHeader
        title={formatContactName(contact)}
        description={contact.email || contact.phone || '—'}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={openEdit} disabled={submitting}>
              Edit contact
            </Button>
            <Button variant="danger" onClick={() => setDeleteOpen(true)} disabled={submitting}>
              Delete
            </Button>
          </div>
        }
      />

      {actionError ? (
        <p className="mb-3 text-sm text-danger" role="alert">
          {actionError}
        </p>
      ) : null}

      {needsReview ? (
        <div className="mb-3 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3" role="status">
          <p className="text-sm font-medium text-ink">Consent review required</p>
          <p className="mt-1 text-sm text-muted">
            This contact was restored with its prior consent statuses preserved. Marketing stays
            blocked until you explicitly review consents. Saving consent changes alone does not
            clear this gate.
          </p>
          <div className="mt-3">
            <Button size="sm" onClick={onReviewConsents} disabled={submitting}>
              {submitting ? 'Reviewing…' : 'Mark consents reviewed'}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <h3 className="mb-3 text-sm font-semibold text-ink">Profile</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Email</dt>
              <dd className="text-right">{contact.email || '—'}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Phone</dt>
              <dd className="text-right">{contact.phone || '—'}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Source</dt>
              <dd className="text-right">{contact.source || '—'}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Locale</dt>
              <dd className="text-right">{contact.locale || '—'}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Timezone</dt>
              <dd className="text-right">{contact.timezone || '—'}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Added</dt>
              <dd className="text-right">{formatDateTime(contact.created_at)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Updated</dt>
              <dd className="text-right">{formatDateTime(contact.updated_at)}</dd>
            </div>
          </dl>
        </Card>

        <Card className="lg:col-span-1">
          <h3 className="mb-3 text-sm font-semibold text-ink">Consent & channels</h3>
          <div className="space-y-3">
            {CHANNELS.map((channel) => (
              <FormField key={channel} label={channel.toUpperCase()}>
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={consentDraft[channel]}
                    onChange={(event) =>
                      setConsentDraft((current) => ({
                        ...current,
                        [channel]: event.target.value,
                      }))
                    }
                    disabled={submitting}
                  >
                    {CONSENT_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {statusLabel(status)}
                      </option>
                    ))}
                  </Select>
                  <Badge tone={statusTone(consentStatus(contact, channel))}>
                    {statusLabel(consentStatus(contact, channel))}
                  </Badge>
                  <Badge tone={isMarketingEligible(contact, channel) ? 'success' : 'neutral'}>
                    {isMarketingEligible(contact, channel) ? 'Marketing eligible' : 'Not eligible'}
                  </Badge>
                </div>
              </FormField>
            ))}
            <Button size="sm" onClick={saveConsents} disabled={submitting}>
              Save consents
            </Button>
          </div>
        </Card>

        <Card className="lg:col-span-1">
          <h3 className="mb-3 text-sm font-semibold text-ink">Tags</h3>
          {tags.length === 0 ? (
            <p className="mb-3 text-sm text-muted">No tags on this contact.</p>
          ) : (
            <div className="mb-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag.id || tag.slug || tag.name} tone="neutral" className="inline-flex items-center gap-1">
                  {tag.name || tag.slug || 'Tag'}
                  <button
                    type="button"
                    className="rounded p-0.5 hover:bg-line"
                    aria-label={`Remove ${tag.name}`}
                    disabled={submitting}
                    onClick={() => onDetachTag(tag.id)}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Select
              value={tagToAttach}
              onChange={(event) => setTagToAttach(event.target.value)}
              disabled={submitting || availableTags.length === 0}
            >
              <option value="">
                {availableTags.length === 0 ? 'No tags available' : 'Select a tag'}
              </option>
              {availableTags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </Select>
            <Button
              variant="secondary"
              size="sm"
              disabled={!tagToAttach || submitting}
              onClick={onAttachTag}
            >
              Add
            </Button>
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete contact"
        description="Delete this contact? It can be restored later by recreating the same email or phone. Prior consents are preserved and marketing stays blocked until review."
        confirmLabel="Delete"
        tone="danger"
        onConfirm={onDelete}
      />

      <Modal
        open={editOpen}
        onClose={() => {
          if (!submitting) setEditOpen(false)
        }}
        title="Edit contact"
        footer={
          <>
            <Button variant="ghost" disabled={submitting} onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button disabled={submitting} onClick={saveEdit}>
              {submitting ? 'Saving…' : 'Save'}
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
          <FormField label="First name" error={firstFieldError(fieldErrors, 'first_name')}>
            <Input
              value={editForm.first_name}
              onChange={(event) =>
                setEditForm((current) => ({ ...current, first_name: event.target.value }))
              }
              disabled={submitting}
            />
          </FormField>
          <FormField label="Last name" error={firstFieldError(fieldErrors, 'last_name')}>
            <Input
              value={editForm.last_name}
              onChange={(event) =>
                setEditForm((current) => ({ ...current, last_name: event.target.value }))
              }
              disabled={submitting}
            />
          </FormField>
          <FormField label="Email" error={firstFieldError(fieldErrors, 'email')}>
            <Input
              value={editForm.email}
              onChange={(event) =>
                setEditForm((current) => ({ ...current, email: event.target.value }))
              }
              disabled={submitting}
            />
          </FormField>
          <FormField label="Phone" error={firstFieldError(fieldErrors, 'phone')}>
            <Input
              value={editForm.phone}
              onChange={(event) =>
                setEditForm((current) => ({ ...current, phone: event.target.value }))
              }
              disabled={submitting}
            />
          </FormField>
        </div>
      </Modal>
    </div>
  )
}
