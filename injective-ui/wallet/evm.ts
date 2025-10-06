import { walletStrategy } from './wallet-strategy'
import { Wallet } from '@injectivelabs/wallet-base'
import { ETHEREUM_CHAIN_ID } from './../utils/constant'
import {
  ErrorType,
  WalletException,
  BitGetException,
  MetamaskException,
  OkxWalletException,
  UnspecifiedErrorCode,
  TrustWalletException
} from '@injectivelabs/exceptions'
import {
  updateEvmNetwork,
  getRabbyProvider,
  getBitGetProvider,
  getRainbowProvider,
  getPhantomProvider,
  getMetamaskProvider,
  getOkxWalletProvider,
  getTrustWalletProvider,
} from '@injectivelabs/wallet-evm'
import type { AccountAddress } from '@injectivelabs/ts-types'
import type { ErrorContext, ThrownException } from '@injectivelabs/exceptions'

export const getEvmWalletProvider = async (wallet: Wallet) => {
  if (wallet === Wallet.Metamask) {
    return await getMetamaskProvider()
  }

  if (wallet === Wallet.BitGet) {
    return await getBitGetProvider()
  }

  if (wallet === Wallet.OkxWallet) {
    return await getOkxWalletProvider()
  }

  if (wallet === Wallet.Phantom) {
    return await getPhantomProvider()
  }

  if (wallet === Wallet.TrustWallet) {
    return await getTrustWalletProvider()
  }

  if (wallet === Wallet.Rainbow) {
    return await getRainbowProvider()
  }

  if (wallet === Wallet.Rabby) {
    return await getRabbyProvider()
  }
}

export const isBitGetInstalled = async (): Promise<boolean> => {
  const provider = await getBitGetProvider()

  return !!provider
}

export const getEvmWalletException = (
  wallet: Wallet,
  error: Error,
  context?: ErrorContext
): ThrownException => {
  if (wallet === Wallet.Metamask) {
    return new MetamaskException(error, context)
  }

  if (wallet === Wallet.BitGet) {
    return new BitGetException(error, context)
  }

  if (wallet === Wallet.OkxWallet) {
    return new OkxWalletException(error, context)
  }

  if (wallet === Wallet.Phantom) {
    return new MetamaskException(error, context)
  }

  if (wallet === Wallet.TrustWallet) {
    return new TrustWalletException(error, context)
  }

  return new WalletException(error, context)
}

export const validateEvmWallet = async ({
  wallet,
  address
}: {
  wallet: Wallet
  address: AccountAddress
}) => {
  const accounts = await walletStrategy.enableAndGetAddresses()
  const isAccountLocked = accounts.length === 0

  if (isAccountLocked) {
    throw getEvmWalletException(
      wallet,
      new Error('Your wallet is currently locked. Please unlock your BitGet.'),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      }
    )
  }

  const [account] = accounts
  const walletActiveAddressDoesntMatchTheActiveAddress =
    account && account.toLowerCase() !== address.toLowerCase()

  if (walletActiveAddressDoesntMatchTheActiveAddress) {
    throw getEvmWalletException(
      wallet,
      new Error(`You are connected to the wrong address. Please reconnect!`),
      {
        contextModule: 'BitGet',
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      }
    )
  }

  const walletChainId = parseInt(await walletStrategy.getEthereumChainId(), 16)
  const walletChainIdDoesntMatchTheActiveChainId =
    ETHEREUM_CHAIN_ID !== walletChainId

  if (walletChainIdDoesntMatchTheActiveChainId) {
    return await updateEvmNetwork(wallet, ETHEREUM_CHAIN_ID)
  }

  const provider = await getEvmWalletProvider(wallet)

  if (!provider) {
    throw getEvmWalletException(
      wallet,
      new Error('You are connected to the wrong wallet.'),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      }
    )
  }
}
