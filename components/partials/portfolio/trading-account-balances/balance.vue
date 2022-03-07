<template>
  <TableRow md class="text-sm md:grid-cols-2 xl:grid-cols-12">
    <div class="col-span-2 xl:col-span-5 grid grid-cols-2 xl:grid-cols-5 gap-4">
      <span class="font-mono text-left xl:hidden">
        {{ $t('portfolio.asset') }}
      </span>
      <span class="text-right xl:text-left">
        <div class="flex items-center justify-end xl:justify-start">
          <div v-if="balance.token.logo" class="w-6 h-6">
            <img
              :src="balance.token.logo"
              :alt="balance.token.name"
              class="min-w-full h-auto rounded-full"
            />
          </div>
          <div class="ml-3">
            <span class="text-gray-200 font-bold">
              {{ balance.token.symbol }}
            </span>
          </div>
        </div>
      </span>
      <span class="font-mono text-left xl:hidden">
        {{ $t('portfolio.total') }}
      </span>
      <span
        class="xl:col-span-2 font-mono text-right justify-end xl:flex items-center"
      >
        <span v-if="hideBalance">{{ HIDDEN_BALANCE_DISPLAY }}</span>
        <span v-else>{{ totalBalanceInString }}</span>
      </span>
      <span class="font-mono text-left xl:hidden">
        {{ $t('portfolio.available') }}
      </span>
      <span
        class="xl:col-span-2 font-mono text-right xl:flex items-center justify-end"
      >
        <span v-if="hideBalance">{{ HIDDEN_BALANCE_DISPLAY }}</span>
        <span v-else>{{ availableBalanceToString }}</span>
      </span>
    </div>

    <div class="col-span-2 xl:col-span-7 grid grid-cols-2 xl:grid-cols-9 gap-4">
      <span class="font-mono text-left xl:hidden">
        {{ $t('portfolio.marginHold') }}
      </span>
      <span
        class="xl:col-span-2 font-mono text-right xl:flex items-center justify-end"
      >
        <span v-if="hideBalance">{{ HIDDEN_BALANCE_DISPLAY }}</span>
        <span v-else>{{ marginHoldToString }}</span>
      </span>

      <span class="font-mono text-left xl:hidden">
        {{ $t('trade.unrealized_pnl') }}
      </span>
      <span
        class="xl:col-span-2 font-mono text-right xl:flex items-center justify-end"
      >
        <span v-if="hideBalance">{{ HIDDEN_BALANCE_DISPLAY }}</span>
        <span v-else-if="unrealizedPnl">{{ unrealizedPnl }}</span>
        <span v-else>&mdash;</span>
      </span>

      <span class="font-mono text-left xl:hidden">
        {{ $t('common.value') }}
      </span>
      <span class="xl:col-span-3 font-mono whitespace-nowrap text-right">
        <span v-if="hideBalance">
          {{ HIDDEN_BALANCE_DISPLAY }}
        </span>
        <span v-else class="flex items-end justify-end flex-col">
          <span class="leading-4">{{ totalInUsdToString }} USD</span>
          <span
            v-if="totalInBtc.gt(0)"
            class="text-opacity-50 text-gray-200 text-2xs xs:ml-1 leading-4"
          >
            ≈ {{ totalInBtcToString }} BTC
          </span>
        </span>
      </span>
      <div
        class="col-span-2 text-right text-primary-500 text-sm flex justify-around sm:justify-end items-center"
      >
        <nuxt-link
          v-if="spotMarketRoute"
          class="cursor-pointer"
          :to="{ name: 'spot-spot', params: { spot: spotMarketRoute } }"
        >
          <span>
            {{ $t('common.trade') }}
          </span>
        </nuxt-link>

        <span class="cursor-pointer ml-6" @click="handleTransferClick">
          {{ $t('common.transfer') }}
        </span>
      </div>
    </div>
  </TableRow>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import {
  BigNumber,
  BigNumberInBase,
  BigNumberInWei
} from '@injectivelabs/utils'
import {
  INJECTIVE_DENOM,
  ZERO_IN_BASE,
  SubaccountBalanceWithTokenAndUsdPriceAndUsdBalance
} from '@injectivelabs/ui-common'
import TableRow from '~/components/elements/table-row.vue'
import {
  HIDDEN_BALANCE_DISPLAY,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  UI_DEFAULT_DISPLAY_DECIMALS
} from '~/app/utils/constants'
import { spot as allowedSpotMarkets } from '~/routes.config'

