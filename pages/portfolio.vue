<template>
  <div class="h-full w-full flex flex-wrap py-4">
    <HOCLoading :status="status">
      <div class="container">
        <div class="w-full mx-auto lg:w-3/4">
          <v-portfolio />
          <v-panel :title="$t('open_positions')" class="mt-12">
            <v-open-positions />
          </v-panel>
          <v-panel :title="$t('open_orders')" class="mt-12">
            <v-open-orders />
          </v-panel>
        </div>
        <v-modal-add-margin />
      </div>
    </HOCLoading>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import VPortfolio from '~/components/partials/common/portfolio/index.vue'
import VOpenPositions from '~/components/partials/portfolio/open-positions.vue'
import VOpenOrders from '~/components/partials/portfolio/open-orders.vue'
import HOCLoading from '~/components/hoc/loading.vue'
import VModalAddMargin from '~/components/partials/modals/add-margin/index.vue'

export default Vue.extend({
  components: {
    VOpenPositions,
    VPortfolio,
    VOpenOrders,
    HOCLoading,
    VModalAddMargin
  },

  data() {
    return {
      status: new Status(StatusType.Loading)
    }
  },

  mounted() {
    this.$accessor.portfolio
      .init()
      .then(() => {
        //
      })
      .catch(this.$onRejected)
      .finally(() => {
        this.status.setIdle()
      })
  },

  beforeDestroy() {
    this.$accessor.portfolio.reset()
  }
})
</script>
