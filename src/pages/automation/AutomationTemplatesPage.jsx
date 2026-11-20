import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageHeader, Button, Card, Badge } from '../../components/ui'

/**
 * Supported automation templates (welcome + abandoned cart).
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
        description="Start from a supported trigger. Welcome and abandoned cart are available when Shopify checkout webhooks are connected."
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
            message through your workspace email sender.
          </p>
          <Button
            className="mt-4"
            onClick={() => navigate('/automation/new?template=welcome')}
          >
            Create welcome automation
          </Button>
        </Card>

        <Card className="flex flex-col">
          <div className="mb-2 flex items-center justify-between gap-2">
            <Badge tone="accent">Available</Badge>
            <Badge tone="info">email</Badge>
          </div>
          <h3 className="text-base font-semibold text-ink">Abandoned cart</h3>
          <p className="mt-1 flex-1 text-sm text-muted">
            When a shopper leaves a Shopify checkout with an email, wait, then send a recovery
            email. Requires Shopify connect with checkout webhooks (`read_checkouts`).
          </p>
          <Button
            className="mt-4"
            onClick={() => navigate('/automation/new?template=abandoned_cart')}
          >
            Create cart recovery
          </Button>
        </Card>
      </div>
    </div>
  )
}
