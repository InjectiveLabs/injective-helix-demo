import { getBridgeUrl } from '@shared/utils/network'

export const getBridgeRedirectionUrl = (suffix?: string) => {
  const sharedWalletStore = useSharedWalletStore()

  const url = suffix ? `${getBridgeUrl()}/${suffix}` : `${getBridgeUrl()}`

  if (!sharedWalletStore.isUserConnected) {
    return `${url}/?origin=helix`
  }

  return `${url}/?address=${sharedWalletStore.injectiveAddress}&wallet=${sharedWalletStore.wallet}&origin=helix`
}
