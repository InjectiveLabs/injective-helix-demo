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
        <span v-else>{{ totalBalanceWithPnlAndMarginInString }}</span>
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
        <span v-else-if="!marginHold.eq(0)">{{ marginHoldToString }}</span>
        <span v-else>&mdash;</span>
      </span>

      <span class="font-mono text-left xl:hidden">
        {{ $t('trade.unrealized_pnl') }}
      </span>
      <span
        class="xl:col-span-2 font-mono text-right xl:flex items-center justify-end"
      >
        <span v-if="hideBalance">{{ HIDDEN_BALANCE_DISPLAY }}</span>
        <span v-else-if="!unrealizedPnl.eq(0)">{{
          unrealizedPnlToString
        }}</span>
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
          <span class="leading-4">
            {{ totalBalanceWithPnlAndMarginInUsdToString }} USD
          </span>
          <span
            v-if="totalBalanceWithPnlAndMarginInBtc.gt(0)"
            class="text-opacity-50 text-gray-200 text-2xs xs:ml-1 leading-4"
          >
            ≈ {{ totalBalanceWithPnlAndMarginInBtcToString }} BTC
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
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
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

    totalPositionsMarginByQuoteToken: {
      type: Object as PropType<Record<string, BigNumberInBase>>,
      required: true
    },

    totalPositionsPnlByQuoteToken: {
      type: Object as PropType<Record<string, BigNumberInBase>>,
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

    positionMargin(): BigNumberInBase {
      const { balance, totalPositionsMarginByQuoteToken } = this

      if (!balance || !balance.token || !balance.token.symbol) {
        return ZERO_IN_BASE
      }

      return (
        totalPositionsMarginByQuoteToken[balance.token.symbol.toLowerCase()] ||
        ZERO_IN_BASE
      )
    },

    unrealizedPnl(): BigNumberInBase {
      const { balance, totalPositionsPnlByQuoteToken } = this

      if (!balance || !balance.token || !balance.token.symbol) {
        return ZERO_IN_BASE
      }

      return (
        totalPositionsPnlByQuoteToken[balance.token.symbol.toLowerCase()] ||
        ZERO_IN_BASE
      )
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

    inOrderBalance(): BigNumberInBase {
      const { availableBalance, totalBalance } = this

      return totalBalance.minus(availableBalance)
    },

    marginHold(): BigNumberInBase {
      const { inOrderBalance, positionMargin } = this

      return inOrderBalance.plus(positionMargin)
    },

    totalBalanceWithPnlAndMargin(): BigNumberInBase {
      const { totalBalance, positionMargin, unrealizedPnl } = this

      return totalBalance.plus(positionMargin).plus(unrealizedPnl)
    },

    totalBalanceWithPnlAndMarginInUsd(): BigNumberInBase {
      const { balance, totalBalanceWithPnlAndMargin } = this

      return totalBalanceWithPnlAndMargin.multipliedBy(balance.token.usdPrice)
    },

    totalBalanceWithPnlAndMarginInBtc(): BigNumberInBase {
      const { totalBalanceWithPnlAndMarginInUsd, btcUsdPrice } = this

      if (!btcUsdPrice) {
        return ZERO_IN_BASE
      }

      return totalBalanceWithPnlAndMarginInUsd.dividedBy(
        new BigNumberInBase(btcUsdPrice)
      )
    },

    unrealizedPnlToString(): string | undefined {
      const { unrealizedPnl } = this

      return unrealizedPnl.toFormat(
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

    marginHoldToString(): string {
      const { marginHold } = this

      return marginHold.toFormat(
        UI_DEFAULT_DISPLAY_DECIMALS,
        BigNumberInBase.ROUND_DOWN
      )
    },

    totalBalanceWithPnlAndMarginInString(): string {
      const { totalBalanceWithPnlAndMargin } = this

      return totalBalanceWithPnlAndMargin.toFormat(
        UI_DEFAULT_DISPLAY_DECIMALS,
        BigNumberInBase.ROUND_DOWN
      )
    },

    totalBalanceWithPnlAndMarginInBtcToString(): string {
      const { totalBalanceWithPnlAndMarginInBtc } = this

      if (totalBalanceWithPnlAndMarginInBtc.eq('0')) {
        return '0.00'
      }

      if (totalBalanceWithPnlAndMarginInBtc.lte('0.0001')) {
        return '<0.0001'
      }

      return totalBalanceWithPnlAndMarginInBtc.toFormat(
        UI_DEFAULT_DISPLAY_DECIMALS
      )
    },

    totalBalanceWithPnlAndMarginInUsdToString(): string {
      const { totalBalanceWithPnlAndMarginInUsd } = this

      return totalBalanceWithPnlAndMarginInUsd.toFormat(
        UI_DEFAULT_MIN_DISPLAY_DECIMALS
      )
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
