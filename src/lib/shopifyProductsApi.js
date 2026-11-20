import { ApiError } from './api.js'
import {
  assertAudienceOk,
  audienceFetch,
  buildAudienceQuery,
  readAudienceCursorPage,
  storeAudiencePath,
} from './audienceApi.js'

/**
 * Synced Shopify products for email product blocks.
 * GET /api/v1/stores/{store}/shopify/products
 *
 * @param {string} storeId
 * @param {{ q?: string | null, status?: string | null, cursor?: string | null, limit?: number }} [params]
 * @param {{ fetchFn?: typeof fetch, cookieString?: string }} [deps]
 */
export async function listStoreShopifyProducts(storeId, params = {}, deps = {}) {
  const query = buildAudienceQuery({
    q: params.q,
    status: params.status,
    cursor: params.cursor,
    limit: params.limit ?? 25,
  })
  const path = `${storeAudiencePath(storeId, 'shopify/products')}${query}`
  const response = await audienceFetch(path, { method: 'GET' }, deps)
  await assertAudienceOk(response, 'Unable to load Shopify products.')
  return readAudienceCursorPage(response)
}

/**
 * @param {Record<string, unknown> | null | undefined} product
 * @returns {{
 *   shopify_product_id: string,
 *   title: string,
 *   image_url: string | null,
 *   product_url: string | null,
 *   price: string | null,
 *   currency_code: string | null,
 *   button_label: string,
 *   show_title: boolean,
 *   show_price: boolean,
 *   show_button: boolean,
 * }}
 */
export function productBlockPropsFromShopifyProduct(product) {
  if (!product?.id) {
    throw new ApiError('A Shopify product is required.', { status: 422 })
  }
  const min = typeof product.price_min === 'string' ? product.price_min : null
  const max = typeof product.price_max === 'string' ? product.price_max : null
  let price = min
  if (min && max && max !== min) {
    price = `${min} – ${max}`
  }
  return {
    shopify_product_id: String(product.id),
    title: typeof product.title === 'string' ? product.title : '',
    image_url: typeof product.featured_image_url === 'string' ? product.featured_image_url : null,
    product_url: typeof product.product_url === 'string' ? product.product_url : null,
    price,
    currency_code: typeof product.currency_code === 'string' ? product.currency_code : null,
    button_label: 'Shop now',
    show_title: true,
    show_price: true,
    show_button: true,
  }
}
