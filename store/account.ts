import { defineStore } from 'pinia'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  SubaccountBalanceWithToken,
  SubaccountBalanceWithTokenAndUsdPriceAndUsdBalance,
  UiAccountTransformer,
  UiSubaccount
} from '@injectivelabs/sdk-ui-ts'
import {
  AccountPortfolio,
  denomAmountToChainDenomAmountToFixed,
  MsgDeposit,
  MsgWithdraw,
  SubaccountBalance
} from '@injectivelabs/sdk-ts'
import { Token } from '@injectivelabs/token-metadata'
import {
  indexerAccountApi,
  msgBroadcastClient,
  tokenPrice,
  tokenService
} from '@/app/Services'
import {
  streamSubaccountBalances,
  cancelSubaccountStreams
} from '@/app/client/streams/account'
import { derivativeMarketRouteNames } from '@/app/data/market'
import { backupPromiseCall } from '@/app/utils/async'

type AccountStoreState = {
  subaccountIds: string[]
  subaccount?: UiSubaccount
  subaccountBalancesWithToken: SubaccountBalanceWithToken[]
  subaccountBalancesWithTokenAndPrice: SubaccountBalanceWithTokenAndUsdPriceAndUsdBalance[]
  accountPortfolio?: AccountPortfolio
}

const initialStateFactory = (): AccountStoreState => ({
  subaccountIds: [],
  subaccount: undefined,
  subaccountBalancesWithToken: [],
  subaccountBalancesWithTokenAndPrice: [],
  accountPortfolio: undefined
})

