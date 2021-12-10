<template>
  <div>
    <div class="flex justify-between items-end flex-wrap">
      <h3 class="text-xl font-bold text-gray-200">
        {{ $t('dmm.ranking.title') }}
      </h3>
      <span class="text-sm text-gray-500">
        {{ $t('dmm.common.lastUpdatedTime') }}: {{ lastUpdated }}
      </span>
    </div>
    <v-card class="mt-6">
      <div class="p-2">
        <VMarketSelector
          :markets="markets"
          :active-market-id="activeMarketId"
          @click="handleMarketChange"
        />
        <VElcsTable :reward-factor="elcsReward" class="mt-6" />
        <VEvcsTable :reward-factor="evcsReward" class="mt-6" />
      </div>
    </v-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { format } from 'date-fns'
import VMarketSelector from './market-selector.vue'
import VElcsTable from './elcs-table.vue'
import VEvcsTable from './evcs-table.vue'
import { UiEpochMarketsWithTokenMeta } from '~/types'
import { DMM_TIME_STAMP_FORMAT } from '~/app/utils/constants'

export default Vue.extend({
  components: {
    VMarketSelector,
    VElcsTable,
    VEvcsTable
  },

  computed: {
    epochLastUpdated(): string {
      return this.$accessor.dmm.updatedAt
    },

    lastUpdated(): string {
      const { epochLastUpdated } = this

      return format(new Date(epochLastUpdated), DMM_TIME_STAMP_FORMAT)
    },

    activeMarketId(): string {
      return this.$accessor.dmm.activeMarketId
    },

    markets(): UiEpochMarketsWithTokenMeta[] {
      return this.$accessor.dmm.marketsWithTokenMeta
    },

    activeMarket(): UiEpochMarketsWithTokenMeta {
      const { activeMarketId, markets } = this

      return markets.find(
        ({ marketId }) => marketId === activeMarketId
      ) as UiEpochMarketsWithTokenMeta
    },

    elcsReward(): string {
      const { activeMarket } = this

      if (activeMarket && activeMarket.lcsAdjustFactor) {
        return activeMarket.lcsAdjustFactor
      }

      return '0'
    },

    evcsReward(): string {
      const { activeMarket } = this

      if (activeMarket && activeMarket.vcsAdjustFactor) {
        return activeMarket.vcsAdjustFactor
      }

      return '0'
    }
  },

  methods: {
    handleMarketChange(market: string) {
      this.$accessor.dmm.setActiveMarketId(market)
    }
  }
})
</script>
