import { identify as amplitudeIdentify } from '@amplitude/analytics-browser'
import BaseTracker from '@/app/providers/amplitude/BaseTracker'
import { AmplitudeEvent } from '@/types'

class GenericTracker extends BaseTracker {
  trackEvent(event: AmplitudeEvent, eventProperties?: Record<string, any>) {
    const { user } = this
    const identify = this.getIdentify()

    if (user || identify) {
      amplitudeIdentify(identify)
    }

    this.trackAmplitude(event, eventProperties)
  }
}

export const amplitudeGenericTracker = new GenericTracker()
