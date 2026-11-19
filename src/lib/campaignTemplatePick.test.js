import assert from 'node:assert/strict'
import { describe, it, beforeEach } from 'node:test'
import {
  campaignTemplateReturnPath,
  clearCampaignTemplatePick,
  getCampaignTemplatePick,
  setCampaignTemplatePick,
} from './campaignTemplatePick.js'

describe('campaignTemplatePick', () => {
  beforeEach(() => {
    clearCampaignTemplatePick()
  })

  it('stores and reads pick context', () => {
    setCampaignTemplatePick({
      campaignId: 'camp_1',
      storeId: 'store_1',
      returnTo: '/campaigns/camp_1/edit?step=template',
      campaignName: 'Spring sale',
    })
    const ctx = getCampaignTemplatePick()
    assert.equal(ctx.campaignId, 'camp_1')
    assert.equal(ctx.storeId, 'store_1')
    assert.equal(ctx.campaignName, 'Spring sale')
  })

  it('clears pick context', () => {
    setCampaignTemplatePick({
      campaignId: 'camp_1',
      storeId: 'store_1',
      returnTo: '/campaigns/camp_1/edit?step=template',
    })
    clearCampaignTemplatePick()
    assert.equal(getCampaignTemplatePick(), null)
  })

  it('builds wizard return path on the template step', () => {
    assert.equal(
      campaignTemplateReturnPath('01abc'),
      '/campaigns/01abc/edit?step=template',
    )
  })
})
