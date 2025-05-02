import mixpanel from 'mixpanel-browser'
import { MIXPANEL_KEY } from '@shared/utils/constant'
import type { MixPanelCounter } from '@/types'
import type { OverridedMixpanel } from 'mixpanel-browser'

export default class MixPanelAnalytics {
  mixpanelClient: undefined | OverridedMixpanel

  constructor() {
    this.mixpanelClient = undefined
  }

  public init() {
    if (this.mixpanelClient || !MIXPANEL_KEY) {
      return
    }

    this.mixpanelClient = mixpanel
    this.mixpanelClient.init(MIXPANEL_KEY, {
      ignore_dnt: true,
      batch_requests: false,
      track_pageview: 'full-url',
      persistence: 'localStorage'
    })
  }

  public getMixpanelClient() {
    if (!MIXPANEL_KEY) {
      return
    }

    if (!this.mixpanelClient) {
      this.init()
    }

    return this.mixpanelClient as OverridedMixpanel
  }

  public increment(event: MixPanelCounter) {
    const client = this.getMixpanelClient()

    if (!client) {
      return
    }

    return client.people.increment(event)
  }

  public track(event: string, props: any) {
    const client = this.getMixpanelClient()

    if (!client) {
      return
    }

    return client.track(event, props)
  }
}

export const mixpanelAnalytics = new MixPanelAnalytics()
