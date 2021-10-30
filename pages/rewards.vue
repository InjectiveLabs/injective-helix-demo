<template>
  <div class="h-full w-full flex flex-wrap py-4">
    <HOCLoading :status="status">
      <div class="container">
        <div class="w-full mx-auto xl:w-4/5">
          <v-panel :title="$t('Trading rewards summary')" class="mt-6">
            <v-overview />
          </v-panel>
          <v-panel :title="$t('Current Epoch')" class="mt-12">
            <v-current-epoch />
          </v-panel>
          <v-panel :title="$t('Past Epoch')" class="mt-12">
            <v-past-epoch />
          </v-panel>
          <v-resources class="mt-12" />
        </div>
      </div>
    </HOCLoading>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import VOverview from '~/components/partials/rewards/overview.vue'
import VResources from '~/components/partials/rewards/resources.vue'
import VCurrentEpoch from '~/components/partials/rewards/current-epoch.vue'
import VPastEpoch from '~/components/partials/rewards/past-epoch.vue'
import HOCLoading from '~/components/hoc/loading.vue'

export default Vue.extend({
  components: {
    HOCLoading,
    VResources,
    VOverview,
    VCurrentEpoch,
    VPastEpoch
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
