import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import {
  PageHeader,
  Button,
  Card,
  FormField,
  Input,
  Textarea,
  Select,
  Badge,
  Tabs,
  LoadingState,
  ErrorState,
  EmptyState,
} from '../../components/ui'
import { ApiError } from '../../lib/api'
import {
  createStoreCampaign,
  getCampaign,
  previewCampaignAudience,
  scheduleCampaign,
  updateCampaign,
} from '../../lib/campaignsApi'
import { listStoreSegments } from '../../lib/segmentsApi'
import { firstFieldError } from '../../lib/tagsUi'
import { useActiveStore } from '../../store/useActiveStore'

const steps = [
  { id: 'setup', label: 'Setup' },
  { id: 'content', label: 'Content' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'review', label: 'Review' },
]

const ALL_ELIGIBLE = 'all_eligible'

function emptyForm(channel) {
  const isSms = channel === 'sms'
  return {
    name: isSms ? 'New SMS campaign' : 'New email campaign',
    subject: isSms ? '' : '',
    previewText: '',
    body: '',
    audienceType: ALL_ELIGIBLE,
    segmentId: '',
    scheduledAt: '',
  }
}

function toDatetimeLocalValue(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function fromDatetimeLocalValue(local) {
  if (!local) return null
  const date = new Date(local)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

function audienceLabel(form, segments) {
  if (form.audienceType === ALL_ELIGIBLE) return 'All eligible contacts'
  const segment = segments.find((item) => item.id === form.segmentId)
  return segment?.name || 'Segment'
}

export function CampaignWizardPage() {
  const { channel: channelParam, campaignId } = useParams()
  const navigate = useNavigate()
  const { activeStore, status: storeStatus } = useActiveStore()
  const storeId = activeStore?.id
  const isEdit = Boolean(campaignId)

  const [channel, setChannel] = useState(channelParam === 'sms' ? 'sms' : 'email')
  const isSms = channel === 'sms'

  const [step, setStep] = useState('setup')
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState(() => emptyForm(channelParam === 'sms' ? 'sms' : 'email'))
  const [segments, setSegments] = useState([])
  const [loadError, setLoadError] = useState('')
  const [loading, setLoading] = useState(isEdit)
  const [loadNonce, setLoadNonce] = useState(0)
  const [notFound, setNotFound] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [actionError, setActionError] = useState('')
  const [previewCount, setPreviewCount] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState('')

  const stepIndex = steps.findIndex((item) => item.id === step)

  useEffect(() => {
    if (storeStatus === 'loading' || !storeId) return undefined
    let cancelled = false

    listStoreSegments(storeId)
      .then((data) => {
        if (!cancelled) setSegments(data)
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadError(error instanceof ApiError ? error.message : 'Unable to load segments.')
        }
      })

    return () => {
      cancelled = true
    }
  }, [storeId, storeStatus])

  useEffect(() => {
    if (!isEdit || storeStatus === 'loading' || !storeId) return undefined

    let cancelled = false
    setLoading(true)
    setLoadError('')
    setNotFound(false)

    getCampaign(campaignId)
      .then((campaign) => {
        if (cancelled) return
        if (campaign.status === 'scheduled') {
          navigate(`/campaigns/${campaign.id}`, { replace: true })
          return
        }
        setChannel(campaign.channel === 'sms' ? 'sms' : 'email')
        setForm({
          name: campaign.name || '',
          subject: campaign.subject || '',
          previewText: campaign.preview_text || '',
          body: campaign.body || '',
          audienceType: campaign.audience_type === 'segment' ? 'segment' : ALL_ELIGIBLE,
          segmentId: campaign.segment_id || '',
          scheduledAt: toDatetimeLocalValue(campaign.scheduled_at),
        })
        setLoading(false)
      })
      .catch((error) => {
        if (cancelled) return
        setLoading(false)
        if (error instanceof ApiError && error.status === 404) {
          setNotFound(true)
          return
        }
        setLoadError(error instanceof ApiError ? error.message : 'Unable to load the campaign.')
      })

    return () => {
      cancelled = true
    }
  }, [isEdit, campaignId, storeId, storeStatus, navigate, loadNonce])

  const needsSegmentChoice = form.audienceType === 'segment' && !form.segmentId

  useEffect(() => {
    if (step !== 'review' || !storeId || needsSegmentChoice) return undefined

    let cancelled = false
    setPreviewLoading(true)
    setPreviewError('')

    previewCampaignAudience(storeId, {
      channel,
      audience_type: form.audienceType,
      segment_id: form.audienceType === 'segment' ? form.segmentId : null,
    })
      .then((result) => {
        if (cancelled) return
        setPreviewCount(result.count)
      })
      .catch((error) => {
        if (cancelled) return
        setPreviewCount(null)
        setPreviewError(
          error instanceof ApiError ? error.message : 'Unable to preview the audience.',
        )
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [step, storeId, channel, form.audienceType, form.segmentId, needsSegmentChoice])

  const validate = (targetStep) => {
    const nextErrors = {}
    if (targetStep === 'setup' || targetStep === 'content' || targetStep === 'schedule' || targetStep === 'review') {
      if (!form.name.trim()) nextErrors.name = 'Campaign name is required.'
      if (form.audienceType === 'segment' && !form.segmentId) {
        nextErrors.segmentId = 'Choose a segment.'
      }
    }
    if (targetStep === 'content' || targetStep === 'schedule' || targetStep === 'review') {
      if (!isSms && !form.subject.trim()) nextErrors.subject = 'Subject is required for email.'
      if (!form.body.trim()) nextErrors.body = 'Content is required.'
    }
    if (targetStep === 'schedule' || targetStep === 'review') {
      // schedule datetime is only required when scheduling, checked at submit
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const goNext = () => {
    if (!validate(step)) return
    const next = steps[Math.min(stepIndex + 1, steps.length - 1)]
    setStep(next.id)
  }

  const goBack = () => {
    const prev = steps[Math.max(stepIndex - 1, 0)]
    setStep(prev.id)
  }

  const buildPayload = () => {
    const payload = {
      name: form.name.trim(),
      audience_type: form.audienceType,
      segment_id: form.audienceType === 'segment' ? form.segmentId : null,
      body: form.body,
    }
    if (!isEdit) payload.channel = channel
    if (isSms) {
      payload.subject = null
      payload.preview_text = null
    } else {
      payload.subject = form.subject
      payload.preview_text = form.previewText
    }
    return payload
  }

  const persistCampaign = async () => {
    const payload = buildPayload()
    if (isEdit) {
      return updateCampaign(campaignId, payload)
    }
    return createStoreCampaign(storeId, payload)
  }

  const saveDraft = async () => {
    if (!storeId || submitting) return
    if (!validate('review')) return
    setSubmitting(true)
    setActionError('')
    try {
      const saved = await persistCampaign()
      navigate(`/campaigns/${saved.id}`)
    } catch (error) {
      if (error instanceof ApiError) {
        setActionError(error.message)
        if (error.errors) {
          setErrors({
            name: firstFieldError(error.errors, 'name') || undefined,
            subject: firstFieldError(error.errors, 'subject') || undefined,
            body: firstFieldError(error.errors, 'body') || undefined,
            segmentId: firstFieldError(error.errors, 'segment_id') || undefined,
          })
        }
      } else {
        setActionError('Unable to save the campaign.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const saveAndSchedule = async () => {
    if (!storeId || submitting) return
    if (!validate('review')) return
    if (!form.scheduledAt) {
      setErrors((current) => ({ ...current, scheduledAt: 'Pick a schedule time.' }))
      setStep('schedule')
      return
    }
    const scheduledAt = fromDatetimeLocalValue(form.scheduledAt)
    if (!scheduledAt) {
      setErrors((current) => ({ ...current, scheduledAt: 'Pick a valid schedule time.' }))
      setStep('schedule')
      return
    }

    setSubmitting(true)
    setActionError('')
    try {
      const saved = await persistCampaign()
      const scheduled = await scheduleCampaign(saved.id, { scheduled_at: scheduledAt })
      navigate(`/campaigns/${scheduled.id}`)
    } catch (error) {
      if (error instanceof ApiError) {
        setActionError(error.message)
        if (error.status === 409) {
          navigate(`/campaigns/${campaignId || ''}`)
          return
        }
        if (error.errors?.scheduled_at) {
          setErrors((current) => ({
            ...current,
            scheduledAt: firstFieldError(error.errors, 'scheduled_at'),
          }))
          setStep('schedule')
        }
      } else {
        setActionError('Unable to schedule the campaign.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const summary = useMemo(
    () => [
      { label: 'Channel', value: isSms ? 'SMS' : 'Email' },
      { label: 'Name', value: form.name || '—' },
      { label: 'Audience', value: audienceLabel(form, segments) },
      {
        label: 'Send',
        value: form.scheduledAt ? `Schedule ${form.scheduledAt.replace('T', ' ')}` : 'Not scheduled',
      },
      {
        label: 'Eligible contacts',
        value: needsSegmentChoice
          ? 'Choose a segment'
          : previewLoading
            ? 'Counting…'
            : previewError
              ? 'Unavailable'
              : previewCount === null
                ? '—'
                : String(previewCount),
      },
    ],
    [form, isSms, segments, previewCount, previewLoading, previewError, needsSegmentChoice],
  )

  if (storeStatus === 'loading') {
    return <LoadingState label="Loading store…" />
  }

  if (!storeId) {
    return (
      <EmptyState
        title="Select a store"
        description="Campaigns are scoped to a store."
        actionLabel="Go to Store settings"
        onAction={() => navigate('/settings/store')}
      />
    )
  }

  if (notFound) {
    return (
      <EmptyState
        title="Campaign not found"
        description="This campaign does not exist or is no longer available."
        actionLabel="Back to campaigns"
        onAction={() => navigate('/campaigns')}
      />
    )
  }

  if (loading) {
    return <LoadingState label="Loading campaign…" />
  }

  if (loadError && isEdit) {
    return (
      <ErrorState
        title="Unable to load campaign"
        description={loadError}
        onRetry={() => setLoadNonce((n) => n + 1)}
      />
    )
  }

  return (
    <div>
      <div className="mb-3">
        <Link to="/campaigns" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
          <ArrowLeft className="size-4" />
          Campaigns
        </Link>
      </div>

      <PageHeader
        title={
          isEdit
            ? isSms
              ? 'Edit SMS campaign'
              : 'Edit email campaign'
            : isSms
              ? 'Create SMS campaign'
              : 'Create email campaign'
        }
        description="Compose a draft and schedule it for later. Delivery is not connected yet."
        actions={<Badge tone="info">{isSms ? 'SMS' : 'Email'}</Badge>}
      />

      {actionError ? (
        <p className="mb-3 text-sm text-danger" role="alert">
          {actionError}
        </p>
      ) : null}

      <Tabs
        className="mb-4"
        value={step}
        onChange={setStep}
        items={steps.map((item) => ({ value: item.id, label: item.label }))}
      />

      {step === 'setup' && (
        <Card className="space-y-3">
          <FormField label="Campaign name" error={errors.name}>
            <Input
              value={form.name}
              onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))}
            />
          </FormField>
          <FormField label="Audience" error={errors.segmentId}>
            <Select
              value={
                form.audienceType === ALL_ELIGIBLE
                  ? ALL_ELIGIBLE
                  : `segment:${form.segmentId || ''}`
              }
              onChange={(event) => {
                const value = event.target.value
                if (value === ALL_ELIGIBLE) {
                  setForm((current) => ({
                    ...current,
                    audienceType: ALL_ELIGIBLE,
                    segmentId: '',
                  }))
                  return
                }
                const segmentId = value.startsWith('segment:') ? value.slice('segment:'.length) : ''
                setForm((current) => ({
                  ...current,
                  audienceType: 'segment',
                  segmentId,
                }))
              }}
            >
              <option value={ALL_ELIGIBLE}>All eligible contacts</option>
              {segments.map((segment) => (
                <option key={segment.id} value={`segment:${segment.id}`}>
                  {segment.name}
                </option>
              ))}
            </Select>
          </FormField>
          {loadError && !isEdit ? (
            <p className="text-sm text-danger" role="alert">
              {loadError}
            </p>
          ) : null}
        </Card>
      )}

      {step === 'content' && (
        <div className="grid gap-3 lg:grid-cols-2">
          <Card className="space-y-3">
            {!isSms ? (
              <>
                <FormField label="Subject line" error={errors.subject}>
                  <Input
                    value={form.subject}
                    onChange={(event) =>
                      setForm((value) => ({ ...value, subject: event.target.value }))
                    }
                  />
                </FormField>
                <FormField label="Preview text">
                  <Input
                    value={form.previewText}
                    onChange={(event) =>
                      setForm((value) => ({ ...value, previewText: event.target.value }))
                    }
                  />
                </FormField>
              </>
            ) : null}
            <FormField label={isSms ? 'SMS message' : 'Email body'} error={errors.body}>
              <Textarea
                rows={12}
                value={form.body}
                onChange={(event) => setForm((value) => ({ ...value, body: event.target.value }))}
              />
            </FormField>
            {isSms ? (
              <p className="text-xs text-muted">{form.body.length}/160 characters (soft limit)</p>
            ) : null}
          </Card>
          <Card>
            <h3 className="mb-3 text-sm font-semibold text-ink">Preview</h3>
            <div className="rounded-md border border-line bg-midnight p-4">
              {!isSms ? (
                <p className="mb-2 text-sm font-semibold text-ink">{form.subject || 'Subject'}</p>
              ) : null}
              <pre className="whitespace-pre-wrap font-sans text-sm text-muted">
                {form.body || 'Message body'}
              </pre>
            </div>
          </Card>
        </div>
      )}

      {step === 'schedule' && (
        <Card className="space-y-3">
          <FormField label="Schedule time" error={errors.scheduledAt}>
            <Input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(event) =>
                setForm((value) => ({ ...value, scheduledAt: event.target.value }))
              }
            />
          </FormField>
          <p className="text-sm text-muted">
            Required only when you schedule. You can still save a draft without a send time.
          </p>
        </Card>
      )}

      {step === 'review' && (
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink">Review</h3>
          <dl className="space-y-2 text-sm">
            {summary.map((item) => (
              <div key={item.label} className="flex justify-between gap-3 border-b border-line/60 py-2">
                <dt className="text-muted">{item.label}</dt>
                <dd className="text-right text-ink">{item.value}</dd>
              </div>
            ))}
          </dl>
          {needsSegmentChoice ? (
            <p className="mt-3 text-sm text-danger" role="alert">
              Choose a segment to preview the audience.
            </p>
          ) : null}
          {!needsSegmentChoice && previewError ? (
            <p className="mt-3 text-sm text-danger" role="alert">
              {previewError}
            </p>
          ) : null}
          <p className="mt-3 text-xs text-muted">
            Scheduling stores the eligible audience count. No email or SMS is delivered in this
            phase.
          </p>
        </Card>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" onClick={stepIndex === 0 ? () => navigate('/campaigns') : goBack}>
          {stepIndex === 0 ? 'Cancel' : 'Back'}
        </Button>
        {step !== 'review' ? (
          <Button onClick={goNext}>Continue</Button>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" disabled={submitting} onClick={saveDraft}>
              {submitting ? 'Saving…' : 'Save draft'}
            </Button>
            <Button disabled={submitting} onClick={saveAndSchedule}>
              {submitting ? 'Scheduling…' : 'Schedule campaign'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
