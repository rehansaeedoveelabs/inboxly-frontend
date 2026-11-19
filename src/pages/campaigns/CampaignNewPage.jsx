import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Mail, MessageSquare, X } from 'lucide-react'
import { Button, EmptyState, LoadingState } from '../../components/ui'
import { useActiveStore } from '../../store/useActiveStore'

const TYPES = [
  {
    id: 'email',
    title: 'Email',
    description: 'Create a one-time email campaign you can send now or schedule for later.',
    cta: 'Create email',
    to: '/campaigns/new/email',
    Icon: Mail,
  },
  {
    id: 'sms',
    title: 'SMS',
    description: "Send a text message campaign to your subscribers' mobile phones.",
    cta: 'Create SMS',
    to: '/campaigns/new/sms',
    Icon: MessageSquare,
  },
]

/**
 * Campaign type chooser — Email + SMS only (WhatsApp intentionally omitted).
 */
export function CampaignNewPage() {
  const navigate = useNavigate()
  const { activeStore, status: storeStatus } = useActiveStore()
  const storeId = activeStore?.id

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

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link
          to="/campaigns"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Campaigns
        </Link>
        <Button variant="ghost" size="sm" aria-label="Close" onClick={() => navigate('/campaigns')}>
          <X className="size-4" />
        </Button>
      </div>

      <div className="mb-8 text-center sm:text-left">
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">New campaign</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">Choose campaign type</h1>
        <p className="mt-2 text-sm text-muted">
          Select the type of campaign you want to create for {activeStore?.name || 'your store'}.
        </p>
      </div>

      <div className="grid gap-4">
        {TYPES.map((item) => {
          const Icon = item.Icon
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.to)}
              className="group flex w-full items-start gap-4 rounded-2xl border border-line bg-elevated p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-electric hover:shadow-[0_18px_40px_-28px_rgba(40,120,255,0.45)]"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-success/30 bg-success/10 text-success">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-semibold text-ink">{item.title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-muted">
                  {item.description}
                </span>
                <span className="mt-4 inline-flex items-center gap-1 rounded-lg bg-success/15 px-3 py-1.5 text-sm font-semibold text-success transition group-hover:bg-success/25">
                  {item.cta}
                  <ChevronRight className="size-4" />
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
