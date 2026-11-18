import { ApiError } from './api.js'
import {
  assertAudienceOk,
  audienceFetch,
  readAudienceJson,
  storeAudiencePath,
} from './audienceApi.js'

/**
 * GET /api/v1/stores/{store}/insights/overview
 *
 * @param {string} storeId
 */
export async function getStoreInsightsOverview(storeId) {
  const path = storeAudiencePath(storeId, 'insights/overview')
  const response = await audienceFetch(path)
  assertAudienceOk(response, 'Unable to load store insights.')
  const payload = await readAudienceJson(response)

  if (typeof payload?.contacts_total !== 'number' || !payload.campaigns || !payload.automations) {
    throw new ApiError('Invalid insights overview response.', {
      status: response.status,
      body: payload,
    })
  }

  return payload
}
