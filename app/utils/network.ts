import { getBridgeUrl } from '@shared/utils/network'

export const getBridgeRedirectionUrl = (suffix?: string) => {
  const walletStore = useWalletStore()

  const url = suffix ? `${getBridgeUrl()}/${suffix}` : `${getBridgeUrl()}`

  if (!walletStore.isUserWalletConnected) {
    return `${url}/?origin=helix`
  }

  return `${url}/?address=${walletStore.injectiveAddress}&wallet=${walletStore.wallet}&origin=helix`
}
