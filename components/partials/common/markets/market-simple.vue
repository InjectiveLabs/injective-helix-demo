<template>
  <TableRow>
    <span class="col-span-2 md:col-span-4">
      <div
        class="flex items-center mb-4 md:mb-0 cursor-pointer text-xs"
        @click.stop="handleClickOnMarket"
      >
        <img
          :src="market.baseToken.icon"
          :alt="market.baseToken.name"
          class="w-4 h-4 mr-2"
        />
        {{ market.ticker }}
        <span
          class="text-primary-500 uppercase tracking-widest text-2xs font-semibold ml-auto"
        >
          {{ typeToString }}
        </span>
      </div>
    </span>
    <span
      class="col-span-4 text-xs font-mono text-right flex items-center justify-end"
    >
      <span
        :class="{
          'text-aqua-500': lastPriceChange === Change.Increase,
          'text-red-500': lastPriceChange === Change.Decrease
        }"
      >
        {{ lastTradedPriceToFormat }}
        <span class="text-xs text-gray-500 ml-1">
          {{ market.quoteToken.symbol }}
        </span>
      </span>
    </span>
    <span class="col-span-4 text-xs font-mono text-right">
      <span :class="change.gte(0) ? 'text-aqua-500' : 'text-red-500'">
        {{ changeToFormat }}%
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

      if (!summary.lastPrice) {
        return Change.NoChange
      }

      return new BigNumberInBase(summary.price).gte(summary.lastPrice)
        ? Change.Increase
        : Change.Decrease
    },

    typeToString(): string {
      const { market } = this

      return market.type === MarketType.Spot ? this.$t('spot') : this.$t('perp')
    }
  },

  methods: {
    handleClickOnMarket() {
      const { market } = this

      this.$root.$emit('toggle-market-slideout')

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
