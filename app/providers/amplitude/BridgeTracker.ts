import { identify as amplitudeIdentify } from '@amplitude/analytics-browser'
import BaseTracker from '~/app/providers/amplitude/BaseTracker'
import { AMPLITUDE_TRANSFERS_MADE_COUNT } from '@/app/utils/vendor'
import { AmplitudeEvent, TransferDirection } from '@/types'

class BridgeTracker extends BaseTracker {
  transferTradingAccountTrack({
    transferDirection,
    token,
    amount
  }: {
    transferDirection: TransferDirection
    token: string
    amount: string
  }) {
    const { user } = this
    const identify = this.getIdentify()

    if (!user || !identify) {
      return
    }

    identify.add(AMPLITUDE_TRANSFERS_MADE_COUNT, 1)
    amplitudeIdentify(identify)

    this.trackAmplitude(AmplitudeEvent.Transfer, {
      transferDirection,
      token,
      amount
    })
  }
}

export const amplitudeBridgeTracker = new BridgeTracker()
