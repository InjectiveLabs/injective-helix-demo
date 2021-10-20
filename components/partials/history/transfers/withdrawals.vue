<template>
  <div class="table-responsive min-h-orders max-h-xs 4xl:max-h-lg">
    <table class="table">
      <thead>
        <tr>
          <th class="text-left">
            {{ $t('address') }}
          </th>
          <th class="text-right">
            {{ $t('amount') }}
          </th>
          <th class="text-center">
            {{ $t('type') }}
          </th>
          <th class="text-right">
            {{ $t('time') }}
          </th>
        </tr>
      </thead>
      <tbody v-if="isUserWalletConnected">
        <tr
          is="v-transfer"
          v-for="(transfer, index) in transfers"
          :key="`transfers-${index}-${transfer.srcSubaccountId}`"
          :transfer="transfer"
        ></tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Trade from './transfer.vue'
import { UiSubaccountTransfer } from '~/types'

export default Vue.extend({
  components: {
    'v-transfer': Trade
  },

  props: {
    transfers: {
      required: true,
      type: Array as PropType<UiSubaccountTransfer[]>
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    }
  }
})
</script>
