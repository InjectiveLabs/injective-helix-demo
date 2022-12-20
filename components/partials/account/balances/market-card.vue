<template>
  <div
    class="rounded-lg bg-gray-950 p-4 flex flex-col gap-2"
    :to="{
      name: 'spot-spot',
      params: { marketId: market.marketId, spot: market.slug }
    }"
  >
    <span class="font-bold text-sm">
      {{ market.baseToken.symbol }}/{{ market.quoteToken.symbol }}
    </span>

    <div class="flex justify-between items-center">
      <span
        v-if="!lastTradedPrice.isNaN()"
        class="font-mono text-sm"
        :class="{
          'text-green-500': lastPriceChange === Change.Increase,
          'text-gray-350': lastPriceChange === Change.NoChange,
          'text-red-500': lastPriceChange === Change.Decrease
        }"
      >
        {{ lastTradedPriceToFormat }}
      </span>
      <span v-else class="text-gray-350">&mdash;</span>

      <span
        v-if="!change.isNaN()"
        class="font-mono text-sm"
        :class="{
          'text-green-500': change.gt(0),
          'text-gray-350': change.eq(0),
          'text-red-500': change.lt(0)
        }"
      >
        {{ changeToFormat }}%
      </span>
      <span v-else class="font-mono text-sm text-gray-350">&mdash;</span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import {
  Change,
  UiSpotMarketSummary,
  UiSpotMarketWithToken,
  ZERO_IN_BASE
} from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { UI_DEFAULT_PRICE_DISPLAY_DECIMALS } from '~/app/utils/constants'

export default Vue.extend({
  props: {
    market: {
      type: Object as PropType<UiSpotMarketWithToken>,
      required: true
    },

    summary: {
      type: Object as PropType<UiSpotMarketSummary>,
      required: true
    }
  },

  data() {
    return {
      Change
    }
  },

  computed: {
    lastTradedPrice(): BigNumberInBase {
      const { summary } = this

      if (!summary || !summary.price) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(summary.lastPrice || summary.price)
    },

    lastTradedPriceToFormat(): string {
      const { lastTradedPrice, market } = this

      return lastTradedPrice.toFormat(
        market?.priceDecimals || UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
        BigNumberInBase.ROUND_DOWN
      )
    },

    change(): BigNumberInBase {
      const { summary } = this

      if (!summary || !summary.change) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(summary.change)
    },

    changeToFormat(): string {
      const { change } = this

      return change.toFormat(2)
    },

    lastPriceChange(): Change {
      const { summary } = this

      if (!summary) {
        return Change.NoChange
      }

      if (!summary.lastPriceChange) {
        return Change.NoChange
      }

      return summary.lastPriceChange
    }
  }
})
</script>
