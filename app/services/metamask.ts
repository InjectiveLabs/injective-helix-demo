import { EthereumChainId } from '@injectivelabs/ts-types'
import {
  ErrorType,
  MetamaskException,
  UnspecifiedErrorCode
} from '@injectivelabs/exceptions'
import detectEthereumProvider from '@metamask/detect-provider'
import { UtilsWallets } from '@injectivelabs/wallet-ts'
import { ETHEREUM_CHAIN_ID } from '@/app/utils/constants'
import { walletStrategy } from '@/app/wallet-strategy'

export const isMetamaskInstalled = async (): Promise<boolean> => {
  const provider = await detectEthereumProvider()

  return !!provider
}

export const validateMetamask = async (
  address: string,
  chainId: EthereumChainId = ETHEREUM_CHAIN_ID
) => {
  const addresses = await walletStrategy.getAddresses()
  const metamaskIsLocked = addresses.length === 0

  if (metamaskIsLocked) {
    throw new MetamaskException(
      new Error(
        'Your Metamask is currently locked. Please unlock your Metamask.'
      ),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      }
    )
  }

  const [metamaskActiveAddress] = addresses
  const metamaskActiveAddressDoesntMatchTheActiveAddress =
    address && metamaskActiveAddress.toLowerCase() !== address.toLowerCase()

  if (metamaskActiveAddressDoesntMatchTheActiveAddress) {
    throw new MetamaskException(
      new Error(
        'You are connected to the wrong address. Please logout and connect to Metamask again'
      ),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      }
    )
  }

  const metamaskChainId = parseInt(
    await walletStrategy.getEthereumChainId(),
    16
  )
  const metamaskChainIdDoesntMatchTheActiveChainId = chainId !== metamaskChainId

  if (metamaskChainIdDoesntMatchTheActiveChainId) {
    return await UtilsWallets.updateMetamaskNetwork(chainId)
  }
}
