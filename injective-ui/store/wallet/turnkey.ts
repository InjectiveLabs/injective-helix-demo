import { getEthereumAddress } from '@injectivelabs/sdk-ts'
import { Wallet, TurnkeyProvider } from '@injectivelabs/wallet-base'
import {
  ErrorType,
  WalletException,
  UnspecifiedErrorCode
} from '@injectivelabs/exceptions'
import { EventBus } from '../../types'
import {
  walletStrategy,
} from '../../WalletService'
import type { TurnkeyWallet } from '@injectivelabs/wallet-turnkey'

function getEmailFromOidcToken(token: string): string {
  try {
    const [__, payload, _] = token.split('.');

    const decodedPayload = JSON.parse(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    );

    return decodedPayload.email;
  } catch {
    return ''
  }
}

export const getEmailTurnkeyOTP = async (email: string) => {
  const walletStore = useSharedWalletStore()

  await walletStore.connectWallet(Wallet.Turnkey)
  const turnkeyWallet = await walletStrategy.getWalletClient() as TurnkeyWallet
  await turnkeyWallet.initOTP(email)

  walletStore.$patch({
    email
  })
}


export const submitTurnkeyOTP = async (otpCode: string) => {
  const walletStore = useSharedWalletStore()
  const turnkeyWallet = await walletStrategy.getWalletClient() as TurnkeyWallet

  try {
    await turnkeyWallet.confirmOTP(otpCode)
    const addresses = await walletStrategy.getAddresses()
  
    const [address] = addresses
    const session = await walletStrategy.getSessionOrConfirm(address)
    
    walletStore.$patch({
      session,
      addresses,
      injectiveAddress: address,
      addressConfirmation: session,
      turnkeyInjectiveAddress: address,
      address: getEthereumAddress(address),
    })

    await walletStore.onConnect()
    const isExistingMagicUser = await walletStore.queryMagicExistingUser(walletStore.email)

    if (isExistingMagicUser) {
      useEventBus(EventBus.HasMagicAccount).emit()
    }
  } catch (e: any) {
     throw new WalletException(
      new Error(e.message),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletNotInstalledError
      }
    )
  }
}

export const connectTurnkeyGoogle = async () => {
  const walletStore = useSharedWalletStore()

  await walletStore.connectWallet(Wallet.Turnkey)
  const turnkeyWallet = await walletStrategy.getWalletClient() as TurnkeyWallet
  const urlOrSession = await turnkeyWallet.initOAuth(TurnkeyProvider.Google)

  if (urlOrSession.startsWith('http')) {
    window.location.href = urlOrSession;

    return
  }

  const addresses = await walletStrategy.getAddresses();
  const [address] = addresses

  
  
  walletStore.$patch({
    addresses,
    session: urlOrSession,
    injectiveAddress: address,
    turnkeyInjectiveAddress: address,
    addressConfirmation: urlOrSession,
    address: getEthereumAddress(address),
  })

  await walletStore.onConnect()
}

export const initTurnkeyGoogle = async (oidcToken: string) => {
  const walletStore = useSharedWalletStore()

  await walletStore.connectWallet(Wallet.Turnkey)

  const turnkeyWallet = await walletStrategy.getWalletClient() as TurnkeyWallet
  const session = await turnkeyWallet.confirmOAuth(TurnkeyProvider.Google, oidcToken)

  const email = getEmailFromOidcToken(oidcToken)
  const addresses = await walletStrategy.getAddresses()
  const [address] = addresses
  
  walletStore.$patch({
    email,
    session,
    addresses: addresses,
    injectiveAddress: address,
    addressConfirmation: session,
    turnkeyInjectiveAddress: address,
    address: getEthereumAddress(address),
  })

  await walletStore.onConnect()

  const isExistingMagicUser = await walletStore.queryMagicExistingUser(walletStore.email)

  if (isExistingMagicUser) {
    useEventBus(EventBus.HasMagicAccount).emit()
  }
}
