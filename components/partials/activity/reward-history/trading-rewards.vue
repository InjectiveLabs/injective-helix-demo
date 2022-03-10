<template>
  <v-card lg>
    <VHocLoading :status="status">
      <v-card-table-wrap>
        <div
          v-if="tradingRewards.length > 0"
          class="table-responsive min-h-orders max-h-lg mt-6"
        >
          <table class="table">
            <thead></thead>
            <tbody v-if="isUserWalletConnected">
              <tr
                is="v-trading-reward"
                v-for="(tradingReward, index) in tradingRewards"
                :key="`trading-reward-${index}`"
                :trading-reward="tradingReward"
              ></tr>
            </tbody>
          </table>
        </div>
        <v-empty-list
          v-else
          :message="$t('rewardsHistory.emptyTradingRewards')"
          class="mt-6"
        />
      </v-card-table-wrap>
    </VHocLoading>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import { TradingReward } from '@injectivelabs/subaccount-consumer'
import VTradingReward from './trading-reward.vue'
import { TradeSelectorType } from '~/types/enums'

export default Vue.extend({
  components: {
    VTradingReward
  },

  data() {
    return {
      TradeSelectorType,

      search: '',
      status: new Status(StatusType.Loading)
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    tradingRewards(): TradingReward[] {
      return this.$accessor.activity.tradingRewardsHistory
    }
  },

  mounted() {
    Promise.all([this.$accessor.activity.fetchTradingRewardsHistory()])
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
