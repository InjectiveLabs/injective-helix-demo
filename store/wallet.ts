import { defineStore } from 'pinia'
import { faucetService } from '@shared/Service'
import { Wallet } from '@injectivelabs/wallet-base'
import { DEFAULT_BLOCK_TIMEOUT_HEIGHT } from '@injectivelabs/utils'
import { walletStrategy, msgBroadcaster } from '@shared/WalletService'
import {
  ErrorType,
  WalletException,
  GeneralException,
  UnspecifiedErrorCode
} from '@injectivelabs/exceptions'
import { TRADING_MESSAGES } from '@/app/data/trade'
import { isCountryRestricted } from '@/app/data/geoip'
import { traceUserDetails } from '@/app/services/tracer'
import { Modal } from '@/types'

type WalletStoreState = {}

const initialStateFactory = (): WalletStoreState => ({})

export const useWalletStore = defineStore('wallet', {
  state: (): WalletStoreState => initialStateFactory(),
  getters: {},

  actions: {
    async init() {
      const sharedWalletStore = useSharedWalletStore()
      const sharedGeoStore = useSharedGeoStore()

      if (!sharedWalletStore.wallet) {
        return
      }

      await sharedWalletStore.init()

      await traceUserDetails({
        address: sharedWalletStore.address,
        wallet: sharedWalletStore.wallet,
        geoContinent: sharedGeoStore.geoContinent,
        geoCountry: sharedGeoStore.geoCountry,
        ipAddress: sharedGeoStore.ipAddress,
        browserCountry: sharedGeoStore.browserCountry,
        vpnDetected: sharedGeoStore.vpnDetected,
        vpnCheckedTimestamp: sharedGeoStore.vpnCheckedTimestamp
      })
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
      const walletStore = useWalletStore()
      const accountStore = useAccountStore()
      const jsonStore = useSharedJsonStore()
      const modalStore = useSharedModalStore()
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

      if (
        [Wallet.TrezorBip32, Wallet.TrezorBip44].includes(wallet) &&
        address
      ) {
        await sharedWalletStore.connectTrezor({ wallet, address })
      }

      if (wallet === Wallet.BitGet) {
        await sharedWalletStore.connectBitGet()
      }

      if (wallet === Wallet.OkxWallet) {
        await sharedWalletStore.connectOkxWallet()
      }

      if (wallet === Wallet.WalletConnect) {
        await sharedWalletStore.connectWalletConnect()
        await msgBroadcaster.setOptions({
          txTimeout: DEFAULT_BLOCK_TIMEOUT_HEIGHT * 5
        })
      }

      if (wallet === Wallet.Rainbow) {
        await sharedWalletStore.connectRainbow()
      }

      accountStore.updateSubaccount(sharedWalletStore.defaultSubaccountId || '')
      modalStore.closeModal(Modal.Connect)

      if (sharedWalletStore.isUserConnected) {
        const someAddressInWalletIsBlackListed =
          sharedWalletStore.addresses.some(
            (address) =>
              jsonStore.blacklistedAddresses.find(
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

    async validateGeo() {
      const sharedGeoStore = useSharedGeoStore()

      await sharedGeoStore.fetchVpnLocation()

      if (isCountryRestricted(sharedGeoStore.country)) {
        throw new GeneralException(
          new Error('This action is not allowed in your country')
        )
      }
    },

    async validateGas() {
      const accountStore = useAccountStore()
      const sharedWalletStore = useSharedWalletStore()

      if (!sharedWalletStore.isEip712 || accountStore.hasSufficientGas) {
        return
      }

      await faucetService.fundInjectiveAddress(
        sharedWalletStore.injectiveAddress
      )
      await accountStore.fetchSignerInjBalance()

      if (accountStore.hasSufficientGas) {
        return
      }

      throw new GeneralException(
        new Error(
          'Due to extremely high usage, gas-free transactions are currently unavailable. You need INJ to cover the transaction.'
        )
      )
    },

    async validate() {
      const walletStore = useWalletStore()
      const sharedWalletStore = useSharedWalletStore()

      await sharedWalletStore.fetchWeb3GatewayStatus()
      await walletStore.validateGas()

      const isAutoSignEnabled = !!sharedWalletStore.isAutoSignEnabled

      await sharedWalletStore.validateAndQueue()

      if (isAutoSignEnabled) {
        await sharedWalletStore.validateAutoSign(TRADING_MESSAGES)
      }
    },

    async disconnect() {
      const appStore = useAppStore()
      const spotStore = useSpotStore()
      const authZStore = useAuthZStore()
      const pointsStore = usePointsStore()
      const accountStore = useAccountStore()
      const exchangeStore = useExchangeStore()
      const activityStore = useActivityStore()
      const positionStore = usePositionStore()
      const campaignStore = useCampaignStore()
      const referralStore = useReferralStore()
      const derivativeStore = useDerivativeStore()
      const leaderboardStore = useLeaderboardStore()
      const gridStrategyStore = useGridStrategyStore()
      const sharedWalletStore = useSharedWalletStore()

      if (sharedWalletStore.wallet === Wallet.WalletConnect) {
        await msgBroadcaster.setOptions({
          txTimeout: DEFAULT_BLOCK_TIMEOUT_HEIGHT
        })
      }

      appStore.reset()
      pointsStore.reset()
      sharedWalletStore.logout()
      spotStore.resetSubaccount()
      derivativeStore.resetSubaccount()
      gridStrategyStore.cancelGridStrategiesStream()

      exchangeStore.$patch({ feeDiscountAccountInfo: undefined })
      accountStore.$reset()
      activityStore.$reset()
      positionStore.$reset()
      referralStore.$reset()
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

      if ([Wallet.Magic, Wallet.Turnkey].includes(sharedWalletStore.wallet)) {
        return await walletStrategy.signEip712TypedData(
          message,
          sharedWalletStore.address
        )
      }

      return await walletStrategy.signArbitrary(address, message)
    }
  }
})
