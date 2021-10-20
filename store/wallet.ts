import { actionTree, getterTree } from 'typed-vuex'
import { AccountAddress } from '@injectivelabs/ts-types'
import { ConcreteStrategyOptions, Wallet } from '@injectivelabs/web3-strategy'
import { confirm, connect, getAddresses } from '~/app/services/wallet'
import { getInjectiveAddress } from '~/app/services/account'
import { validateMetamask, isMetamaskInstalled } from '~/app/services/metamask'
import { WalletConnectStatus } from '~/types'

const initialStateFactory = () => ({
  walletConnectStatus: WalletConnectStatus.idle as WalletConnectStatus,
  wallet: Wallet.Metamask,
  address: '' as AccountAddress,
  injectiveAddress: '' as AccountAddress,
  addressConfirmation: '' as string,
  addresses: [] as AccountAddress[],
  metamaskInstalled: false as boolean
})

const initialState = initialStateFactory()

export const state = () => ({
  walletConnectStatus: initialState.walletConnectStatus as WalletConnectStatus,
  wallet: initialState.wallet as Wallet,
  addresses: initialState.addresses as AccountAddress[],
  address: initialState.address as AccountAddress,
  injectiveAddress: initialState.injectiveAddress as AccountAddress,
  addressConfirmation: initialState.addressConfirmation as string,
  metamaskInstalled: initialState.metamaskInstalled as boolean
})

export type WalletStoreState = ReturnType<typeof state>

export const getters = getterTree(state, {
  isUserWalletConnected: (state) => {
    const addressConnectedAndConfirmed =
      !!state.address && !!state.addressConfirmation
    const hasAddresses = state.addresses.length > 0

    return (
      hasAddresses && addressConnectedAndConfirmed && !!state.injectiveAddress
    )
  }
})

export const mutations = {
  setWallet(state: WalletStoreState, wallet: Wallet) {
    state.wallet = wallet
  },

  setAddress(state: WalletStoreState, address: AccountAddress) {
    state.address = address
  },

  setAddressConfirmation(state: WalletStoreState, addressConfirmation: string) {
    state.addressConfirmation = addressConfirmation
  },

  setInjectiveAddress(state: WalletStoreState, injectiveAddress: string) {
    state.injectiveAddress = injectiveAddress
  },

  setMetamaskInstalled(state: WalletStoreState, metamaskInstalled: boolean) {
    state.metamaskInstalled = metamaskInstalled
  },

  setAddresses(state: WalletStoreState, addresses: AccountAddress[]) {
    state.addresses = addresses
  },

  setWalletConnectStatus(
    state: WalletStoreState,
    walletConnectStatus: WalletConnectStatus
  ) {
    state.walletConnectStatus = walletConnectStatus
  },

  reset(state: WalletStoreState) {
    const initialState = initialStateFactory()

    state.address = initialState.address
    state.addresses = initialState.addresses
    state.injectiveAddress = initialState.injectiveAddress
    state.addressConfirmation = initialState.addressConfirmation
  },

  resetPage(_state: WalletStoreState) {
    //
  }
}

export const actions = actionTree(
  { state, mutations },
  {
    async init({ state }) {
      await this.app.$accessor.wallet.connect(state.wallet || Wallet.Metamask)
    },

    async initPage(_) {
      await this.app.$accessor.token.getAllTokenWithBalanceAndAllowance()
    },

    async isMetamaskInstalled({ commit }) {
      commit('setMetamaskInstalled', await isMetamaskInstalled())
    },

    async connect({ commit }, wallet: Wallet) {
      commit('setWallet', wallet)

      await connect({
        wallet,
        onAccountChangeCallback: async (_address: string) => {
          await this.app.$accessor.wallet.connectAndConfirm(wallet)
        }
      })
    },

    async connectLedger(
      { commit },
      options: Partial<ConcreteStrategyOptions> = {}
    ) {
      commit('setWallet', Wallet.Ledger)
      await connect({ wallet: Wallet.Ledger, options })
    },

    async getAddresses(_): Promise<AccountAddress[]> {
      return await getAddresses()
    },

    async confirm({ commit }, addresses: AccountAddress[]) {
      await this.app.$accessor.app.validate()

      commit('setWalletConnectStatus', WalletConnectStatus.connecting)

      const [address] = addresses
      const addressConfirmation = await confirm(address)
      const injectiveAddress = getInjectiveAddress(address)

      commit('setInjectiveAddress', injectiveAddress)
      commit('setAddressConfirmation', addressConfirmation)
      commit('setAddresses', addresses)
      commit('setAddress', address)

      await this.app.$accessor.account.fetchSubaccounts()
      await this.app.$accessor.bank.fetchBalances()

      await this.app.$accessor.token.getTokenBalanceAndAllowanceForDerivativeMarket()
      await this.app.$accessor.token.getTokenBalanceAndAllowanceForMarket()

      if (this.app.context.route.name === 'portfolio') {
        await this.app.$accessor.portfolio.init()
      }

      if (this.app.context.route.name === 'history') {
        await this.app.$accessor.history.init()
      }

      if (this.app.context.route.name === 'wallet') {
        await this.app.$accessor.wallet.initPage()
      }

      commit('setWalletConnectStatus', WalletConnectStatus.connected)
    },

    async connectAndConfirm({ commit }, wallet: Wallet) {
      await this.app.$accessor.app.validate()
      await this.app.$accessor.wallet.connect(wallet)

      commit('setWalletConnectStatus', WalletConnectStatus.connecting)

      const addresses = await getAddresses()
      const [address] = addresses
      const addressConfirmation = await confirm(address)
      const injectiveAddress = getInjectiveAddress(address)

      commit('setInjectiveAddress', injectiveAddress)
      commit('setAddress', address)
      commit('setAddresses', addresses)
      commit('setAddressConfirmation', addressConfirmation)

      await this.app.$accessor.account.fetchSubaccounts()
      await this.app.$accessor.bank.fetchBalances()

      await this.app.$accessor.token.getTokenBalanceAndAllowanceForDerivativeMarket()
      await this.app.$accessor.token.getTokenBalanceAndAllowanceForMarket()

      if (this.app.context.route.name === 'portfolio') {
        await this.app.$accessor.portfolio.init()
      }

      if (this.app.context.route.name === 'history') {
        await this.app.$accessor.history.init()
      }

      if (this.app.context.route.name === 'wallet') {
        await this.app.$accessor.wallet.initPage()
      }

      commit('setWalletConnectStatus', WalletConnectStatus.connected)
    },

    async validate({ state }) {
      const { chainId } = this.app.$accessor.app

      if (state.wallet === Wallet.Metamask) {
        await validateMetamask(state.address, chainId)
      }
    },

    async validateTransferRestrictions({ state }) {
      const { chainId } = this.app.$accessor.app

      if (state.wallet === Wallet.Metamask) {
        await validateMetamask(state.address, chainId)
      }
    },

    async logout({ commit }) {
      await this.app.$accessor.account.reset()
      await this.app.$accessor.token.reset()
      await this.app.$accessor.spot.resetSubaccount()
      await this.app.$accessor.derivatives.resetSubaccount()
      await this.app.$accessor.bank.reset()
      await this.app.$accessor.portfolio.reset()
      await this.app.$accessor.history.reset()

      commit('reset')
      commit('resetPage')
      commit('setWalletConnectStatus', WalletConnectStatus.disconnected)
    },

    async resetPage({ commit }) {
      await this.app.$accessor.token.reset()

      commit('resetPage')
    }
  }
)
