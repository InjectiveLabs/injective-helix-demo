import {
  CosmosWalletException,
  ErrorType,
  UnspecifiedErrorCode
} from '@injectivelabs/exceptions'
import { PublicKey } from '@injectivelabs/sdk-ts'
import { CosmosChainId } from '@injectivelabs/ts-types'
import {
  Wallet,
  UtilsWallets,
  CosmosWalletStrategy
} from '@injectivelabs/wallet-ts'
import { CHAIN_ID } from '@/app/utils/constants'
import { walletStrategy } from '@/app/wallet-strategy'

export const confirmCorrectKeplrAddress = async (injectiveAddress: string) => {
  // We only perform this check for Keplr addresses
  if (walletStrategy.getWallet() !== Wallet.Keplr) {
    return
  }

  const keplr = new UtilsWallets.KeplrWallet(CHAIN_ID)
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

export const validateCosmosWallet = async ({
  wallet,
  address,
  chainId
}: {
  wallet: Wallet
  address: string
  chainId: CosmosChainId
}) => {
  const cosmosWalletStrategy = new CosmosWalletStrategy({
    wallet,
    chainId
  })

  if (!(await cosmosWalletStrategy.isChainIdSupported())) {
    throw new CosmosWalletException(
      new Error(`The wallet does not support ${chainId}`),
      {
        code: UnspecifiedErrorCode
      }
    )
  }

  const accounts = await cosmosWalletStrategy.getAddresses()

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
  const activeAddressDoesntMatchTheActiveAddress =
    address && account.toLowerCase() !== address.toLowerCase()

  if (activeAddressDoesntMatchTheActiveAddress) {
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
