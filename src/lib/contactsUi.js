/**
 * Pure helpers for Contacts list/detail (API snake_case → UI).
 */

/**
 * Display name from ContactResource fields. Falls back to email/phone — never invents a person.
 *
 * @param {{ first_name?: string | null, last_name?: string | null, email?: string | null, phone?: string | null } | null | undefined} contact
 */
export function formatContactName(contact) {
  const first = String(contact?.first_name ?? '').trim()
  const last = String(contact?.last_name ?? '').trim()
  const full = `${first} ${last}`.trim()
  if (full) return full
  if (contact?.email) return String(contact.email)
  if (contact?.phone) return String(contact.phone)
  return 'Unnamed contact'
}

/**
 * Consent status for a channel from ContactResource.consents map.
 * Returns null when missing — callers must not treat that as subscribed.
 *
 * @param {{ consents?: Record<string, { status?: string }> | null } | null | undefined} contact
 * @param {'email' | 'sms' | 'push'} channel
 * @returns {string | null}
 */
export function consentStatus(contact, channel) {
  const status = contact?.consents?.[channel]?.status
  return typeof status === 'string' && status !== '' ? status : null
}

/**
 * Map list tabs to ListContactsRequest `consent_email` (backend-supported only).
 *
 * @param {'all' | 'email' | 'email_nonsubscribed'} tab
 * @returns {string | undefined}
 */
export function consentEmailFilterForTab(tab) {
  if (tab === 'email') return 'subscribed'
  if (tab === 'email_nonsubscribed') return 'nonsubscribed'
  return undefined
}

/**
 * Append page rows without duplicating ids (cursor pagination safety).
 *
 * @template {{ id?: string }} T
 * @param {T[]} existing
 * @param {T[]} incoming
 * @returns {T[]}
 */
export function appendUniqueById(existing, incoming) {
  const list = Array.isArray(existing) ? existing : []
  const next = [...list]
  const seen = new Set(list.map((row) => row?.id).filter(Boolean))

  for (const row of Array.isArray(incoming) ? incoming : []) {
    if (!row?.id || seen.has(row.id)) continue
    seen.add(row.id)
    next.push(row)
  }

  return next
}

/**
 * @param {{ consent_review_required?: boolean, consent_review_required_at?: string | null } | null | undefined} contact
 */
export function requiresConsentReview(contact) {
  if (contact?.consent_review_required === true) return true
  return Boolean(contact?.consent_review_required_at)
}

/**
 * @param {{ marketing_eligible?: Record<string, boolean> | null } | null | undefined} contact
 * @param {'email' | 'sms' | 'push'} channel
 */
export function isMarketingEligible(contact, channel) {
  return contact?.marketing_eligible?.[channel] === true
}

/**
 * Short summary of preserved consent statuses for restore confirmations.
 *
 * @param {{ consents?: Record<string, { status?: string }> | null } | null | undefined} contact
 */
export function formatConsentSummary(contact) {
  const channels = ['email', 'sms', 'push']
  return channels
    .map((channel) => {
      const status = consentStatus(contact, channel) || 'unknown'
      return `${channel}: ${status}`
    })
    .join(' · ')
}
