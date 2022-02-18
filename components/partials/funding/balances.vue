<template>
  <div>
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <v-card-select
        v-model="component"
        lg
        :option="components.bankAccount"
        :status="status"
      >
        <template slot="subtitle">
          <div class="font-semibold text-lg flex items-center mb-4">
            <span>{{ $t('funding.bankAccount') }}</span>
            <v-icon-info-tooltip
              class="ml-3"
              color="text-gray-200"
              :tooltip="$t('funding.bankAccountTooltip')"
              lg
            />
          </div>
        </template>
        <div class="text-right tracking-wider">
          <p class="text-gray-500 text-xs uppercase mb-3">
            {{ $t('funding.walletValue') }}
          </p>
          <p class="text-2xl">{{ totalBankBalanceToString }} USD</p>
        </div>
      </v-card-select>

      <v-card-select
        v-model="component"
        lg
        :option="components.tradingAccount"
        :status="status"
      >
        <template slot="subtitle">
          <div class="font-semibold text-lg flex items-center mb-4">
            <span>{{ $t('funding.tradingAccount') }}</span>
            <v-icon-info-tooltip
              class="ml-3"
              color="text-gray-200"
              :tooltip="$t('funding.tradingAccountTooltip')"
              lg
            />
          </div>
        </template>
        <div class="text-right tracking-wider">
          <p class="text-gray-500 text-xs uppercase mb-3">
            {{ $t('funding.portfolioValue') }}
          </p>
          <p class="text-2xl">{{ tradingAccountBalancesToString }} USD</p>
        </div>
      </v-card-select>
    </div>

    <div class="w-full mt-6 relative">
      <portal to="account-summary">
        <div v-if="status.isLoading()" class="h-16 w-full xl:w-1/4 relative">
          <v-loading />
        </div>
        <v-account-summary v-else :total-balance="totalBalance" />
      </portal>

      <v-panel :title="panelTitle">
        <div
          v-if="component === components.tradingAccount"
          slot="context"
          class="w-full mx-auto mb-4 -mt-3"
        >
          <div class="flex flex-wrap items-center justify-center">
            <v-button-select
              v-model="tradingAccountComponent"
              :option="tradingAccountComponents.balances"
              text
            >
              {{ $t('activities.funds') }}
            </v-button-select>
            <div class="mx-2 w-px h-4 bg-gray-500"></div>
            <v-button-select
              v-model="tradingAccountComponent"
              :option="tradingAccountComponents.positions"
              text
            >
              {{ $t('activities.positions') }}
            </v-button-select>
          </div>
        </div>
        <div>
          <VHocLoading :status="status">
            <component
              :is="`v-${component}`"
              v-bind="{
                bankBalancesWithUsdBalance,
                subaccountBalancesWithUsdBalance,
                tradingAccountComponent
              }"
            ></component>
          </VHocLoading>
        </div>
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
  SubaccountBalanceWithTokenWithUsdBalance,
  TokenWithBalanceAndPrice,
  UiDerivativeMarketWithToken,
  UiDerivativeOrderbook,
  UiPosition,
  ZERO_IN_BASE,
  ZERO_TO_STRING
} from '@injectivelabs/ui-common'
import VBankBalances from '~/components/partials/funding/bank-balances/index.vue'
import VTradingAccountBalances from '~/components/partials/funding/trading-account-balances/index.vue'
import VAccountSummary from '~/components/partials/funding/account-summary.vue'
import {
  UI_MINIMAL_AMOUNT,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  UI_DEFAULT_DISPLAY_DECIMALS
} from '~/app/utils/constants'
import { SubaccountBalanceWithTokenAndPrice } from '~/types'
import VLoading from '~/components/elements/loading.vue'

const components = {
  bankAccount: 'bank-balances',
  tradingAccount: 'trading-account-balances'
}

const tradingAccountComponents = {
  balances: 'balances',
  positions: 'positions'
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
      status: new Status(StatusType.Loading),

      components,
      component: components.bankAccount,

      tradingAccountComponent: tradingAccountComponents.balances,
      tradingAccountComponents
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

    subaccountBalancesWithTokenAndPrice(): SubaccountBalanceWithTokenAndPrice[] {
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

    subaccountBalancesWithUsdBalance(): SubaccountBalanceWithTokenWithUsdBalance[] {
      const { subaccountBalancesWithTokenAndPrice } = this

      return subaccountBalancesWithTokenAndPrice.map((balance) => {
        const balanceInUsd = new BigNumberInWei(balance.availableBalance)
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

    totalPositionsPnl(): BigNumberInBase {
      const { markets, orderbooks, positions } = this

      return positions.reduce((total, p) => {
        const market = markets.find((m) => m.marketId === p.marketId)
        const orderbook = orderbooks[p.marketId]

        if (!market || !orderbook) {
          return total.plus(new BigNumberInBase(ZERO_IN_BASE))
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

        return total.plus(pnl)
      }, ZERO_IN_BASE)
    },

    totalPositionsPnlInString(): string {
      const { totalPositionsPnl } = this

      return totalPositionsPnl.toFormat(UI_DEFAULT_DISPLAY_DECIMALS)
    },

    totalPositionsMargin(): BigNumberInBase {
      const { markets, positions } = this

      return positions.reduce((total, p) => {
        const market = markets.find((m) => m.marketId === p.marketId)

        if (!market) {
          return total.plus(new BigNumberInBase(ZERO_IN_BASE))
        }

        return total.plus(
          new BigNumberInWei(p.margin).toBase(market.quoteToken.decimals)
        )
      }, ZERO_IN_BASE)
    },

    totalPositionMarginsToString(): string {
      const { totalPositionsMargin } = this

      return totalPositionsMargin.toFormat(UI_DEFAULT_DISPLAY_DECIMALS)
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
        `funding.${
          component === components.bankAccount
            ? 'bankBalances'
            : 'tradingAccountBalances'
        }`
      )
    }
  },

  mounted() {
    Promise.all([
      this.$accessor.token.getErc20TokensWithBalanceAndPriceFromBank(),
      this.$accessor.account.fetchSubaccountsBalancesWithPrices(),
      this.$accessor.derivatives.fetchSubaccountOrders(),
      this.$accessor.positions.fetchOrderbook(),
      this.$accessor.positions.fetchSubaccountPositions()
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
  }
})
</script>
