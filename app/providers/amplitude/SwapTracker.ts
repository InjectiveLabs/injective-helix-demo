import { BigNumberInBase } from '@injectivelabs/utils'
import { identify as amplitudeIdentify } from '@amplitude/analytics-browser'
import BaseTracker from '@/app/providers/amplitude/BaseTracker'
import { AmplitudeEvent } from '@/types'
import { AMPLITUDE_SUCCESSFUL_SWAP_COUNT } from '@/app/utils/vendor'

class SwapTracker extends BaseTracker {
  swap({
    error,
    fee,
    rate,
    inputAmount,
    outputAmount,
    outputToken,
    inputToken,
    minimumOutput,
    slippageTolerance
  }: {
    error: Error
    fee: BigNumberInBase
    rate: string | undefined
    inputAmount: string | undefined
    outputAmount: string | undefined
    outputToken: string | undefined
    inputToken: string | undefined
    minimumOutput: string
    slippageTolerance: string
  }) {
    if (!error) {
      const user = this.getUser()
      const identify = this.getIdentify()

      if (!user || !identify) {
        return
      }

      identify.add(AMPLITUDE_SUCCESSFUL_SWAP_COUNT, 1)

      if (!error) {
        identify.add(AMPLITUDE_SUCCESSFUL_SWAP_COUNT, 1)
      }

      amplitudeIdentify(identify)
    }

    this.trackAmplitude(AmplitudeEvent.Swap, {
      error,
      fee: fee.toFixed(),
      rate,
      inputToken,
      inputAmount,
      outputToken,
      outputAmount,
      minimumOutput,
      slippageTolerance,
      isSuccess: !error
    })
  }
}

export const amplitudeSwapTracker = new SwapTracker()
