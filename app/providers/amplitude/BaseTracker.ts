import { track, Identify, setUserId } from '@amplitude/analytics-browser'
import { BaseEvent } from '@amplitude/analytics-types'
import { AMPLITUDE_WALLET, AMPLITUDE_VIP_TIER_LEVEL } from '@/app/utils/vendor'
import { AMPLITUDE_KEY } from '@/app/utils/constants'
import { localStorage } from '@/app/Services'
import { AmplitudeTrackerUser } from '@/types'

type TrackAmplitudeFn = <T extends string | BaseEvent>(
  args: T,
  eventProperties?: Record<string, any> | undefined
) => void

export const trackAmplitude: TrackAmplitudeFn = <T extends string | BaseEvent>(
  args: T,
  eventProperties?: Record<string, any> | undefined
): void => {
  if (AMPLITUDE_KEY) {
    track(args, eventProperties)
  }
}

export default class BaseAmplitudeTracker {
  setUser(user: AmplitudeTrackerUser) {
    setUserId(user.address)
    this.setUserLocalStorage(user)
  }

  protected getUser(): AmplitudeTrackerUser | undefined {
    return localStorage.get('amplitudeUser') as unknown as
      | AmplitudeTrackerUser
      | undefined
  }

  protected setUserLocalStorage(user: AmplitudeTrackerUser) {
    localStorage.set('amplitudeUser', user)
  }

  protected getIdentify(): Identify {
    const user = this.getUser()
    const identify = new Identify()

    if (!user) {
      return identify
    }

    identify.set(AMPLITUDE_WALLET, user.wallet)
    identify.set(AMPLITUDE_VIP_TIER_LEVEL, user.tierLevel)

    return identify
  }

  protected trackAmplitude: TrackAmplitudeFn = <T extends string | BaseEvent>(
    args: T,
    eventProperties?: Record<string, any> | undefined
  ): void => {
    if (AMPLITUDE_KEY) {
      track(args, eventProperties)
    }
  }
}
