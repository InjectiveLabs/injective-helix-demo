<template>
  <div>
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <v-card-select v-model="component" lg :option="components.bankAccount">
        <template slot="subtitle">
          <div class="font-semibold text-lg flex items-center mb-4">
            <span>{{ $t('portfolio.bankAccount') }}</span>
            <v-icon-info-tooltip
              class="ml-3"
              color="text-gray-200"
              :tooltip="$t('portfolio.bankAccountTooltip')"
              lg
            />
          </div>
        </template>
        <div class="text-right">
          <p class="text-gray-500 text-xs uppercase mb-3 tracking-wider">
            {{ $t('portfolio.walletValue') }}
          </p>
          <p class="text-2xl">
            <span v-if="status.isLoading()">&mdash; USD</span>
            <span v-else-if="hideBalance">{{ HIDDEN_BALANCE_DISPLAY }}</span>
            <span v-else>{{ totalBankBalanceToString }} USD</span>
          </p>
        </div>
      </v-card-select>

      <v-card-select v-model="component" lg :option="components.tradingAccount">
        <template slot="subtitle">
          <div class="font-semibold text-lg flex items-center mb-4">
            <span>{{ $t('portfolio.tradingAccount') }}</span>
            <v-icon-info-tooltip
              class="ml-3"
              color="text-gray-200"
              :tooltip="$t('portfolio.tradingAccountTooltip')"
              lg
            />
          </div>
        </template>
        <div class="text-right">
          <p class="text-gray-500 text-xs uppercase mb-3 tracking-wider">
            {{ $t('portfolio.portfolioValue') }}
          </p>
          <p class="text-2xl">
            <span v-if="status.isLoading()">&mdash; USD</span>
            <span v-else-if="hideBalance">{{ HIDDEN_BALANCE_DISPLAY }}</span>
            <span v-else>{{ tradingAccountBalancesToString }} USD</span>
          </p>
          <p class="text-sm mt-2 text-gray-500">
            <span v-if="status.isLoading()">&mdash; USD</span>
            <span v-else-if="hideBalance">{{ HIDDEN_BALANCE_DISPLAY }}</span>
            <span v-else>
              {{ $t('common.available') }}
              {{ totalSubaccountAvailableBalancesToString }} USD
            </span>
          </p>
        </div>
      </v-card-select>
    </div>

    <div class="w-full mt-6 relative">
      <portal to="account-summary">
        <v-account-summary
          :status="status"
          :total-balance="totalBalance"
          :hide-balance.sync="hideBalance"
        />
      </portal>

      <v-panel :title="panelTitle">
        <VHocLoading :status="status">
          <component
            :is="`v-${component}`"
            v-bind="{
              hideBalance,
              bankBalancesWithUsdBalance,
              subaccountBalancesWithUsdBalance,
              totalPositionsMarginByQuoteDenom,
              totalPositionsPnlByQuoteDenom
            }"
          ></component>
        </VHocLoading>
      </v-panel>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  BigNumberInBase,
  BigNumberInWei,
  Status,
  StatusType
} from '@injectivelabs/utils'
import { TradeDirection } from '@injectivelabs/ts-types'
import {
  BankBalanceWithToken,
  IbcBankBalanceWithToken,
  BankBalanceWithTokenAndBalanceWithUsdBalance,
  SubaccountBalanceWithTokenAndUsdPriceAndUsdBalance,
  TokenWithBalanceAndPrice,
  UiDerivativeMarketWithToken,
  UiDerivativeOrderbook,
  UiPosition,
  ZERO_IN_BASE,
  ZERO_TO_STRING
} from '@injectivelabs/ui-common'
import VBankBalances from '~/components/partials/portfolio/bank-balances/index.vue'
import VTradingAccountBalances from '~/components/partials/portfolio/trading-account-balances/index.vue'
import VAccountSummary from '~/components/partials/portfolio/account-summary.vue'
import {
  HIDDEN_BALANCE_DISPLAY,
  UI_MINIMAL_AMOUNT,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  UI_DEFAULT_DISPLAY_DECIMALS
} from '~/app/utils/constants'
import VLoading from '~/components/elements/loading.vue'

const components = {
  bankAccount: 'bank-balances',
  tradingAccount: 'trading-account-balances'
}

