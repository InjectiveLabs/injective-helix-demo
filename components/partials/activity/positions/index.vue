<template>
  <div class="h-full">
    <VHocLoading :status="status">
      <div class="h-full flex flex-col">
        <div class="flex items-center gap-4">
          <v-tab-selector-item
            v-model="component"
            :option="components.positions"
          >
            <div class="flex items-center gap-1">
              <span>{{ $t('activity.openPositions') }}</span>
              <portal-target name="activity-tab-position-count" />
            </div>
          </v-tab-selector-item>

          <div class="w-px h-4 bg-gray-500" />

          <v-tab-selector-item
            v-model="component"
            :option="components.fundingPayments"
          >
            <div class="flex items-center gap-1">
              <span>{{ $t('activity.fundingPayments') }}</span>
            </div>
          </v-tab-selector-item>
        </div>

        <v-card md class="h-full mt-6">
          <v-positions v-show="component === components.positions" />
          <v-funding-payments v-if="component === components.fundingPayments" />
        </v-card>
      </div>
    </VHocLoading>
    <v-modal-add-margin />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import VPositions from '~/components/partials/activity/positions/positions.vue'
import VFundingPayments from '~/components/partials/activity/positions/funding-payments.vue'
import VModalAddMargin from '~/components/partials/modals/add-margin/index.vue'
import VTabSelectorItem from '~/components/partials/activity/common/tab-selector-item.vue'

const components = {
  positions: 'positions',
  fundingPayments: 'funding-payments'
}

export default Vue.extend({
  components: {
    VModalAddMargin,
    VPositions,
    VFundingPayments,
    VTabSelectorItem
  },

  data() {
    return {
      components,
      component: components.positions,
      status: new Status(StatusType.Loading)
    }
  },

  mounted() {
    this.status.setLoading()

    Promise.all([this.$accessor.derivatives.init()])
      .then(() => {})
      .catch(this.$onError)
      .finally(() => {
        this.status.setIdle()
      })

    Promise.all([
      this.$accessor.positions.streamSubaccountPositions(),
      this.$accessor.derivatives.streamSubaccountOrders()
    ])
      .then(() => {
        //
      })
      .catch(this.$onRejected)
  }
})
</script>
