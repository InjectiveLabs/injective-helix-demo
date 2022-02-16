<template>
  <v-card lg>
    <HOCLoading :status="status">
      <v-card-table-wrap>
        <template #actions>
          <div
            class="col-span-12 lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-4 w-full"
          >
            <v-search
              dense
              class="col-span-2 sm:col-span-1"
              :placeholder="$t('trade.filter')"
              :search="search"
              @searched="handleInputOnSearch"
            />

            <type-selector
              class="self-start"
              :value="type"
              @click="handleTypeClick"
            />

            <side-selector
              class="self-start"
              :value="side"
              @click="handleSideClick"
            />
          </div>
        </template>
        <div class="table-responsive min-h-orders max-h-lg mt-6">
          <table class="table">
            <trades-table-header market-column-enabled />
            <tbody v-if="isUserWalletConnected">
              <tr
                is="v-trade"
                v-for="(trade, index) in filteredTrades"
                :key="`trades-${index}-${trade.marketId}`"
                :trade="trade"
              ></tr>
            </tbody>
          </table>
        </div>
      </v-card-table-wrap>
    </HOCLoading>
  </v-card>
</template>

<script lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import Vue from 'vue'
import { UiSpotTrade, UiSpotMarketWithToken } from '@injectivelabs/ui-common'
import { TradeExecutionType } from '@injectivelabs/ts-types'
import Trade from '~/components/partials/common/spot/trade.vue'
import TradesTableHeader from '~/components/partials/common/spot/trades-table-header.vue'
import HOCLoading from '~/components/hoc/loading.vue'
import SideSelector from '~/components/partials/common/trades/side-selector.vue'
import TypeSelector from '~/components/partials/common/trades/type-selector.vue'

export default Vue.extend({
  components: {
    'v-trade': Trade,
    TradesTableHeader,
    TypeSelector,
    SideSelector,
    HOCLoading
  },

  data() {
    return {
      search: '',
      type: undefined as string | undefined,
      side: undefined as string | undefined,
      status: new Status(StatusType.Loading)
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    trades(): UiSpotTrade[] {
      return this.$accessor.activities.subaccountSpotTrades
    },

    markets(): UiSpotMarketWithToken[] {
      return this.$accessor.spot.markets
    },

    filteredTrades(): UiSpotTrade[] {
      const { markets, search, trades, type, side } = this

      return trades.filter((t) => {
        const market = markets.find((m) => m.marketId === t.marketId)

        if (!market || (!search && !type && !side)) {
          return true
        }

        const isPartOfSearchFilter =
          !search ||
          market.ticker.toLowerCase().includes(search.trim().toLowerCase())

        const isMarketType = type === TradeExecutionType.Market
        const isPartOfTypeFilter =
          !type ||
          (isMarketType &&
            t.tradeExecutionType === TradeExecutionType.Market) ||
          (!isMarketType && t.tradeExecutionType !== TradeExecutionType.Market)
        const isPartOfSideFilter = !side || t.tradeDirection === side

        return isPartOfSearchFilter && isPartOfTypeFilter && isPartOfSideFilter
      })
    }
  },

  mounted() {
    Promise.all([this.$accessor.activities.fetchSubaccountSpotTrades()])
      .then(() => {
        //
      })
      .catch(this.$onError)
      .finally(() => {
        this.status.setIdle()
      })
  },

  methods: {
    handleInputOnSearch(search: string) {
      this.search = search
    },

    handleSideClick(side: string | undefined) {
      this.side = side
    },

    handleTypeClick(type: string | undefined) {
      this.type = type
    }
  }
})
</script>
