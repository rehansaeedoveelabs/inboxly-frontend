import {
  assertAudienceOk,
  audienceFetch,
  readAudienceResource,
  storeAudiencePath,
} from './audienceApi.js'

/**
 * @returns {{
 *   email: { from_name: string, from_email: string, reply_to: string, footer_address: string },
 *   sms: { sender_id: string, compliance_text: string, enabled: boolean },
 *   web_push: { enabled: boolean, prompt_delay_seconds: number, icon_label: string }
 * }}
 */
export function defaultChannelSettings() {
  return {
    email: {
      from_name: '',
      from_email: '',
      reply_to: '',
      footer_address: '',
    },
    sms: {
      sender_id: '',
      compliance_text: 'Msg & data rates may apply. Reply STOP to opt out.',
      enabled: false,
    },
    web_push: {
      enabled: false,
      prompt_delay_seconds: 12,
      icon_label: 'Inboxly',
    },
  }
}

/**
 * @param {object | null | undefined} store
 */
export function channelsFromStore(store) {
  const defaults = defaultChannelSettings()
  const channels = store?.metadata?.channels && typeof store.metadata.channels === 'object'
    ? store.metadata.channels
    : {}
  const email = channels.email && typeof channels.email === 'object' ? channels.email : {}
  const sms = channels.sms && typeof channels.sms === 'object' ? channels.sms : {}
  const webPush = channels.web_push && typeof channels.web_push === 'object' ? channels.web_push : {}

  return {
    email: {
      from_name: email.from_name || store?.name || defaults.email.from_name,
      from_email: email.from_email || defaults.email.from_email,
      reply_to: email.reply_to || defaults.email.reply_to,
      footer_address: email.footer_address || defaults.email.footer_address,
    },
    sms: {
      sender_id: sms.sender_id || defaults.sms.sender_id,
      compliance_text: sms.compliance_text || defaults.sms.compliance_text,
      enabled: sms.enabled === true,
    },
    web_push: {
      enabled: webPush.enabled === true,
      prompt_delay_seconds:
        typeof webPush.prompt_delay_seconds === 'number'
          ? webPush.prompt_delay_seconds
          : defaults.web_push.prompt_delay_seconds,
      icon_label: webPush.icon_label || store?.name || defaults.web_push.icon_label,
    },
  }
}

export async function getStoreChannels(storeId, deps = {}) {
  const path = storeAudiencePath(storeId, 'channels')
  const response = await audienceFetch(path, { method: 'GET' }, deps)
  await assertAudienceOk(response, 'Unable to load channel settings.')
  const store = await readAudienceResource(response, 'store')
  return channelsFromStore(store)
}

export async function updateStoreChannels(storeId, channels, deps = {}) {
  const path = storeAudiencePath(storeId, 'channels')
  const response = await audienceFetch(
    path,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(channels),
    },
    deps,
  )
  await assertAudienceOk(response, 'Unable to save channel settings.')
  const store = await readAudienceResource(response, 'store')
  return channelsFromStore(store)
}
