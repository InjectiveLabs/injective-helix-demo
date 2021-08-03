<template>
  <tr @click.stop="onRowClick">
    <td is="v-ui-table-td" xs>
      <p class="text-gray-100 text-sm">{{ market.ticker }}</p>
    </td>
    <td is="v-ui-table-td" right xs>
      <div v-if="lastTradedPrice.gt(0)" class="flex justify-end items-center">
        <v-ui-format-price
          v-bind="{
            value: lastTradedPrice,
            decimals: market.priceDecimals,
            class: {
              'text-aqua-500': lastPriceChange === Change.Increase,
              'text-red-500': lastPriceChange === Change.Decrease
            }
          }"
          class="mr-1"
        />
        <v-ui-icon
          v-if="[Change.New, Change.NoChange].includes(lastPriceChange)"
          xs
          :rotate="lastPriceChange === Change.Decrease"
          :aqua="lastPriceChange === Change.Increase"
          :red="lastPriceChange === Change.Decrease"
          :icon="Icon.Arrow"
        />
      </div>
      <span v-else class="text-gray-500">&mdash;</span>
    </td>
  </tr>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { ZERO_IN_BASE } from '~/app/utils/constants'
import {
  Change,
  DerivativeOrderSide,
  UiDerivativeMarket,
  Icon,
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
      Change,
      DerivativeOrderSide
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
