import {
  BankBalances,
  BankBalanceWithTokenMetaData,
  IbcBankBalanceWithTokenMetaData,
  Token,
  TokenTransformer
} from '@injectivelabs/ui-common'
import { BigNumberInBase } from '@injectivelabs/utils'
import { actionTree, getterTree } from 'typed-vuex'
import {
  bankActionServiceFactory,
  bankService,
  tokenService
} from '~/app/services'
import { backupPromiseCall } from '~/app/utils/async'

const initialStateFactory = () => ({
  balances: {} as BankBalances,
  ibcBalances: {} as BankBalances,
  balancesWithTokenMetaData: [] as BankBalanceWithTokenMetaData[],
  ibcBalancesWithTokenMetaData: [] as IbcBankBalanceWithTokenMetaData[]
})

const initialState = initialStateFactory()

export const state = () => ({
  balances: initialState.balances,
  ibcBalances: initialState.balances,
  balancesWithTokenMetaData: initialState.balancesWithTokenMetaData,
  ibcBalancesWithTokenMetaData: initialState.ibcBalancesWithTokenMetaData
})

export type BankStoreState = ReturnType<typeof state>

export const getters = getterTree(state, {
  //
})

export const mutations = {
  setBalances(state: BankStoreState, balances: BankBalances) {
    state.balances = balances
  },

  setBalancesWithTokenMetaData(
    state: BankStoreState,
    balancesWithTokenMetaData: BankBalanceWithTokenMetaData[]
  ) {
    state.balancesWithTokenMetaData = balancesWithTokenMetaData
  },

  setIbcBalances(state: BankStoreState, ibcBalances: BankBalances) {
    state.ibcBalances = ibcBalances
  },

  setIbcBalancesWithTokenMetaData(
    state: BankStoreState,
    ibcBalancesWithTokenMetaData: IbcBankBalanceWithTokenMetaData[]
  ) {
    state.ibcBalancesWithTokenMetaData = ibcBalancesWithTokenMetaData
  },

  reset(state: BankStoreState) {
    const initialState = initialStateFactory()

    state.balances = initialState.balances
    state.balancesWithTokenMetaData = initialState.balancesWithTokenMetaData
    state.ibcBalancesWithTokenMetaData =
      initialState.ibcBalancesWithTokenMetaData
  }
}

export const actions = actionTree(
  { state },
  {
    async init(_) {
      await this.app.$accessor.bank.fetchBalances()
    },

    async fetchBalances({ commit }) {
      const { injectiveAddress } = this.app.$accessor.wallet

      if (!injectiveAddress) {
        return
      }

      const { bankBalances, ibcBankBalances } = await bankService.fetchBalances(
        injectiveAddress
      )

      commit('setBalances', bankBalances)
      commit('setIbcBalances', ibcBankBalances)
    },

    async fetchBalancesWithTokenMetaData({ state, commit }) {
      const { balances } = state
      const { injectiveAddress } = this.app.$accessor.wallet

      if (!injectiveAddress) {
        return
      }

      const balancesWithTokenMeta = (
        await Promise.all(
          Object.keys(balances).map(async (denom) => {
            const tokenMeta = await tokenService.getTokenMetaDataWithIbc(denom)

            return {
              denom,
              balance: balances[denom],
              token: TokenTransformer.tokenMetaToToken(tokenMeta, denom)
            }
          })
        )
      ).filter(
        (balance) => balance.token !== undefined
      ) as BankBalanceWithTokenMetaData[]

      commit('setBalancesWithTokenMetaData', balancesWithTokenMeta)
    },

    async fetchIbcBalancesWithTokenMetaData({ state, commit }) {
      const { ibcBalances } = state
      const { injectiveAddress } = this.app.$accessor.wallet

      if (!injectiveAddress) {
        return
      }

      const ibcBalancesWithTokenMeta = (
        await Promise.all(
          Object.keys(ibcBalances).map(async (denom) => {
            const { baseDenom, path } = await tokenService.fetchDenomTrace(
              denom
            )
            const tokenMeta = tokenService.getTokenMetaDataBySymbol(baseDenom)

            return {
              denom,
              baseDenom,
              balance: ibcBalances[denom],
              channelId: path.replace('transfer/', ''),
              token: TokenTransformer.tokenMetaToToken(tokenMeta, denom)
            }
          })
        )
      ).filter(
        (balance) => balance.token !== undefined
      ) as IbcBankBalanceWithTokenMetaData[]

      commit('setIbcBalancesWithTokenMetaData', ibcBalancesWithTokenMeta)
    },

    async transfer(
      _,
      {
        amount,
        denom,
        destination,
        token
      }: {
        amount: BigNumberInBase
        denom: string
        destination: string
        token: Token
      }
    ) {
      const {
        address,
        injectiveAddress,
        isUserWalletConnected
      } = this.app.$accessor.wallet
      const bankActionService = bankActionServiceFactory()

      if (!address || !isUserWalletConnected) {
        return
      }

      await this.app.$accessor.wallet.validate()

      await bankActionService.transfer({
        address,
        injectiveAddress,
        destination,
        denom,
        amount: amount.toWei(token.decimals).toFixed()
      })

      await backupPromiseCall(() => this.app.$accessor.bank.fetchBalances())
    }
  }
)
