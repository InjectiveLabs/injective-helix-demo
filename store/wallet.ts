import { defineStore } from 'pinia'
import {
  ErrorType,
  WalletException,
  UnspecifiedErrorCode
} from '@injectivelabs/exceptions'
import { Wallet } from '@injectivelabs/wallet-ts'
import { TRADING_MESSAGES } from '@/app/data/trade'
import blacklistedAddresses from '@/app/data/ofac.json'

type WalletStoreState = {}

const initialStateFactory = (): WalletStoreState => ({})

export const useWalletStore = defineStore('wallet', {
  state: (): WalletStoreState => initialStateFactory(),
  getters: {},
  actions: {
    async init() {
      const sharedWalletStore = useSharedWalletStore()

      if (!sharedWalletStore.wallet) {
        return
      }

      await sharedWalletStore.init()
    },

    async connect({ wallet, address }: { wallet: Wallet; address?: string }) {
      const accountStore = useAccountStore()
      const sharedWalletStore = useSharedWalletStore()

      if (wallet === Wallet.Metamask) {
        await sharedWalletStore.connectMetamask()
      }

      if (wallet === Wallet.Keplr) {
        await sharedWalletStore.connectKeplr()
      }

      if (wallet === Wallet.Leap) {
        await sharedWalletStore.connectLeap()
      }

      if ([Wallet.Ledger, Wallet.LedgerLegacy].includes(wallet) && address) {
        await sharedWalletStore.connectLedger({
          wallet,
          address
        })
      }

      if (wallet === Wallet.Phantom) {
        await sharedWalletStore.connectPhantomWallet()
      }

      if (wallet === Wallet.Ninji) {
        await sharedWalletStore.connectNinji()
      }

      if (wallet === Wallet.Cosmostation) {
        await sharedWalletStore.connectCosmosStation()
      }

      if (wallet === Wallet.Trezor && address) {
        await sharedWalletStore.connectTrezor(address)
      }

      if (wallet === Wallet.BitGet) {
        await sharedWalletStore.connectBitGet()
      }

      if (wallet === Wallet.OkxWallet) {
        await sharedWalletStore.connectOkxWallet()
      }

      if (wallet === Wallet.Torus) {
        await sharedWalletStore.connectTorus()
      }

      if (wallet === Wallet.WalletConnect) {
        await sharedWalletStore.connectWalletConnect()
      }

      accountStore.$patch({
        subaccountId: sharedWalletStore.defaultSubaccountId
      })

      if (sharedWalletStore.isUserConnected) {
        const someAddressInWalletIsBlackListed =
          sharedWalletStore.addresses.some(
            (address) =>
              blacklistedAddresses.find(
                (blacklistedAddress) =>
                  blacklistedAddress.toLowerCase() === address.toLowerCase()
              ) !== undefined
          )

        if (someAddressInWalletIsBlackListed) {
          throw new WalletException(
            new Error('This wallet address is restricted.'),
            {
              code: UnspecifiedErrorCode,
              type: ErrorType.WalletError
            }
          )
        }
      }
    },

    async validate() {
      const appStore = useAppStore()
      const sharedWalletStore = useSharedWalletStore()

      const isAutoSignEnabled = !!sharedWalletStore.isAutoSignEnabled

      await appStore.validateGeoIp()
      await sharedWalletStore.validateAndQueue()

      if (isAutoSignEnabled) {
        await sharedWalletStore.validateAutoSign(TRADING_MESSAGES)
      }
    },

    async disconnect() {
      const appStore = useAppStore()
      const spotStore = useSpotStore()
      const authZStore = useAuthZStore()
      const accountStore = useAccountStore()
      const exchangeStore = useExchangeStore()
      const activityStore = useActivityStore()
      const positionStore = usePositionStore()
      const campaignStore = useCampaignStore()
      const derivativeStore = useDerivativeStore()
      const gridStrategyStore = useGridStrategyStore()
      const sharedWalletStore = useSharedWalletStore()

      await sharedWalletStore.logout()

      appStore.reset()
      sharedWalletStore.logout()
      spotStore.resetSubaccount()
      derivativeStore.resetSubaccount()

      exchangeStore.$patch({ feeDiscountAccountInfo: undefined })
      accountStore.$reset()
      activityStore.$reset()
      positionStore.$reset()
      authZStore.$reset()
      campaignStore.reset()
      gridStrategyStore.$patch({ strategies: [] })
    }
  }
})
