<template>
  <div class="h-full w-full flex flex-wrap py-4">
    <HOCLoading :status="status">
      <div class="container">
        <div class="w-full mx-auto xl:w-4/5">
          <v-panel :title="$t('Trade & Earn')" class="mt-6">
            <v-campaign />
          </v-panel>
          <v-panel :title="$t('Current Epoch')" class="mt-12">
            <v-current-epoch />
          </v-panel>
          <v-panel :title="$t('Markets Information')" class="mt-12">
            <v-markets-info />
          </v-panel>
        </div>
      </div>
    </HOCLoading>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import VCampaign from '~/components/partials/trade-and-earn/campaign.vue'
import VCurrentEpoch from '~/components/partials/trade-and-earn/current-epoch.vue'
import VMarketsInfo from '~/components/partials/trade-and-earn/markets-info.vue'
import HOCLoading from '~/components/hoc/loading.vue'

export default Vue.extend({
  components: {
    HOCLoading,
    VCampaign,
    VMarketsInfo,
    VCurrentEpoch
  },

  data() {
    return {
      status: new Status(StatusType.Loading)
    }
  },

  mounted() {
    Promise.all([this.$accessor.exchange.initRewards()])
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
