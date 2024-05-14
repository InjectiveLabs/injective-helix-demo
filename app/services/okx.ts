import { EthereumChainId, AccountAddress } from '@injectivelabs/ts-types'
import {
  ErrorType,
  GeneralException,
  UnspecifiedErrorCode,
  OkxWalletException
} from '@injectivelabs/exceptions'
import { UtilsWallets } from '@injectivelabs/wallet-ts/dist/esm/exports'
import { ETHEREUM_CHAIN_ID } from '@/app/utils/constants'
import { walletStrategy } from '@/app/wallet-strategy'

export const isOkxWalletInstalled = async (): Promise<boolean> => {
  const provider = await UtilsWallets.getOkxWalletProvider()

  return !!provider
}

export const validateOkxWallet = async (
  address: AccountAddress,
  chainId: EthereumChainId = ETHEREUM_CHAIN_ID
) => {
  const addresses = await walletStrategy.enableAndGetAddresses()
  const okxWalletIsLocked = addresses.length === 0

  if (okxWalletIsLocked) {
    throw new OkxWalletException(
      new Error(
        'Your OkxWallet is currently locked. Please unlock your OkxWallet.'
      ),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      }
    )
  }

  const [okxWalletActiveAddress] = addresses
  const okxWalletActiveAddressDoesntMatchTheActiveAddress =
    address && okxWalletActiveAddress.toLowerCase() !== address.toLowerCase()

  if (okxWalletActiveAddressDoesntMatchTheActiveAddress) {
    throw new OkxWalletException(
      new Error(
        'You are connected to the wrong address. Please logout and connect to OkxWallet again'
      ),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      }
    )
  }

  const okxWalletChainId = parseInt(
    await walletStrategy.getEthereumChainId(),
    16
  )
  const okxWalletChainIdDoesntMatchTheActiveChainId =
    chainId !== okxWalletChainId

  if (okxWalletChainIdDoesntMatchTheActiveChainId) {
    return await UtilsWallets.updateOkxWalletNetwork(chainId)
  }

  const okxProvider = await UtilsWallets.getOkxWalletProvider()

  if (!okxProvider) {
    throw new GeneralException(
      new Error(
        'You are connected to the wrong wallet. Please use Okx Wallet.'
      ),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      }
    )
  }
}
