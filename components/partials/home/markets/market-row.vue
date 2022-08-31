<template>
  <nuxt-link :to="marketRoute">
    <div
      class="grid grid-cols-12 items-center py-2.5 gap-12 box-content min-w-[912px]"
    >
      <div class="col-span-2 flex items-center justify-start pl-4">
        <div class="flex items-center justify-start">
          <img
            :src="baseTokenLogo"
            :alt="market.baseToken.name"
            class="w-4 h-4 md:w-6 md:h-6 mr-4"
          />
          <div
            class="mr-4 text-left text-helixGray-500 text-sm font-bold whitespace-nowrap mb-1"
          >
            <div class="flex">
              {{ market.ticker }}
            </div>
            <span class="text-helixGray-300 text-xs">
              {{ market.baseToken.name }}
            </span>
          </div>
        </div>
      </div>
      <div class="col-span-2 flex">
        <span class="w-full text-gray-900 font-medium text-sm text-right">
          <div class="flex align-center justify-end">
            <IconArrow
              v-if="!lastTradedPrice.isNaN()"
              class="transform w-3 h-3 mr-1 mt-1"
              :class="{
                'text-green-500 rotate-90': lastPriceChange !== Change.Decrease,
                'text-red-500 -rotate-90': lastPriceChange === Change.Decrease
              }"
            />
            <span
              v-if="!lastTradedPrice.isNaN()"
              :class="{
                'text-green-500': lastPriceChange !== Change.Decrease,
                'text-red-500': lastPriceChange === Change.Decrease
              }"
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
          class="w-full text-right"
        >
          {{ changeToFormat }}%
        </span>
        <span v-else class="text-gray-400">&mdash;</span>
      </div>
      <div class="col-span-3 flex h-7 w-[70%] justify-self-center">
        <HocLoading :status="status">
          <LineGraph
            v-if="chartData.length > 1"
            :data="chartData"
            :color="chartLineColor"
            :bg-type="'transparent'"
            :stroke-width="1"
            :smoothness="0.2"
          />
        </HocLoading>
      </div>
      <div class="col-span-3 align-center justify-self-center">
        <VButton primary-outline-light md class="rounded">Trade</VButton>
      </div>
    </div>
  </nuxt-link>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
// @ts-ignore
import { LineGraph } from 'vue-plot'
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import {
  UiDerivativeMarketSummary,
  UiDerivativeMarketWithToken,
  UiMarketHistory,
  ZERO_IN_BASE,
  UiSpotMarketSummary,
  UiSpotMarketWithToken,
  getTokenLogoWithVendorPathPrefix
} from '@injectivelabs/sdk-ui-ts'
import {
  MARKETS_HISTORY_CHART_ONE_HOUR,
  MARKETS_HISTORY_CHART_SEVEN_DAYS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS
} from '~/app/utils/constants'
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
      status: new Status(StatusType.Loading)
    }
  },

  computed: {
    marketsHistory(): UiMarketHistory[] {
      return this.$accessor.exchange.marketsHistory
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

    lastTradedPrice(): BigNumberInBase {
      const { market, summary } = this

      if (!market || !summary) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(summary.price)
    },

    chartLineColor(): string {
      const { chartData } = this

      if (chartData.length < 1) {
        return ''
      }

      const [, lastYAxisHolcPrice] = chartData[chartData.length - 1]
      const [, firstYaxisHolcPrice] = chartData[0]

      return lastYAxisHolcPrice >= firstYaxisHolcPrice ? '#0EE29B' : '#f3164d'
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

  mounted() {
    Promise.all([
      this.$accessor.exchange.getMarketsHistory({
        marketIds: [this.market.marketId],
        resolution: MARKETS_HISTORY_CHART_ONE_HOUR,
        countback: MARKETS_HISTORY_CHART_SEVEN_DAYS
      })
    ])
      .then(() => {
        //
      })
      .catch(this.$onError)
      .finally(() => {
        this.status.setIdle()
      })
  }
})
</script>
