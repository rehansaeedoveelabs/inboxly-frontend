import { Link } from 'react-router-dom'
import { PageHeader, Card } from '../components/ui'

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-lg py-10">
      <PageHeader title="Page not found" description="That URL does not match any screen in Inboxly." />
      <Card className="mt-4 space-y-3">
        <p className="text-sm text-muted">Check the link, or go back to the dashboard.</p>
        <Link
          to="/"
          className="inline-flex h-9 items-center justify-center rounded-md bg-electric px-3.5 text-sm font-medium text-ink hover:opacity-90"
        >
          Back to dashboard
        </Link>
      </Card>
    </div>
  )
}
