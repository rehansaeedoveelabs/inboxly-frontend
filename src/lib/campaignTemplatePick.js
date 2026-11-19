/**
 * Round-trip context when a campaign wizard sends the merchant to Email Templates
 * to pick/edit a design, then return to the wizard Template step.
 *
 * Prefer sessionStorage; fall back to an in-memory map for non-browser test envs.
 */

const STORAGE_KEY = 'inboxly.campaignTemplatePick'

/** @type {string | null} */
let memoryFallback = null

function storageGet() {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage.getItem(STORAGE_KEY)
    }
  } catch {
    // ignore quota / private mode
  }
  return memoryFallback
}

function storageSet(value) {
  memoryFallback = value
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(STORAGE_KEY, value)
    }
  } catch {
    // keep memoryFallback
  }
}

function storageClear() {
  memoryFallback = null
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // ignore
  }
}

/**
 * @typedef {{
 *   campaignId: string,
 *   storeId: string,
 *   returnTo: string,
 *   campaignName?: string,
 *   channel?: 'email' | 'sms',
 * }} CampaignTemplatePickContext
 */

/**
 * @param {CampaignTemplatePickContext} context
 */
export function setCampaignTemplatePick(context) {
  if (!context?.campaignId || !context?.storeId || !context?.returnTo) return
  storageSet(
    JSON.stringify({
      ...context,
      channel: context.channel === 'sms' ? 'sms' : 'email',
    }),
  )
}

/** @returns {CampaignTemplatePickContext | null} */
export function getCampaignTemplatePick() {
  try {
    const raw = storageGet()
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (
      typeof parsed?.campaignId !== 'string' ||
      typeof parsed?.storeId !== 'string' ||
      typeof parsed?.returnTo !== 'string'
    ) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function clearCampaignTemplatePick() {
  storageClear()
}

/**
 * @param {string} campaignId
 * @returns {string}
 */
export function campaignTemplateReturnPath(campaignId) {
  return `/campaigns/${campaignId}/edit?step=template`
}

/**
 * Apply a store email template to the campaign in pick-context and navigate back.
 * If there is no pick context, returns false so the caller can fall back to editing.
 *
 * @param {{
 *   templateId: string,
 *   navigate: (to: string) => void,
 *   applyFn: (campaignId: string, payload: { email_template_id: string }) => Promise<unknown>,
 * }} args
 * @returns {Promise<boolean>} true when applied and navigated back
 */
export async function finishCampaignTemplatePick({ templateId, navigate, applyFn }) {
  const ctx = getCampaignTemplatePick()
  if (!ctx?.campaignId || typeof applyFn !== 'function') return false
  if (ctx.channel === 'sms') return false

  await applyFn(ctx.campaignId, { email_template_id: templateId })
  const returnTo = ctx.returnTo || campaignTemplateReturnPath(ctx.campaignId)
  clearCampaignTemplatePick()
  navigate(returnTo)
  return true
}

/**
 * Apply an SMS body to the campaign in pick-context and navigate back.
 *
 * @param {{
 *   body: string,
 *   navigate: (to: string) => void,
 *   updateFn: (campaignId: string, payload: { body: string }) => Promise<unknown>,
 * }} args
 * @returns {Promise<boolean>}
 */
export async function finishCampaignSmsTemplatePick({ body, navigate, updateFn }) {
  const ctx = getCampaignTemplatePick()
  if (!ctx?.campaignId || typeof updateFn !== 'function') return false
  if (ctx.channel && ctx.channel !== 'sms') return false

  await updateFn(ctx.campaignId, { body })
  const returnTo = ctx.returnTo || campaignTemplateReturnPath(ctx.campaignId)
  clearCampaignTemplatePick()
  navigate(returnTo)
  return true
}
