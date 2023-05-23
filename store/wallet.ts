import { defineStore } from 'pinia'
import { isCosmosWallet, Wallet } from '@injectivelabs/wallet-ts'
import {
  getDefaultSubaccountId,
  getEthereumAddress,
  getInjectiveAddress
} from '@injectivelabs/sdk-ts'
import {
  ErrorType,
  UnspecifiedErrorCode,
  ChainCosmosErrorCode,
  CosmosWalletException
} from '@injectivelabs/exceptions'
import { CosmosChainId } from '@injectivelabs/ts-types'
import { confirm, connect, getAddresses } from '@/app/services/wallet'
import { validateMetamask, isMetamaskInstalled } from '@/app/services/metamask'
import { walletStrategy } from '@/app/wallet-strategy'
import {
  amplitudeTracker,
  amplitudeWalletTracker
} from '@/app/providers/amplitude'
import {
  validateCosmosWallet,
  confirmCorrectKeplrAddress
} from '@/app/services/cosmos'
import { IS_DEVNET } from '@/app/utils/constants'
import { BusEvents, WalletConnectStatus } from '@/types'

type WalletStoreState = {
  walletConnectStatus: WalletConnectStatus
  address: string
  injectiveAddress: string
  addressConfirmation: string
  addresses: string[]
  metamaskInstalled: boolean
  wallet: Wallet
}

const initialStateFactory = (): WalletStoreState => ({
  address: '',
  addresses: [],
  injectiveAddress: '',
  addressConfirmation: '',
  wallet: Wallet.Metamask,
  metamaskInstalled: false,
  walletConnectStatus: WalletConnectStatus.idle
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

    defaultSubaccountId: (state) => {
      if (!state.injectiveAddress) {
        return ''
      }

      return getDefaultSubaccountId(state.injectiveAddress)
    },

    isCosmosWallet: (state) => {
      return isCosmosWallet(state.wallet)
    },

    /**
     * Fee delegation doesn't
     * work for cosmos wallets and its disabled
     * on devnet
     */
    isWalletExemptFromGasFee: (state) => {
      return !isCosmosWallet(state.wallet) && !IS_DEVNET
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

    async onConnect() {
      const accountStore = useAccountStore()
      const walletStore = useWalletStore()
      const exchangeStore = useExchangeStore()

      useEventBus(BusEvents.WalletConnected).emit()

      await accountStore.fetchAccountPortfolio()
      await exchangeStore.initFeeDiscounts()

      amplitudeTracker.setUser({
        wallet: walletStore.wallet,
        address: walletStore.injectiveAddress,
        tierLevel: exchangeStore.feeDiscountAccountInfo?.tierLevel || 0
      })
      amplitudeWalletTracker.submitWalletConnectedTrackEvent()

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
        addressConfirmation
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
        addressConfirmation
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
        addressConfirmation
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
        addresses: injectiveAddresses
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
        addresses: injectiveAddresses
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
        addresses: injectiveAddresses
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
        addressConfirmation
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
        addressConfirmation
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
      const { hasEnoughInjForGas } = useAccountStore()
      const { ethereumChainId, chainId } = useAppStore()
      const { wallet, injectiveAddress, address } = useWalletStore()

      if (wallet === Wallet.Metamask) {
        await validateMetamask(address, ethereumChainId)
      }

      if (isCosmosWallet(wallet)) {
        await validateCosmosWallet({
          address: injectiveAddress,
          chainId: chainId as unknown as CosmosChainId,
          wallet
        })

        if (!hasEnoughInjForGas) {
          throw new CosmosWalletException(
            new Error('Insufficient INJ to pay for gas/transaction fees.'),
            {
              code: UnspecifiedErrorCode,
              type: ErrorType.WalletError,
              contextCode: ChainCosmosErrorCode.ErrInsufficientFee
            }
          )
        }
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

      await walletStrategy.disconnectWallet()

      walletStore.reset()
      spotStore.resetSubaccount()
      derivativeStore.resetSubaccount()

      accountStore.$reset()
      peggyStore.$reset()
      activityStore.$reset()
      positionStore.$reset()
    },

    reset() {
      const walletStore = useWalletStore()

      const { address, addresses, injectiveAddress, addressConfirmation } =
        initialStateFactory()

      walletStore.$patch({
        address,
        addresses,
        injectiveAddress,
        addressConfirmation
      })
    }
  }
})
