<template>
  <div class="h-full w-full flex flex-wrap py-4">
    <HOCLoading :status="status">
      <div class="container">
        <div class="w-full mx-auto xl:w-4/5">
          <v-current-epoch class="mt-6" />
          <v-previous-epoch class="mt-12" />
          <v-markets-info class="mt-12" />
        </div>
      </div>
    </HOCLoading>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import VPreviousEpoch from '~/components/partials/trade-and-earn/previous-epoch.vue'
import VCurrentEpoch from '~/components/partials/trade-and-earn/current-epoch.vue'
import VMarketsInfo from '~/components/partials/trade-and-earn/markets-info.vue'
import HOCLoading from '~/components/hoc/loading.vue'

export default Vue.extend({
  components: {
    HOCLoading,
    VPreviousEpoch,
    VMarketsInfo,
    VCurrentEpoch
  },

  data() {
    return {
      status: new Status(StatusType.Loading)
    }
  },

  mounted() {
    Promise.all([
      this.$accessor.exchange.initTradeAndEarn(),
      this.$accessor.token.getInjUsdPrice()
    ])
      .then(() => {
        //
      })
      .catch(this.$onRejected)
      .finally(() => {
        this.status.setIdle()
      })
  },

  beforeDestroy() {
    this.$accessor.exchange.reset()
  }
})
</script>
