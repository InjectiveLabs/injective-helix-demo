import { identify as amplitudeIdentify } from '@amplitude/analytics-browser'
import BaseTracker from '~/app/providers/amplitude/BaseTracker'
import { AMPLITUDE_CONVERT_ATTEMPT_COUNT } from '@/app/utils/vendor'
import { AmplitudeEvent } from '@/types'

class ConvertTracker extends BaseTracker {
  convertClickedTrackEvent({
    isBuy,
    baseDenom,
    quoteDenom,
    baseAmount,
    quoteAmount,
    slippageTolerance,
    rate,
    fee,
    minimumAmountReceived
  }: {
    isBuy: boolean
    baseDenom: string
    quoteDenom: string
    baseAmount: string
    quoteAmount: string
    slippageTolerance: string
    rate: string
    fee: string
    minimumAmountReceived: string
  }) {
    const { user } = this
    const identify = this.getIdentify()

    if (!user || !identify) {
      return
    }

    identify.add(AMPLITUDE_CONVERT_ATTEMPT_COUNT, 1)
    amplitudeIdentify(identify)

    this.trackAmplitude(AmplitudeEvent.ConvertClicked, {
      isBuy,
      baseDenom,
      quoteDenom,
      baseAmount,
      quoteAmount,
      slippageTolerance,
      rate,
      fee,
      minimumAmountReceived
    })
  }

  convertAttemptTrackEvent({
    isBuy,
    baseDenom,
    quoteDenom,
    baseAmount,
    quoteAmount,
    slippageTolerance,
    rate,
    fee,
    minimumAmountReceived,
    error
  }: {
    isBuy: boolean
    baseDenom: string
    quoteDenom: string
    baseAmount: string
    quoteAmount: string
    slippageTolerance: string
    rate: string
    fee: string
    minimumAmountReceived: string
    error?: string
  }) {
    this.trackAmplitude(AmplitudeEvent.ConvertAttempt, {
      isBuy,
      baseDenom,
      quoteDenom,
      baseAmount,
      quoteAmount,
      slippageTolerance,
      rate,
      fee,
      minimumAmountReceived,
      error
    })
  }
}

export const amplitudeConvertTracker = new ConvertTracker()
