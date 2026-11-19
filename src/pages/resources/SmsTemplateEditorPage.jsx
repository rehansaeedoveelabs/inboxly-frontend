import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  FormField,
  Input,
  LoadingState,
  Select,
  Textarea,
} from '../../components/ui'
import { SmsPhonePreview } from '../../components/campaigns/SmsPhonePreview'
import { SmsMergeTagPicker } from '../../components/smsTemplates/SmsMergeTagPicker'
import { ApiError } from '../../lib/api'
import { updateCampaign } from '../../lib/campaignsApi'
import {
  clearCampaignTemplatePick,
  finishCampaignSmsTemplatePick,
  getCampaignTemplatePick,
} from '../../lib/campaignTemplatePick'
import { cn } from '../../lib/cn'
import {
  SMS_TEMPLATE_CATEGORIES,
  personalizeSmsBody,
  smsLengthStats,
} from '../../lib/smsTemplateCatalog'
import {
  deleteSmsTemplate,
  getSmsTemplate,
  updateSmsTemplate,
} from '../../lib/smsTemplatesApi'
import { firstFieldError } from '../../lib/tagsUi'
import { useActiveStore } from '../../store/useActiveStore'

const CATEGORY_OPTIONS = SMS_TEMPLATE_CATEGORIES.filter((item) => item.id !== 'all')

function formatSmsMeter(stats) {
  const smsLabel = stats.segments === 1 ? '1 SMS' : `${stats.segments} SMS`
  return `${stats.chars} chars · ${smsLabel}`
}