export default Vue.extend({
  components: {
    VAccountSummary,
    VBankBalances,
    VLoading,
    VTradingAccountBalances
  },

  data() {
    return {
      HIDDEN_BALANCE_DISPLAY,
      balancesPoll: undefined as any,
      status: new Status(StatusType.Loading),
      hideBalance: false,

      components,
      component: components.bankAccount
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    bankBalances(): Array<BankBalanceWithToken | IbcBankBalanceWithToken> {
      return this.$accessor.bank.bankBalancesWithToken
    },

    positions(): UiPosition[] {
      return this.$accessor.positions.subaccountPositions
    },

    markets(): UiDerivativeMarketWithToken[] {
      return this.$accessor.derivatives.markets
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

    orderbooks(): Record<string, UiDerivativeOrderbook> {
      return this.$accessor.positions.orderbooks
    },

    // calculate and append total USD balances
    bankBalancesWithUsdBalance(): BankBalanceWithTokenAndBalanceWithUsdBalance[] {
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

        const balanceInUsd = new BigNumberInWei(balance)
          .toBase(tokenWithBalance.decimals)
          .times(tokenWithBalance.usdPrice)
          .toFixed(UI_DEFAULT_DISPLAY_DECIMALS)

        return {
          balance,
          balanceInUsd,
          denom: tokenWithBalance.denom,
          token: tokenWithBalance
        }
      })
    },

    subaccountBalancesWithUsdBalance(): SubaccountBalanceWithTokenAndUsdPriceAndUsdBalance[] {
      const { subaccountBalancesWithTokenAndPrice } = this

      return subaccountBalancesWithTokenAndPrice.map((balance) => {
        const balanceInUsd = new BigNumberInWei(balance.totalBalance)
          .toBase(balance.token.decimals)
          .times(balance.token.usdPrice)
          .toFixed(UI_DEFAULT_DISPLAY_DECIMALS)

        return {
          ...balance,
          balanceInUsd
        }
      })
    },

    totalBankBalance(): BigNumberInBase {
      const { bankBalancesWithUsdBalance } = this

      return bankBalancesWithUsdBalance.reduce(
        (total, balance) =>
          total.plus(new BigNumberInBase(balance.balanceInUsd)),
        ZERO_IN_BASE
      )
    },

    totalBankBalanceToString(): string {
      const { totalBankBalance } = this

      if (totalBankBalance.eq(0)) {
        return '0.00'
      }

      if (totalBankBalance.lte(UI_MINIMAL_AMOUNT)) {
        return `< ${UI_MINIMAL_AMOUNT.toFormat(
          UI_DEFAULT_MIN_DISPLAY_DECIMALS
        )}`
      }

      return totalBankBalance.toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    },

    totalSubaccountBalances(): BigNumberInBase {
      const { subaccountBalancesWithUsdBalance } = this

      return subaccountBalancesWithUsdBalance.reduce(
        (total, balance) =>
          total.plus(new BigNumberInBase(balance.balanceInUsd)),
        ZERO_IN_BASE
      )
    },

    totalSubaccountAvailableBalances(): BigNumberInBase {
      const { subaccountBalancesWithUsdBalance } = this

      return subaccountBalancesWithUsdBalance.reduce((total, balance) => {
        const availableBalanceInUsd = new BigNumberInWei(
          balance.availableBalance
        )
          .toBase(balance.token.decimals)
          .times(balance.token.usdPrice)
          .toFixed(UI_DEFAULT_DISPLAY_DECIMALS)

        return total.plus(availableBalanceInUsd)
      }, ZERO_IN_BASE)
    },

    totalSubaccountBalancesToString(): string {
      const { totalSubaccountBalances } = this

      if (totalSubaccountBalances.eq(0)) {
        return '0.00'
      }

      if (totalSubaccountBalances.lte(UI_MINIMAL_AMOUNT)) {
        return `< ${UI_MINIMAL_AMOUNT.toFormat(
          UI_DEFAULT_MIN_DISPLAY_DECIMALS
        )}`
      }

      return totalSubaccountBalances.toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    },

    totalPositionsPnlByQuoteDenom(): Record<string, BigNumberInBase> {
      const { markets, orderbooks, positions } = this

      return positions.reduce((list, p) => {
        const market = markets.find((m) => m.marketId === p.marketId)
        const orderbook = orderbooks[p.marketId]

        if (!market || !orderbook) {
          return list
        }

        const quoteDenom = market.quoteDenom.toLowerCase()

        if (!list[quoteDenom]) {
          list[quoteDenom] = ZERO_IN_BASE
        }

        const price = new BigNumberInWei(p.entryPrice).toBase(
          market.quoteToken.decimals
        )

        const [sell] = orderbook.sells
        const [buy] = orderbook.buys

        const highestBuy = new BigNumberInBase(buy ? buy.price : 0)
        const lowestSell = new BigNumberInBase(sell ? sell.price : 0)
        const executionPrice = new BigNumberInWei(
          highestBuy.plus(lowestSell).div(2)
        ).toBase(market.quoteToken.decimals)

        const pnl = executionPrice.isZero()
          ? ZERO_IN_BASE
          : new BigNumberInBase(p.quantity)
              .times(executionPrice.minus(price))
              .times(p.direction === TradeDirection.Long ? 1 : -1)

        list[quoteDenom] = list[quoteDenom].plus(pnl)

        return list
      }, {} as Record<string, BigNumberInBase>)
    },

    totalPositionsPnl(): BigNumberInBase {
      const {
        totalPositionsPnlByQuoteDenom,
        subaccountBalancesWithTokenAndPrice
      } = this

      return Object.entries(totalPositionsPnlByQuoteDenom).reduce(
        (total, [denom, balance]) => {
          const symbolFromSubaccount = subaccountBalancesWithTokenAndPrice.find(
            (b) => b.token.denom === denom
          )
          const usdPrice = symbolFromSubaccount
            ? symbolFromSubaccount.token.usdPrice
            : 1

          return total.plus(balance.times(usdPrice))
        },
        ZERO_IN_BASE
      )
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

    totalPositionsMargin(): BigNumberInBase {
      const {
        totalPositionsMarginByQuoteDenom,
        subaccountBalancesWithTokenAndPrice
      } = this

      return Object.entries(totalPositionsMarginByQuoteDenom).reduce(
        (total, [denom, balance]) => {
          const symbolFromSubaccount = subaccountBalancesWithTokenAndPrice.find(
            (b) => b.token.denom === denom
          )
          const usdPrice = symbolFromSubaccount
            ? symbolFromSubaccount.token.usdPrice
            : 1

          return total.plus(balance.times(usdPrice))
        },
        ZERO_IN_BASE
      )
    },

    tradingAccountBalances(): BigNumberInBase {
      const {
        totalSubaccountBalances,
        totalPositionsMargin,
        totalPositionsPnl
      } = this

      return totalSubaccountBalances
        .plus(totalPositionsMargin)
        .plus(totalPositionsPnl)
    },

    totalSubaccountAvailableBalancesToString(): string {
      const { totalSubaccountAvailableBalances } = this

      return totalSubaccountAvailableBalances.toFormat(2)
    },

    tradingAccountBalancesToString(): string {
      const { tradingAccountBalances } = this

      return tradingAccountBalances.toFormat(2)
    },

    totalBalance(): BigNumberInBase {
      const { totalBankBalance, tradingAccountBalances } = this

      return totalBankBalance.plus(tradingAccountBalances)
    },

    panelTitle(): string {
      const { component } = this

      return this.$t(
        `portfolio.${
          component === components.bankAccount
            ? 'bankBalances'
            : 'tradingAccountBalances'
        }`
      )
    }
  },

  mounted() {
    Promise.all([
      this.$accessor.token.getErc20TokensWithBalanceAndPriceFromBankAndMarkets(),
      this.$accessor.account.fetchSubaccountsBalancesWithPrices()
    ])
      .then(() => {
        //
      })
      .catch(this.$onError)
      .finally(() => {
        this.status.setIdle()
      })

    Promise.all([this.$accessor.token.getBitcoinUsdPrice()])
      .then(() => {
        //
      })
      .catch(this.$onError)
      .finally(() => {
        //
      })

    Promise.all([
      this.$accessor.derivatives.fetchSubaccountOrders(),
      this.$accessor.positions.fetchMarketsOrderbook(),
      this.$accessor.positions.fetchSubaccountPositions()
    ])
      .then(() => {
        //
      })
      .catch(this.$onError)
      .finally(() => {
        //
      })

    this.$root.$on('funding:refresh', this.refreshBalances)
    this.pollBalances()
  },

  beforeDestroy() {
    this.$root.$off('funding:refresh', this.refreshBalances)
    clearInterval(this.balancesPoll)
  },

  methods: {
    fetchBalances(): Promise<void[]> {
      return Promise.all([
        this.$accessor.bank.fetchBankBalancesWithToken(),
        this.$accessor.account.fetchSubaccountsBalancesWithPrices()
      ])
    },

    refreshBalances() {
      this.status.setLoading()

      this.fetchBalances()
        .then(() => {
          //
        })
        .catch(this.$onError)
        .finally(() => {
          this.status.setIdle()
        })
    },

    pollBalances() {
      this.balancesPoll = setInterval(() => {
        this.fetchBalances()
      }, 30 * 1000)
    }
  }
})
</script>
