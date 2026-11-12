import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import {
  PageHeader,
  Button,
  Card,
  FormField,
  Input,
  Select,
  Badge,
  LoadingState,
  ErrorState,
  EmptyState,
} from '../../components/ui'
import { EmailBlockEditor } from '../../components/emailTemplates/EmailBlockEditor'
import { EmailHtmlPreview } from '../../components/emailTemplates/EmailHtmlPreview'
import { ApiError } from '../../lib/api'
import { listStoreAssets } from '../../lib/assetsApi'
import {
  deleteEmailTemplate,
  emptyEmailDocument,
  getEmailTemplate,
  previewEmailDocument,
  updateEmailTemplate,
} from '../../lib/emailTemplatesApi'
import { firstFieldError } from '../../lib/tagsUi'
import { useActiveStore } from '../../store/useActiveStore'

export function EmailTemplateEditorPage() {
  const { templateId } = useParams()
  const navigate = useNavigate()
  const { activeStore, status: storeStatus } = useActiveStore()
  const storeId = activeStore?.id

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [loadNonce, setLoadNonce] = useState(0)

  const [name, setName] = useState('')
  const [category, setCategory] = useState('general')
  const [status, setStatus] = useState('draft')
  const [document, setDocument] = useState(emptyEmailDocument())
  const [assets, setAssets] = useState([])

  const [previewHtml, setPreviewHtml] = useState('')
  const [previewError, setPreviewError] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [actionError, setActionError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    if (storeStatus === 'loading' || !storeId || !templateId) return undefined

    let cancelled = false
    setLoading(true)
    setLoadError('')
    setNotFound(false)

    Promise.all([getEmailTemplate(templateId), listStoreAssets(storeId, { limit: 100 })])
      .then(([template, assetPage]) => {
        if (cancelled) return
        setName(template.name || '')
        setCategory(template.category || 'general')
        setStatus(template.status || 'draft')
        setDocument(template.document || emptyEmailDocument())
        setPreviewHtml(template.html || '')
        setAssets(assetPage.data || [])
        setLoading(false)
      })
      .catch((error) => {
        if (cancelled) return
        setLoading(false)
        if (error instanceof ApiError && error.status === 404) {
          setNotFound(true)
          return
        }
        setLoadError(error instanceof ApiError ? error.message : 'Unable to load template.')
      })

    return () => {
      cancelled = true
    }
  }, [storeId, storeStatus, templateId, loadNonce])

  const runPreview = async () => {
    if (!storeId || previewLoading) return
    setPreviewLoading(true)
    setPreviewError('')
    try {
      const result = await previewEmailDocument(storeId, document)
      setPreviewHtml(result.html)
    } catch (error) {
      setPreviewError(error instanceof ApiError ? error.message : 'Unable to preview.')
      if (error instanceof ApiError && error.errors?.document) {
        setFieldErrors({ document: firstFieldError(error.errors, 'document') })
      }
    } finally {
      setPreviewLoading(false)
    }
  }

  const save = async () => {
    if (!templateId || saving) return
    if (!name.trim()) {
      setFieldErrors({ name: 'Name is required.' })
      return
    }
    setSaving(true)
    setActionError('')
    setFieldErrors({})
    try {
      const updated = await updateEmailTemplate(templateId, {
        name: name.trim(),
        category,
        status,
        document,
      })
      setPreviewHtml(updated.html || '')
      setDocument(updated.document || document)
    } catch (error) {
      if (error instanceof ApiError) {
        setActionError(error.message)
        setFieldErrors({
          name: firstFieldError(error.errors, 'name') || undefined,
          document: firstFieldError(error.errors, 'document') || undefined,
        })
      } else {
        setActionError('Unable to save the template.')
      }
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!templateId || deleting) return
    if (!window.confirm('Delete this template? Campaigns that already applied it keep their snapshot.')) {
      return
    }
    setDeleting(true)
    setActionError('')
    try {
      await deleteEmailTemplate(templateId)
      navigate('/resources/templates')
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'Unable to delete.')
    } finally {
      setDeleting(false)
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

  if (notFound) {
    return (
      <EmptyState
        title="Template not found"
        description="This template does not exist or is no longer available."
        actionLabel="Back to templates"
        onAction={() => navigate('/resources/templates')}
      />
    )
  }

  if (loading) {
    return <LoadingState label="Loading template…" />
  }

  if (loadError) {
    return (
      <ErrorState
        title="Unable to load template"
        description={loadError}
        onRetry={() => setLoadNonce((n) => n + 1)}
      />
    )
  }

  return (
    <div>
      <div className="mb-3">
        <Link
          to="/resources/templates"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Templates
        </Link>
      </div>

      <PageHeader
        title="Edit email template"
        description="Block JSON is the source of truth. HTML is sanitized and stored as a snapshot."
        actions={
          <>
            <Badge tone={status === 'published' ? 'success' : 'warning'}>{status}</Badge>
            <Button variant="secondary" disabled={previewLoading} onClick={runPreview}>
              {previewLoading ? 'Previewing…' : 'Refresh preview'}
            </Button>
            <Button variant="danger" disabled={deleting} onClick={remove}>
              {deleting ? 'Deleting…' : 'Delete'}
            </Button>
            <Button disabled={saving} onClick={save}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </>
        }
      />

      {actionError ? (
        <p className="mb-3 text-sm text-danger" role="alert">
          {actionError}
        </p>
      ) : null}
      {fieldErrors.document ? (
        <p className="mb-3 text-sm text-danger" role="alert">
          {fieldErrors.document}
        </p>
      ) : null}

      <div className="mb-4 grid gap-3 lg:grid-cols-3">
        <Card className="space-y-3 lg:col-span-2">
          <FormField label="Name" error={fieldErrors.name}>
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </FormField>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Category">
              <Input value={category} onChange={(event) => setCategory(event.target.value)} />
            </FormField>
            <FormField label="Status">
              <Select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </Select>
            </FormField>
          </div>
        </Card>
        <Card className="space-y-2">
          <p className="text-sm font-semibold text-ink">Images</p>
          <p className="text-sm text-muted">
            Upload images in the library, then pick them in image blocks.
          </p>
          <Button variant="secondary" onClick={() => navigate('/resources/images')}>
            Open image library
          </Button>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <EmailBlockEditor document={document} onChange={setDocument} assets={assets} />
        <div className="space-y-2">
          <p className="text-sm font-semibold text-ink">Preview</p>
          {previewError ? (
            <p className="text-sm text-danger" role="alert">
              {previewError}
            </p>
          ) : null}
          <EmailHtmlPreview html={previewHtml} className="min-h-[640px]" />
        </div>
      </div>
    </div>
  )
}
