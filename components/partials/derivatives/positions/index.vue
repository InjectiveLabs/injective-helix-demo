<template>
  <div v-if="market" class="h-full">
    <div
      v-if="position && isUserWalletConnected"
      class="table-responsive table-orders"
    >
      <table class="table">
        <position-table-header />
        <tbody>
          <tr is="v-position" :position="position"></tr>
        </tbody>
      </table>
    </div>
    <v-user-wallet-connect-warning
      v-else-if="!isUserWalletConnected"
      class="bg-gray-900 mt-2"
    />
    <div v-else class="h-full w-full bg-gray-900 flex mt-2">
      <div class="grow text-center m-auto">
        <img src="/svg/empty-list.svg" class="mx-auto mb-2" />
        <p>{{ $t('trade.emptyPositions') }}</p>
      </div>
    </div>
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
      status: new Status()
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    market(): UiDerivativeMarketWithToken | undefined {
      return this.$accessor.derivatives.market
    },

    position(): UiPosition | undefined {
      return this.$accessor.derivatives.subaccountPosition
    }
  }
})
</script>
