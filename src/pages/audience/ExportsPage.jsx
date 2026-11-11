import { Download } from 'lucide-react'
import { PageHeader, EmptyState } from '../../components/ui'

/**
 * Exports are deferred: the Laravel Audience API has no export routes yet.
 * Do not invent mock history or fake downloads.
 */
export function ExportsPage() {
  return (
    <div>
      <PageHeader
        title="Exports"
        description="Audience exports are not available from the backend yet."
      />
      <EmptyState
        icon={Download}
        title="Exports coming later"
        description="There is no export API in Inboxly Phase 4. This page is reserved until server-side export jobs land — no mock files or fabricated contact counts."
      />
    </div>
  )
}
