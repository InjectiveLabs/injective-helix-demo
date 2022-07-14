<template>
  <div class="h-full w-full flex flex-wrap py-4">
    <HocLoading :status="status">
      <div class="container">
        <div class="w-full mx-auto xl:w-4/5">
          <CurrentEpoch class="mt-6" />
          <PreviousRewards v-if="false" class="mt-12" />
          <PendingRewards class="mt-12" />
          <MarketsInfo class="mt-12" />
        </div>
      </div>
    </HocLoading>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import PreviousRewards from '~/components/partials/trade-and-earn/previous-rewards.vue'
import PendingRewards from '~/components/partials/trade-and-earn/pending-rewards/index.vue'
import CurrentEpoch from '~/components/partials/trade-and-earn/current-epoch.vue'
import MarketsInfo from '~/components/partials/trade-and-earn/markets-info.vue'

export default Vue.extend({
  components: {
    PreviousRewards,
    PendingRewards,
    MarketsInfo,
    CurrentEpoch
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
