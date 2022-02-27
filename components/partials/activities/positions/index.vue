<template>
  <div class="h-full w-full flex flex-wrap py-4">
    <div class="w-full mx-auto">
      <div class="flex flex-wrap items-center justify-center">
        <v-button-select
          v-model="component"
          :option="components.positions"
          text
        >
          {{ $t('activities.positions') }}
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
</template>

<script lang="ts">
import Vue from 'vue'
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
      component: components.positions
    }
  }
})
</script>
