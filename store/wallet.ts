import { actionTree, getterTree } from 'nuxt-typed-vuex'
import { AccountAddress } from '@injectivelabs/ts-types'
import { Wallet } from '@injectivelabs/web3-strategy'
import { BigNumberInBase } from '@injectivelabs/utils'
import { confirm, connect, transfer } from '~/app/services/wallet'
import { getInjectiveAddress } from '~/app/services/account'

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

    return hasAddresses && addressConnectedAndConfirmed
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

  logout(state: WalletStoreState) {
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
    async connect(_, wallet: Wallet): Promise<AccountAddress[]> {
      return await connect(wallet)
    },

    async confirm({ commit }, addresses: AccountAddress[]) {
      const [address] = addresses
      const addressConfirmation = await confirm(address)
      const injectiveAddress = getInjectiveAddress(address)

      await this.app.$accessor.account.fetchSubaccounts(injectiveAddress)

      commit('setAddress', address)
      commit('setInjectiveAddress', injectiveAddress)
      commit('setAddresses', addresses)
      commit('setAddressConfirmation', addressConfirmation)
    },

    async connectAndConfirm({ commit }, wallet: Wallet) {
      const addresses = await connect(wallet)
      const [address] = addresses
      const addressConfirmation = await confirm(address)
      const injectiveAddress = getInjectiveAddress(address)

      await this.app.$accessor.account.fetchSubaccounts(injectiveAddress)

      commit('setAddress', address)
      commit('setInjectiveAddress', injectiveAddress)
      commit('setAddresses', addresses)
      commit('setAddressConfirmation', addressConfirmation)
    },

    async transfer(
      { state, getters },
      { amount, denom }: { amount: BigNumberInBase; denom: string }
    ) {
      const { address } = state
      const { isUserWalletConnected } = getters
      const { gasPrice } = this.app.$accessor.app

      if (!address || !isUserWalletConnected) {
        return
      }

      await transfer({
        address,
        denom,
        gasPrice: new BigNumberInBase(gasPrice).toWei(),
        amount: amount.toWei()
      })

      // await testnetBackupPromiseCall(() => this.getTokenBalances())
    }
  }
)
