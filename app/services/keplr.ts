import {
  CosmosWalletException,
  ErrorType,
  UnspecifiedErrorCode
} from '@injectivelabs/exceptions'
import { PublicKey } from '@injectivelabs/sdk-ts'
import { ChainId } from '@injectivelabs/ts-types'
import { Wallet } from '@injectivelabs/wallet-ts'
import { KeplrWallet } from '@injectivelabs/wallet-ts/dist/keplr'
import { CHAIN_ID } from '../utils/constants'
import { walletStrategy } from '../wallet-strategy'

export const confirmCorrectKeplrAddress = async (injectiveAddress: string) => {
  // We only perform this check for Keplr addresses
  if (walletStrategy.getWallet() !== Wallet.Keplr) {
    return
  }

  const keplr = new KeplrWallet(CHAIN_ID)
  const key = await keplr.getKey()
  const publicKey = PublicKey.fromBase64(
    Buffer.from(key.pubKey).toString('base64')
  )

  const { address: derivedAddress } = publicKey.toAddress()

  if (derivedAddress !== injectiveAddress) {
    throw new CosmosWalletException(
      new Error(
        'Connected Keplr address is wrong. Please update Injective on Keplr.'
      )
    )
  }
}

export const validateKeplr = async (address: string, chainId: ChainId) => {
  const keplr = new KeplrWallet(chainId)

  if (!(await keplr.checkChainIdSupport())) {
    await keplr.experimentalSuggestChain()
  }

  const accounts = await keplr.getAccounts()

  if (accounts.length === 0) {
    throw new CosmosWalletException(
      new Error('Your Keplr wallet is not installed or its not unlocked'),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletNotInstalledError
      }
    )
  }

  const [account] = accounts
  const keplrActiveAddressDoesntMatchTheActiveAddress =
    address && account.address.toLowerCase() !== address.toLowerCase()

  if (keplrActiveAddressDoesntMatchTheActiveAddress) {
    throw new CosmosWalletException(
      new Error(
        `You are connected to the wrong address. Your connected address is ${address}`
      ),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      }
    )
  }
}
