import {
  BigNumberInBase,
  denomAmountToChainDenomAmountToFixed
} from '@injectivelabs/utils'
import { actionTree, getterTree } from 'typed-vuex'
import {
  ChainMetrics,
  SubaccountBalanceWithToken,
  SubaccountBalanceWithTokenAndUsdPriceAndUsdBalance,
  UiAccountTransformer,
  UiSubaccount,
  UiSubaccountBalance,
  ZERO_TO_STRING
} from '@injectivelabs/sdk-ui-ts'
import {
  AccountPortfolio,
  MsgDeposit,
  MsgWithdraw
} from '@injectivelabs/sdk-ts'
import { Token } from '@injectivelabs/token-metadata'
import {
  exchangeAccountApi,
  msgBroadcastClient,
  tokenPrice,
  tokenService
} from '~/app/Services'
import {
  streamSubaccountBalances,
  cancelSubaccountStreams
} from '~/app/client/streams/account'
import { backupPromiseCall } from '~/app/utils/async'
import { derivativeMarketRouteNames } from '~/app/data/market'

const initialStateFactory = () => ({
  subaccountIds: [] as string[],
  subaccount: undefined as UiSubaccount | undefined,
  subaccountBalancesWithToken: [] as SubaccountBalanceWithToken[],
  subaccountBalancesWithTokenAndPrice:
    [] as SubaccountBalanceWithTokenAndUsdPriceAndUsdBalance[],
  accountPortfolio: undefined as AccountPortfolio | undefined
})

const initialState = initialStateFactory()

export const state = () => ({
  subaccountIds: initialState.subaccountIds as string[],
  subaccount: initialState.subaccount as UiSubaccount | undefined,
  subaccountBalancesWithToken:
    initialState.subaccountBalancesWithToken as SubaccountBalanceWithToken[],
  subaccountBalancesWithTokenAndPrice:
    initialState.subaccountBalancesWithTokenAndPrice as SubaccountBalanceWithTokenAndUsdPriceAndUsdBalance[],
  accountPortfolio: initialState.accountPortfolio as
    | AccountPortfolio
    | undefined
})

export type AccountStoreState = ReturnType<typeof state>

export const getters = getterTree(state, {
  hasAnyTradingAccountBalances: (state: AccountStoreState) => {
    if (!state.subaccount) {
      return false
    }

    return state.subaccount.balances.length > 0
  }
})

export const mutations = {
  setSubacccountIds(state: AccountStoreState, subaccountIds: string[]) {
    state.subaccountIds = subaccountIds
  },

  setSubaccount(state: AccountStoreState, subaccount: UiSubaccount) {
    state.subaccount = subaccount
  },

  setPortfolioValue(
    state: AccountStoreState,
    accountPortfolio: AccountPortfolio
  ) {
    state.accountPortfolio = accountPortfolio
  },

  setSubaccountBalance(state: AccountStoreState, balance: UiSubaccountBalance) {
    if (!state.subaccount) {
      return
    }

    const currentBalance = [...state.subaccount.balances].find(
      (b) => b.denom === balance.denom
    )
    const balances = [...state.subaccount.balances].filter(
      (b) => b.denom !== balance.denom
    )
    const updatedBalance = {
      ...balance,
      totalBalance:
        balance.totalBalance ||
        (currentBalance ? currentBalance.totalBalance : ZERO_TO_STRING),
      availableBalance:
        balance.availableBalance ||
        (currentBalance ? currentBalance.availableBalance : ZERO_TO_STRING)
    }

    state.subaccount = {
      ...state.subaccount,
      balances: [...balances, updatedBalance]
    }
  },

  setSubaccountBalancesWithToken(
    state: AccountStoreState,
    subaccountBalancesWithToken: SubaccountBalanceWithToken[]
  ) {
    state.subaccountBalancesWithToken = subaccountBalancesWithToken
  },

  setSubaccountBalancesWithTokenAndPrice(
    state: AccountStoreState,
    subaccountBalancesWithTokenAndPrice: SubaccountBalanceWithTokenAndUsdPriceAndUsdBalance[]
  ) {
    state.subaccountBalancesWithTokenAndPrice =
      subaccountBalancesWithTokenAndPrice
  },

  reset(state: AccountStoreState) {
    const initialState = initialStateFactory()

    state.subaccount = initialState.subaccount
    state.subaccountIds = initialState.subaccountIds
    state.subaccountBalancesWithToken = initialState.subaccountBalancesWithToken
    state.subaccountBalancesWithTokenAndPrice =
      initialState.subaccountBalancesWithTokenAndPrice
  }
}

