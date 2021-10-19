<template>
  <div v-if="market" class="table-responsive table-orders">
    <table class="table">
      <position-table-header />
      <tbody v-if="isUserWalletConnected">
        <tr is="v-position" v-if="position" :position="position"></tr>
      </tbody>
    </table>
    <v-user-wallet-connect-warning v-if="!isUserWalletConnected" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status } from '@injectivelabs/utils'
import Position from '~/components/partials/common/derivatives/position.vue'
import { UiDerivativeMarket, UiPosition, Icon } from '~/types'
import PositionTableHeader from '~/components/partials/common/derivatives/position-table.header.vue'

export default Vue.extend({
  components: {
    'v-position': Position,
    PositionTableHeader
  },

  data() {
    return {
      Icon,
      status: new Status()
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    market(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    },

    position(): UiPosition | undefined {
      return this.$accessor.derivatives.subaccountPosition
    }
  }
})
</script>
