<template>
  <div class="h-full">
    <VHocLoading :status="status">
      <div class="h-full flex flex-col">
        <div class="flex items-center justify-center">
          <v-button-select
            v-model="component"
            :option="components.positions"
            text
          >
            {{ $t('activity.openPositions') }}
          </v-button-select>
          <div class="mx-2 w-px h-4 bg-gray-500"></div>
          <v-button-select
            v-model="component"
            :option="components.fundingPayments"
            text
          >
            {{ $t('activity.fundingPayments') }}
          </v-button-select>
        </div>

        <v-card md class="h-full mt-6">
          <component :is="`v-${component}`"></component>
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

const components = {
  positions: 'positions',
  fundingPayments: 'funding-payments'
}

export default Vue.extend({
  components: {
    VModalAddMargin,
    VPositions,
    VFundingPayments
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
  },

  beforeDestroy() {
    this.$accessor.app.cancelAllStreams()
  }
})
</script>
