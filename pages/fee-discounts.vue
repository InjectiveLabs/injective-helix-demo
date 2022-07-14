<template>
  <div class="h-full w-full flex flex-wrap fee-discounts min-h-screen-excluding-header-and-footer">
    <HocLoading :status="status">
      <div class="container">
        <div class="w-full mx-auto xl:w-4/5">
          <div class="my-12">
            <h3 class="text-xl font-bold text-gray-200">
              {{ $t('fee_discounts.page_title') }}
            </h3>
            <div class="mt-6 mb-8">
              <p class="text-sm font-normal mb-2">
                {{ $t('fee_discounts.page_description') }}
              </p>
              <p class="text-sm text-primary-500 font-normal">
                {{ $t('fee_discounts.page_description_warning') }}
              </p>
            </div>
            <Overview class="my-8" />
            <v-panel>
              <Fees />
            </v-panel>
          </div>
        </div>
      </div>
    </HocLoading>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import Overview from '~/components/partials/fee-discounts/overview.vue'
import Fees from '~/components/partials/fee-discounts/index.vue'

export default Vue.extend({
  components: {
    Overview,
    Fees
  },

  data() {
    return {
      status: new Status(StatusType.Loading)
    }
  },

  mounted() {
    Promise.all([
      this.$accessor.exchange.fetchParams(),
      this.$accessor.exchange.fetchFeeDiscountSchedule(),
      this.$accessor.exchange.fetchFeeDiscountAccountInfo(),
      this.$accessor.params.fetchAprParams()
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

<style lang="scss" scoped>
.fee-discounts {
  background: url('@/assets/fee-discounts-background-mobile.svg');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}

@media (min-width: 480px) {
  .fee-discounts {
    background: url('@/assets/fee-discounts-background.svg');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
  }
}
</style>
