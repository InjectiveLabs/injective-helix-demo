import { defineStore } from 'pinia'
import {
  ErrorType,
  WalletException,
  GeneralException,
  UnspecifiedErrorCode
} from '@injectivelabs/exceptions'
import { Wallet } from '@injectivelabs/wallet-ts'
import { walletStrategy } from '@shared/wallet/wallet-strategy'
import { blacklistedAddresses } from '@/app/json'
import { TRADING_MESSAGES } from '@/app/data/trade'
import { isCountryRestricted } from '@/app/data/geoip'
import { Modal } from '@/types'

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

    async connectAddressOrPrivatekey({
      wallet,
      addressOrPk
    }: {
      wallet?: Wallet
      addressOrPk: string
    }) {
      const SharedWalletStore = useSharedWalletStore()

      if (!wallet) {
        await SharedWalletStore.connectAddress(addressOrPk)

        return
      }

      if (wallet === Wallet.PrivateKey) {
        await SharedWalletStore.connectPrivateKey(addressOrPk)
      }
    },

    async connect({ wallet, address }: { wallet: Wallet; address?: string }) {
      const modalStore = useSharedModalStore()
      const walletStore = useWalletStore()
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

      accountStore.updateSubaccount(sharedWalletStore.defaultSubaccountId || '')
      modalStore.closeModal(Modal.Connect)

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
          walletStore.disconnect()

          throw new WalletException(
            new Error('Connected account address is restricted.'),
            {
              code: UnspecifiedErrorCode,
              type: ErrorType.WalletError
            }
          )
        }
      }
    },

    async validate() {
      const sharedGeoStore = useSharedGeoStore()
      const sharedWalletStore = useSharedWalletStore()

      const isAutoSignEnabled = !!sharedWalletStore.isAutoSignEnabled

      await sharedGeoStore.fetchVpnLocation()

      if (isCountryRestricted(sharedGeoStore.country)) {
        throw new GeneralException(
          new Error('Helix is currently not available in your region')
        )
      }

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
      const leaderboardStore = useLeaderboardStore()
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
      leaderboardStore.$patch({
        pnlLeaderboard: {
          ...leaderboardStore.pnlLeaderboard,
          accountRow: undefined
        },
        competitionLeaderboard: {
          ...leaderboardStore.competitionLeaderboard,
          accountRow: undefined
        }
      })
    },

    async signArbitraryData(address: string, message: string) {
      const sharedWalletStore = useSharedWalletStore()

      if (sharedWalletStore.wallet === Wallet.Magic) {
        return await walletStrategy.signEip712TypedData(
          message,
          sharedWalletStore.address
        )
      }

      return await walletStrategy.signArbitrary(address, message)
    }
  }
})
