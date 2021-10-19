<template>
  <TableRow @click.native.stop="handleClickOnMarket">
    <span
      class="text-base md:text-sm"
      :class="{
        'col-span-2 md:col-span-3': !simple,
        'col-span-2 md:col-span-4': simple
      }"
    >
      <div
        class="flex items-center cursor-pointer justify-center md:justify-start"
      >
        <img
          :src="market.baseToken.icon"
          :alt="market.baseToken.name"
          class="w-4 h-4 md:w-6 md:h-6 mr-4"
        />
        <div class="mr-4 whitespace-nowrap">
          {{ market.ticker }}
          <span v-if="!simple" class="text-gray-500 text-xs hidden md:block">
            {{ market.baseToken.name }}
          </span>
        </div>
      </div>
    </span>
    <span
      class="col-span-1 text-2xs md:text-sm text-gray-300 text-left md:hidden"
    >
      {{ $t('last_traded_price') }}
    </span>
    <span
      class="font-mono text-right text-2xs md:text-sm flex items-center justify-end"
      :class="{
        'col-span-1 md:col-span-3': !simple,
        'col-span-1 md:col-span-4': simple
      }"
    >
      <v-icon-arrow
        class="transform w-3 h-3 mr-1"
        :class="{
          'text-aqua-500 rotate-90': lastPriceChange !== Change.Decrease,
          'text-red-500 -rotate-90': lastPriceChange === Change.Decrease
        }"
      />
      <span
        :class="{
          'text-aqua-500': lastPriceChange !== Change.Decrease,
          'text-red-500': lastPriceChange === Change.Decrease
        }"
      >
        {{ lastTradedPriceToFormat }}
        <span class="text-xs text-gray-500 ml-1">
          {{ market.quoteToken.symbol }}
        </span>
      </span>
    </span>
    <span
      class="col-span-1 text-2xs md:text-sm text-gray-300 text-left md:hidden"
    >
      {{ $t('market_change_24h') }}
    </span>
    <span
      class="font-mono text-right text-2xs md:text-sm"
      :class="{
        'col-span-1 md:col-span-3': !simple,
        'col-span-1 md:col-span-4': simple
      }"
    >
      <span :class="change.gte(0) ? 'text-aqua-500' : 'text-red-500'">
        {{ changeToFormat }}%
      </span>
    </span>
    <span
      v-if="!simple"
      class="col-span-1 text-2xs md:text-sm text-gray-300 text-left md:hidden"
    >
      {{ $t('market_volume_24h') }}
    </span>
    <span
      v-if="!simple"
      class="text-2xs md:text-sm font-mono text-right"
      :class="{ 'col-span-1 md:col-span-3': !simple, 'col-span-4': simple }"
    >
      {{ volumeToFormat }}
      <span class="text-xs text-gray-500 ml-1">
        {{ market.quoteToken.symbol }}
      </span>
    </span>
  </TableRow>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import TableRow from '~/components/elements/table-row.vue'
import {
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
  ZERO_IN_BASE
} from '~/app/utils/constants'
import {
  Change,
  MarketType,
  UiDerivativeMarket,
  UiDerivativeMarketSummary,
  UiSpotMarket,
  UiSpotMarketSummary
} from '~/types'

export default Vue.extend({
  components: {
    TableRow
  },

  props: {
    simple: {
      required: false,
      default: false,
      type: Boolean
    },

    market: {
      required: true,
      type: Object as PropType<UiDerivativeMarket | UiSpotMarket>
    },

    summary: {
      required: true,
      type: Object as PropType<UiDerivativeMarketSummary | UiSpotMarketSummary>
    }
  },

  data() {
    return {
      Change
    }
  },

  computed: {
    currentSpotMarket(): UiSpotMarket | undefined {
      return this.$accessor.spot.market
    },

    currentDerivativeMarket(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    },

    currentLastSpotTradedPrice(): BigNumberInBase {
      return this.$accessor.spot.lastTradedPrice
    },

    currentLastDerivativeTradedPrice(): BigNumberInBase {
      return this.$accessor.derivatives.lastTradedPrice
    },

    currentMarket(): UiSpotMarket | UiDerivativeMarket | undefined {
      const { currentSpotMarket, currentDerivativeMarket, market } = this

      return market.type === MarketType.Spot
        ? currentSpotMarket
        : currentDerivativeMarket
    },

    currentLastTradedPrice(): BigNumberInBase {
      const {
        currentLastSpotTradedPrice,
        currentLastDerivativeTradedPrice,
        market
      } = this

      return market.type === MarketType.Spot
        ? currentLastSpotTradedPrice
        : currentLastDerivativeTradedPrice
    },

    lastTradedPrice(): BigNumberInBase {
      const { market, currentMarket, currentLastTradedPrice, summary } = this

      if (!market || !summary) {
        return ZERO_IN_BASE
      }

      if (
        currentMarket &&
        currentMarket.marketId === market.marketId &&
        currentLastTradedPrice
      ) {
        return currentLastTradedPrice
      }

      return new BigNumberInBase(summary.price)
    },

    lastTradedPriceToFormat(): string {
      const { market, lastTradedPrice } = this

      if (!market) {
        return lastTradedPrice.toFormat(
          UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
          BigNumberInBase.ROUND_DOWN
        )
      }

      return lastTradedPrice.toFormat(
        market.priceDecimals,
        BigNumberInBase.ROUND_DOWN
      )
    },

    volume(): BigNumberInBase {
      const { market, summary } = this

      if (!market || !summary) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(summary.volume)
    },

    volumeToFormat(): string {
      const { volume } = this

      return volume.toFormat(0, BigNumberInBase.ROUND_DOWN)
    },

    change(): BigNumberInBase {
      const { market, summary } = this

      if (!market || !summary) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(summary.change)
    },

    changeToFormat(): string {
      const { change } = this

      return change.toFormat(2, BigNumberInBase.ROUND_DOWN)
    },

    lastPriceChange(): Change {
      const { market, summary } = this

      if (!market || !summary) {
        return Change.NoChange
      }

      if (!summary.lastPriceChange) {
        return Change.NoChange
      }

      return summary.lastPriceChange
    }
  },

  methods: {
    handleClickOnMarket() {
      const { market } = this

      if (market.type === MarketType.Derivative) {
        return this.$router.push({
          name: 'derivatives-derivative',
          params: {
            marketId: market.marketId,
            derivative: market.slug
          }
        })
      }

      if (market.type === MarketType.Spot) {
        return this.$router.push({
          name: 'spot-spot',
          params: {
            marketId: market.marketId,
            spot: market.slug
          }
        })
      }
    }
  }
})
</script>
