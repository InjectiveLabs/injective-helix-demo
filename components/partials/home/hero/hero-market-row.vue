<template>
  <nuxt-link :to="marketRoute">
    <div
      class="grid grid-cols-12 items-center border-helixGray-200 py-4 gap-10 box-content"
    >
      <div class="col-span-4 flex items-center justify-start pl-4">
        <div class="flex items-center justify-start">
          <img
            :src="baseTokenLogo"
            :alt="market.baseToken.name"
            class="w-4 h-4 md:w-6 md:h-6 mr-3"
          />
          <div
            class="text-left text-helixGray-500 text-sm font-bold whitespace-nowrap"
          >
            <div class="flex leading-4">
              {{ market.ticker }}
            </div>
            <p class="text-helixGray-300 text-xs leading-3.5">
              {{ market.baseToken.name }}
            </p>
          </div>
        </div>
      </div>
      <div class="col-span-3 flex">
        <span class="w-full text-gray-900 font-medium text-sm text-right">
          <div class="flex align-center justify-end">
            <IconArrow
              v-if="!lastTradedPrice.isNaN() && !useDefaultLastTradedPriceColor"
              class="transform w-3 h-3 mr-1 mt-1"
              :class="{
                'text-green-500 rotate-90': lastPriceChange === Change.Increase,
                'text-red-500 -rotate-90': lastPriceChange === Change.Decrease
              }"
            />
            <span
              v-if="!lastTradedPrice.isNaN()"
              :class="lastTradedPriceTextColorClass"
            >
              {{ lastTradedPriceToFormat }}
            </span>
            <span v-else class="text-gray-400">&mdash;</span>
          </div>
        </span>
      </div>
      <div class="col-span-2 flex">
        <span
          v-if="!change.isNaN()"
          :class="change.gte(0) ? 'text-green-500' : 'text-red-500'"
        >
          {{ `${change.gte(0) ? '+' : ''}${changeToFormat}%` }}
        </span>
        <span v-else class="text-gray-400">&mdash;</span>
      </div>
      <div class="col-span-3 flex pr-4 h-7">
        <LineGraph
          v-if="chartData.length > 1"
          :data="chartData"
          :color="chartLineColor"
          :bg-type="'transparent'"
          :stroke-width="1"
          :smoothness="0.2"
          :padding="chartPadding"
        />
      </div>
    </div>
  </nuxt-link>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
// @ts-ignore
import { LineGraph } from 'vue-plot'
import {
  UiDerivativeMarketSummary,
  UiDerivativeMarketWithToken,
  UiMarketHistory,
  ZERO_IN_BASE,
  UiSpotMarketSummary,
  UiSpotMarketWithToken,
  getTokenLogoWithVendorPathPrefix
} from '@injectivelabs/sdk-ui-ts'
import { UI_DEFAULT_PRICE_DISPLAY_DECIMALS } from '~/app/utils/constants'
import { Change, MarketRoute } from '~/types'
import { betaMarketSlugs } from '~/app/data/market'
import {
  getMarketRoute,
  getFormattedMarketsHistoryChartData
} from '~/app/utils/market'

export default Vue.extend({
  components: {
    LineGraph
  },

  props: {
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
      Change,
      status: new Status(StatusType.Loading),
      chartPadding: {
        top: 4,
        right: 10,
        bottom: 4,
        left: 10
      },
      useDefaultLastTradedPriceColor: true
    }
  },

  computed: {
    marketsHistory(): UiMarketHistory[] {
      return this.$accessor.exchange.marketsHistory
    },

    lastTradedPriceTextColorClass(): Record<string, boolean> | string {
      const { lastPriceChange, useDefaultLastTradedPriceColor } = this

      if (useDefaultLastTradedPriceColor) {
        return 'text-helixGray-500'
      }

      return {
        'text-green-500': lastPriceChange !== Change.Decrease,
        'text-red-500': lastPriceChange === Change.Decrease
      }
    },

    chartData(): number[][] {
      const { market, marketsHistory } = this
      if (marketsHistory.length === 0 || !market) {
        return []
      }

      const matchingMarket = marketsHistory.find(
        (marketHistory: UiMarketHistory) => {
          return marketHistory.marketId === market.marketId
        }
      )

      if (!matchingMarket) {
        return []
      }

      return getFormattedMarketsHistoryChartData(matchingMarket)
    },

    chartLineColor(): string {
      const { chartData } = this

      const minimumChartDataPoints = 2

      if (chartData.length < minimumChartDataPoints) {
        return ''
      }

      const [firstChartDataPoint] = chartData
      const lastChartDataPointPosition = new BigNumberInBase(chartData.length)
        .minus(1)
        .toNumber()
      const [, firstYaxisHolcPrice] = firstChartDataPoint
      const [, lastYAxisHolcPrice] = chartData[lastChartDataPointPosition]
      const positiveChangeColor = '#0EE29B'
      const negativeChangeColor = '#F3164D'

      return new BigNumberInBase(lastYAxisHolcPrice).gte(firstYaxisHolcPrice)
        ? positiveChangeColor
        : negativeChangeColor
    },

    lastTradedPrice(): BigNumberInBase {
      const { market, summary } = this

      if (!market || !summary) {
        return ZERO_IN_BASE
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
    },

    marketRoute(): MarketRoute {
      const { market } = this

      const marketRoute = getMarketRoute(market)

      return marketRoute || { name: 'markets' }
    },

    baseTokenLogo(): string {
      const { market } = this

      if (!market || !market.baseToken) {
        return ''
      }

      return getTokenLogoWithVendorPathPrefix(market.baseToken.logo)
    }
  },

  watch: {
    lastPriceChange(status) {
      if (status === Change.NoChange) {
        return
      }

      this.updateLastPriceChangeColor()
    }
  },

  methods: {
    updateLastPriceChangeColor() {
      this.useDefaultLastTradedPriceColor = false

      setTimeout(() => {
        this.useDefaultLastTradedPriceColor = true
      }, 3000)
    }
  }
})
</script>
