import { defineStore } from 'pinia'
import { isCosmosWallet, isEthWallet, Wallet } from '@injectivelabs/wallet-ts'
import {
  getEthereumAddress,
  getInjectiveAddress,
  getDefaultSubaccountId
} from '@injectivelabs/sdk-ts'
import { CosmosChainId } from '@injectivelabs/ts-types'
import { GeneralException } from '@injectivelabs/exceptions'
import { confirm, connect, getAddresses } from '@/app/services/wallet'
import { validateMetamask, isMetamaskInstalled } from '@/app/services/metamask'
import { walletStrategy } from '@/app/wallet-strategy'
import { amplitudeWalletTracker } from '@/app/providers/amplitude'
import {
  validateCosmosWallet,
  confirmCorrectKeplrAddress
} from '@/app/services/cosmos'
import { BusEvents, WalletConnectStatus } from '@/types'
import {
  validateTrustWallet,
  isTrustWalletInstalled
} from '@/app/services/trust-wallet'
import { GrantDirection } from '@/types/authZ'

type WalletStoreState = {
  wallet: Wallet

  address: string
  addresses: string[]
  injectiveAddress: string
  defaultSubaccountId: string
  addressConfirmation: string

  trustWalletInstalled: boolean
  metamaskInstalled: boolean

  walletConnectStatus: WalletConnectStatus

  authZ: {
    address: string
    direction: GrantDirection
    injectiveAddress: string
    defaultSubaccountId: string
  }
}

const initialStateFactory = (): WalletStoreState => ({
  address: '',
  addresses: [],
  injectiveAddress: '',
  defaultSubaccountId: '',
  addressConfirmation: '',
  wallet: Wallet.Metamask,
  metamaskInstalled: false,
  trustWalletInstalled: false,
  walletConnectStatus: WalletConnectStatus.idle,

  authZ: {
    address: '',
    direction: GrantDirection.Grantee,
    injectiveAddress: '',
    defaultSubaccountId: ''
  }
})

