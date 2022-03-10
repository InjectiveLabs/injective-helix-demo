<template>
  <div class="h-full w-full flex flex-wrap py-4">
    <VHocLoading :status="status">
      <div class="container">
        <div class="w-full mx-auto xl:w-4/5">
          <v-overview class="mt-6" />
          <v-panel :title="$t('Fee Discounts')" class="mt-12">
            <v-fees />
          </v-panel>
        </div>
      </div>
    </VHocLoading>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import VOverview from '~/components/partials/fee-discounts/overview.vue'
import VFees from '~/components/partials/fee-discounts/index.vue'

export default Vue.extend({
  components: {
    VOverview,
    VFees
  },

  data() {
    return {
      status: new Status(StatusType.Loading)
    }
  },

  mounted() {
    Promise.all([
      this.$accessor.exchange.fetchParams(),
      this.$accessor.exchange.fetchFeeDiscountSchedule()
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