export const useAccountStore = defineStore('account', {
  state: (): AccountStoreState => initialStateFactory(),
  getters: {
    hasAnyTradingAccountBalances(state) {
      if (!state.subaccount) {
        return false
      }

      return state.subaccount.balances.length > 0
    }
  },
  actions: {
    async init() {
      const accountStore = useAccountStore()

      await accountStore.fetchSubaccounts()
    },

    async fetchSubaccounts() {
      const accountStore = useAccountStore()
      const derivativeStore = useDerivativeStore()
      const route = useRoute()
      const positionStore = usePositionStore()
      const spotStore = useSpotStore()

      const { injectiveAddress } = useWalletStore()

      if (!injectiveAddress) {
        return
      }

      const subaccountIds = await indexerAccountApi.fetchSubaccountsList(
        injectiveAddress
      )

      if (subaccountIds.length === 0) {
        return
      }

      const [subaccountId] = subaccountIds
      const balances = await indexerAccountApi.fetchSubaccountBalancesList(
        subaccountId
      )
      const subaccount = {
        subaccountId,
        balances: balances.map((b) =>
          UiAccountTransformer.accountBalanceToUiAccountBalance(b)
        )
      }

      accountStore.$patch({
        subaccount,
        subaccountIds
      })

      if (route.name === 'spot-spot') {
        await spotStore.fetchSubaccountOrders()
        await spotStore.fetchSubaccountTrades()
        await spotStore.streamSubaccountOrders()
        await spotStore.streamSubaccountOrderHistory()
      }

      if (derivativeMarketRouteNames.includes(route.name as string)) {
        await derivativeStore.fetchSubaccountOrders()
        await derivativeStore.fetchSubaccountTrades()
        await derivativeStore.streamSubaccountOrders()
        await derivativeStore.streamSubaccountOrderHistory()
        await derivativeStore.streamSubaccountTrades()
        await positionStore.fetchSubaccountPositions()
        await positionStore.streamSubaccountPositions()
      }
    },

    async fetchSubaccountsBalances() {
      const accountStore = useAccountStore()

      if (!accountStore.subaccount) {
        await accountStore.refreshSubaccountBalances()
      }

      if (accountStore.subaccount && !accountStore.subaccount.balances) {
        await accountStore.refreshSubaccountBalances()
      }
    },

    async refreshSubaccountBalances() {
      const accountStore = useAccountStore()

      await accountStore.fetchSubaccounts()

      if (!accountStore.subaccount) {
        return
      }

      const subaccountBalances = accountStore.subaccount.balances
      const subaccountBalancesWithToken =
        await tokenService.getSubaccountBalancesWithToken(subaccountBalances)

      accountStore.$patch({
        subaccountBalancesWithToken
      })
    },

    async fetchSubaccountsBalancesWithPrices() {
      const accountStore = useAccountStore()

      await accountStore.refreshSubaccountBalances()

      const subaccountBalancesWithTokenAndPrice = await Promise.all(
        accountStore.subaccountBalancesWithToken.map(async (balance) => {
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

      accountStore.$patch({
        subaccountBalancesWithTokenAndPrice
      })
    },

    async updateSubaccount() {
      const accountStore = useAccountStore()
      const { injectiveAddress } = useWalletStore()

      if (!accountStore.subaccount || !injectiveAddress) {
        return
      }

      const balances = await indexerAccountApi.fetchSubaccountBalancesList(
        accountStore.subaccount.subaccountId
      )
      const updatedSubaccount = {
        subaccountId: accountStore.subaccount.subaccountId,
        balances: balances.map((b) =>
          UiAccountTransformer.accountBalanceToUiAccountBalance(b)
        )
      }

      accountStore.$patch({
        subaccount: updatedSubaccount
      })
    },

    async fetchAccountPortfolio() {
      const accountStore = useAccountStore()
      const { injectiveAddress } = useWalletStore()

      if (!injectiveAddress) {
        return
      }

      if (!accountStore.subaccount) {
        await accountStore.init()
      }

      const accountPortfolio = await indexerAccountApi.fetchPortfolio(
        injectiveAddress
      )

      accountStore.$patch({
        accountPortfolio
      })
    },

    streamSubaccountBalances() {
      const accountStore = useAccountStore()

      if (!accountStore.subaccount) {
        return
      }

      streamSubaccountBalances({
        subaccountId: accountStore.subaccount.subaccountId,
        callback: ({ balance }: { balance?: SubaccountBalance }) => {
          if (!balance || !accountStore.subaccount) {
            return
          }

          const balances = [...accountStore.subaccount.balances]

          const currentBalanceIndex = balances.findIndex(
            ({ denom }) => denom === balance.denom
          )

          if (balance.deposit) {
            const updatedBalance = {
              totalBalance: balance.deposit.totalBalance,
              availableBalance: balance.deposit.availableBalance,
              denom: balance.denom
            }

            if (currentBalanceIndex !== -1) {
              balances[currentBalanceIndex] = updatedBalance
            } else {
              balances.push(updatedBalance)
            }

            accountStore.$patch({
              subaccount: {
                ...accountStore.subaccount,
                balances
              }
            })
          }
        }
      })
    },

    async deposit({
      amount,
      token
    }: {
      amount: BigNumberInBase
      token: Token
    }) {
      const accountStore = useAccountStore()
      const bankStore = useBankStore()
      const { queue } = useAppStore()
      const { address, injectiveAddress, isUserWalletConnected, validate } =
        useWalletStore()

      if (!accountStore.subaccount || !isUserWalletConnected) {
        return
      }

      await queue()
      await validate()

      const message = MsgDeposit.fromJSON({
        injectiveAddress,
        subaccountId: accountStore.subaccount.subaccountId,
        amount: {
          denom: token.denom,
          amount: denomAmountToChainDenomAmountToFixed({
            value: amount,
            decimals: token.decimals
          })
        }
      })

      await msgBroadcastClient.broadcastOld({
        msgs: message,
        address
      })

      await backupPromiseCall(() => bankStore.fetchBalances())
      await backupPromiseCall(() => accountStore.updateSubaccount())
    },

    async withdraw({
      amount,
      token
    }: {
      amount: BigNumberInBase
      token: Token
    }) {
      const accountStore = useAccountStore()
      const bankStore = useBankStore()
      const { queue } = useAppStore()
      const { address, injectiveAddress, isUserWalletConnected, validate } =
        useWalletStore()

      if (!accountStore.subaccount || !isUserWalletConnected) {
        return
      }

      await queue()
      await validate()

      const message = MsgWithdraw.fromJSON({
        injectiveAddress,
        subaccountId: accountStore.subaccount.subaccountId,
        amount: {
          denom: token.denom,
          amount: denomAmountToChainDenomAmountToFixed({
            value: amount,
            decimals: token.decimals
          })
        }
      })

      await msgBroadcastClient.broadcastOld({
        msgs: message,
        address
      })

      await backupPromiseCall(() => bankStore.fetchBalances())
      await backupPromiseCall(() => accountStore.updateSubaccount())
    },

    async reset() {
      const accountStore = useAccountStore()

      await cancelSubaccountStreams()

      accountStore.$reset()
    }
  }
})
