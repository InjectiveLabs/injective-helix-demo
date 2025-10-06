import { defineStore } from 'pinia'
import { StatusType } from '@injectivelabs/utils'
import { GeneralException } from '@injectivelabs/exceptions'
import { Wallet, isEvmWallet, isCosmosWallet } from '@injectivelabs/wallet-base'
import {
  submitTurnkeyOTP,
  initTurnkeyGoogle,
  getEmailTurnkeyOTP,
  connectTurnkeyGoogle
} from './turnkey'
import {
  getAddresses,
  walletStrategy,
  msgBroadcaster,
  validateEvmWallet,
  validateCosmosWallet,
  autoSignWalletStrategy,
  autoSignMsgBroadcaster
} from '../../WalletService'
import {
  checkIsBitGetInstalled,
  checkIsRainbowInstalled,
  checkIsMetamaskInstalled,
  checkIsOkxWalletInstalled,
  checkIsTrustWalletInstalled,
  checkIsRabbyWalletInstalled,
  checkIsPhantomWalletInstalled
} from './extensions'
import {
  IS_HELIX,
  IS_DEVNET,
  MSG_TYPE_URL_MSG_EXECUTE_CONTRACT
} from '../../utils/constant'
import {
  MsgGrant,
  PrivateKey,
  msgsOrMsgExecMsgs,
  getEthereumAddress,
  getInjectiveAddress,
  getDefaultSubaccountId,
  MsgGrantWithAuthorization,
  getGenericAuthorizationFromMessageType
} from '@injectivelabs/sdk-ts'
import { web3GatewayService } from '../../Service'
import { connectMagic, queryMagicExistingUser } from './magic'
import { confirmCosmosWalletAddress } from './../../wallet/cosmos'
import { EventBus, GrantDirection, WalletConnectStatus } from '../../types'
import type { Wallet as WalletType } from '@injectivelabs/wallet-base'
import type { MsgBroadcasterTxOptions } from '@injectivelabs/wallet-core'
import type { Msgs, ContractExecutionCompatAuthz } from '@injectivelabs/sdk-ts'
import type { AutoSign } from '../../types'

type WalletStoreState = {
  wallet: Wallet
  email?: string
  isDev: boolean
  address: string
  session: string
  isEip712: boolean
  privateKey: string
  addresses: string[]
  autoSign?: AutoSign
  hwAddresses: string[]
  queueStatus: StatusType
  rabbyInstalled: boolean
  injectiveAddress: string
  bitGetInstalled: boolean
  rainbowInstalled: boolean
  phantomInstalled: boolean
  metamaskInstalled: boolean
  addressConfirmation: string
  okxWalletInstalled: boolean
  trustWalletInstalled: boolean
  turnkeyInjectiveAddress: string

  walletConnectStatus: WalletConnectStatus
  authZ: {
    address: string
    injectiveAddress: string
    direction: GrantDirection
    defaultSubaccountId: string
  }
}

const initialStateFactory = (): WalletStoreState => ({
  email: '',
  address: '',
  session: '',
  isDev: false,
  addresses: [],
  privateKey: '',
  hwAddresses: [],
  isEip712: true,
  injectiveAddress: '',
  bitGetInstalled: false,
  addressConfirmation: '',
  wallet: Wallet.Metamask,
  rabbyInstalled: false,
  rainbowInstalled: false,
  phantomInstalled: false,
  metamaskInstalled: false,
  okxWalletInstalled: false,
  trustWalletInstalled: false,
  turnkeyInjectiveAddress: '',
  queueStatus: StatusType.Idle,

  walletConnectStatus: WalletConnectStatus.idle,

  autoSign: {
    duration: 0,
    expiration: 0,
    privateKey: '',
    injectiveAddress: ''
  },

  authZ: {
    address: '',
    injectiveAddress: '',
    defaultSubaccountId: '',
    direction: GrantDirection.Grantee
  }
})

