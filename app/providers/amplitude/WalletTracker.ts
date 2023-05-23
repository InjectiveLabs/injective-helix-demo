import { identify as amplitudeIdentify } from '@amplitude/analytics-browser'
import { Wallet } from '@injectivelabs/wallet-ts'
import BaseTracker from '@/app/providers/amplitude/BaseTracker'
import { AMPLITUDE_LOGIN_COUNT } from '@/app/utils/vendor'
import { AmplitudeEvent } from '@/types'

class WalletTracker extends BaseTracker {
  submitWalletConnectedTrackEvent() {
    const { user } = this
    const identify = this.getIdentify()

    if (!user || !identify) {
      return
    }

    identify.add(AMPLITUDE_LOGIN_COUNT, 1)
    amplitudeIdentify(identify)

    this.trackAmplitude(AmplitudeEvent.Login, {
      wallet: user.wallet,
      address: user.address
    })
  }

  submitWalletSelectedTrackEvent({
    wallet,
    userCountryFromVpnApi,
    userCountryFromBrowser
  }: {
    wallet: Wallet
    userCountryFromVpnApi: string
    userCountryFromBrowser?: string
  }) {
    this.trackAmplitude(AmplitudeEvent.WalletSelected, {
      wallet,
      userCountryFromBrowser,
      userCountryFromVpnApi
    })
  }
}

export const amplitudeWalletTracker = new WalletTracker()
