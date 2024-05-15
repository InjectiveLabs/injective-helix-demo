import { Wallet } from '@injectivelabs/wallet-ts'
import {
  ErrorType,
  WalletException,
  UnspecifiedErrorCode
} from '@injectivelabs/exceptions'
import { walletStrategy } from '@shared/wallet/wallet-strategy'
import { HttpClient } from '@injectivelabs/utils'
import { blacklistedAddresses } from '@/app/data/wallet-address'
import { GEO_IP_RESTRICTIONS_ENABLED } from '@/app/utils/constants'

export const connect = ({
  wallet,
  options
}: {
  wallet: Wallet
  options?: {
    privateKey?: string
  }
  // onAccountChangeCallback?: (account: string) => void,
}) => {
  walletStrategy.setWallet(wallet)

  if (wallet === Wallet.PrivateKey && options?.privateKey) {
    walletStrategy.setOptions({ privateKey: options.privateKey })
  }
}

export const getAddresses = async (): Promise<string[]> => {
  const addresses = await walletStrategy.enableAndGetAddresses()

  if (addresses.length === 0) {
    throw new WalletException(
      new Error('There are no addresses linked in this wallet.'),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      }
    )
  }

  if (!addresses.every((address) => !!address)) {
    throw new WalletException(
      new Error('There are no addresses linked in this wallet.'),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      }
    )
  }

  if (GEO_IP_RESTRICTIONS_ENABLED) {
    const [address] = addresses
    const addressIsBlackListed =
      blacklistedAddresses.find(
        (blacklistedAddress) =>
          blacklistedAddress.toLowerCase() === address.toLowerCase()
      ) !== undefined

    if (addressIsBlackListed) {
      throw new WalletException(new Error('This addresses is restricted.'), {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      })
    }
  }

  return addresses
}

export const confirm = async (address: string) => {
  return await walletStrategy.getSessionOrConfirm(address)
}

export const autoSignCreateAccountNoThrow = async (address: string) => {
  try {
    await new HttpClient('https://api.express.injective.dev').post(
      '/create-account',
      { address }
    )
  } catch (e) {
    // do nothing
  }
}
