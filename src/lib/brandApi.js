import {
  assertAudienceOk,
  audienceFetch,
  readAudienceResource,
  storeAudiencePath,
} from './audienceApi.js'

/**
 * @returns {{
 *   logo_asset_id: string | null,
 *   logo_name: string | null,
 *   colors: { accent: string, dark: string, light: string },
 *   fonts: { headings: string, body: string },
 *   social_links: Array<{ network: string, url: string, id?: string }>
 * }}
 */
export function defaultBrandState() {
  return {
    logo_asset_id: null,
    logo_name: null,
    colors: { accent: '#2878FF', dark: '#10131C', light: '#FFFFFF' },
    fonts: { headings: 'DM Sans', body: 'DM Sans' },
    social_links: [],
  }
}

/**
 * @param {object | null | undefined} store
 */
export function brandFromStore(store) {
  const brand = store?.metadata?.brand && typeof store.metadata.brand === 'object'
    ? store.metadata.brand
    : {}
  const defaults = defaultBrandState()
  const colors = brand.colors && typeof brand.colors === 'object' ? brand.colors : {}
  const fonts = brand.fonts && typeof brand.fonts === 'object' ? brand.fonts : {}
  const social = Array.isArray(brand.social_links) ? brand.social_links : []

  return {
    logo_asset_id: brand.logo_asset_id || null,
    logo_name: brand.logo_name || null,
    colors: {
      accent: colors.accent || defaults.colors.accent,
      dark: colors.dark || defaults.colors.dark,
      light: colors.light || defaults.colors.light,
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
    colors: brand.colors,
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
