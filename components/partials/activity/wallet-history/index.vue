<template>
  <div class="h-full flex flex-col">
    <div class="flex items-center justify-center">
      <v-button-select v-model="component" :option="components.transfers" text>
        {{ $t('walletHistory.transfers.transfers') }}
      </v-button-select>
      <div class="mx-2 w-px h-4 bg-gray-500"></div>
      <v-button-select v-model="component" :option="components.deposits" text>
        {{ $t('walletHistory.deposits') }}
      </v-button-select>
      <div class="mx-2 w-px h-4 bg-gray-500"></div>
      <v-button-select
        v-model="component"
        :option="components.withdrawals"
        text
      >
        {{ $t('walletHistory.withdrawals') }}
      </v-button-select>
    </div>
    <v-card md class="h-full mt-6">
      <component :is="`v-${component}`"></component>
    </v-card>
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
