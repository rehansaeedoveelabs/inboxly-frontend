/**
 * Pure helpers for campaign Facebook publishing UI.
 */

/**
 * @param {Array<{ id: string, can_publish?: boolean, is_default?: boolean }>} pages
 * @param {string[]} [currentSelected]
 * @returns {string[]}
 */
export function defaultSelectedPageIds(pages, currentSelected = []) {
  const publishable = (pages || []).filter((page) => page.can_publish)
  const publishableIds = new Set(publishable.map((page) => page.id))

  const retained = (currentSelected || []).filter((id) => publishableIds.has(id))
  if (retained.length > 0) return retained

  const defaults = publishable.filter((page) => page.is_default).map((page) => page.id)
  if (defaults.length > 0) return defaults

  return publishable.slice(0, 1).map((page) => page.id)
}

/**
 * @param {string} status
 * @returns {'success' | 'danger' | 'warning' | 'info' | 'neutral'}
 */
export function publicationStatusTone(status) {
  if (status === 'published') return 'success'
  if (status === 'failed') return 'danger'
  if (status === 'outcome_unknown') return 'warning'
  if (status === 'queued' || status === 'publishing') return 'info'
  return 'neutral'
}

/**
 * Whether the UI should offer retry for this publication row.
 * @param {{ status?: string }} row
 */
export function canRetryPublication(row) {
  return row?.status === 'failed'
}

/**
 * Whether the UI should offer reconcile (ambiguous Meta outcome).
 * @param {{ status?: string }} row
 */
export function canReconcilePublication(row) {
  return row?.status === 'outcome_unknown'
}
