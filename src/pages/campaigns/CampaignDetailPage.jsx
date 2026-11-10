import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import {
  PageHeader,
  Card,
  Badge,
  MetricCard,
  EmptyState,
  Button,
} from '../../components/ui'
import { getCampaignById } from '../../mock'
import { formatCurrency, formatDateTime, formatNumber, statusLabel, statusTone } from '../../lib/format'

export function CampaignDetailPage() {
  const { campaignId } = useParams()
  const navigate = useNavigate()
  const campaign = getCampaignById(campaignId)

  if (!campaign) {
    return (
      <EmptyState
        title="Campaign not found"
        description="This campaign ID is not in the mock dataset."
        actionLabel="Back to campaigns"
        onAction={() => navigate('/campaigns')}
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
        title={campaign.name}
        description={`${campaign.channel.toUpperCase()} · ${campaign.audience}`}
        actions={
          <>
            <Badge tone={statusTone(campaign.status)}>{statusLabel(campaign.status)}</Badge>
            <Button variant="secondary" onClick={() => alert('Prototype only — duplicate stays local.')}>
              Duplicate
            </Button>
          </>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Delivered" value={formatNumber(campaign.stats.delivered)} />
        <MetricCard label="Opens" value={formatNumber(campaign.stats.opens)} />
        <MetricCard label="Clicks" value={formatNumber(campaign.stats.clicks)} />
        <MetricCard label="Revenue" value={formatCurrency(campaign.stats.revenue)} />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink">Details</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Subject</dt>
              <dd>{campaign.subject || '—'}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Audience size</dt>
              <dd>{formatNumber(campaign.audienceCount)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Scheduled</dt>
              <dd>{formatDateTime(campaign.scheduledAt)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Sent</dt>
              <dd>{formatDateTime(campaign.sentAt)}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink">Content preview</h3>
          <div className="rounded-md border border-line bg-midnight p-4">
            <pre className="whitespace-pre-wrap font-sans text-sm text-muted">{campaign.content}</pre>
          </div>
        </Card>
      </div>
    </div>
  )
}
