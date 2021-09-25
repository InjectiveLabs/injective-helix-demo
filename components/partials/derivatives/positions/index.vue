<template>
  <div v-if="market" class="table-responsive">
    <table class="table">
      <thead>
        <tr>
          <th class="text-center">&nbsp;</th>
          <th class="text-center">
            <span>{{ $t('side') }}</span>
          </th>
          <th class="text-right">
            <span>{{ $t('entry_price') }}</span>
          </th>
          <th class="text-right">
            <span>{{ $t('amount') }}</span>
          </th>
          <th class="text-right">
            <span>{{ $t('liquidation_price') }}</span>
          </th>
          <th class="text-right">
            <div class="flex items-center justify-end relative">
              <span class="mr-1">{{ $t('unrealized_pnl') }}</span>
              <v-icon-info-tooltip
                class="ml-2"
                :tooltip="$t('unrealized_pnl_tooltip')"
              />
            </div>
          </th>
          <th class="text-right">
            <span>{{ $t('notional_size') }}</span>
          </th>
          <th class="text-right">
            <span>{{ $t('margin') }}</span>
          </th>
          <th class="text-right">
            <span>{{ $t('leverage') }}</span>
          </th>
        </tr>
      </thead>
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
import Position from './position.vue'
import { UiDerivativeMarket, UiPosition, Icon } from '~/types'

export default Vue.extend({
  components: {
    'v-position': Position
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