export function SmsTemplateEditorPage() {
  const { templateId } = useParams()
  const navigate = useNavigate()
  const { activeStore, status: storeStatus } = useActiveStore()
  const storeId = activeStore?.id
  const shopName = activeStore?.name || activeStore?.shopify_shop_domain || 'Your shop'
  const [pickContext] = useState(() => getCampaignTemplatePick())
  const pickingForCampaign =
    Boolean(pickContext?.campaignId) && (pickContext?.channel || 'email') === 'sms'

  const bodyRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [loadNonce, setLoadNonce] = useState(0)

  const [name, setName] = useState('')
  const [category, setCategory] = useState('promo')
  const [status, setStatus] = useState('draft')
  const [body, setBody] = useState('')

  const [saving, setSaving] = useState(false)
  const [usingInCampaign, setUsingInCampaign] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [actionError, setActionError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    if (storeStatus === 'loading' || !storeId || !templateId) return undefined

    let cancelled = false
    setLoading(true)
    setLoadError('')
    setNotFound(false)

    getSmsTemplate(templateId)
      .then((template) => {
        if (cancelled) return
        setName(template.name || '')
        setCategory(template.category || 'promo')
        setStatus(template.status || 'draft')
        setBody(template.body || '')
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

  const previewBody = useMemo(
    () => personalizeSmsBody(body, { shopName }),
    [body, shopName],
  )

  const rawStats = useMemo(() => smsLengthStats(body), [body])
  const previewStats = useMemo(() => smsLengthStats(previewBody), [previewBody])

  const insertMergeTag = (token) => {
    const el = bodyRef.current
    if (!el) {
      setBody((current) => `${current}${token}`)
      return
    }
    const start = el.selectionStart ?? body.length
    const end = el.selectionEnd ?? body.length
    const next = `${body.slice(0, start)}${token}${body.slice(end)}`
    setBody(next)
    window.requestAnimationFrame(() => {
      el.focus()
      const cursor = start + token.length
      el.setSelectionRange(cursor, cursor)
    })
  }

  const save = async ({ publish = false } = {}) => {
    if (!templateId || saving) return false
    setSaving(true)
    setActionError('')
    setFieldErrors({})
    try {
      const nextStatus = publish ? 'published' : status
      const updated = await updateSmsTemplate(templateId, {
        name: name.trim() || 'Untitled SMS',
        category,
        status: nextStatus,
        body,
      })
      setName(updated.name || name)
      setCategory(updated.category || category)
      setStatus(updated.status || nextStatus)
      setBody(updated.body || body)
      setSavedFlash(true)
      window.setTimeout(() => setSavedFlash(false), 1600)
      return true
    } catch (error) {
      if (error instanceof ApiError) {
        setActionError(error.message)
        setFieldErrors({
          name: firstFieldError(error.errors, 'name') || undefined,
          body: firstFieldError(error.errors, 'body') || undefined,
          category: firstFieldError(error.errors, 'category') || undefined,
        })
      } else {
        setActionError('Unable to save template.')
      }
      return false
    } finally {
      setSaving(false)
    }
  }

  const useInCampaign = async () => {
    if (!pickingForCampaign || usingInCampaign) return
    setUsingInCampaign(true)
    setActionError('')
    try {
      const ok = await save({ publish: true })
      if (!ok) return
      await finishCampaignSmsTemplatePick({
        body: personalizeSmsBody(body, { shopName }),
        navigate,
        updateFn: updateCampaign,
      })
    } catch (error) {
      setActionError(
        error instanceof ApiError ? error.message : 'Unable to apply this template to the campaign.',
      )
    } finally {
      setUsingInCampaign(false)
    }
  }

  const remove = async () => {
    if (!templateId || deleting) return
    setDeleting(true)
    setActionError('')
    try {
      await deleteSmsTemplate(templateId)
      clearCampaignTemplatePick()
      navigate('/resources/sms-templates')
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'Unable to delete template.')
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const goBack = () => {
    if (pickingForCampaign && pickContext?.returnTo) {
      clearCampaignTemplatePick()
      navigate(pickContext.returnTo)
      return
    }
    navigate('/resources/sms-templates')
  }

  if (storeStatus === 'loading' || loading) {
    return <LoadingState label="Loading template…" />
  }

  if (!storeId) {
    return (
      <EmptyState
        title="Select a store"
        description="SMS templates are scoped to a store."
        actionLabel="Go to Store settings"
        onAction={() => navigate('/settings/store')}
      />
    )
  }

  if (notFound) {
    return (
      <EmptyState
        title="Template not found"
        description="This SMS template may have been deleted."
        actionLabel="Back to SMS templates"
        onAction={() => navigate('/resources/sms-templates')}
      />
    )
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
    <div className="pb-10">
      <div className="mb-4">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Back to templates
        </button>
      </div>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight text-ink">Edit SMS template</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Write a reusable SMS. Merge tags like{' '}
            <span className="font-mono text-ink">{'{{first_name}}'}</span> fill per recipient; any
            link is auto-tracked for clicks and revenue.
          </p>
        </div>
        {savedFlash ? <p className="text-sm text-success">Saved</p> : null}
      </div>

      {pickingForCampaign ? (
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-electric/40 bg-electric/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink">
            Editing for campaign
            {pickContext.campaignName ? ` “${pickContext.campaignName}”` : ''}. Save, then use in
            campaign to return.
          </p>
          <Button variant="secondary" onClick={goBack}>
            Back to campaign
          </Button>
        </div>
      ) : null}

      {actionError ? (
        <p className="mb-3 text-sm text-danger" role="alert">
          {actionError}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5 rounded-2xl border border-line bg-elevated p-5 sm:p-6">
          <FormField label="Template name" error={fieldErrors.name}>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Eid offer"
            />
          </FormField>

          <FormField label="Category" error={fieldErrors.category}>
            <Select value={category} onChange={(event) => setCategory(event.target.value)}>
              {CATEGORY_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </Select>
          </FormField>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-ink">Message</span>
            </div>
            <Textarea
              ref={bodyRef}
              rows={6}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              className={cn(fieldErrors.body ? 'border-danger' : null)}
              placeholder="Eid Mubarak from {{shop_name}}, {{first_name}}! Celebrate with 25% off. Code EID25: {{short_url}}"
            />
            {fieldErrors.body ? (
              <p className="mt-1.5 text-xs text-danger">{fieldErrors.body}</p>
            ) : null}
            <p className="mt-2 text-right text-xs text-muted">{formatSmsMeter(rawStats)}</p>
          </div>

          <div className="rounded-xl border border-line bg-midnight/40 p-4">
            <SmsMergeTagPicker onInsert={insertMergeTag} />
            <p className="mt-4 text-xs leading-relaxed text-muted">
              Tip: use <span className="font-mono text-ink">{'{{shop_url}}'}</span> for your store
              link — any link in the message is shortened and click-tracked (clicks → revenue)
              automatically.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <Button
              variant="ghost"
              className="text-danger"
              disabled={deleting || saving}
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" disabled={saving || usingInCampaign} onClick={goBack}>
                Cancel
              </Button>
              {pickingForCampaign ? (
                <Button disabled={saving || usingInCampaign} onClick={useInCampaign}>
                  {usingInCampaign ? 'Applying…' : 'Use in campaign'}
                </Button>
              ) : null}
              <Button disabled={saving || usingInCampaign} onClick={() => save({ publish: true })}>
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-line bg-elevated p-5 xl:sticky xl:top-4">
          <p className="mb-4 text-[11px] font-semibold tracking-wide text-muted uppercase">
            Preview
          </p>
          <div className="flex justify-center">
            <SmsPhonePreview body={previewBody} shopName={shopName} />
          </div>
          <p className="mt-4 text-center text-xs text-muted">
            {formatSmsMeter(previewStats)} · {previewStats.encoding} · sample data shown
          </p>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete SMS template?"
        description="This cannot be undone."
        confirmLabel={deleting ? 'Deleting…' : 'Delete'}
        tone="danger"
        onClose={() => setConfirmDelete(false)}
        onConfirm={remove}
      />
    </div>
  )
}
