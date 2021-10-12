<template>
  <div class="flex-1">
    <div class="flex items-center justify-between">
      <div class="flex items-center justify-center">
        <v-button
          :class="{
            'text-gray-500': component !== components.deposits
          }"
          text-sm
          class="font-normal"
          @click.stop="onSelect(components.deposits)"
        >
          <span>
            {{ $t('deposits') }}
            {{ `(${deposits.length})` }}
          </span>
        </v-button>
        <div class="mx-2 w-px h-4 bg-gray-500"></div>
        <v-button
          :class="{
            'text-gray-500': component !== components.withdrawals
          }"
          text-sm
          class="font-normal"
          @click.stop="onSelect(components.withdrawals)"
        >
          <span> {{ $t('withdrawals') }} {{ `(${withdrawals.length})` }} </span>
        </v-button>
      </div>
    </div>

    <div class="bg-gray-900 px-4 py-2 rounded-lg mt-2">
      <component
        :is="component"
        v-if="component"
        :transfers="currentTransfers"
      ></component>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VDeposits from './transfers/deposits.vue'
import VWithdrawals from './transfers/withdrawls.vue'
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
