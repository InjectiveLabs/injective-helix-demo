import { getBridgeUrl } from '@shared/utils/network'

export const getBridgeRedirectionUrl = (suffix?: string) => {
  const walletStore = useSharedWalletStore()

  const url = suffix ? `${getBridgeUrl()}/${suffix}` : `${getBridgeUrl()}`

  if (!walletStore.isUserConnected) {
    return `${url}/?origin=helix`
  }

  return `${url}/?address=${walletStore.injectiveAddress}&wallet=${walletStore.wallet}&origin=helix`
}
