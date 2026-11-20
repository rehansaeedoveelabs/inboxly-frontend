import {
  assertAudienceOk,
  audienceFetch,
  readAudienceJson,
  readAudienceResource,
  storeAudiencePath,
} from './audienceApi.js'
import { ApiError } from './api.js'

export const BRAND_FONT_OPTIONS = [
  'Arial',
  'Helvetica',
  'Georgia',
  'Times New Roman',
  'Verdana',
  'Trebuchet MS',
  'DM Sans',
  'Inter',
]

/**
 * @returns {{
 *   logo_asset_id: string | null,
 *   logo_name: string | null,
 *   imported_logo_url: string | null,
 *   colors: { accent: string, dark: string, light: string, additional: string[] },
 *   fonts: { headings: string, body: string },
 *   social_links: Array<{ network: string, url: string, id?: string }>
 * }}
 */
export function defaultBrandState() {
  return {
    logo_asset_id: null,
    logo_name: null,
    imported_logo_url: null,
    colors: {
      accent: '#00A3FF',
      dark: '#000000',
      light: '#FFFFFF',
      additional: [],
    },
    fonts: { headings: 'Arial', body: 'Arial' },
    social_links: [],
  }
}

/**
 * @param {object | null | undefined} store
 */
export function brandFromStore(store) {
  const brand =
    store?.metadata?.brand && typeof store.metadata.brand === 'object' ? store.metadata.brand : {}
  const defaults = defaultBrandState()
  const colors = brand.colors && typeof brand.colors === 'object' ? brand.colors : {}
  const fonts = brand.fonts && typeof brand.fonts === 'object' ? brand.fonts : {}
  const social = Array.isArray(brand.social_links) ? brand.social_links : []
  const additional = Array.isArray(colors.additional)
    ? colors.additional.filter((value) => typeof value === 'string' && value.trim() !== '')
    : []

  return {
    logo_asset_id: brand.logo_asset_id || null,
    logo_name: brand.logo_name || null,
    imported_logo_url: brand.imported_logo_url || null,
    colors: {
      accent: colors.accent || defaults.colors.accent,
      dark: colors.dark || defaults.colors.dark,
      light: colors.light || defaults.colors.light,
      additional: additional.slice(0, 6),
    },
    fonts: {
      headings: fonts.headings || defaults.fonts.headings,
      body: fonts.body || defaults.fonts.body,
    },
    social_links: social.map((link, index) => ({
      id: link.id || `soc_${index}`,
      network: link.network || 'Instagram',
      url: link.url || '',
    })),
  }
}

/**
 * GET /api/v1/stores/{store}/brand → StoreResource
 */
export async function getStoreBrand(storeId, deps = {}) {
  const path = storeAudiencePath(storeId, 'brand')
  const response = await audienceFetch(path, { method: 'GET' }, deps)
  await assertAudienceOk(response, 'Unable to load brand assets.')
  const store = await readAudienceResource(response, 'store')
  return brandFromStore(store)
}

/**
 * PUT /api/v1/stores/{store}/brand
 */
export async function updateStoreBrand(storeId, brand, deps = {}) {
  const path = storeAudiencePath(storeId, 'brand')
  const body = {
    logo_asset_id: brand.logo_asset_id || null,
    logo_name: brand.logo_name || null,
    imported_logo_url: brand.imported_logo_url || null,
    colors: {
      accent: brand.colors?.accent,
      dark: brand.colors?.dark,
      light: brand.colors?.light,
      additional: Array.isArray(brand.colors?.additional) ? brand.colors.additional : [],
    },
    fonts: brand.fonts,
    social_links: (brand.social_links || []).map(({ network, url }) => ({ network, url })),
  }
  const response = await audienceFetch(
    path,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    deps,
  )
  await assertAudienceOk(response, 'Unable to save brand assets.')
  const store = await readAudienceResource(response, 'store')
  return brandFromStore(store)
}

/**
 * POST /api/v1/stores/{store}/brand/import
 * @returns {Promise<{ brand: ReturnType<typeof brandFromStore>, source: string, notice: string }>}
 */
export async function importStoreBrand(storeId, deps = {}) {
  const path = storeAudiencePath(storeId, 'brand/import')
  const response = await audienceFetch(path, { method: 'POST' }, deps)
  await assertAudienceOk(response, 'Unable to import brand assets.')
  const payload = await readAudienceJson(response)
  if (!payload?.data || typeof payload.data !== 'object') {
    throw new ApiError('Invalid brand import response.', { status: response.status, body: payload })
  }
  return {
    brand: brandFromStore(payload.data),
    source: typeof payload.source === 'string' ? payload.source : 'defaults',
    notice: typeof payload.notice === 'string' ? payload.notice : 'Brand assets imported.',
  }
}
