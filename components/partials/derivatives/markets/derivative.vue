<template>
  <tr @click.stop="onRowClick">
    <td is="v-ui-table-td">
      <div class="flex items-center">
        <img
          :src="market.baseToken.icon"
          :alt="market.baseToken.name"
          class="w-6 h-6 mr-4"
        />
        <div class="leading-none">
          <p class="text-gray-100 font-semibold text-sm">{{ market.ticker }}</p>
          <p class="text-gray-500 text-xs">
            {{ market.baseToken.name }}
          </p>
        </div>
      </div>
    </td>
    <td is="v-ui-table-td" right class="font-normal">
      <div v-if="lastTradedPrice.gt(0)" class="flex justify-end items-center">
        <v-ui-format-price
          v-bind="{
            value: lastTradedPrice,
            decimals: market.priceDecimals,
            class: {
              'text-primary-500': lastPriceChange === Change.Increase,
              'text-accent-500': lastPriceChange === Change.Decrease
            }
          }"
          class="mr-1"
        />
        <v-ui-icon
          v-if="[Change.Increase, Change.Decrease].includes(lastPriceChange)"
          xs
          :rotate="lastPriceChange === Change.Decrease"
          :primary="lastPriceChange === Change.Increase"
          :accent="lastPriceChange === Change.Decrease"
          :icon="Icon.Arrow"
        />
      </div>
      <span v-else class="text-gray-500">&mdash;</span>
    </td>
    <td is="v-ui-table-td" right class="font-normal">
      <v-ui-text sm class="text-right">
        <v-ui-format-percent
          v-bind="{
            appendPlusSign: true,
            precision: 2,
            value: change.toFixed(),
            class: change.gte(0) ? 'text-primary-500' : 'text-accent-500'
          }"
        />
      </v-ui-text>
    </td>
    <td is="v-ui-table-td" right class="font-normal">
      <v-ui-text v-if="volume.gt(0)" class="flex items-center justify-end">
        <v-ui-format-number
          v-bind="{
            dontGroupValues: true,
            value: volume,
            decimals: 0
          }"
        />
        <small class="text-xs font-normal text-gray-500 ml-1">{{
          market.quoteToken.symbol
        }}</small>
      </v-ui-text>
      <span v-else class="text-gray-500">&mdash;</span>
    </td>
  </tr>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { ZERO_IN_BASE } from '~/app/utils/constants'
import {
  UiDerivativeMarket,
  Icon,
  Change,
  UiDerivativeMarketSummary
} from '~/types'

export default Vue.extend({
  props: {
    market: {
      required: true,
      type: Object as PropType<UiDerivativeMarket>
    },

    marketSummary: {
      required: true,
      type: Object as PropType<UiDerivativeMarketSummary>
    }
  },

  data() {
    return {
      Icon,
      Change
    }
  },

  computed: {
    currentMarket(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    },

    currentLastTradedPrice(): BigNumberInBase {
      return this.$accessor.derivatives.lastTradedPrice
    },

    lastTradedPrice(): BigNumberInBase {
      const {
        market,
        currentMarket,
        currentLastTradedPrice,
        marketSummary
      } = this

      if (!market || !marketSummary) {
        return ZERO_IN_BASE
      }

      if (
        currentMarket &&
        currentMarket.marketId === market.marketId &&
        currentLastTradedPrice
      ) {
        return currentLastTradedPrice
      }

      return new BigNumberInBase(marketSummary.price)
    },

    volume(): BigNumberInBase {
      const { market, marketSummary } = this

      if (!market || !marketSummary) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(
        new BigNumberInBase(marketSummary.volume).dp(0).toFixed()
      )
    },

    change(): BigNumberInBase {
      const { market, marketSummary } = this

      if (!market || !marketSummary) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(marketSummary.change)
    },

    lastPriceChange(): Change {
      const { market, marketSummary } = this

      if (!market || !marketSummary) {
        return Change.NoChange
      }

      if (!marketSummary.lastPrice) {
        return Change.NoChange
      }

      if (
        new BigNumberInBase(marketSummary.lastPrice).eq(marketSummary.price)
      ) {
        return Change.NoChange
      }

      return new BigNumberInBase(marketSummary.price).gte(
        marketSummary.lastPrice
      )
        ? Change.Increase
        : Change.Decrease
    }
  },

  methods: {
    onRowClick() {
      const { market } = this

      this.$emit('selected')
      this.$router.push({
        name: 'derivatives-derivative',
        params: {
          marketId: market.marketId,
          derivative: market.slug
        }
      })
    }
  }
})
</script>
