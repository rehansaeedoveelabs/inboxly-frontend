/** Segment rule builder helpers matching backend SegmentRules schema. */

export const SEGMENT_FIELDS = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'first_name', label: 'First name' },
  { value: 'last_name', label: 'Last name' },
  { value: 'source', label: 'Source' },
  { value: 'tag', label: 'Tag slug' },
  { value: 'consent.email', label: 'Email consent' },
  { value: 'consent.sms', label: 'SMS consent' },
  { value: 'consent.push', label: 'Push consent' },
  { value: 'orders.has', label: 'Has purchased (Shopify)' },
  { value: 'orders.count', label: 'Order count (Shopify)' },
]

export const SEGMENT_OPS = [
  { value: 'eq', label: 'Equals' },
  { value: 'neq', label: 'Not equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'starts_with', label: 'Starts with' },
  { value: 'in', label: 'In list' },
  { value: 'not_in', label: 'Not in list' },
  { value: 'is_null', label: 'Is empty' },
  { value: 'is_not_null', label: 'Is not empty' },
  { value: 'gte', label: 'At least' },
  { value: 'lte', label: 'At most' },
]

const CONSENT_OPS = new Set(['eq', 'neq', 'in', 'not_in', 'is_null', 'is_not_null'])
const ORDERS_HAS_OPS = new Set(['is_not_null', 'is_null'])
const ORDERS_COUNT_OPS = new Set(['eq', 'neq', 'gte', 'lte'])
const LIST_OPS = new Set(['in', 'not_in'])
const NULL_OPS = new Set(['is_null', 'is_not_null'])

export function defaultSegmentRules() {
  return {
    operator: 'and',
    conditions: [{ field: 'consent.email', op: 'eq', value: 'subscribed' }],
  }
}

export function opsForField(field) {
  const key = String(field || '')
  if (key.startsWith('consent.')) {
    return SEGMENT_OPS.filter((op) => CONSENT_OPS.has(op.value))
  }
  if (key === 'orders.has') {
    return SEGMENT_OPS.filter((op) => ORDERS_HAS_OPS.has(op.value)).map((op) =>
      op.value === 'is_not_null'
        ? { ...op, label: 'Has at least one order' }
        : { ...op, label: 'Has never purchased' },
    )
  }
  if (key === 'orders.count') {
    return SEGMENT_OPS.filter((op) => ORDERS_COUNT_OPS.has(op.value))
  }
  return SEGMENT_OPS.filter((op) => !['gte', 'lte'].includes(op.value))
}

/**
 * Convert draft UI condition (value always string) into API condition.
 * @param {{ field: string, op: string, value: string }} condition
 */
export function toApiCondition(condition) {
  const field = condition.field
  const op = condition.op
  if (NULL_OPS.has(op)) {
    return { field, op }
  }
  if (LIST_OPS.has(op)) {
    const list = String(condition.value || '')
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
    return { field, op, value: list }
  }
  return { field, op, value: String(condition.value ?? '').trim() }
}

/**
 * @param {{ operator: string, conditions: Array<{ field: string, op: string, value?: string }> }} draft
 */
export function toApiRules(draft) {
  return {
    operator: draft.operator === 'or' ? 'or' : 'and',
    conditions: (draft.conditions || []).map(toApiCondition),
  }
}

/**
 * Flatten API rules into editable draft (list values joined by comma).
 * @param {{ operator?: string, conditions?: object[] } | null | undefined} rules
 */
export function toDraftRules(rules) {
  const conditions = Array.isArray(rules?.conditions) ? rules.conditions : []
  return {
    operator: rules?.operator === 'or' ? 'or' : 'and',
    conditions: conditions.map((condition) => ({
      field: condition.field || 'email',
      op: condition.op || 'eq',
      value: Array.isArray(condition.value)
        ? condition.value.join(', ')
        : condition.value == null
          ? ''
          : String(condition.value),
    })),
  }
}

/**
 * Client-side filter for segment list search.
 * @param {Array<{ name?: string, description?: string | null }>} segments
 * @param {string} query
 */
export function filterSegments(segments, query) {
  const q = String(query || '')
    .trim()
    .toLowerCase()
  const list = Array.isArray(segments) ? segments : []
  if (!q) return list
  return list.filter((segment) => {
    const haystack = `${segment?.name || ''} ${segment?.description || ''}`.toLowerCase()
    return haystack.includes(q)
  })
}
