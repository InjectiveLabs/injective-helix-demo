<template>
  <div class="h-full w-full flex flex-wrap py-4">
    <div class="w-full mx-auto">
      <div class="flex flex-wrap items-center justify-center">
        <v-button-select v-model="component" :option="components.deposits" text>
          {{ $t('activities.deposits') }}
        </v-button-select>
        <div class="mx-2 w-px h-4 bg-gray-500"></div>
        <v-button-select
          v-model="component"
          :option="components.withdrawals"
          text
        >
          {{ $t('activities.withdrawals') }}
        </v-button-select>
        <div class="mx-2 w-px h-4 bg-gray-500"></div>
        <v-button-select
          v-model="component"
          :option="components.transfers"
          text
        >
          {{ $t('activities.transfers') }}
        </v-button-select>
      </div>
      <div class="mt-6 relative">
        <component :is="`v-${component}`"></component>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VFundingPayments from './funding-payments.vue'

const components = {
  deposits: 'deposits',
  withdrawals: 'withdrawals',
  transfers: 'transfers'
}

export default Vue.extend({
  components: {
    VFundingPayments
  },

  data() {
    return {
      components,
      component: components.deposits
    }
  }
})
</script>
