<template>
  <div class="h-full w-full flex flex-wrap py-4">
    <HocLoading :status="status">
      <div class="container">
        <div class="w-full mx-auto xl:w-4/5">
          <VOverview class="mt-6" />
          <VPanel :title="$t('Fee Discounts')" class="mt-12">
            <VFees />
          </VPanel>
        </div>
      </div>
    </HocLoading>
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
