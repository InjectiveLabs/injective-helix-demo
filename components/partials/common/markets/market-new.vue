<template>
  <TableRow
    :dense="simple"
    :lg="!simple"
    class="cursor-pointer"
    @click.native.stop="handleClickOnMarket"
  >
    <span
      class="text-base md:text-sm"
      :class="{
        'col-span-3': !simple,
        'col-span-5': simple
      }"
    >
      <div class="flex items-center cursor-pointer justify-start">
        <img
          :src="market.baseToken.logo"
          :alt="market.baseToken.name"
          class="w-4 h-4 md:w-6 md:h-6 mr-4"
        />
        <div class="mr-4 text-left">
          <div class="flex">
            {{ market.ticker }}
            <span
              v-if="isMarketBeta"
              primary
              xs
              class="ml-2 text-2xs uppercase text-primary-500"
            >
              {{ $t('marketBeta.beta') }}
            </span>
          </div>
          <span v-if="!simple" class="text-gray-500 text-xs hidden md:block">
            {{ market.baseToken.name }}
          </span>
        </div>
      </div>
    </span>
    <span
      class="text-center text-sm"
      :class="{
        'col-span-9': !simple,
        'col-span-7': simple
      }"
    >
      {{ $t('marketNew.soonToBeReleased') }}
    </span>
  </TableRow>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  UiDerivativeMarketSummary,
  UiDerivativeMarketWithToken,
  MarketType,
  ZERO_IN_BASE,
  UiSpotMarketSummary,
  UiSpotMarketWithToken
} from '@injectivelabs/ui-common'
import TableRow from '~/components/elements/table-row.vue'
import { UI_DEFAULT_PRICE_DISPLAY_DECIMALS } from '~/app/utils/constants'
import { Change } from '~/types'
import { betaMarketSlugs } from '~/app/data/market'

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
      type: Object as PropType<
        UiDerivativeMarketWithToken | UiSpotMarketWithToken
      >
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
    currentSpotMarket(): UiSpotMarketWithToken | undefined {
      return this.$accessor.spot.market
    },

    currentDerivativeMarket(): UiDerivativeMarketWithToken | undefined {
      return this.$accessor.derivatives.market
    },

    currentLastSpotTradedPrice(): BigNumberInBase {
      return this.$accessor.spot.lastTradedPrice
    },

    currentLastDerivativeTradedPrice(): BigNumberInBase {
      return this.$accessor.derivatives.lastTradedPrice
    },

    /* Current market is the market that we are currently trading on */
    currentMarket():
      | UiSpotMarketWithToken
      | UiDerivativeMarketWithToken
      | undefined {
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

    isMarketBeta(): boolean {
      const { market } = this

      if (!market) {
        return false
      }

      return betaMarketSlugs.includes(market.slug)
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

      this.$root.$emit('close-market-slideout')

      return this.$router.push({
        name: 'market-market',
        params: {
          marketId: market.marketId,
          market: market.slug
        }
      })
    }
  }
})
</script>
