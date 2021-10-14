<template>
  <div class="table-responsive h-full min-h-orders max-h-xs 4xl:max-h-lg">
    <table class="table">
      <position-table-header market-column-enabled />
      <tbody v-if="isUserWalletConnected">
        <tr
          is="v-position"
          v-for="position in positions"
          :key="`position-${position.marketId}`"
          :position="position"
        ></tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status } from '@injectivelabs/utils'
import Position from '~/components/partials/common/derivatives/position.vue'
import PositionTableHeader from '~/components/partials/common/derivatives/position-table.header.vue'
import { UiPosition, Icon } from '~/types'

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
    positions(): UiPosition[] {
      return this.$accessor.portfolio.subaccountPositions
    },

    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    }
  }
})
</script>
