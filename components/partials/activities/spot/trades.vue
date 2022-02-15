<template>
  <v-card lg>
    <HOCLoading :status="status">
      <v-card-table-wrap>
        <template #filters>
          <v-search
            dense
            class="mb-6"
            :placeholder="$t('trade.filter')"
            :search="search"
            @searched="handleInputOnSearch"
          />
        </template>
        <div class="table-responsive min-h-orders max-h-lg">
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
import Trade from '~/components/partials/common/spot/trade.vue'
import TradesTableHeader from '~/components/partials/common/spot/trades-table-header.vue'
import HOCLoading from '~/components/hoc/loading.vue'

export default Vue.extend({
  components: {
    'v-trade': Trade,
    TradesTableHeader,
    HOCLoading
  },

  data() {
    return {
      search: '',
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
      const { markets, search, trades } = this

      return trades.filter((t) => {
        const market = markets.find((m) => m.marketId === t.marketId)

        if (!market || !search) {
          return true
        }

        return market.ticker.toLowerCase().includes(search.trim().toLowerCase())
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
    }
  }
})
</script>
