import { Wallet } from '@injectivelabs/wallet-base'
import { getEthereumAddress } from '@injectivelabs/sdk-ts'
import { uiApi } from '../../Service'
import { WalletConnectStatus } from '../../types'
import { getAddresses, walletStrategy } from '../../WalletService'
import type { MagicProvider } from '@injectivelabs/wallet-base'

export const queryMagicExistingUser = async (email?: string) => {
  if (!email) {
    return
  }

  const response = await uiApi.client.post('/magic', {
    email
  })

  return response.data
}

export const connectMagic = async (
  provider?: MagicProvider,
  email?: string
) => {
  const walletStore = useSharedWalletStore()

  await walletStore.connectWallet(Wallet.Magic)

  try {
    const [address] = await getAddresses({ email, provider })

    if (!address) {
      return
    }

    const ethereumAddress = getEthereumAddress(address)
    const session = await walletStrategy.getSessionOrConfirm(address)

    walletStore.$patch({
      session,
      address: ethereumAddress,
      injectiveAddress: address,
      addresses: [ethereumAddress],
      addressConfirmation: await walletStrategy.getSessionOrConfirm(address)
    })

    await walletStore.onConnect()
  } catch {
    walletStore.wallet = Wallet.Metamask
    walletStore.walletConnectStatus = WalletConnectStatus.idle
  }
}
