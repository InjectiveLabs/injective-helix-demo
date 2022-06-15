<template>
  <div class="h-full flex flex-col">
    <div class="flex items-center gap-4">
      <TabSelectorItem
        v-model="component"
        data-cy="wallet-history-transfers-link"
        :option="components.transfers"
      >
        <div class="flex items-center gap-1">
          <span>{{ $t('walletHistory.transfers.transfers') }}</span>
        </div>
      </TabSelectorItem>

      <div class="w-px h-4 bg-gray-500" />

      <TabSelectorItem
        v-model="component"
        data-cy="wallet-history-deposits-link"
        :option="components.deposits"
      >
        <div class="flex items-center gap-1">
          <span>{{ $t('walletHistory.deposits') }}</span>
        </div>
      </TabSelectorItem>

      <div class="w-px h-4 bg-gray-500" />

      <TabSelectorItem
        v-model="component"
        data-cy="wallet-history-withdrawals-link"
        :option="components.withdrawals"
      >
        <div class="flex items-center gap-1">
          <span>{{ $t('walletHistory.withdrawals') }}</span>
        </div>
      </TabSelectorItem>
    </div>
    <VCard md class="h-full mt-6">
      <component :is="`${component}`"></component>
    </VCard>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Deposits from './deposits/index.vue'
import Withdrawals from './withdrawals/index.vue'
import Transfers from './transfers/index.vue'
import TabSelectorItem from '~/components/partials/activity/common/tab-selector-item.vue'

const components = {
  deposits: 'deposits',
  withdrawals: 'withdrawals',
  transfers: 'transfers'
}

export default Vue.extend({
  components: {
    Deposits,
    Withdrawals,
    Transfers,
    TabSelectorItem
  },

  data() {
    return {
      components,
      component: components.transfers
    }
  }
})
</script>