export const useSharedWalletStore = defineStore('sharedWallet', {
  state: (): WalletStoreState => initialStateFactory(),
  getters: {
    authZOrAddress: (state) => {
      return state.authZ.address || state.address
    },

    isWalletExemptFromGasFee: (state) => {
      return !isCosmosWallet(state.wallet) && !IS_DEVNET
    },

    authZOrInjectiveAddress: (state) => {
      return state.authZ.injectiveAddress || state.injectiveAddress
    },

    defaultSubaccountId: (state) => {
      if (!state.injectiveAddress) {
        return undefined
      }

      return getDefaultSubaccountId(state.injectiveAddress)
    },

    authZOrDefaultSubaccountId: (state) => {
      return (
        state.authZ.defaultSubaccountId ||
        (state.injectiveAddress &&
          getDefaultSubaccountId(state.injectiveAddress)) ||
        ''
      )
    },

    isAutoSignEnabled: (state) => {
      if (!state.autoSign) {
        return false
      }

      if (!state.autoSign.injectiveAddress || !state.autoSign.privateKey) {
        return false
      }

      if (!state.autoSign.expiration || !state.autoSign.duration) {
        return false
      }

      return true
    },

    isUserConnected: (state) => {
      const addressConnectedAndConfirmed =
        !!state.address && !!state.addressConfirmation && !!state.session
      const hasAddresses = state.addresses.length > 0

      return (
        state.walletConnectStatus !== WalletConnectStatus.connecting &&
        hasAddresses &&
        addressConnectedAndConfirmed &&
        !!state.injectiveAddress
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
    }
  },
  actions: {
    checkIsBitGetInstalled,
    checkIsRainbowInstalled,
    checkIsMetamaskInstalled,
    checkIsOkxWalletInstalled,
    checkIsTrustWalletInstalled,
    checkIsRabbyWalletInstalled,
    checkIsPhantomWalletInstalled,

    connectMagic,
    submitTurnkeyOTP,
    initTurnkeyGoogle,
    getEmailTurnkeyOTP,
    connectTurnkeyGoogle,
    queryMagicExistingUser,

    async validateAndQueue() {
      const sharedWalletStore = useSharedWalletStore()

      await sharedWalletStore.validate()

      sharedWalletStore.queue()
    },

    async disconnectAutoSign() {
      const walletStore = useSharedWalletStore()

      walletStore.$patch({
        autoSign: undefined
      })

      await autoSignWalletStrategy.disconnect()
    },

    onConnect() {
      const modalStore = useSharedModalStore()
      const walletStore = useSharedWalletStore()

      modalStore.closeAll()

      walletStore.$patch({
        walletConnectStatus: WalletConnectStatus.connected
      })

      useEventBus(EventBus.WalletConnected).emit()
    },

    resetAuthZ() {
      const walletStore = useSharedWalletStore()

      walletStore.$patch({
        authZ: {
          address: '',
          injectiveAddress: '',
          defaultSubaccountId: '',
          direction: GrantDirection.Granter
        }
      })

      walletStore.onConnect()
    },

    queue() {
      const walletStore = useSharedWalletStore()

      if (walletStore.queueStatus === StatusType.Loading) {
        throw new GeneralException(new Error('You have a pending transaction.'))
      } else {
        walletStore.$patch({
          queueStatus: StatusType.Loading
        })
      }
    },

    connectAuthZ(
      injectiveAddress: string,
      direction: GrantDirection = GrantDirection.Granter
    ) {
      const walletStore = useSharedWalletStore()

      walletStore.$patch({
        authZ: {
          direction,
          injectiveAddress,
          address: getEthereumAddress(injectiveAddress),
          defaultSubaccountId: getDefaultSubaccountId(injectiveAddress)
        }
      })

      walletStore.onConnect()
    },

    async init() {
      const walletStore = useSharedWalletStore()

      walletStore.walletConnectStatus = WalletConnectStatus.idle

      await walletStrategy.setWallet(walletStore.wallet)

      if (
        walletStore.wallet === Wallet.Magic &&
        (!walletStore.isUserConnected || walletStore.turnkeyInjectiveAddress)
      ) {
        await walletStore.connectMagic()
      }

      if (
        walletStore.isUserConnected &&
        walletStore.wallet === Wallet.Turnkey
      ) {
        // refresh session
        await walletStrategy.getSessionOrConfirm()
      }

      if (walletStore.autoSign) {
        autoSignWalletStrategy.setMetadata({
          privateKey: {
            privateKey: walletStore.autoSign.privateKey as string
          }
        })
      }

      if (walletStore.privateKey) {
        walletStore.connectWallet(Wallet.PrivateKey, {
          privateKey: walletStore.privateKey
        })
      }
    },

    async validate() {
      const walletStore = useSharedWalletStore()

      if (walletStore.autoSign) {
        return
      }

      if (
        ([
          Wallet.BitGet,
          Wallet.Phantom,
          Wallet.Metamask,
          Wallet.OkxWallet,
          Wallet.TrustWallet
        ] as WalletType[]).includes(walletStore.wallet)
      ) {
        await validateEvmWallet({
          wallet: walletStore.wallet,
          address: walletStore.address
        })
      }

      if (
        ([
          Wallet.Leap,
          Wallet.Ninji,
          Wallet.Keplr,
          Wallet.OWallet,
          Wallet.Cosmostation
        ] as WalletType[]).includes(walletStore.wallet)
      ) {
        await validateCosmosWallet({
          wallet: walletStore.wallet,
          address: walletStore.injectiveAddress
        })
      }
    },

    async connectWallet(wallet: Wallet, options?: { privateKey: string }) {
      const walletStore = useSharedWalletStore()

      /**
       * We should disconnect only if there are no hardware wallets connected
       * and we still haven't fetched any addresses and we've already connected
       * so there is no need to disconnect
       */
      if (walletStore.hwAddresses.length === 0) {
        await walletStrategy.disconnect()
      }

      await walletStrategy.setWallet(wallet)

      if (options?.privateKey) {
        walletStrategy.setMetadata({
          privateKey: {
            privateKey: options.privateKey
          }
        })
      }

      walletStore.$patch({
        wallet
      })

      if (wallet !== Wallet.PrivateKey) {
        walletStore.$patch({
          walletConnectStatus: WalletConnectStatus.connecting
        })
      }
    },

    async logout() {
      const walletStore = useSharedWalletStore()

      walletStore.walletConnectStatus = WalletConnectStatus.disconnecting

      await walletStrategy.disconnect()

      walletStore.$patch({
        ...initialStateFactory(),
        autoSign: undefined,
        turnkeyInjectiveAddress: '',
        queueStatus: StatusType.Idle,
        rabbyInstalled: walletStore.rabbyInstalled,
        bitGetInstalled: walletStore.bitGetInstalled,
        phantomInstalled: walletStore.phantomInstalled,
        metamaskInstalled: walletStore.metamaskInstalled,
        okxWalletInstalled: walletStore.okxWalletInstalled,
        walletConnectStatus: WalletConnectStatus.disconnected,
        trustWalletInstalled: walletStore.trustWalletInstalled,
        authZ: {
          address: '',
          injectiveAddress: '',
          defaultSubaccountId: '',
          direction: GrantDirection.Granter
        }
      })

      useEventBus(EventBus.WalletDisconnected).emit()
    },

    async getHWAddresses(wallet: Wallet) {
      const walletStore = useSharedWalletStore()

      if (
        walletStore.hwAddresses.length === 0 ||
        walletStore.wallet !== wallet
      ) {
        walletStrategy.disconnect()
        walletStrategy.setWallet(wallet)

        walletStore.$patch({
          wallet
        })

        const addresses = await getAddresses()

        const injectiveAddresses = isEvmWallet(wallet)
          ? addresses.map(getInjectiveAddress)
          : addresses

        walletStore.$patch({
          hwAddresses: injectiveAddresses
        })
      } else {
        const addresses = await getAddresses()
        const injectiveAddresses = isEvmWallet(wallet)
          ? addresses.map(getInjectiveAddress)
          : addresses

        walletStore.$patch({
          hwAddresses: [...walletStore.hwAddresses, ...injectiveAddresses]
        })
      }
    },

    async broadcastMessages(messages: Msgs | Msgs[], memo?: string) {
      const walletStore = useSharedWalletStore()
      const broadcastOptions = await walletStore.prepareBroadcastMessages(
        messages,
        memo
      )

      if (!broadcastOptions) {
        return
      }

      const msgs = Array.isArray(messages) ? messages : [messages]

      const hasMsgExecuteContract = msgs.some(
        (msg) =>
          JSON.parse(msg.toJSON())['@type'] ===
          MSG_TYPE_URL_MSG_EXECUTE_CONTRACT
      )

      if (
        walletStore.autoSign &&
        !hasMsgExecuteContract &&
        walletStore.isAutoSignEnabled
      ) {
        const response = await autoSignMsgBroadcaster.broadcastV2({
          memo,
          injectiveAddress: walletStore.autoSign.injectiveAddress,
          msgs: msgsOrMsgExecMsgs(msgs, walletStore.autoSign.injectiveAddress)
        })

        return response
      }

      const response = await msgBroadcaster.broadcast(broadcastOptions)

      return response
    },

    prepareBroadcastMessages(messages: Msgs | Msgs[], memo?: string) {
      const walletStore = useSharedWalletStore()
      const msgs = Array.isArray(messages) ? messages : [messages]

      if (!walletStore.isUserConnected) {
        return
      }

      let actualMessage

      if (walletStore.isAutoSignEnabled && walletStore.isAuthzWalletConnected) {
        // error because we don't support authz + auto-sign
        throw new GeneralException(
          new Error('Authz and auto-sign cannot be used together')
        )

        // TODO: uncomment this when we support authz + auto-sign
        // actualMessage = msgsOrMsgExecMsgs(
        //   msgsOrMsgExecMsgs(msgs, walletStore.injectiveAddress),
        //   walletStore.autoSign.injectiveAddress
        // )
      } else if (walletStore.isAuthzWalletConnected) {
        actualMessage = msgsOrMsgExecMsgs(msgs, walletStore.injectiveAddress)
      } else {
        actualMessage = msgs
      }

      const broadcastOptions = {
        memo,
        msgs: actualMessage,
        injectiveAddress: walletStore.injectiveAddress
      }

      return broadcastOptions
    },

    async broadcastWithFeeDelegation({
      memo,
      messages
    }: {
      memo?: string
      messages: Msgs | Msgs[]
    }) {
      const walletStore = useSharedWalletStore()
      const notificationStore = useSharedNotificationStore()

      const broadcastOptions = await walletStore.prepareBroadcastMessages(
        messages,
        memo
      )

      if (!broadcastOptions) {
        return
      }

      const msgs = Array.isArray(messages) ? messages : [messages]

      const hasMsgExecuteContract = msgs.some((msg) => {
        const parsedMsg = JSON.parse(msg.toJSON())

        const isMsgExec =
          parsedMsg['@type'] === MSG_TYPE_URL_MSG_EXECUTE_CONTRACT

        return isMsgExec
      })

      if (
        !walletStore.isEip712 &&
        walletStore.autoSign &&
        !hasMsgExecuteContract &&
        walletStore.isAutoSignEnabled
      ) {
        const msgExecMsgs = msgsOrMsgExecMsgs(
          msgs,
          walletStore.autoSign.injectiveAddress
        )

        const response =
          await autoSignMsgBroadcaster.broadcastWithFeeDelegation({
            memo,
            msgs: msgExecMsgs,
            injectiveAddress: walletStore.autoSign.injectiveAddress
          })

        if (IS_HELIX) {
          notificationStore.$patch({ txResponse: response })
          notificationStore.initTelemetry()
        }

        return response
      }

      const action = walletStore.isEip712
        ? (params: MsgBroadcasterTxOptions) =>
            msgBroadcaster.broadcastV2(params)
        : (params: MsgBroadcasterTxOptions) =>
            msgBroadcaster.broadcastWithFeeDelegation(params)

      const response = await action(broadcastOptions)

      if (IS_HELIX) {
        notificationStore.$patch({ txResponse: response })
        notificationStore.initTelemetry()
      }

      return response
    },

    async validateAutoSign(
      msgsType: string[] = [],
      contractExecutionCompatAuthz: ContractExecutionCompatAuthz[] = []
    ) {
      if (msgsType.length === 0 && contractExecutionCompatAuthz.length === 0) {
        throw new GeneralException(new Error('No messages provided'))
      }

      const walletStore = useSharedWalletStore()

      if (!walletStore.isAutoSignEnabled) {
        return
      }

      const autoSign = walletStore.autoSign as AutoSign
      const nowInSeconds = Math.floor(Date.now() / 1000)

      if (autoSign.expiration > nowInSeconds) {
        return
      }

      const expirationInSeconds = autoSign.duration || 3600

      const grantWithAuthorization = contractExecutionCompatAuthz.map(
        (authorization) =>
          MsgGrantWithAuthorization.fromJSON({
            authorization,
            grantee: autoSign.injectiveAddress,
            granter: walletStore.injectiveAddress,
            expiration: nowInSeconds + expirationInSeconds
          })
      )

      const authZMsgs = msgsType.map((messageType) =>
        MsgGrant.fromJSON({
          grantee: autoSign.injectiveAddress,
          granter: walletStore.injectiveAddress,
          expiration: nowInSeconds + expirationInSeconds,
          authorization: getGenericAuthorizationFromMessageType(messageType)
        })
      )

      await walletStore.connectWallet(walletStore.wallet)

      await walletStore.broadcastWithFeeDelegation({
        messages: [...authZMsgs, ...grantWithAuthorization]
      })

      walletStore.$patch((state) => {
        state.autoSign = {
          ...autoSign,
          expiration: expirationInSeconds
        }
      })
    },

    async connectAutoSign(
      msgsType: string[] = [],
      contractExecutionCompatAuthz: ContractExecutionCompatAuthz[] = []
    ) {
      if (msgsType.length === 0 && contractExecutionCompatAuthz.length === 0) {
        throw new GeneralException(new Error('No messages provided'))
      }

      const walletStore = useSharedWalletStore()

      const { privateKey } = PrivateKey.generate()
      const injectiveAddress = privateKey.toBech32()

      const nowInSeconds = Math.floor(Date.now() / 1000)
      const expirationInSeconds = 60 * 60 * 24 * 3 // 3 days

      const grantWithAuthorization = contractExecutionCompatAuthz.map(
        (authorization) =>
          MsgGrantWithAuthorization.fromJSON({
            authorization,
            grantee: injectiveAddress,
            granter: walletStore.injectiveAddress,
            expiration: nowInSeconds + expirationInSeconds
          })
      )

      const authZMsgs = msgsType.map((messageType) =>
        MsgGrant.fromJSON({
          grantee: injectiveAddress,
          granter: walletStore.injectiveAddress,
          expiration: nowInSeconds + expirationInSeconds,
          authorization: getGenericAuthorizationFromMessageType(messageType)
        })
      )

      await walletStore.broadcastWithFeeDelegation({
        messages: [...authZMsgs, ...grantWithAuthorization]
      })

      const autoSign = {
        injectiveAddress,
        duration: expirationInSeconds,
        privateKey: privateKey.toPrivateKeyHex(),
        expiration: nowInSeconds + expirationInSeconds
      }

      walletStore.$patch({
        autoSign
      })

      autoSignWalletStrategy.setMetadata({
        privateKey: {
          privateKey: autoSign.privateKey
        }
      })
    },

    async fetchWeb3GatewayStatus() {
      const walletStore = useSharedWalletStore()

      const status = await web3GatewayService.healthCheck()

      walletStore.$patch({
        isEip712: !status
      })
    },

    async connectTrustWallet() {
      const walletStore = useSharedWalletStore()

      await walletStore.connectWallet(Wallet.TrustWallet)

      const addresses = await getAddresses()
      const [address] = addresses
      const session = await walletStrategy.getSessionOrConfirm(address)

      walletStore.$patch({
        address,
        session,
        addresses,
        injectiveAddress: getInjectiveAddress(address),
        addressConfirmation: await walletStrategy.getSessionOrConfirm(address)
      })

      await walletStore.onConnect()
    },

    async connectWalletConnect() {
      const walletStore = useSharedWalletStore()

      await walletStore.connectWallet(Wallet.WalletConnect)

      const addresses = await getAddresses()

      const [address] = addresses
      const session = await walletStrategy.getSessionOrConfirm(address)

      walletStore.$patch({
        address,
        session,
        addresses,
        injectiveAddress: getInjectiveAddress(address),
        addressConfirmation: await walletStrategy.getSessionOrConfirm(address)
      })

      await walletStore.onConnect()
    },

    async connectEvmWallet(wallet: Wallet) {
      const walletStore = useSharedWalletStore()

      await walletStore.connectWallet(wallet)

      const addresses = await getAddresses()
      const [address] = addresses
      const session = await walletStrategy.getSessionOrConfirm(address)

      walletStore.$patch({
        address,
        session,
        addresses,
        injectiveAddress: getInjectiveAddress(address),
        addressConfirmation: await walletStrategy.getSessionOrConfirm(address)
      })

      await walletStore.onConnect()
    },

    async connectCosmosWallet(wallet: Wallet) {
      const walletStore = useSharedWalletStore()

      await walletStore.connectWallet(wallet)

      const injectiveAddresses = await getAddresses()
      const [injectiveAddress] = injectiveAddresses
      const session = await walletStrategy.getSessionOrConfirm()

      await confirmCosmosWalletAddress(wallet, injectiveAddress)

      walletStore.$patch({
        session,
        injectiveAddress,
        addresses: injectiveAddresses,
        address: getEthereumAddress(injectiveAddress),
        addressConfirmation:
          await walletStrategy.getSessionOrConfirm(injectiveAddress)
      })

      await walletStore.onConnect()
    },

    async connectLedger({
      wallet,
      address
    }: {
      wallet: Wallet
      address: string
    }) {
      const walletStore = useSharedWalletStore()

      await walletStore.connectWallet(wallet)

      const ethereumAddress = getEthereumAddress(address)
      const session = await walletStrategy.getSessionOrConfirm(ethereumAddress)

      walletStore.$patch({
        session,
        address: ethereumAddress,
        injectiveAddress: address,
        addresses: [ethereumAddress],
        addressConfirmation:
          await walletStrategy.getSessionOrConfirm(ethereumAddress)
      })

      await walletStore.onConnect()
    },

    async connectTrezor({
      wallet,
      address
    }: {
      wallet: Wallet
      address: string
    }) {
      const walletStore = useSharedWalletStore()

      await walletStore.connectWallet(wallet)

      const ethereumAddress = getEthereumAddress(address)
      const session = await walletStrategy.getSessionOrConfirm(ethereumAddress)

      walletStore.$patch({
        session,
        address: ethereumAddress,
        injectiveAddress: address,
        addresses: [ethereumAddress],
        addressConfirmation:
          await walletStrategy.getSessionOrConfirm(ethereumAddress)
      })

      await walletStore.onConnect()
    },

    async connectPrivateKey(privateKeyHash: string) {
      const walletStore = useSharedWalletStore()

      const pk = PrivateKey.fromHex(privateKeyHash)
      const injectiveAddress = pk.toBech32()

      await walletStore.connectWallet(Wallet.PrivateKey, {
        privateKey: privateKeyHash
      })

      const address = getEthereumAddress(injectiveAddress)
      const session = await walletStrategy.getSessionOrConfirm(address)

      walletStore.$patch({
        address,
        session,
        injectiveAddress,
        addresses: [address],
        wallet: Wallet.PrivateKey,
        privateKey: privateKeyHash,
        addressConfirmation: await walletStrategy.getSessionOrConfirm(address)
      })

      await walletStore.onConnect()
    },

    async connectAddress(injectiveAddress: string) {
      const walletStore = useSharedWalletStore()

      await walletStore.connectWallet(Wallet.Metamask)

      const addresses = [getEthereumAddress(injectiveAddress)]
      const [address] = addresses
      const session = await walletStrategy.getSessionOrConfirm(address)

      walletStore.$patch({
        address,
        session,
        addresses,
        isDev: true,
        injectiveAddress,
        addressConfirmation: await walletStrategy.getSessionOrConfirm(address)
      })

      await walletStore.onConnect()
    },

    async connectLedgerCosmos(injectiveAddress: string) {
      const walletStore = useSharedWalletStore()

      await walletStore.connectWallet(Wallet.LedgerCosmos)

      const ethereumAddress = getEthereumAddress(injectiveAddress)
      const session = await walletStrategy.getSessionOrConfirm()

      walletStore.$patch({
        session,
        injectiveAddress,
        address: ethereumAddress,
        addresses: [ethereumAddress],
        addressConfirmation:
          await walletStrategy.getSessionOrConfirm(injectiveAddress)
      })

      await walletStore.onConnect()
    },

    async connectCosmosStation() {
      const walletStore = useSharedWalletStore()

      await walletStore.connectWallet(Wallet.Cosmostation)

      const injectiveAddresses = await getAddresses()
      const [injectiveAddress] = injectiveAddresses
      const session = await walletStrategy.getSessionOrConfirm()

      walletStore.$patch({
        session,
        injectiveAddress,
        addresses: injectiveAddresses,
        address: getEthereumAddress(injectiveAddress),
        addressConfirmation:
          await walletStrategy.getSessionOrConfirm(injectiveAddress)
      })

      await walletStore.onConnect()
    }
  }
})
