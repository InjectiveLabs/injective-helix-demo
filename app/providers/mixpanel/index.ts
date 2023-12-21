import { OverridedMixpanel } from 'mixpanel-browser'

export class MixPanelAnalytics {
  mixpanel: OverridedMixpanel

  constructor(mixpanel: OverridedMixpanel) {
    this.mixpanel = mixpanel
  }

  init(mixpanelKey: string) {
    this.mixpanel.init(mixpanelKey, {
      persistence: 'localStorage',
      debug: true,
      batch_requests: false,
      track_pageview: true
    })
  }
}
