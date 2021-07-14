import { actionTree, getterTree } from 'typed-vuex'
import { AccountAddress } from '@injectivelabs/ts-types'
import { ConcreteStrategyOptions, Wallet } from '@injectivelabs/web3-strategy'
import { confirm, connect, getAddresses } from '~/app/services/wallet'
import { getInjectiveAddress } from '~/app/services/account'
import { validateMetamask } from '~/app/services/metamask'

const initialStateFactory = () => ({
  wallet: Wallet.Metamask,
  address: '' as AccountAddress,
  injectiveAddress: '' as AccountAddress,
  addressConfirmation: '' as string,
  addresses: [] as AccountAddress[]
})

const initialState = initialStateFactory()

export const state = () => ({
  wallet: initialState.wallet as Wallet,
  addresses: initialState.addresses as AccountAddress[],
  address: initialState.address as AccountAddress,
  injectiveAddress: initialState.injectiveAddress as AccountAddress,
  addressConfirmation: initialState.addressConfirmation as string
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

  setAddresses(state: WalletStoreState, addresses: AccountAddress[]) {
    state.addresses = addresses
  },

  reset(state: WalletStoreState) {
    const initialState = initialStateFactory()

    state.address = initialState.address
    state.addresses = initialState.addresses
    state.injectiveAddress = initialState.injectiveAddress
    state.addressConfirmation = initialState.addressConfirmation
  }
}

export const actions = actionTree(
  { state, mutations },
  {
    async init({ state }) {
      await this.app.$accessor.wallet.connect(state.wallet || Wallet.Metamask)
    },

    async connect({ commit }, wallet: Wallet) {
      commit('setWallet', wallet)
      await connect(wallet)
    },

    async connectLedger(
      { commit },
      options: Partial<ConcreteStrategyOptions> = {}
    ) {
      commit('setWallet', Wallet.Ledger)
      await connect(Wallet.Ledger, options)
    },

    async getAddresses(_): Promise<AccountAddress[]> {
      return await getAddresses()
    },

    async confirm({ commit }, addresses: AccountAddress[]) {
      await this.app.$accessor.app.validate()

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
    },

    async connectAndConfirm({ commit }, wallet: Wallet) {
      await this.app.$accessor.app.validate()

      await this.app.$accessor.wallet.connect(wallet)
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
    },

    async validate({ state }) {
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

      commit('reset')
    }
  }
)
