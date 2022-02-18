<template>
  <div>
    <div class="relative max-w-full">
      <VHocLoading :status="status">
        <component
          :is="`v-${tradingAccountComponent}`"
          v-bind="$attrs"
        ></component>
      </VHocLoading>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import VBalances from './balances.vue'
import VPositions from '~/components/partials/common/account/positions.vue'

export default Vue.extend({
  components: {
    VBalances,
    VPositions
  },

  props: {
    tradingAccountComponent: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      status: new Status(StatusType.Loading)
    }
  },

  mounted() {
    Promise.all([
      this.$accessor.derivatives.fetchSubaccountOrders(),
      this.$accessor.positions.fetchOrderbook(),
      this.$accessor.positions.fetchSubaccountPositions()
    ])
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
