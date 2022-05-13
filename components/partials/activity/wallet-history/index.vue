<template>
  <div class="h-full flex flex-col">
    <div class="flex items-center gap-4">
      <v-tab-selector-item v-model="component" :option="components.transfers">
        <div class="flex items-center gap-1">
          <span>{{ $t('walletHistory.transfers.transfers') }}</span>
        </div>
      </v-tab-selector-item>

      <div class="w-px h-4 bg-gray-500" />

      <v-tab-selector-item v-model="component" :option="components.deposits">
        <div class="flex items-center gap-1">
          <span>{{ $t('walletHistory.deposits') }}</span>
        </div>
      </v-tab-selector-item>

      <div class="w-px h-4 bg-gray-500" />

      <v-tab-selector-item v-model="component" :option="components.withdrawals">
        <div class="flex items-center gap-1">
          <span>{{ $t('walletHistory.withdrawals') }}</span>
        </div>
      </v-tab-selector-item>
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
import VTabSelectorItem from '~/components/partials/activity/common/tab-selector-item.vue'

const components = {
  deposits: 'deposits',
  withdrawals: 'withdrawals',
  transfers: 'transfers'
}

export default Vue.extend({
  components: {
    VDeposits,
    VWithdrawals,
    VTransfers,
    VTabSelectorItem
  },

  data() {
    return {
      components,
      component: components.transfers
    }
  }
})
</script>
