<template>
  <VCard lg>
    <HocLoading :status="status">
      <VCardTableWrap>
        <div
          v-if="tradingRewards.length > 0"
          class="table-responsive min-h-orders max-h-lg mt-6"
        >
          <table class="table">
            <thead></thead>
            <tbody v-if="isUserWalletConnected">
              <tr
                is="TradingReward"
                v-for="(tradingReward, index) in tradingRewards"
                :key="`trading-reward-${index}`"
                :trading-reward="tradingReward"
              ></tr>
            </tbody>
          </table>
        </div>
        <EmptyList
          v-else
          :message="$t('rewardsHistory.emptyTradingRewards')"
          class="mt-6"
        />
      </VCardTableWrap>
    </HocLoading>
  </VCard>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import { TradingReward } from '@injectivelabs/sdk-ts'
import VTradingReward from './trading-reward.vue'
import { TradeSelectorType } from '~/types/enums'

export default Vue.extend({
  components: {
    TradingReward: VTradingReward
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
