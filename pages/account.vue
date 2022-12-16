<template>
  <HocLoading :status="status">
    <Account :balances="balances" />
  </HocLoading>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  UiDerivativeMarketWithToken,
  UiPosition,
  BankBalanceWithToken,
  IbcBankBalanceWithToken,
  TokenWithBalanceAndPrice,
  SubaccountBalanceWithTokenAndUsdPriceAndUsdBalance,
  ZERO_TO_STRING,
  getTokenLogoWithVendorPathPrefix,
  ZERO_IN_BASE
} from '@injectivelabs/sdk-ui-ts'
import { TradeDirection } from '@injectivelabs/ts-types'
import {
  BigNumberInBase,
  BigNumberInWei,
  Status,
  StatusType
} from '@injectivelabs/utils'
import Account from '~/components/partials/account/index.vue'
import {
  AccountBalance,
  BankBalanceWithTokenWithBalanceAndPrice,
  SubaccountBalanceWithTokenMarginAndPnlTotalBalanceInUsd
} from '~/types'

export default Vue.extend({
  components: {
    Account
  },

  data() {
    return {
      status: new Status(StatusType.Loading),
      interval: 0 as any
    }
  },

  computed: {
    markets(): UiDerivativeMarketWithToken[] {
      return this.$accessor.derivatives.markets
    },

    positions(): UiPosition[] {
      return this.$accessor.positions.subaccountPositions
    },

    bankBalances(): Array<BankBalanceWithToken | IbcBankBalanceWithToken> {
      return this.$accessor.bank.bankBalancesWithToken
    },

    erc20TokensWithBalanceAndPriceFromBank(): TokenWithBalanceAndPrice[] {
      return this.$accessor.token.erc20TokensWithBalanceAndPriceFromBank
    },

    ibcTokensWithBalanceAndPriceFromBank(): TokenWithBalanceAndPrice[] {
      return this.$accessor.token.ibcTokensWithBalanceAndPriceFromBank
    },

    subaccountBalancesWithTokenAndPrice(): SubaccountBalanceWithTokenAndUsdPriceAndUsdBalance[] {
      return this.$accessor.account.subaccountBalancesWithTokenAndPrice
    },

    bankBalancesWithUsdBalanceAndUsdPrice(): BankBalanceWithTokenWithBalanceAndPrice[] {
      const {
        bankBalances,
        erc20TokensWithBalanceAndPriceFromBank,
        ibcTokensWithBalanceAndPriceFromBank
      } = this

      return [
        ...erc20TokensWithBalanceAndPriceFromBank,
        ...ibcTokensWithBalanceAndPriceFromBank
      ].map((tokenWithBalance) => {
        const balance =
          bankBalances.find(({ denom }) => denom === tokenWithBalance.denom)
            ?.balance || ZERO_TO_STRING

        return {
          balance,
          denom: tokenWithBalance.denom,
          token: {
            ...tokenWithBalance
          }
        }
      })
    },

    totalPositionsPnlByQuoteDenom(): Record<string, BigNumberInBase> {
      const { markets, positions } = this

      return positions.reduce((list, p) => {
        const market = markets.find((m) => m.marketId === p.marketId)

        if (!market) {
          return list
        }

        const quoteDenom = market.quoteDenom.toLowerCase()

        if (!list[quoteDenom]) {
          list[quoteDenom] = ZERO_IN_BASE
        }

        const price = new BigNumberInWei(p.entryPrice).toBase(
          market.quoteToken.decimals
        )
        const markPrice = new BigNumberInWei(p.markPrice).toBase(
          market.quoteToken.decimals
        )

        const pnl = new BigNumberInBase(p.quantity)
          .times(markPrice.minus(price))
          .times(p.direction === TradeDirection.Long ? 1 : -1)

        list[quoteDenom] = list[quoteDenom].plus(pnl)

        return list
      }, {} as Record<string, BigNumberInBase>)
    },

    totalPositionsMarginByQuoteDenom(): Record<string, BigNumberInBase> {
      const { markets, positions } = this

      return positions.reduce((list, p) => {
        const market = markets.find((m) => m.marketId === p.marketId)

        if (!market) {
          return list
        }

        const quoteDenom = market.quoteDenom.toLowerCase()

        if (!list[quoteDenom]) {
          list[quoteDenom] = ZERO_IN_BASE
        }

        list[quoteDenom] = list[quoteDenom].plus(
          new BigNumberInWei(p.margin).toBase(market.quoteToken.decimals)
        )

        return list
      }, {} as Record<string, BigNumberInBase>)
    },

    subaccountBalanceWithTokenMarginAndPnlTotalBalanceInUsd(): SubaccountBalanceWithTokenMarginAndPnlTotalBalanceInUsd[] {
      const {
        subaccountBalancesWithTokenAndPrice,
        totalPositionsMarginByQuoteDenom,
        totalPositionsPnlByQuoteDenom
      } = this

      return subaccountBalancesWithTokenAndPrice.map((balance) => {
        const denom = balance.token.denom.toLowerCase()
        const usdPrice = balance.token.usdPrice

        const margin = totalPositionsMarginByQuoteDenom[denom] || ZERO_IN_BASE
        const pnl = totalPositionsPnlByQuoteDenom[denom] || ZERO_IN_BASE

        const balanceInBigNumber = new BigNumberInWei(
          balance.totalBalance
        ).toBase(balance.token.decimals)
        const availableBalanceInBigNumber = new BigNumberInWei(
          balance.availableBalance
        ).toBase(balance.token.decimals)

        const pnlInAssetCount = pnl.dividedBy(usdPrice)
        const totalBalance = balanceInBigNumber
          .plus(margin)
          .plus(pnlInAssetCount)

        return {
          ...balance,
          margin,
          totalBalance,
          inOrderBalance: balanceInBigNumber.minus(availableBalanceInBigNumber),
          pnlInUsd: pnl,
          totalBalanceInUsd: balanceInBigNumber
            .plus(margin)
            .times(usdPrice)
            .plus(pnl),
          token: {
            ...balance.token,
            logo: getTokenLogoWithVendorPathPrefix(balance.token.logo)
          }
        }
      })
    },

    balances(): AccountBalance[] {
      const {
        bankBalancesWithUsdBalanceAndUsdPrice,
        subaccountBalanceWithTokenMarginAndPnlTotalBalanceInUsd
      } = this

      const balances = bankBalancesWithUsdBalanceAndUsdPrice.reduce(
        (result, balance) => {
          result.push({
            bankBalance: new BigNumberInWei(balance.balance || 0).toBase(
              balance.token.decimals
            ),
            subaccountAvailableBalance: ZERO_IN_BASE,
            subaccountTotalBalance: ZERO_IN_BASE,
            inOrderBalance: ZERO_IN_BASE,
            margin: ZERO_IN_BASE,
            pnl: ZERO_IN_BASE,
            token: balance.token
          } as AccountBalance)

          return result
        },
        [] as AccountBalance[]
      )

      subaccountBalanceWithTokenMarginAndPnlTotalBalanceInUsd.reduce(
        (result, balance) => {
          const index = result.findIndex(
            (b) => b.token.denom === balance.token.denom
          )

          const subaccountAvailableBalance = new BigNumberInWei(
            balance.availableBalance
          ).toBase(balance.token.decimals)

          if (index === -1) {
            result.push({
              bankBalance: ZERO_IN_BASE,
              subaccountAvailableBalance,
              subaccountTotalBalance: balance.totalBalance,
              inOrderBalance: balance.inOrderBalance,
              margin: balance.margin,
              pnl: balance.pnlInUsd,
              token: { ...balance.token, usdPrice: 0 }
            })
          } else {
            const existingBalance = result[index]

            result[index] = {
              ...existingBalance,
              subaccountAvailableBalance,
              subaccountTotalBalance: balance.totalBalance,
              inOrderBalance: balance.inOrderBalance,
              margin: balance.margin,
              pnl: balance.pnlInUsd
            }
          }

          return result
        },
        balances
      )

      return balances
    }
  },

  mounted() {
    this.startPollingMarkets()

    Promise.all([
      this.$accessor.token.getBitcoinUsdPrice(),
      this.$accessor.bank.fetchBankBalancesWithToken(),
      this.$accessor.account.fetchSubaccounts()
    ])
      .then(() => {
        //
      })
      .catch(this.$onError)
      .finally(() => {
        this.status.setIdle()
      })
  },

  beforeDestroy() {
    this.stopPollingMarkets()
  },

  methods: {
    startPollingMarkets() {
      this.interval = setInterval(() => {
        this.$accessor.app.pollMarkets()
      }, 1000 * 10)
    },

    stopPollingMarkets() {
      clearInterval(this.interval)
    }
  }
})
</script>
