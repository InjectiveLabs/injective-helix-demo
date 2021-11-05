<template>
  <v-card-table-wrap>
    <template #filters>
      <v-button-filter v-model="component" :option="components.openPositions">
        <span>
          {{ $t('open_positions') }}
        </span>
      </v-button-filter>
    </template>
    <template #context>
      <v-button
        v-if="positions.length > 0 && isUserWalletConnected"
        text-xs
        @click.stop="closeAllPosition"
      >
        {{ $t('close_all') }}
      </v-button>
    </template>
    <component :is="component" v-if="component"></component>
  </v-card-table-wrap>
</template>

<script lang="ts">
import Vue from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import OpenPositions from './positions/index.vue'
import {
  DerivativeOrderSide,
  TradeDirection,
  UiDerivativeMarket,
  UiPosition
} from '~/types'
import { getPositionFeeAdjustedBankruptcyPrice } from '~/app/services/derivatives'

const components = {
  openPositions: 'v-open-positions'
}

export default Vue.extend({
  components: {
    'v-open-positions': OpenPositions
  },

  data() {
    return {
      components,
      component: components.openPositions
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    markets(): UiDerivativeMarket[] {
      return this.$accessor.derivatives.markets
    },

    positions(): UiPosition[] {
      return this.$accessor.portfolio.subaccountPositions
    }
  },

  methods: {
    onSelect(component: string) {
      this.component = component
    },

    getMarket(marketId: string): UiDerivativeMarket | undefined {
      const { markets } = this

      return markets.find((m) => m.marketId === marketId)
    },

    closeAllPosition() {
      const { positions } = this

      const positionsToCancel = positions
        .map((position) => {
          const market = this.getMarket(position.marketId) as UiDerivativeMarket

          return {
            market,
            price: market
              ? getPositionFeeAdjustedBankruptcyPrice({ position, market })
              : new BigNumberInBase(0),
            orderType:
              position.direction === TradeDirection.Long
                ? DerivativeOrderSide.Sell
                : DerivativeOrderSide.Buy,
            quantity: new BigNumberInBase(position.quantity)
          }
        })
        .filter(({ market }) => market !== undefined)

      this.$accessor.derivatives
        .closeAllPosition({
          positions: positionsToCancel
        })
        .then(() => {
          this.$toast.success(this.$t('all_position_closed'))
        })
        .catch(this.$onRejected)
    }
  }
})
</script>
