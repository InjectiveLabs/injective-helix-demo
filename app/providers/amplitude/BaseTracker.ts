import { track, Identify, setUserId } from '@amplitude/analytics-browser'
import { BaseEvent } from '@amplitude/analytics-types'
import { Wallet } from '@injectivelabs/wallet-ts'
import { AMPLITUDE_WALLET, AMPLITUDE_VIP_TIER_LEVEL } from '@/app/utils/vendor'
import { AMPLITUDE_KEY } from '@/app/utils/constants'
import { localStorage } from '@/app/Services'

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

interface AmplitudeTrackerUser {
  tierLevel: number
  address: string
  wallet: Wallet
}

export default class BaseAmplitudeTracker {
  protected user?: AmplitudeTrackerUser

  constructor(user?: AmplitudeTrackerUser) {
    this.user = user || this.getUserLocalStorage()
  }

  setUser(user: AmplitudeTrackerUser) {
    this.user = user
    setUserId(user.address)
    this.setUserLocalStorage(user)
  }

  protected getUser(): AmplitudeTrackerUser | undefined {
    return this.user
  }

  protected setUserLocalStorage(user: AmplitudeTrackerUser) {
    localStorage.set('amplitudeUser', user)
  }

  protected getUserLocalStorage(): AmplitudeTrackerUser | undefined {
    return localStorage.get('amplitudeUser') as unknown as
      | AmplitudeTrackerUser
      | undefined
  }

  protected getIdentify(): Identify {
    const { user } = this
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

export const amplitudeTracker = new BaseAmplitudeTracker()
