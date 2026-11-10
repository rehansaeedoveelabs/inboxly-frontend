import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import {
  PageHeader,
  Card,
  Badge,
  Button,
  EmptyState,
} from '../../components/ui'
import { formatContactName, getContactById } from '../../mock'
import { formatCurrency, formatDateTime, statusLabel, statusTone } from '../../lib/format'

export function ContactDetailPage() {
  const { contactId } = useParams()
  const navigate = useNavigate()
  const contact = getContactById(contactId)

  if (!contact) {
    return (
      <EmptyState
        title="Contact not found"
        description="This contact ID is not in the mock dataset."
        actionLabel="Back to contacts"
        onAction={() => navigate('/audience/contacts')}
      />
    )
  }

  return (
    <div>
      <div className="mb-3">
        <Link to="/audience/contacts" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
          <ArrowLeft className="size-4" />
          Contacts
        </Link>
      </div>

      <PageHeader
        title={formatContactName(contact)}
        description={contact.email}
        actions={
          <Button variant="secondary" onClick={() => alert('Prototype only — no changes saved.')}>
            Edit contact
          </Button>
        }
      />

      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <h3 className="mb-3 text-sm font-semibold text-ink">Profile</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Phone</dt>
              <dd>{contact.phone || '—'}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Location</dt>
              <dd>{contact.location}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Orders</dt>
              <dd>{contact.orders}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Total spent</dt>
              <dd>{formatCurrency(contact.totalSpent)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Added</dt>
              <dd>{formatDateTime(contact.createdAt)}</dd>
            </div>
          </dl>
        </Card>

        <Card className="lg:col-span-1">
          <h3 className="mb-3 text-sm font-semibold text-ink">Consent & channels</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Email</span>
              <Badge tone={statusTone(contact.emailStatus)}>{statusLabel(contact.emailStatus)}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">SMS</span>
              <Badge tone={statusTone(contact.smsStatus)}>{statusLabel(contact.smsStatus)}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Push</span>
              <Badge tone={statusTone(contact.pushStatus)}>{statusLabel(contact.pushStatus)}</Badge>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {contact.tags.map((tag) => (
              <Badge key={tag} tone="neutral">
                {tag}
              </Badge>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-1">
          <h3 className="mb-3 text-sm font-semibold text-ink">Customer activity</h3>
          <ul className="space-y-2">
            {contact.activity.map((item) => (
              <li key={item.id} className="rounded-md border border-line bg-midnight px-3 py-2">
                <p className="text-sm text-ink">{item.label}</p>
                <p className="text-xs text-muted">{formatDateTime(item.at)}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
