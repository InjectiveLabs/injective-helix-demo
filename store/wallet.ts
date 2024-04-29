import { defineStore } from 'pinia'
import { isCosmosWallet, isEthWallet, Wallet } from '@injectivelabs/wallet-ts'
import {
  getEthereumAddress,
  getInjectiveAddress,
  getDefaultSubaccountId,
  PrivateKey,
  MsgGrant
} from '@injectivelabs/sdk-ts'
import { CosmosChainId, MsgType } from '@injectivelabs/ts-types'
import { GeneralException } from '@injectivelabs/exceptions'
import { confirm, connect, getAddresses } from '@/app/services/wallet'
import { validateMetamask, isMetamaskInstalled } from '@/app/services/metamask'
import { walletStrategy } from '@/app/wallet-strategy'
import { mixpanelAnalytics } from '@/app/providers/mixpanel'
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
import { isOkxWalletInstalled } from '@/app/services/okx'
import { isBitGetInstalled } from '@/app/services/bitget'
import { isPhantomInstalled } from '@/app/services/phantom'
import { msgBroadcastClient } from '~/app/Services'

type WalletStoreState = {
  wallet: Wallet

  address: string
  addresses: string[]
  injectiveAddress: string
  defaultSubaccountId: string
  addressConfirmation: string

  trustWalletInstalled: boolean
  metamaskInstalled: boolean
  phantomInstalled: boolean
  okxWalletInstalled: boolean
  bitGetInstalled: boolean

  walletConnectStatus: WalletConnectStatus

  authZ: {
    address: string
    direction: GrantDirection
    injectiveAddress: string
    defaultSubaccountId: string
  }

  autoSign?: {
    pk: string
    injAddress: string
    expiration: number
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
  okxWalletInstalled: false,
  phantomInstalled: false,
  bitGetInstalled: false,

  walletConnectStatus: WalletConnectStatus.idle,

  authZ: {
    address: '',
    direction: GrantDirection.Grantee,
    injectiveAddress: '',
    defaultSubaccountId: ''
  },

  autoSign: undefined
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

      walletStore.initAutoSign()
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

    onConnect() {
      // const accountStore = useAccountStore()
      const walletStore = useWalletStore()
      const accountStore = useAccountStore()
      // const exchangeStore = useExchangeStore()

      useEventBus(BusEvents.WalletConnected).emit()

      // TODO
      // await accountStore.fetchAccountPortfolioBalances()

      // mixpanelAnalytics.trackLogin({
      //   wallet: walletStore.wallet,
      //   injectiveAddress: walletStore.injectiveAddress,
      //   tierLevel: exchangeStore.feeDiscountAccountInfo?.tierLevel || 0
      // })

      accountStore.$patch({
        subaccountId: walletStore.defaultSubaccountId
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

    async isOkxWalletInstalled() {
      const walletStore = useWalletStore()

      walletStore.$patch({
        okxWalletInstalled: await isOkxWalletInstalled()
      })
    },

    async isPhantomInstalled() {
      const walletStore = useWalletStore()

      walletStore.$patch({
        phantomInstalled: await isPhantomInstalled()
      })
    },

    async isBitGetInstalled() {
      const walletStore = useWalletStore()

      walletStore.$patch({
        bitGetInstalled: await isBitGetInstalled()
      })
    },

    async getHWAddresses(wallet: Wallet) {
      const walletStore = useWalletStore()

      if (walletStore.addresses.length === 0 || walletStore.wallet !== wallet) {
        await connect({ wallet })

        const addresses = await getAddresses()
        const injectiveAddresses = addresses.map(getInjectiveAddress)

        walletStore.$patch({
          wallet,
          addresses: injectiveAddresses
        })
      } else {
        const addresses = await getAddresses()
        const injectiveAddresses = addresses.map(getInjectiveAddress)

        walletStore.$patch({
          wallet,
          addresses: [...walletStore.addresses, ...injectiveAddresses]
        })
      }
    },

    async connectLedger(address: string) {
      const walletStore = useWalletStore()

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

    async connectLedgerLegacy(address: string) {
      const walletStore = useWalletStore()

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

    async connectTrezor(address: string) {
      const walletStore = useWalletStore()

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
      const walletStore = useWalletStore()

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
      const walletStore = useWalletStore()

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

    async connectOkxWallet() {
      const walletStore = useWalletStore()

      await walletStore.connectWallet(Wallet.OkxWallet)

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

    async connectBitGet() {
      const walletStore = useWalletStore()

      await walletStore.connectWallet(Wallet.BitGet)

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

    async connectPhantom() {
      const walletStore = useWalletStore()

      await walletStore.connectWallet(Wallet.Phantom)

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
      const walletStore = useWalletStore()

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
      const walletStore = useWalletStore()

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
      const walletStore = useWalletStore()

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

    async connectNinji() {
      const walletStore = useWalletStore()

      await walletStore.connectWallet(Wallet.Ninji)

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
      const walletStore = useWalletStore()

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
      const walletStore = useWalletStore()

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
      const walletStore = useWalletStore()

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

    async disconnect() {
      const spotStore = useSpotStore()
      const authZStore = useAuthZStore()
      const walletStore = useWalletStore()
      const accountStore = useAccountStore()
      const exchangeStore = useExchangeStore()
      const activityStore = useActivityStore()
      const positionStore = usePositionStore()
      const campaignStore = useCampaignStore()
      const derivativeStore = useDerivativeStore()
      const gridStrategyStore = useGridStrategyStore()

      await walletStrategy.disconnect()
      mixpanelAnalytics.trackLogout()

      walletStore.reset()
      spotStore.resetSubaccount()
      derivativeStore.resetSubaccount()

      exchangeStore.$patch({ feeDiscountAccountInfo: undefined })
      accountStore.$reset()
      activityStore.$reset()
      positionStore.$reset()
      authZStore.$reset()
      campaignStore.reset()
      gridStrategyStore.$patch({ strategies: [] })
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
    },

    async connectAutoSign() {
      const walletStore = useWalletStore()

      const { privateKey } = PrivateKey.generate()
      const pk = privateKey.toPrivateKeyHex()
      const injAddress = privateKey.toBech32()

      const authZMsgs = Object.values(MsgType).map((messageType) =>
        MsgGrant.fromJSON({
          messageType: `/${messageType}`,
          grantee: injAddress,
          granter: walletStore.injectiveAddress,
          expiryInSeconds: Date.now() / 1000 + 60 * 60
        })
      )

      await msgBroadcastClient.broadcastWithFeeDelegation({
        msgs: authZMsgs,
        injectiveAddress: walletStore.injectiveAddress
      })

      walletStore.$patch({
        autoSign: {
          injAddress,
          pk,
          expiration: Date.now() + 1000 * 60 * 60
        }
      })

      walletStore.initAutoSign()
    },

    initAutoSign() {
      const walletStore = useWalletStore()

      if (walletStore.autoSign) {
        walletStrategy.setWallet(Wallet.PrivateKey)
        walletStrategy.setOptions({ privateKey: walletStore.autoSign.pk })
      }
    }
  }
})
