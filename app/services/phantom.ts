import { UtilsWallets } from '@injectivelabs/wallet-ts'
import {
  ErrorType,
  GeneralException,
  MetamaskException,
  UnspecifiedErrorCode
} from '@injectivelabs/exceptions'
import { walletStrategy } from '../wallet-strategy'

export const isPhantomInstalled = async (): Promise<boolean> => {
  const provider = await UtilsWallets.getPhantomProvider()

  return !!provider
}

export const validatePhantom = async (address: string) => {
  const addresses = await walletStrategy.getAddresses()
  const trustWalletIsLocked = addresses.length === 0

  if (trustWalletIsLocked) {
    throw new MetamaskException(
      new Error(
        'Your Phantom is currently locked. Please unlock your Phantom.'
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
    throw new MetamaskException(
      new Error(
        'You are connected to the wrong address. Please logout and connect to Phantom again'
      ),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      }
    )
  }

  const phantomProvider = await UtilsWallets.getPhantomProvider()

  if (!phantomProvider) {
    throw new GeneralException(
      new Error('You are connected to the wrong wallet. Please use Phantom.'),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      }
    )
  }
}
