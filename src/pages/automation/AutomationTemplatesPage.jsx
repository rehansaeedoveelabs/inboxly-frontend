import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageHeader, Button, Card, Badge } from '../../components/ui'

/**
 * v1 only ships the welcome (email subscribed) automation.
 * Other template ideas remain deferred until their triggers exist.
 */
export function AutomationTemplatesPage() {
  const navigate = useNavigate()

  return (
    <div>
      <div className="mb-3">
        <Link to="/automation" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
          <ArrowLeft className="size-4" />
          Automation
        </Link>
      </div>

      <PageHeader
        title="Automation templates"
        description="Start from a supported trigger. Only welcome (email subscribed) is available in v1."
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <Card className="flex flex-col">
          <div className="mb-2 flex items-center justify-between gap-2">
            <Badge tone="accent">Available</Badge>
            <Badge tone="info">email</Badge>
          </div>
          <h3 className="text-base font-semibold text-ink">Welcome email</h3>
          <p className="mt-1 flex-1 text-sm text-muted">
            When a contact subscribes to email marketing, optionally wait, then send a welcome
            message through the existing email sender.
          </p>
          <Button className="mt-4" onClick={() => navigate('/automation/new')}>
            Create welcome automation
          </Button>
        </Card>

        <Card className="flex flex-col opacity-70">
          <div className="mb-2 flex items-center justify-between gap-2">
            <Badge>Coming later</Badge>
          </div>
          <h3 className="text-base font-semibold text-ink">Abandoned cart</h3>
          <p className="mt-1 flex-1 text-sm text-muted">
            Requires commerce events that are not implemented yet.
          </p>
          <Button className="mt-4" variant="secondary" disabled>
            Unavailable
          </Button>
        </Card>
      </div>
    </div>
  )
}
