<template>
  <div v-if="market" class="h-full">
    <div
      v-if="positions.length > 0 && isUserWalletConnected"
      class="table-responsive table-orders"
    >
      <table class="table">
        <position-table-header />
        <tbody>
          <tr
            is="v-position"
            v-for="(position, index) in positions"
            :key="`positions-${index}-${position.marketId}`"
            :position="position"
          ></tr>
        </tbody>
      </table>
    </div>
    <v-user-wallet-connect-warning
      v-else-if="!isUserWalletConnected"
      class="bg-gray-900 mt-2"
    />
    <v-empty-list v-else :message="$t('trade.emptyPositions')" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status } from '@injectivelabs/utils'
import {
  UiDerivativeMarketWithToken,
  UiPosition
} from '@injectivelabs/ui-common'
import Position from '~/components/partials/common/derivatives/position.vue'
import PositionTableHeader from '~/components/partials/common/derivatives/position-table.header.vue'

export default Vue.extend({
  components: {
    'v-position': Position,
    PositionTableHeader
  },

  data() {
    return {
      status: new Status(),
      interval: 0 as any
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    market(): UiDerivativeMarketWithToken | undefined {
      return this.$accessor.derivatives.market
    },

    positions(): UiPosition[] {
      return this.$accessor.positions.subaccountPositions
    }
  },

  mounted() {
    this.$accessor.positions.fetchOpenPositionsMarketsOrderbook()

    this.interval = setInterval(() => {
      this.$accessor.positions.fetchOpenPositionsMarketsOrderbook()
    }, 10000)
  },

  beforeDestroy() {
    clearInterval(this.interval)
  }
})
</script>
