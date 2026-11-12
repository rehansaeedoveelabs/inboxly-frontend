import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import {
  PageHeader,
  Card,
  Badge,
  MetricCard,
  EmptyState,
  Button,
  LoadingState,
  ErrorState,
  ConfirmDialog,
} from '../../components/ui'
import { ApiError } from '../../lib/api'
import {
  deleteCampaign,
  duplicateCampaign,
  formatCampaignAudience,
  getCampaign,
  sendCampaign,
  testSendCampaign,
  unscheduleCampaign,
} from '../../lib/campaignsApi'
import { listStoreSegments } from '../../lib/segmentsApi'
import { formatDateTime, formatNumber, statusLabel, statusTone } from '../../lib/format'
import { useActiveStore } from '../../store/useActiveStore'
import { EmailHtmlPreview } from '../../components/emailTemplates/EmailHtmlPreview'

export function CampaignDetailPage() {
  const { campaignId } = useParams()
  const navigate = useNavigate()
  const { activeStore, status: storeStatus } = useActiveStore()
  const storeId = activeStore?.id

  const [campaign, setCampaign] = useState(null)
  const [segmentNames, setSegmentNames] = useState(() => new Map())
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [actionError, setActionError] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmSend, setConfirmSend] = useState(false)
  const [testNotice, setTestNotice] = useState('')
  const [refreshNonce, setRefreshNonce] = useState(0)

  const reload = useCallback(() => {
    setRefreshNonce((n) => n + 1)
  }, [])

  useEffect(() => {
    if (!campaignId || storeStatus === 'loading') return undefined

    let cancelled = false
    setLoading(true)
    setLoadError('')
    setNotFound(false)

    const load = async () => {
      try {
        const [record, segments] = await Promise.all([
          getCampaign(campaignId),
          storeId ? listStoreSegments(storeId) : Promise.resolve([]),
        ])
        if (cancelled) return
        setCampaign(record)
        setSegmentNames(new Map(segments.map((segment) => [segment.id, segment.name])))
      } catch (error) {
        if (cancelled) return
        setCampaign(null)
        if (error instanceof ApiError && error.status === 404) {
          setNotFound(true)
          return
        }
        setLoadError(error instanceof ApiError ? error.message : 'Unable to load the campaign.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [campaignId, storeId, storeStatus, refreshNonce])

  if (!campaignId) {
    return (
      <EmptyState
        title="Campaign not found"
        description="This campaign does not exist or is no longer available."
        actionLabel="Back to campaigns"
        onAction={() => navigate('/campaigns')}
      />
    )
  }

  const onUnschedule = async () => {
    if (!campaign || busy) return
    setBusy(true)
    setActionError('')
    try {
      const updated = await unscheduleCampaign(campaign.id)
      setCampaign(updated)
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'Unable to unschedule.')
    } finally {
      setBusy(false)
    }
  }

  const onDuplicate = async () => {
    if (!campaign || busy) return
    setBusy(true)
    setActionError('')
    try {
      const copy = await duplicateCampaign(campaign.id)
      navigate(`/campaigns/${copy.id}/edit`)
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'Unable to duplicate.')
      setBusy(false)
    }
  }

  const onDelete = async () => {
    if (!campaign) return
    setActionError('')
    await deleteCampaign(campaign.id)
    navigate('/campaigns')
  }

  const onTestSend = async () => {
    if (!campaign || busy) return
    setBusy(true)
    setActionError('')
    setTestNotice('')
    try {
      const result = await testSendCampaign(campaign.id)
      if (result.accepted) {
        setTestNotice(`Test email accepted for ${result.to}.`)
      } else {
        setActionError(result.error_message || 'Test send was rejected.')
      }
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'Unable to send test email.')
    } finally {
      setBusy(false)
    }
  }

  const onSendNow = async () => {
    if (!campaign || busy) return
    setBusy(true)
    setActionError('')
    setConfirmSend(false)
    try {
      const updated = await sendCampaign(campaign.id)
      setCampaign(updated)
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'Unable to send the campaign.')
    } finally {
      setBusy(false)
    }
  }

  if (storeStatus === 'loading' || loading) {
    return <LoadingState label="Loading campaign…" />
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

  if (loadError) {
    return (
      <ErrorState title="Unable to load campaign" description={loadError} onRetry={reload} />
    )
  }

  if (!campaign) {
    return (
      <EmptyState
        title="Campaign not found"
        description="This campaign does not exist or is no longer available."
        actionLabel="Back to campaigns"
        onAction={() => navigate('/campaigns')}
      />
    )
  }

  const isDraft = campaign.status === 'draft'
  const isScheduled = campaign.status === 'scheduled'
  const isEmail = campaign.channel === 'email'
  const canSendEmail = isEmail && (isDraft || isScheduled)
  const audience = formatCampaignAudience(campaign, segmentNames)

  return (
    <div>
      <div className="mb-3">
        <Link to="/campaigns" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
          <ArrowLeft className="size-4" />
          Campaigns
        </Link>
      </div>

      <PageHeader
        title={campaign.name}
        description={`${String(campaign.channel || '').toUpperCase()} · ${audience}`}
        actions={
          <>
            <Badge tone={statusTone(campaign.status)}>{statusLabel(campaign.status)}</Badge>
            {isDraft ? (
              <Button variant="secondary" onClick={() => navigate(`/campaigns/${campaign.id}/edit`)}>
                Edit
              </Button>
            ) : null}
            {isScheduled ? (
              <Button variant="secondary" disabled={busy} onClick={onUnschedule}>
                Unschedule
              </Button>
            ) : null}
            {isEmail && isDraft ? (
              <Button variant="secondary" disabled={busy} onClick={onTestSend}>
                Send test
              </Button>
            ) : null}
            {canSendEmail ? (
              <Button disabled={busy} onClick={() => setConfirmSend(true)}>
                Send now
              </Button>
            ) : null}
            <Button variant="secondary" disabled={busy} onClick={onDuplicate}>
              Duplicate
            </Button>
            {isDraft ? (
              <Button variant="danger" disabled={busy} onClick={() => setConfirmDelete(true)}>
                Delete
              </Button>
            ) : null}
          </>
        }
      />

      {actionError ? (
        <p className="mb-3 text-sm text-danger" role="alert">
          {actionError}
        </p>
      ) : null}
      {testNotice ? (
        <p className="mb-3 text-sm text-success" role="status">
          {testNotice}
        </p>
      ) : null}

      {!isEmail ? (
        <p className="mb-3 rounded-md border border-line bg-midnight px-3 py-2 text-sm text-muted" role="status">
          SMS sending is not available yet. You can still draft and schedule SMS campaigns; delivery
          will be enabled when an SMS provider is connected.
        </p>
      ) : null}

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label="Eligible audience"
          value={
            campaign.audience_count === null || campaign.audience_count === undefined
              ? '—'
              : formatNumber(campaign.audience_count)
          }
        />
        <MetricCard label="Status" value={statusLabel(campaign.status)} />
        <MetricCard label="Channel" value={String(campaign.channel || '').toUpperCase()} />
        {campaign.sent_count != null ? (
          <MetricCard label="Sent" value={formatNumber(campaign.sent_count)} />
        ) : null}
        {campaign.failed_count != null ? (
          <MetricCard label="Failed" value={formatNumber(campaign.failed_count)} />
        ) : null}
        {campaign.skipped_count != null ? (
          <MetricCard label="Skipped" value={formatNumber(campaign.skipped_count)} />
        ) : null}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink">Details</h3>
          <dl className="space-y-2 text-sm">
            {campaign.channel === 'email' ? (
              <>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Subject</dt>
                  <dd className="text-right">{campaign.subject || '—'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Preview text</dt>
                  <dd className="text-right">{campaign.preview_text || '—'}</dd>
                </div>
              </>
            ) : null}
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Audience</dt>
              <dd className="text-right">{audience}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Audience count</dt>
              <dd>
                {campaign.audience_count === null || campaign.audience_count === undefined
                  ? '—'
                  : formatNumber(campaign.audience_count)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Scheduled</dt>
              <dd>{formatDateTime(campaign.scheduled_at)}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink">Content</h3>
          {campaign.content_format === 'html' && campaign.html_body ? (
            <EmailHtmlPreview html={campaign.html_body} className="min-h-[360px]" />
          ) : (
            <div className="rounded-md border border-line bg-midnight p-4">
              <pre className="whitespace-pre-wrap font-sans text-sm text-muted">
                {campaign.body || '—'}
              </pre>
            </div>
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete campaign?"
        description="This draft will be removed. This cannot be undone from the UI."
        confirmLabel="Delete"
        tone="danger"
        onConfirm={onDelete}
      />

      <ConfirmDialog
        open={confirmSend}
        onClose={() => setConfirmSend(false)}
        title="Send campaign now?"
        description="This queues delivery to the eligible audience. Requires messaging to be enabled on the server (Brevo for email)."
        confirmLabel="Send now"
        onConfirm={onSendNow}
      />
    </div>
  )
}
