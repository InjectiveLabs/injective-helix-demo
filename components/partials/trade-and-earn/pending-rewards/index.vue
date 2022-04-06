<template>
  <div>
    <VHocLoading :status="status">
      <div>
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-gray-200">
            {{ $t('tradeAndEarn.pendingRewards') }}
          </h3>
        </div>
        <v-epoch
          v-for="(schedule, index) in schedules"
          :key="`pending-rewards-epoch-${index}`"
          :class="index > 0 ? 'mt-12' : 'mt-0'"
          :schedule="schedule"
          :index="index"
        />
      </div>
    </VHocLoading>
  </div>
</template>

<script lang="ts">
import { CampaignRewardPool } from '@injectivelabs/chain-consumer'
import { Status, StatusType } from '@injectivelabs/utils'
import Vue from 'vue'
import VEpoch from './epoch.vue'
import { TradingRewardsCampaign } from '~/app/services/exchange'

export default Vue.extend({
  components: {
    VEpoch
  },

  data() {
    return {
      status: new Status(StatusType.Loading)
    }
  },

  computed: {
    tradingRewardsCampaign(): TradingRewardsCampaign | undefined {
      return this.$accessor.exchange.tradingRewardsCampaign
    },

    schedules(): CampaignRewardPool[] {
      const { tradingRewardsCampaign } = this

      if (!tradingRewardsCampaign) {
        return []
      }

      return tradingRewardsCampaign.pendingTradingRewardPoolCampaignScheduleList
    }
  },

  mounted() {
    Promise.all([this.$accessor.exchange.fetchPendingTradeRewardPoints()])
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
