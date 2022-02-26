<template>
  <div>
    <v-panel :title="$t('trade.markets')">
      <div slot="context">
        <div>
          <div class="sm:flex items-center justify-center mb-8">
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

          <div class="flex items-center mb-6">
            <v-button
              :class="{
                'text-gray-500': filterType !== FilterTypes.Volume
              }"
              text-sm
              class="font-normal"
              @click.stop="updateFilterType(FilterTypes.Volume)"
            >
              <span class="uppercase text-xs">{{ $t('home.topVolume') }}</span>
            </v-button>
            <div class="mx-2 w-px h-4 bg-gray-700"></div>
            <v-button
              :class="{
                'text-gray-500': filterType !== FilterTypes.New
              }"
              text-sm
              class="font-normal"
              @click.stop="updateFilterType(FilterTypes.New)"
            >
              <span class="uppercase text-xs">{{ $t('home.whatsNew') }}</span>
            </v-button>
          </div>
        </div>
      </div>

      <div class="relative">
        <VHocLoading :status="status">
          <v-table
            :markets="markets"
            :summaries="marketsSummary"
            :show-all="showAll"
            :show-promoted="filterType === FilterTypes.New"
          />
        </VHocLoading>
      </div>
    </v-panel>

    <div v-if="!showAll && filterType !== FilterTypes.New" class="text-center">
      <v-button lg primary class="w-60 mt-6" @click="showAllMarkets">
        {{ $t('home.viewAllMarkets') }}
      </v-button>
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
import VTable from './table.vue'

enum FilterTypes {
  Volume = 'volume',
  New = 'new'
}

export default Vue.extend({
  components: {
    VTable
  },

  data() {
    return {
      FilterTypes,
      filterType: FilterTypes.Volume,
      showAll: false,

      interval: 0 as any
    }
  },

  computed: {
    marketsLoadingState(): StatusType {
      return this.$accessor.app.marketsLoadingState
    },

    status(): Status {
      const { marketsLoadingState } = this

      return new Status(marketsLoadingState)
    },

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

    markets(): Array<UiSpotMarketWithToken | UiDerivativeMarketWithToken> {
      const { spotMarkets, derivativeMarkets } = this

      return [...derivativeMarkets, ...spotMarkets]
    },

    marketsSummary(): Array<UiSpotMarketSummary | UiDerivativeMarketSummary> {
      const { spotMarketsSummary, derivativeMarketsSummary } = this

      return [...derivativeMarketsSummary, ...spotMarketsSummary]
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

    totalTrades(): BigNumberInBase {
      // todo: need support from BE for total trades

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
      this.$accessor.app.setMarketsLoadingState(StatusType.Loading)

      Promise.all([this.$accessor.app.pollMarkets()])
        .then(() => {
          this.interval = setInterval(async () => {
            await this.$accessor.app.pollMarkets()
          }, 5000)
        })
        .catch(this.$onRejected)
        .finally(() => {
          this.$accessor.app.setMarketsLoadingState(StatusType.Idle)
        })
    },

    showAllMarkets() {
      this.showAll = true
    },

    updateFilterType(type: FilterTypes) {
      this.filterType = type
    }
  }
})
</script>
