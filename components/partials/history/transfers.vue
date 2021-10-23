<template>
  <v-card-table-wrap>
    <template #filters>
      <v-button-filter v-model="component" :option="components.deposits">
        <span>
          {{ $t('deposits') }}
          {{ `(${deposits.length})` }}
        </span>
      </v-button-filter>
      <div class="mx-2 w-px h-4 bg-gray-500"></div>
      <v-button-filter v-model="component" :option="components.withdrawals">
        <span> {{ $t('withdrawals') }} {{ `(${withdrawals.length})` }} </span>
      </v-button-filter>
    </template>

    <component
      :is="component"
      v-if="component"
      :transfers="currentTransfers"
    ></component>
  </v-card-table-wrap>
</template>

<script lang="ts">
import Vue from 'vue'
import VDeposits from './transfers/deposits.vue'
import VWithdrawals from './transfers/withdrawals.vue'
import { TransferType, UiSubaccountTransfer } from '~/types'

const components = {
  deposits: 'v-deposits',
  withdrawals: 'v-withdrawals'
}

export default Vue.extend({
  components: {
    'v-deposits': VDeposits,
    'v-withdrawals': VWithdrawals
  },

  data() {
    return {
      components,
      component: components.deposits
    }
  },

  computed: {
    transfers(): UiSubaccountTransfer[] {
      return this.$accessor.history.subaccountTransfers
    },

    deposits(): UiSubaccountTransfer[] {
      const { transfers } = this

      return transfers.filter(
        (transfer) => transfer.transferType === TransferType.Deposit
      )
    },

    withdrawals(): UiSubaccountTransfer[] {
      const { transfers } = this

      return transfers.filter(
        (transfer) => transfer.transferType === TransferType.Withdraw
      )
    },

    currentTransfers(): Array<UiSubaccountTransfer> {
      const { deposits, component, withdrawals } = this

      return component === components.deposits ? deposits : withdrawals
    }
  },

  methods: {
    onSelect(component: string) {
      this.component = component
    }
  }
})
</script>
