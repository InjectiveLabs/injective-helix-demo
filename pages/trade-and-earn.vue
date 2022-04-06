<template>
  <div class="h-full w-full flex flex-wrap py-4">
    <VHocLoading :status="status">
      <div class="container">
        <div class="w-full mx-auto xl:w-4/5">
          <v-current-epoch class="mt-6" />
          <v-previous-rewards v-if="false" class="mt-12" />
          <v-pending-rewards class="mt-12" />
          <v-markets-info class="mt-12" />
        </div>
      </div>
    </VHocLoading>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import VPreviousRewards from '~/components/partials/trade-and-earn/previous-rewards.vue'
import VPendingRewards from '~/components/partials/trade-and-earn/pending-rewards/index.vue'
import VCurrentEpoch from '~/components/partials/trade-and-earn/current-epoch.vue'
import VMarketsInfo from '~/components/partials/trade-and-earn/markets-info.vue'

export default Vue.extend({
  components: {
    VPreviousRewards,
    VPendingRewards,
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
      this.$accessor.token.getInjUsdPrice(),
      this.$accessor.exchange.fetchParams(),
      this.$accessor.exchange.fetchTradingRewardsCampaign()
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
