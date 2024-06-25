import { defineStore } from 'pinia'
import { Wallet } from '@injectivelabs/wallet-ts'
import { TRADING_MESSAGES } from '@/app/data/trade'

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
      const walletStore = useSharedWalletStore()
      const accountStore = useAccountStore()

      if (wallet === Wallet.Metamask) {
        await walletStore.connectMetamask()
      }

      if (wallet === Wallet.Keplr) {
        await walletStore.connectKeplr()
      }

      if (wallet === Wallet.Leap) {
        await walletStore.connectLeap()
      }

      if ([Wallet.Ledger, Wallet.LedgerLegacy].includes(wallet) && address) {
        await walletStore.connectLedger({
          wallet,
          address
        })
      }

      if (wallet === Wallet.Phantom) {
        await walletStore.connectPhantomWallet()
      }

      if (wallet === Wallet.Ninji) {
        await walletStore.connectNinji()
      }

      if (wallet === Wallet.Cosmostation) {
        await walletStore.connectCosmosStation()
      }

      if (wallet === Wallet.Trezor && address) {
        await walletStore.connectTrezor(address)
      }

      if (wallet === Wallet.BitGet) {
        await walletStore.connectBitGet()
      }

      if (wallet === Wallet.OkxWallet) {
        await walletStore.connectOkxWallet()
      }

      if (wallet === Wallet.Torus) {
        await walletStore.connectTorus()
      }

      if (wallet === Wallet.WalletConnect) {
        await walletStore.connectWalletConnect()
      }

      accountStore.$patch({
        subaccountId: walletStore.defaultSubaccountId
      })
    },

    async validate() {
      const appStore = useAppStore()
      const walletStore = useSharedWalletStore()

      const isAutoSignEnabled = !!walletStore.isAutoSignEnabled

      await appStore.validateGeoIp()
      await walletStore.validateAndQueue()

      if (isAutoSignEnabled) {
        await walletStore.validateAutoSign(TRADING_MESSAGES)
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
