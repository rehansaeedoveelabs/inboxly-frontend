import { Construction } from 'lucide-react'
import { PageHeader, EmptyState, Badge } from '../components/ui'

export function PlaceholderPage({ title, description, stage = 'Stage 3–4' }) {
  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        actions={<Badge tone="info">{stage}</Badge>}
      />
      <EmptyState
        icon={Construction}
        title={`${title} module coming next`}
        description="Shell, navigation and shared components are ready. Full module screens will be built in the next stages using mock data only."
      />
    </div>
  )
}
