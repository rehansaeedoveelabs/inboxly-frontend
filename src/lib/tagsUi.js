/**
 * Pure helpers for Tags page filtering and form error display.
 * Kept separate so component behavior can be tested without a React harness.
 */

/**
 * Client-side filter for store tags (search + source/custom type).
 * Source tags are identified by a `source:` name prefix (Shopify-style).
 *
 * @param {Array<{ id?: string, name?: string }>} tags
 * @param {{ query?: string, typeFilter?: 'any' | 'source' | 'custom' }} [options]
 * @returns {typeof tags}
 */
export function filterTags(tags, { query = '', typeFilter = 'any' } = {}) {
  const q = String(query || '')
    .trim()
    .toLowerCase()
  const list = Array.isArray(tags) ? tags : []

  return list.filter((tag) => {
    const name = String(tag?.name ?? '')
    const matchesQuery = !q || name.toLowerCase().includes(q)
    const isSource = name.startsWith('source:')
    const matchesType =
      typeFilter === 'any' ||
      (typeFilter === 'source' ? isSource : typeFilter === 'custom' ? !isSource : true)
    return matchesQuery && matchesType
  })
}

/**
 * First Laravel validation message for a field.
 *
 * @param {Record<string, string[]> | null | undefined} errors
 * @param {string} field
 * @returns {string | undefined}
 */
export function firstFieldError(errors, field) {
  const list = errors?.[field]
  return Array.isArray(list) && typeof list[0] === 'string' && list[0] ? list[0] : undefined
}