export const actions = actionTree(
  { state, mutations },
  {
    async init(_) {
      await this.app.$accessor.account.fetchSubaccounts()
    },

    async fetchSubaccounts({ commit }) {
      const { injectiveAddress } = this.app.$accessor.wallet

      if (!injectiveAddress) {
        return
      }

      const subaccountIds = await exchangeAccountApi.fetchSubaccountsList(
        injectiveAddress
      )

      if (subaccountIds.length === 0) {
        return
      }

      const [subaccountId] = subaccountIds
      const balances = await exchangeAccountApi.fetchSubaccountBalancesList(
        subaccountId
      )
      const subaccount = {
        subaccountId,
        balances: balances.map((b) =>
          UiAccountTransformer.accountBalanceToUiAccountBalance(b)
        )
      }

      commit('setSubacccountIds', subaccountIds)
      commit('setSubaccount', subaccount)

      if (this.app.context.route.name === 'spot-spot') {
        await this.app.$accessor.spot.fetchSubaccountOrders()
        await this.app.$accessor.spot.fetchSubaccountTrades()
        await this.app.$accessor.spot.streamSubaccountOrders()
        await this.app.$accessor.spot.streamSubaccountTrades()
      }

      if (
        derivativeMarketRouteNames.includes(
          this.app.context.route.name as string
        )
      ) {
        await this.app.$accessor.derivatives.fetchSubaccountOrders()
        await this.app.$accessor.derivatives.fetchSubaccountTrades()
        await this.app.$accessor.derivatives.streamSubaccountOrders()
        await this.app.$accessor.derivatives.streamSubaccountTrades()
        await this.app.$accessor.positions.fetchSubaccountPositions()
        await this.app.$accessor.positions.streamSubaccountPositions()
      }
    },

    async fetchSubaccountsBalances({ state }) {
      const { subaccount } = state

      if (!subaccount) {
        await this.app.$accessor.account.refreshSubaccountBalances()
      }

      if (subaccount && !subaccount.balances) {
        await this.app.$accessor.account.refreshSubaccountBalances()
      }
    },

    async refreshSubaccountBalances({ commit, state }) {
      await this.app.$accessor.account.fetchSubaccounts()

      const { subaccount: newSubaccount } = state

      if (!newSubaccount) {
        return
      }

      const subaccountBalances = newSubaccount.balances
      const subaccountBalancesWithToken =
        await tokenService.getSubaccountBalancesWithToken(subaccountBalances)

      commit('setSubaccountBalancesWithToken', subaccountBalancesWithToken)
    },

    async fetchSubaccountsBalancesWithPrices({ commit, state }) {
      await this.app.$accessor.account.refreshSubaccountBalances()

      const { subaccountBalancesWithToken: newSubaccountBalancesWithToken } =
        state

      const subaccountBalancesWithTokenAndPrice = await Promise.all(
        newSubaccountBalancesWithToken.map(async (balance) => {
          return {
            ...balance,
            token: {
              ...balance.token,
              usdPrice: await tokenPrice.fetchUsdTokenPrice(
                balance.token.coinGeckoId
              )
            }
          } as SubaccountBalanceWithTokenAndUsdPriceAndUsdBalance
        })
      )

      commit(
        'setSubaccountBalancesWithTokenAndPrice',
        subaccountBalancesWithTokenAndPrice
      )
    },

    async updateSubaccount({ commit, state }) {
      const { subaccount } = state
      const { injectiveAddress } = this.app.$accessor.wallet

      if (!subaccount || !injectiveAddress) {
        return
      }

      const { subaccountId } = subaccount
      const balances = await exchangeAccountApi.fetchSubaccountBalancesList(
        subaccountId
      )
      const updatedSubaccount = {
        subaccountId,
        balances: balances.map((b) =>
          UiAccountTransformer.accountBalanceToUiAccountBalance(b)
        )
      }

      commit('setSubaccount', updatedSubaccount)
    },

    async fetchAccountPortfolio({ commit, state }) {
      const { subaccount } = state
      const { injectiveAddress } = this.app.$accessor.wallet

      if (!injectiveAddress) {
        return
      }

      if (!subaccount) {
        await this.app.$accessor.account.init()
      }

      const portfolio = await exchangeAccountApi.fetchPortfolio(
        injectiveAddress
      )

      commit('setPortfolioValue', portfolio)
    },

    streamSubaccountBalances({ commit, state }) {
      const { subaccount } = state

      if (!subaccount) {
        return
      }

      streamSubaccountBalances({
        subaccountId: subaccount.subaccountId,
        callback: ({ balance }) => {
          if (!balance) {
            return
          }

          commit(
            'setSubaccountBalance',
            UiAccountTransformer.accountBalanceToUiAccountBalance(balance)
          )
        }
      })
    },

    async deposit(
      { state },
      { amount, token }: { amount: BigNumberInBase; token: Token }
    ) {
      const { subaccount } = state
      const { address, injectiveAddress, isUserWalletConnected } =
        this.app.$accessor.wallet

      if (!subaccount || !isUserWalletConnected) {
        return
      }

      await this.app.$accessor.app.queue()
      await this.app.$accessor.wallet.validate()

      const message = MsgDeposit.fromJSON({
        injectiveAddress,
        subaccountId: subaccount.subaccountId,
        amount: {
          denom: token.denom,
          amount: denomAmountToChainDenomAmountToFixed({
            value: amount,
            decimals: token.decimals
          })
        }
      })

      await msgBroadcastClient.broadcast({
        bucket: ChainMetrics.Deposit,
        msgs: message,
        address
      })

      await backupPromiseCall(() => this.app.$accessor.bank.fetchBalances())
      await backupPromiseCall(() =>
        this.app.$accessor.account.updateSubaccount()
      )
    },

    async withdraw(
      { state },
      { amount, token }: { amount: BigNumberInBase; token: Token }
    ) {
      const { subaccount } = state
      const { address, injectiveAddress, isUserWalletConnected } =
        this.app.$accessor.wallet

      if (!subaccount || !isUserWalletConnected) {
        return
      }

      await this.app.$accessor.app.queue()
      await this.app.$accessor.wallet.validate()

      const message = MsgWithdraw.fromJSON({
        injectiveAddress,
        subaccountId: subaccount.subaccountId,
        amount: {
          denom: token.denom,
          amount: denomAmountToChainDenomAmountToFixed({
            value: amount,
            decimals: token.decimals
          })
        }
      })

      await msgBroadcastClient.broadcast({
        bucket: ChainMetrics.Deposit /* TODO */,
        msgs: message,
        address
      })

      await backupPromiseCall(() => this.app.$accessor.bank.fetchBalances())
      await backupPromiseCall(() =>
        this.app.$accessor.account.updateSubaccount()
      )
    },

    async reset({ commit }) {
      await cancelSubaccountStreams()
      commit('reset')
    }
  }
)
