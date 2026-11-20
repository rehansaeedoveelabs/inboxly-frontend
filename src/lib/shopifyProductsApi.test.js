import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  listStoreShopifyProducts,
  productBlockPropsFromShopifyProduct,
} from './shopifyProductsApi.js'

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('shopifyProductsApi', () => {
  it('lists store products', async () => {
    const fetchFn = async (url, options = {}) => {
      if (String(url).includes('/sanctum/csrf-cookie')) {
        return new Response(null, { status: 204 })
      }
      assert.equal(options.method || 'GET', 'GET')
      assert.match(String(url), /\/api\/v1\/stores\/01STORE\/shopify\/products\?limit=25$/)
      return jsonResponse(200, {
        data: [
          {
            id: '01PROD',
            title: 'Honey Jar',
            featured_image_url: 'https://cdn.example/honey.jpg',
            product_url: 'https://shop.example.com/products/honey-jar',
          },
        ],
        meta: { next_cursor: null },
        links: {},
      })
    }

    const page = await listStoreShopifyProducts('01STORE', {}, { fetchFn, cookieString: '' })
    assert.equal(page.data[0].title, 'Honey Jar')
  })

  it('maps product picker selection to block props', () => {
    const props = productBlockPropsFromShopifyProduct({
      id: '01PROD',
      title: 'Honey Jar',
      featured_image_url: 'https://cdn.example/honey.jpg',
      product_url: 'https://shop.example.com/products/honey-jar',
      price_min: '12.00',
      price_max: '18.00',
      currency_code: 'USD',
    })
    assert.deepEqual(props, {
      shopify_product_id: '01PROD',
      title: 'Honey Jar',
      image_url: 'https://cdn.example/honey.jpg',
      product_url: 'https://shop.example.com/products/honey-jar',
      price: '12.00 – 18.00',
      currency_code: 'USD',
      button_label: 'Shop now',
      show_title: true,
      show_price: true,
      show_button: true,
    })
  })
})
