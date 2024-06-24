import { defineStore } from 'pinia'
import { Wallet } from '@injectivelabs/wallet-ts'
import { mixpanelAnalytics } from '@/app/providers/mixpanel'
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

      if (sharedWalletStore.isUserConnected) {
        mixpanelAnalytics.trackWalletAddress({
          injectiveAddress: sharedWalletStore.injectiveAddress
        })
      }

      await sharedWalletStore.init()
    },

    async connect({ wallet, address }: { wallet: Wallet; address?: string }) {
      const walletStore = useSharedWalletStore()
      const accountStore = useAccountStore()

      // walletTracker.walletSelected({ wallet })

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

      accountStore.$patch({
        subaccountId: walletStore.defaultSubaccountId
      })
    },

    async validate() {
      const walletStore = useSharedWalletStore()

      const isAutoSignEnabled = !!walletStore.isAutoSignEnabled

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

    // Todo when connectivg wallet, reset account defaultSubaccountId
    // TODO When Connecting AuthZ, reset account defaultSubaccountId
    // TODO When Reseting AuthZ, reset account defaultSubaccountId
  }
})
