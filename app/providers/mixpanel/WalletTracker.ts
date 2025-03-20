import { Wallet } from '@injectivelabs/wallet-base'
import { mixpanelAnalytics } from '@/app/providers/mixpanel/BaseTracker'
import { MixPanelEvent } from '@/types'

export const trackLogin = ({
  address,
  wallet
}: {
  address: string
  wallet: Wallet
}) => {
  const client = mixpanelAnalytics.getMixpanelClient()

  if (!client) {
    return
  }

  client.identify(address)

  mixpanelAnalytics.track(MixPanelEvent.WalletConnected, {
    Wallet: wallet,
    Address: address
  })

  client.people.increment({ Login: 1, [wallet]: 1 })
  client.people.set({ wallet })
}

export const trackWalletAddress = (injectiveAddress: string) => {
  const client = mixpanelAnalytics.getMixpanelClient()

  if (!client) {
    return
  }

  client.identify(injectiveAddress)
}

export const trackLogout = () => {
  const client = mixpanelAnalytics.getMixpanelClient()

  if (!client) {
    return
  }

  client.reset()
}
