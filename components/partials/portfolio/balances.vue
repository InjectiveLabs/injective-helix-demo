<template>
  <div>
    <div
      class="flex sm:grid grid-cols-2 lg:grid-cols-3 gap-4 overflow-x-auto hide-scrollbar"
    >
      <v-card-select
        v-model="component"
        lg
        :option="components.bankAccount"
        data-cy="wallet-panel"
      >
        <template slot="subtitle">
          <div class="font-semibold text-lg flex items-center mb-2">
            <span>{{ $t('portfolio.bankAccount') }}</span>
            <IconInfoTooltip
              class="ml-3"
              color="text-gray-200"
              :tooltip="$t('portfolio.bankAccountTooltip')"
              lg
            />
          </div>
        </template>

        <IconWallet slot="icon" class="w-6 h-auto" />

        <div class="text-right">
          <p class="text-gray-500 text-xs uppercase mb-2 tracking-wider">
            {{ $t('portfolio.walletValue') }}
          </p>
          <p class="text-lg 3md:text-2xl" data-cy="wallet-value-usd-text-content-parent">
            <span v-if="status.isLoading()">&mdash; USD</span>
            <span v-else-if="hideBalance">{{ HIDDEN_BALANCE_DISPLAY }}</span>
            <span v-else data-cy="wallet-value-usd-text-content">
              {{ totalBankBalanceToString }} USD
            </span>
          </p>
        </div>
      </v-card-select>

      <v-card-select
        v-model="component"
        lg
        :option="components.tradingAccount"
        data-cy="trading-account-panel"
      >
        <template slot="subtitle">
          <div class="font-semibold text-lg flex items-center mb-2">
            <span>{{ $t('portfolio.tradingAccount') }}</span>
            <IconInfoTooltip
              class="ml-3"
              color="text-gray-200"
              :tooltip="$t('portfolio.tradingAccountTooltip')"
              lg
            />
          </div>
        </template>

        <IconRectangleChart slot="icon" class="w-6 h-auto" />

        <div class="text-right">
          <p class="text-gray-500 text-xs uppercase mb-2 tracking-wider">
            {{ $t('portfolio.portfolioValue') }}
          </p>
          <p
            class="text-lg 3md:text-2xl"
            data-cy="trading-account-total-usd-text-content"
          >
            <span v-if="status.isLoading()">&mdash; USD</span>
            <span v-else-if="hideBalance">{{ HIDDEN_BALANCE_DISPLAY }}</span>
            <span v-else>{{ tradingAccountBalancesToString }} USD</span>
          </p>
          <p
            class="text-sm mt-2 text-gray-500"
            data-cy="trading-account-available-usd-text-content"
          >
            <span v-if="status.isLoading()">&mdash; USD</span>
            <span v-else-if="hideBalance">{{ HIDDEN_BALANCE_DISPLAY }}</span>
            <span v-else>
              {{ $t('common.available') }}
              {{ totalTradingAccountAvailableBalancesToString }} USD
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

      <v-panel :title="panelTitle" card-wrapper-class="mt-6">
        <portal-target slot="context" name="portfolio-balance-sub-tabs" />

        <VHocLoading :status="status">
          <component
            :is="`v-${component}`"
            v-bind="{
              hideBalance,
              bankBalancesWithUsdBalance,
              subaccountBalanceWithTokenMarginAndPnlTotalBalanceInUsd
            }"
          />
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
  UiPosition,
  ZERO_IN_BASE,
  ZERO_TO_STRING
} from '@injectivelabs/ui-common'
import VBankBalances from '~/components/partials/portfolio/bank-balances/index.vue'
import VTradingAccountBalances from '~/components/partials/portfolio/trading-account-balances/index.vue'
import VAccountSummary from '~/components/partials/portfolio/account-summary.vue'
import { SubaccountBalanceWithTokenMarginAndPnlTotalBalanceInUsd } from '~/types'
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
            .plus(pnl)
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

    totalTradingAccountAvailableBalances(): BigNumberInBase {
      const { subaccountBalancesWithTokenAndPrice } = this

      return subaccountBalancesWithTokenAndPrice.reduce((total, balance) => {
        const availableBalanceInUsd = new BigNumberInWei(
          balance.availableBalance
        )
          .toBase(balance.token.decimals)
          .times(balance.token.usdPrice)
          .toFixed(UI_DEFAULT_DISPLAY_DECIMALS)

        return total.plus(availableBalanceInUsd)
      }, ZERO_IN_BASE)
    },

    tradingAccountBalances(): BigNumberInBase {
      const { subaccountBalanceWithTokenMarginAndPnlTotalBalanceInUsd } = this

      return subaccountBalanceWithTokenMarginAndPnlTotalBalanceInUsd.reduce(
        (total, balance) =>
          total.plus(new BigNumberInBase(balance.totalBalanceInUsd)),
        ZERO_IN_BASE
      )
    },

    tradingAccountBalancesToString(): string {
      const { tradingAccountBalances } = this

      return tradingAccountBalances.toFormat(2)
    },

    totalTradingAccountAvailableBalancesToString(): string {
      const { totalTradingAccountAvailableBalances } = this

      return totalTradingAccountAvailableBalances.toFormat(2)
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
      this.$accessor.positions.fetchSubaccountPositions(),
      // set up streaming
      this.$accessor.account.streamSubaccountBalances(),
      this.$accessor.positions.streamSubaccountPositions(),
      this.$accessor.derivatives.streamSubaccountOrders()
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
    this.$accessor.app.cancelAllStreams()
    clearInterval(this.balancesPoll)
  },

  methods: {
    fetchBalances(): Promise<void[]> {
      return Promise.all([
        this.$accessor.account.fetchSubaccountsBalancesWithPrices(),
        this.$accessor.bank.fetchBankBalancesWithToken(),
        this.$accessor.derivatives.fetchSubaccountOrders(),
        this.$accessor.positions.fetchSubaccountPositions() // refresh mark price
      ])
    },

    refreshBalances() {
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
