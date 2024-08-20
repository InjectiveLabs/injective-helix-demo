import mixpanel, { OverridedMixpanel } from 'mixpanel-browser'
import { MIXPANEL_KEY } from '@/app/utils/constants/setup'
import { MixPanelCounter } from '@/types'

export default class MixPanelAnalytics {
  mixpanelClient: OverridedMixpanel | undefined

  constructor() {
    this.mixpanelClient = undefined
  }

  public track(event: string, props: any) {
    const client = this.getMixpanelClient()

    if (!client) {
      return
    }

    return client.track(event, props)
  }

  public increment(event: MixPanelCounter) {
    const client = this.getMixpanelClient()

    if (!client) {
      return
    }

    return client.people.increment(event)
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
}

export const mixpanelAnalytics = new MixPanelAnalytics()
