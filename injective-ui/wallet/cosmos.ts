import { CHAIN_ID } from './../utils/constant'
import { walletStrategy } from './wallet-strategy'
import { confirmCosmosAddress } from '@injectivelabs/wallet-cosmos'
import {
  ErrorType,
  UnspecifiedErrorCode,
  CosmosWalletException
} from '@injectivelabs/exceptions'
import type { Wallet } from '@injectivelabs/wallet-base'

export const confirmCosmosWalletAddress = async (
  wallet: Wallet,
  injectiveAddress: string
) => await confirmCosmosAddress({ wallet, injectiveAddress, chainId: CHAIN_ID })

export const validateCosmosWallet = async ({
  wallet,
  address
}: {
  wallet: Wallet
  address: string
}) => {
  const accounts = await walletStrategy.enableAndGetAddresses()
  const isAccountLocked = accounts.length === 0

  if (isAccountLocked) {
    throw new CosmosWalletException(
      new Error('Your wallet is not installed or its not unlocked'),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletNotInstalledError
      }
    )
  }

  const [account] = accounts
  const activeAddressDoesntMatchTheActiveAddress =
    account && account.toLowerCase() !== address.toLowerCase()

  if (activeAddressDoesntMatchTheActiveAddress) {
    throw new CosmosWalletException(
      new Error(`You are connected to the wrong address. Please reconnect!`),
      {
        contextModule: wallet,
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      }
    )
  }
}
