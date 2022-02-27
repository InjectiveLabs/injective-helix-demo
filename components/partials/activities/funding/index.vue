<template>
  <div class="h-full w-full flex flex-wrap py-4">
    <div class="w-full mx-auto">
      <div class="flex flex-wrap items-center justify-center">
        <v-button-select
          v-model="component"
          :option="components.transfers"
          text
        >
          {{ $t('fundingHistory.transfers.transfers') }}
        </v-button-select>
        <div class="mx-2 w-px h-4 bg-gray-500"></div>
        <v-button-select v-model="component" :option="components.deposits" text>
          {{ $t('fundingHistory.deposits') }}
        </v-button-select>
        <div class="mx-2 w-px h-4 bg-gray-500"></div>
        <v-button-select
          v-model="component"
          :option="components.withdrawals"
          text
        >
          {{ $t('fundingHistory.withdrawals') }}
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
import VDeposits from './deposits/index.vue'
import VWithdrawals from './withdrawals/index.vue'
import VTransfers from './transfers/index.vue'

const components = {
  deposits: 'deposits',
  withdrawals: 'withdrawals',
  transfers: 'transfers'
}

export default Vue.extend({
  components: {
    VDeposits,
    VWithdrawals,
    VTransfers
  },

  data() {
    return {
      components,
      component: components.transfers
    }
  }
})
</script>