export default Vue.extend({
  components: {
    TableRow
  },

  props: {
    balance: {
      required: true,
      type: Object as PropType<SubaccountBalanceWithTokenAndUsdPriceAndUsdBalance>
    },

    hideBalance: {
      type: Boolean,
      default: false
    },

    totalPositionsMargin: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    totalPositionsPnl: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    }
  },

  data() {
    return {
      allowedSpotMarkets,
      HIDDEN_BALANCE_DISPLAY,
      INJECTIVE_DENOM
    }
  },

  computed: {
    btcUsdPrice(): number {
      return this.$accessor.token.btcUsdPrice
    },

    isUsdt(): Boolean {
      const { balance } = this

      if (!balance || !balance.token || !balance.token.symbol) {
        return false
      }

      return balance.token.symbol.toUpperCase() === 'USDT'
    },

    availableBalance(): BigNumberInBase {
      const { balance } = this

      if (!balance.availableBalance) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(balance.availableBalance).toBase(
        balance.token.decimals
      )
    },

    totalBalance(): BigNumberInBase {
      const { balance } = this

      if (!balance.totalBalance) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(balance.totalBalance).toBase(
        balance.token.decimals
      )
    },

    totalBalanceWithMarginAndPnL(): BigNumberInBase {
      const { totalBalance, marginHold, totalPositionsPnl } = this

      return totalBalance.plus(marginHold).plus(totalPositionsPnl)
    },

    inOrderBalance(): BigNumberInBase {
      const { availableBalance, totalBalance } = this

      return totalBalance.minus(availableBalance)
    },

    marginHold(): BigNumberInBase {
      const { inOrderBalance, isUsdt, totalPositionsMargin } = this

      if (!isUsdt) {
        return inOrderBalance
      }

      return inOrderBalance.plus(totalPositionsMargin)
    },

    unrealizedPnl(): string | undefined {
      const { isUsdt, totalPositionsPnl } = this

      if (!isUsdt) {
        return undefined
      }

      return totalPositionsPnl.toFormat(
        UI_DEFAULT_DISPLAY_DECIMALS,
        BigNumberInBase.ROUND_DOWN
      )
    },

    availableBalanceToString(): string {
      const { availableBalance } = this

      return availableBalance.toFormat(
        UI_DEFAULT_DISPLAY_DECIMALS,
        BigNumberInBase.ROUND_DOWN
      )
    },

    totalInUsd(): BigNumberInBase {
      const { isUsdt, balance, totalBalanceWithMarginAndPnL } = this

      if (!isUsdt) {
        return new BigNumberInBase(balance.balanceInUsd)
      }

      return totalBalanceWithMarginAndPnL.multipliedBy(balance.token.usdPrice)
    },

    totalInBtc(): BigNumberInBase {
      const { totalInUsd, btcUsdPrice } = this

      if (!btcUsdPrice) {
        return ZERO_IN_BASE
      }

      return totalInUsd.dividedBy(new BigNumberInBase(btcUsdPrice))
    },

    marginHoldToString(): string {
      const { marginHold } = this

      return marginHold.toFormat(
        UI_DEFAULT_DISPLAY_DECIMALS,
        BigNumberInBase.ROUND_DOWN
      )
    },

    totalBalanceInString(): string {
      const { isUsdt, totalBalance, totalBalanceWithMarginAndPnL } = this

      const total = isUsdt ? totalBalanceWithMarginAndPnL : totalBalance

      return total.toFormat(
        UI_DEFAULT_DISPLAY_DECIMALS,
        BigNumberInBase.ROUND_DOWN
      )
    },

    totalInBtcToString(): string {
      const { totalInBtc } = this

      if (totalInBtc.eq('0')) {
        return '0.00'
      }

      if (totalInBtc.lte('0.0001')) {
        return '<0.0001'
      }

      return totalInBtc.toFormat(UI_DEFAULT_DISPLAY_DECIMALS)
    },

    totalInUsdToString(): string {
      const { totalInUsd } = this

      return totalInUsd.toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    },

    spotMarketRoute(): string | undefined {
      const { allowedSpotMarkets, balance } = this

      const route = allowedSpotMarkets.find((marketRoute) => {
        return marketRoute.startsWith(balance.token.symbol.toLowerCase())
      })

      return route
    }
  },

  methods: {
    handleTransferClick() {
      const { balance } = this

      this.$root.$emit('bridge:transfer-to-bank', balance.token)
    }
  }
})
</script>
