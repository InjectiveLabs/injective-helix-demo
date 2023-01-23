import { defineStore } from 'pinia'
import { isCosmosWallet, Wallet } from '@injectivelabs/wallet-ts'
import { getEthereumAddress, getInjectiveAddress } from '@injectivelabs/sdk-ts'
import {
  ChainCosmosErrorCode,
  CosmosWalletException,
  ErrorType,
  UnspecifiedErrorCode
} from '@injectivelabs/exceptions'
import { CosmosChainId } from '@injectivelabs/ts-types'
import { confirm, connect, getAddresses } from '@/app/services/wallet'
import { validateMetamask, isMetamaskInstalled } from '@/app/services/metamask'
import { BusEvents, WalletConnectStatus } from '@/types'
import { walletStrategy } from '@/app/wallet-strategy'
import { amplitudeTracker } from '@/app/providers/AmplitudeTracker'
import {
  confirmCorrectKeplrAddress,
  validateCosmosWallet
} from '@/app/services/cosmos'
import { IS_DEVNET } from '~~/app/utils/constants'

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
  walletConnectStatus: WalletConnectStatus.idle,
  address: '',
  injectiveAddress: '',
  addressConfirmation: '',
  addresses: [],
  metamaskInstalled: false,
  wallet: Wallet.Metamask
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

    isCosmosWallet: (state) => {
      return isCosmosWallet(state.wallet)
    },

    hasEnoughInjForGas: (state) => {
      const bankStore = useBankStore()

      // fee delegation don't work on devnet
      const isWalletExemptFromGasFee =
        !isCosmosWallet(state.wallet) || !IS_DEVNET

      return isWalletExemptFromGasFee || bankStore.hasEnoughInjForGas
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

    async initPage() {
      const accountStore = useAccountStore()
      const bankStore = useBankStore()
      const onBoardStore = useOnboardStore()
      const tokenStore = useTokenStore()

      await bankStore.fetchBankBalancesWithToken()
      await accountStore.fetchSubaccounts()
      await accountStore.fetchSubaccountsBalances()
      await accountStore.fetchSubaccountsBalancesWithPrices()
      await onBoardStore.init()
      await tokenStore.getErc20TokensWithBalanceAndPriceFromBankAndMarkets()
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
      const bankStore = useBankStore()
      const exchangeStore = useExchangeStore()
      const referralStore = useReferralStore()
      const walletStore = useWalletStore()

      await accountStore.fetchSubaccounts()
      await bankStore.fetchBalances()
      await exchangeStore.initFeeDiscounts()

      amplitudeTracker.submitWalletSelectedTrackEvent(walletStore.wallet)
      amplitudeTracker.setUser({
        tierLevel: exchangeStore.feeDiscountAccountInfo?.tierLevel || 0,
        address: walletStore.injectiveAddress,
        wallet: walletStore.wallet
      })
      amplitudeTracker.submitWalletConnectedTrackEvent()

      walletStore.$patch({
        walletConnectStatus: WalletConnectStatus.connected
      })

      useEventBus(BusEvents.WalletConnected).emit()

      await referralStore.init()
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

      await appStore.validate()
      await walletStore.connectWallet(walletStore.wallet)

      const addresses = [address]
      const addressConfirmation = await confirm(address)
      const injectiveAddress = getInjectiveAddress(address)

      walletStore.$patch({
        address,
        addressConfirmation,
        addresses,
        injectiveAddress
      })

      await walletStore.onConnect()
    },

    async connectTrezor(address: string) {
      const appStore = useAppStore()
      const walletStore = useWalletStore()

      await appStore.validate()
      await walletStore.connectWallet(walletStore.wallet)

      const addresses = [address]
      const addressConfirmation = await confirm(address)
      const injectiveAddress = getInjectiveAddress(address)

      walletStore.$patch({
        address,
        addressConfirmation,
        addresses,
        injectiveAddress
      })

      await walletStore.onConnect()
    },

    async connectMetamask() {
      const appStore = useAppStore()
      const walletStore = useWalletStore()

      await appStore.validate()
      await walletStore.connectWallet(Wallet.Metamask)

      const addresses = await getAddresses()
      const [address] = addresses
      const addressConfirmation = await confirm(address)
      const injectiveAddress = getInjectiveAddress(address)

      walletStore.$patch({
        address,
        addressConfirmation,
        addresses,
        injectiveAddress
      })

      await walletStore.onConnect()
    },

    async connectWalletConnect() {
      const appStore = useAppStore()
      const walletStore = useWalletStore()

      await appStore.validate()
      await walletStore.connectWallet(Wallet.WalletConnect)

      const addresses = await getAddresses()
      const [address] = addresses
      const addressConfirmation = await confirm(address)
      const injectiveAddress = getInjectiveAddress(address)

      walletStore.$patch({
        address,
        addressConfirmation,
        addresses,
        injectiveAddress
      })

      await walletStore.onConnect()
    },

    async connectKeplr() {
      const appStore = useAppStore()
      const walletStore = useWalletStore()

      await appStore.validate()
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

      await appStore.validate()
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

      await appStore.validate()
      await walletStore.connectWallet(Wallet.Cosmostation)

      const injectiveAddresses = await getAddresses()
      const [injectiveAddress] = injectiveAddresses
      const addressConfirmation = await confirm(injectiveAddress)
      const ethereumAddress = getEthereumAddress(injectiveAddress)

      walletStore.$patch({
        addressConfirmation,
        injectiveAddress,
        address: ethereumAddress,
        addresses: injectiveAddresses
      })

      await walletStore.onConnect()
    },

    async connectTorus() {
      const appStore = useAppStore()
      const walletStore = useWalletStore()

      await appStore.validate()
      await walletStore.connectWallet(Wallet.Torus)

      const addresses = await getAddresses()
      const [address] = addresses
      const addressConfirmation = await confirm(address)
      const injectiveAddress = getInjectiveAddress(address)

      walletStore.$patch({
        address,
        addresses,
        addressConfirmation,
        injectiveAddress
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
      const { wallet, injectiveAddress, address } = useWalletStore()
      const { ethereumChainId, chainId } = useAppStore()
      const { hasEnoughInjForGas } = useBankStore()

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
      const activityStore = useActivityStore()
      const bankStore = useBankStore()
      const derivativeStore = useDerivativeStore()
      const positionStore = usePositionStore()
      const referralStore = useReferralStore()
      const spotStore = useSpotStore()
      const tokenStore = useTokenStore()
      const walletStore = useWalletStore()

      await walletStrategy.disconnectWallet()

      accountStore.reset()
      walletStore.reset()
      derivativeStore.resetSubaccount()
      spotStore.resetSubaccount()

      activityStore.$reset()
      bankStore.$reset()
      positionStore.$reset()
      referralStore.$reset()
      tokenStore.$reset()
    },

    reset() {
      const walletStore = useWalletStore()

      const initialState = initialStateFactory()

      walletStore.$patch({
        address: initialState.address,
        addresses: initialState.addresses,
        injectiveAddress: initialState.injectiveAddress,
        addressConfirmation: initialState.addressConfirmation
      })
    }
  }
})
