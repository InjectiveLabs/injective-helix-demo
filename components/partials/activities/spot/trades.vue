<template>
  <v-card lg>
    <HOCLoading :status="status">
      <v-card-table-wrap>
        <div class="table-responsive min-h-orders max-h-xs 4xl:max-h-lg">
          <table class="table">
            <trades-table-header market-column-enabled />
            <tbody v-if="isUserWalletConnected">
              <tr
                is="v-trade"
                v-for="(trade, index) in trades"
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
import { UiSpotTrade } from '@injectivelabs/ui-common'
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
      status: new Status(StatusType.Loading)
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    trades(): UiSpotTrade[] {
      return this.$accessor.activities.subaccountSpotTrades
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
  }
})
</script>
