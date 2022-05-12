<template>
  <div>
    <v-panel :title="$t('trade.markets')">
      <div slot="context">
        <div>
          <div v-if="false" class="sm:flex items-center justify-center mb-8">
            <div class="text-center mb-6 sm:mb-0 min-w-2xs">
              <p class="text-gray-500 uppercase text-xs tracking-wider mb-3">
                {{ $t('home.totalTradingVolume') }}
              </p>
              <span class="font-mono text-2xl">${{ totalVolumeToString }}</span>
            </div>
            <div class="mx-8 w-px h-20 bg-gray-700 hidden sm:block"></div>
            <div class="text-center min-w-2xs">
              <p class="text-gray-500 uppercase text-xs tracking-wider mb-3">
                {{ $t('home.totalTrades') }}
              </p>
              <span class="font-mono text-2xl">{{ totalTradesToString }}</span>
            </div>
          </div>

          <div class="flex items-center my-2 -mx-2">
            <v-button
              :class="{
                'text-gray-500': filterType !== MarketFilterType.Volume
              }"
              text-sm
              class="font-normal"
              @click.stop="updateFilterType(MarketFilterType.Volume)"
            >
              <span class="uppercase text-xs">{{ $t('home.trending') }}</span>
            </v-button>
            <div class="mx-2 w-px h-4 bg-gray-700"></div>
            <v-button
              :class="{
                'text-gray-500': filterType !== MarketFilterType.New
              }"
              text-sm
              class="font-normal"
              @click.stop="updateFilterType(MarketFilterType.New)"
            >
              <span class="uppercase text-xs">{{ $t('home.whatsNew') }}</span>
            </v-button>
          </div>
        </div>
      </div>

      <div class="relative">
        <VHocLoading :status="status" :show-loading="markets.length === 0">
          <v-table
            :markets="markets"
            :summaries="marketsSummary"
            :filter-type="filterType"
          />
        </VHocLoading>
      </div>
    </v-panel>

    <div v-if="filterType !== MarketFilterType.All" class="text-center">
      <nuxt-link :to="{ name: 'markets' }">
        <v-button lg primary class="w-60 mt-6">
          {{ $t('home.viewAllMarkets') }}
        </v-button>
      </nuxt-link>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  UiDerivativeMarketSummary,
  UiDerivativeMarketWithToken,
  UiSpotMarketSummary,
  UiSpotMarketWithToken,
  ZERO_IN_BASE
} from '@injectivelabs/ui-common'
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import VTable from '~/components/partials/home/markets/markets-table.vue'
import { MarketFilterType } from '~/types'

export default Vue.extend({
  components: {
    VTable
  },

  data() {
    return {
      MarketFilterType,
      filterType: MarketFilterType.Volume,
      status: new Status(StatusType.Loading),

      interval: 0 as any
    }
  },

  computed: {
    derivativeMarkets(): UiDerivativeMarketWithToken[] {
      return this.$accessor.derivatives.markets
    },

    derivativeMarketsSummary(): UiDerivativeMarketSummary[] {
      return this.$accessor.derivatives.marketsSummary
    },

    spotMarkets(): UiSpotMarketWithToken[] {
      return this.$accessor.spot.markets
    },

    spotMarketsSummary(): UiSpotMarketSummary[] {
      return this.$accessor.spot.marketsSummary
    },

    upcomingMarkets(): Array<
      UiSpotMarketWithToken | UiDerivativeMarketWithToken
    > {
      return this.$accessor.exchange.upcomingMarkets
    },

    upcomingMarketSummaries(): Array<
      UiSpotMarketSummary | UiDerivativeMarketSummary
    > {
      return this.$accessor.exchange.upcomingMarketsSummaries
    },

    markets(): Array<UiSpotMarketWithToken | UiDerivativeMarketWithToken> {
      const { spotMarkets, derivativeMarkets, upcomingMarkets } = this

      return [...derivativeMarkets, ...spotMarkets, ...upcomingMarkets]
    },

    marketsSummary(): Array<UiSpotMarketSummary | UiDerivativeMarketSummary> {
      const {
        spotMarketsSummary,
        derivativeMarketsSummary,
        upcomingMarketSummaries
      } = this

      return [
        ...derivativeMarketsSummary,
        ...spotMarketsSummary,
        ...upcomingMarketSummaries
      ]
    },

    totalVolume(): BigNumberInBase {
      const { marketsSummary } = this

      return marketsSummary.reduce((total, summary) => {
        return total.plus(new BigNumberInBase(summary.volume || '0'))
      }, ZERO_IN_BASE)
    },

    totalVolumeToString(): string {
      const { totalVolume } = this

      return totalVolume.toFormat(0, BigNumberInBase.ROUND_DOWN)
    },

    // todo: need support from BE for total trades
    totalTrades(): BigNumberInBase {
      return ZERO_IN_BASE
    },

    totalTradesToString(): string {
      const { totalTrades } = this

      return totalTrades.toFormat(0, BigNumberInBase.ROUND_DOWN)
    }
  },

  mounted() {
    this.setMarketSummariesPolling()
  },

  beforeDestroy() {
    clearInterval(this.interval)
  },

  methods: {
    setMarketSummariesPolling() {
      Promise.all([this.$accessor.app.pollMarkets()])
        .then(() => {
          this.interval = setInterval(async () => {
            await this.$accessor.app.pollMarkets()
          }, 5000)
        })
        .catch(this.$onRejected)
        .finally(() => {
          this.status.setIdle()
        })
    },

    updateFilterType(type: MarketFilterType) {
      this.filterType = type
    }
  }
})
</script>
