import { init, track } from '@amplitude/analytics-browser'
import { BaseEvent } from '@amplitude/analytics-types'
import { Context } from '@nuxt/types'
import { AMPLITUDE_KEY, HAS_AMPLITUDE_KEY } from '~/app/utils/constants'

export type TrackAmplitudeFn = <T extends string | BaseEvent>(
  args: T,
  eventProperties?: Record<string, any> | undefined
) => void

export const trackAmplitude: TrackAmplitudeFn = <T extends string | BaseEvent>(
  args: T,
  eventProperties?: Record<string, any> | undefined
): void => {
  if (HAS_AMPLITUDE_KEY) {
    track(args, eventProperties)
  }
}

export default function (_ctx: Context, inject: any) {
  if (HAS_AMPLITUDE_KEY) {
    init(AMPLITUDE_KEY)
  }

  inject('amplitude', {
    track: trackAmplitude
  })
}