export const useWalletStore = defineStore('wallet', {
  state: (): WalletStoreState => initialStateFactory(),
  getters: {
    isUserWalletConnected: (state) => {
      const addressConnectedAndConfirmed =
        !!state.address && !!state.addressConfirmation
      const hasAddresses = state.addresses.length > 0

      return (
        hasAddresses && addressConnectedAndConfirmed && !!state.injectiveAddress
      )
    },

    isAuthzWalletConnected: (state) => {
      const addressConnectedAndConfirmed =
        !!state.address && !!state.addressConfirmation
      const hasAddresses = state.addresses.length > 0
      const isUserWalletConnected =
        hasAddresses && addressConnectedAndConfirmed && !!state.injectiveAddress

      return (
        isUserWalletConnected &&
        !!state.authZ.address &&
        !!state.authZ.injectiveAddress
      )
    },

    isCosmosWallet: (state) => {
      return isCosmosWallet(state.wallet)
    },

    authZOrInjectiveAddress: (state) => {
      return state.authZ.injectiveAddress || state.injectiveAddress
    },

    authZOrDefaultSubaccountId: (state) => {
      return state.authZ.defaultSubaccountId || state.defaultSubaccountId
    },

    authZOrAddress: (state) => {
      return state.authZ.address || state.address
    }
  },
  actions: {
    async init() {
      const walletStore = useWalletStore()

      if (!walletStore.wallet) {
        return
      }

      await connect({ wallet: walletStore.wallet })
    },

    async connectWallet(wallet: Wallet) {
      const walletStore = useWalletStore()

      walletStore.$patch({
        wallet,
        walletConnectStatus: WalletConnectStatus.connecting
      })

      await connect({ wallet })
    },

    connectAuthZ(
      injectiveAddress: string,
      direction: GrantDirection = GrantDirection.Granter
    ) {
      const walletStore = useWalletStore()

      walletStore.$patch({
        authZ: {
          direction,
          injectiveAddress,
          address: getEthereumAddress(injectiveAddress),
          defaultSubaccountId: getDefaultSubaccountId(injectiveAddress)
        }
      })
    },

    async onConnect() {
      const accountStore = useAccountStore()
      const walletStore = useWalletStore()
      const authZStore = useAuthZStore()
      const exchangeStore = useExchangeStore()

      useEventBus(BusEvents.WalletConnected).emit()

      await accountStore.fetchAccountPortfolio()
      await exchangeStore.initFeeDiscounts()
      await authZStore.fetchGrants()

      amplitudeWalletTracker.submitWalletConnectedTrackEvent({
        wallet: walletStore.wallet,
        address: walletStore.injectiveAddress,
        tierLevel: exchangeStore.feeDiscountAccountInfo?.tierLevel || 0
      })

      walletStore.$patch({
        walletConnectStatus: WalletConnectStatus.connected
      })
    },

    async isMetamaskInstalled() {
      const walletStore = useWalletStore()

      walletStore.$patch({
        metamaskInstalled: await isMetamaskInstalled()
      })
    },

    async isTrustWalletInstalled() {
      const walletStore = useWalletStore()

      walletStore.$patch({
        trustWalletInstalled: await isTrustWalletInstalled()
      })
    },

    async getHWAddresses(wallet: Wallet) {
      const walletStore = useWalletStore()

      if (walletStore.addresses.length === 0 || walletStore.wallet !== wallet) {
        await connect({ wallet })

        walletStore.$patch({
          wallet,
          addresses: await getAddresses()
        })
      } else {
        const addresses = await getAddresses()

        walletStore.$patch({
          wallet,
          addresses: [...walletStore.addresses, ...addresses]
        })
      }
    },

    async connectLedger(address: string) {
      const appStore = useAppStore()
      const walletStore = useWalletStore()

      await appStore.validate(walletStore.wallet)
      await walletStore.connectWallet(walletStore.wallet)

      const addresses = [address]
      const addressConfirmation = await confirm(address)
      const injectiveAddress = getInjectiveAddress(address)

      walletStore.$patch({
        address,
        addresses,
        injectiveAddress,
        addressConfirmation
      })

      await walletStore.onConnect()
    },

    async connectTrezor(address: string) {
      const appStore = useAppStore()
      const walletStore = useWalletStore()

      await appStore.validate(walletStore.wallet)
      await walletStore.connectWallet(walletStore.wallet)

      const addresses = [address]
      const addressConfirmation = await confirm(address)
      const injectiveAddress = getInjectiveAddress(address)

      walletStore.$patch({
        address,
        addresses,
        injectiveAddress,
        addressConfirmation,
        defaultSubaccountId: getDefaultSubaccountId(injectiveAddress)
      })

      await walletStore.onConnect()
    },

    async connectMetamask() {
      const appStore = useAppStore()
      const walletStore = useWalletStore()

      await appStore.validate(Wallet.Metamask)
      await walletStore.connectWallet(Wallet.Metamask)

      const addresses = await getAddresses()
      const [address] = addresses
      const addressConfirmation = await confirm(address)
      const injectiveAddress = getInjectiveAddress(address)

      walletStore.$patch({
        address,
        addresses,
        injectiveAddress,
        addressConfirmation,
        defaultSubaccountId: getDefaultSubaccountId(injectiveAddress)
      })

      await walletStore.onConnect()
    },

    async connectTrustWallet() {
      const appStore = useAppStore()
      const walletStore = useWalletStore()

      await appStore.validate(Wallet.TrustWallet)
      await walletStore.connectWallet(Wallet.TrustWallet)

      const addresses = await getAddresses()
      const [address] = addresses
      const addressConfirmation = await confirm(address)
      const injectiveAddress = getInjectiveAddress(address)

      walletStore.$patch({
        address,
        addresses,
        injectiveAddress,
        addressConfirmation,
        defaultSubaccountId: getDefaultSubaccountId(injectiveAddress)
      })

      await walletStore.onConnect()
    },

    async connectWalletConnect() {
      const appStore = useAppStore()
      const walletStore = useWalletStore()

      await appStore.validate(Wallet.WalletConnect)
      await walletStore.connectWallet(Wallet.WalletConnect)

      const addresses = await getAddresses()
      const [address] = addresses
      const addressConfirmation = await confirm(address)
      const injectiveAddress = getInjectiveAddress(address)

      walletStore.$patch({
        address,
        addresses,
        injectiveAddress,
        addressConfirmation,
        defaultSubaccountId: getDefaultSubaccountId(injectiveAddress)
      })

      await walletStore.onConnect()
    },

    async connectKeplr() {
      const appStore = useAppStore()
      const walletStore = useWalletStore()

      await appStore.validate(Wallet.Keplr)
      await walletStore.connectWallet(Wallet.Keplr)

      const injectiveAddresses = await getAddresses()
      const [injectiveAddress] = injectiveAddresses
      const addressConfirmation = await confirm(injectiveAddress)
      const ethereumAddress = getEthereumAddress(injectiveAddress)

      await confirmCorrectKeplrAddress(injectiveAddress)

      walletStore.$patch({
        injectiveAddress,
        addressConfirmation,
        address: ethereumAddress,
        addresses: injectiveAddresses,
        defaultSubaccountId: getDefaultSubaccountId(injectiveAddress)
      })

      await walletStore.onConnect()
    },

    async connectLeap() {
      const appStore = useAppStore()
      const walletStore = useWalletStore()

      await appStore.validate(Wallet.Leap)
      await walletStore.connectWallet(Wallet.Leap)

      const injectiveAddresses = await getAddresses()
      const [injectiveAddress] = injectiveAddresses
      const addressConfirmation = await confirm(injectiveAddress)
      const ethereumAddress = getEthereumAddress(injectiveAddress)

      walletStore.$patch({
        injectiveAddress,
        addressConfirmation,
        address: ethereumAddress,
        addresses: injectiveAddresses,
        defaultSubaccountId: getDefaultSubaccountId(injectiveAddress)
      })

      await walletStore.onConnect()
    },

    async connectCosmostation() {
      const appStore = useAppStore()
      const walletStore = useWalletStore()

      await appStore.validate(Wallet.Cosmostation)
      await walletStore.connectWallet(Wallet.Cosmostation)

      const injectiveAddresses = await getAddresses()
      const [injectiveAddress] = injectiveAddresses
      const addressConfirmation = await confirm(injectiveAddress)
      const ethereumAddress = getEthereumAddress(injectiveAddress)

      walletStore.$patch({
        injectiveAddress,
        addressConfirmation,
        address: ethereumAddress,
        addresses: injectiveAddresses,
        defaultSubaccountId: getDefaultSubaccountId(injectiveAddress)
      })

      await walletStore.onConnect()
    },

    async connectTorus() {
      const appStore = useAppStore()
      const walletStore = useWalletStore()

      await appStore.validate(Wallet.Torus)
      await walletStore.connectWallet(Wallet.Torus)

      const addresses = await getAddresses()
      const [address] = addresses
      const addressConfirmation = await confirm(address)
      const injectiveAddress = getInjectiveAddress(address)

      walletStore.$patch({
        address,
        addresses,
        injectiveAddress,
        addressConfirmation,
        defaultSubaccountId: getDefaultSubaccountId(injectiveAddress)
      })

      await walletStore.onConnect()
    },

    async connectAddress(injectiveAddress: string) {
      const appStore = useAppStore()
      const walletStore = useWalletStore()

      await appStore.validate(Wallet.Metamask)
      await walletStore.connectWallet(Wallet.Metamask)

      const addressConfirmation = await confirm(injectiveAddress)
      const address = getEthereumAddress(injectiveAddress)

      walletStore.$patch({
        address,
        addresses: [address],
        injectiveAddress,
        addressConfirmation,
        defaultSubaccountId: getDefaultSubaccountId(injectiveAddress)
      })

      await walletStore.onConnect()
    },

    setWalletConnectStatus(walletConnectStatus: WalletConnectStatus) {
      const walletStore = useWalletStore()

      walletStore.$patch({
        walletConnectStatus
      })
    },

    setAddresses(addresses: string[]) {
      const walletStore = useWalletStore()

      walletStore.$patch({
        addresses
      })
    },

    async validate() {
      const appStore = useAppStore()
      const walletStore = useWalletStore()

      if (walletStore.wallet === Wallet.Metamask) {
        await validateMetamask(walletStore.address, appStore.ethereumChainId)
      }

      if (walletStore.wallet === Wallet.TrustWallet) {
        await validateTrustWallet(walletStore.address, appStore.ethereumChainId)
      }

      if (
        isEthWallet(walletStore.wallet) &&
        walletStore.isAuthzWalletConnected
      ) {
        throw new GeneralException(
          new Error(
            'Ethereum native wallets currently do not support AuthZ transactions'
          )
        )
      }

      if (isCosmosWallet(walletStore.wallet)) {
        await validateCosmosWallet({
          address: walletStore.injectiveAddress,
          chainId: appStore.chainId as unknown as CosmosChainId,
          wallet: walletStore.wallet
        })
      }
    },

    async logout() {
      const accountStore = useAccountStore()
      const spotStore = useSpotStore()
      const peggyStore = usePeggyStore()
      const walletStore = useWalletStore()
      const activityStore = useActivityStore()
      const positionStore = usePositionStore()
      const derivativeStore = useDerivativeStore()
      const authZStore = useAuthZStore()

      await walletStrategy.disconnectWallet()

      walletStore.reset()
      spotStore.resetSubaccount()
      derivativeStore.resetSubaccount()

      accountStore.$reset()
      peggyStore.$reset()
      activityStore.$reset()
      positionStore.$reset()
      authZStore.$reset()
    },

    reset() {
      const walletStore = useWalletStore()

      const {
        address,
        addresses,
        injectiveAddress,
        defaultSubaccountId,
        addressConfirmation
      } = initialStateFactory()

      walletStore.resetAuthZ()
      walletStore.$patch({
        address,
        addresses,
        injectiveAddress,
        defaultSubaccountId,
        addressConfirmation
      })
    },

    resetAuthZ() {
      const walletStore = useWalletStore()

      walletStore.$patch({
        authZ: {
          address: '',
          injectiveAddress: '',
          defaultSubaccountId: '',
          direction: GrantDirection.Grantee
        }
      })
    }
  }
})
