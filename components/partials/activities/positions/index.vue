<template>
  <VHocLoading :status="status">
    <div class="h-full w-full flex flex-wrap py-4">
      <div class="w-full mx-auto">
        <div class="flex flex-wrap items-center justify-center">
          <v-button-select
            v-model="component"
            :option="components.positions"
            text
          >
            {{ $t('activities.openPositions') }}
          </v-button-select>
          <div class="mx-2 w-px h-4 bg-gray-500"></div>
          <v-button-select
            v-model="component"
            :option="components.fundingPayments"
            text
          >
            {{ $t('activities.fundingPayments') }}
          </v-button-select>
        </div>
        <div class="mt-6 relative">
          <component :is="`v-${component}`"></component>
        </div>
      </div>
      <v-modal-add-margin />
    </div>
  </VHocLoading>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import VPositions from '~/components/partials/activities/positions/positions.vue'
import VFundingPayments from '~/components/partials/activities/positions/funding-payments.vue'
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
