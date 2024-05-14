import { EthereumChainId } from '@injectivelabs/ts-types'
import {
  ErrorType,
  TrustWalletException,
  UnspecifiedErrorCode
} from '@injectivelabs/exceptions'
import { UtilsWallets } from '@injectivelabs/wallet-ts/dist/esm/exports'
import { ETHEREUM_CHAIN_ID } from '@/app/utils/constants'
import { walletStrategy } from '@/app/wallet-strategy'

export const isTrustWalletInstalled = async (): Promise<boolean> => {
  const provider = await UtilsWallets.getTrustWalletProvider()

  return !!provider
}

export const validateTrustWallet = async (
  address: string,
  chainId: EthereumChainId = ETHEREUM_CHAIN_ID
) => {
  const addresses = await walletStrategy.enableAndGetAddresses()
  const trustWalletIsLocked = addresses.length === 0

  if (trustWalletIsLocked) {
    throw new TrustWalletException(
      new Error(
        'Your TrustWallet is currently locked. Please unlock your TrustWallet.'
      ),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      }
    )
  }

  const [trustWalletActiveAddress] = addresses
  const trustWalletActiveAddressDoesntMatchTheActiveAddress =
    address && trustWalletActiveAddress.toLowerCase() !== address.toLowerCase()

  if (trustWalletActiveAddressDoesntMatchTheActiveAddress) {
    throw new TrustWalletException(
      new Error(
        'You are connected to the wrong address. Please logout and connect to TrustWallet again'
      ),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      }
    )
  }

  const trustWalletChainId = parseInt(
    await walletStrategy.getEthereumChainId(),
    16
  )
  const trustWalletChainIdDoesntMatchTheActiveChainId =
    chainId !== trustWalletChainId

  if (trustWalletChainIdDoesntMatchTheActiveChainId) {
    return await UtilsWallets.updateTrustWalletNetwork(chainId)
  }
}
