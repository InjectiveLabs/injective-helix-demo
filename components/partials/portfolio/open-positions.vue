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
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import OpenPositions from './positions/index.vue'
import {
  DerivativeOrderSide,
  TradeDirection,
  UiDerivativeMarket,
  UiPosition
} from '~/types'
import { ZERO_IN_BASE } from '~/app/utils/constants'

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

    getPrice(position: UiPosition): BigNumberInBase {
      const market = this.getMarket(position.marketId) || {
        quoteToken: { decimals: 18 },
        priceDecimals: ZERO_IN_BASE,
        takerFeeRate: ZERO_IN_BASE
      }

      const price = new BigNumberInWei(position.entryPrice).toBase(
        market.quoteToken.decimals
      )

      const unitMargin = new BigNumberInWei(position.margin)
        .toBase(market.quoteToken.decimals)
        .dividedBy(position.quantity)
      const isPositionLong = position.direction === TradeDirection.Long

      const bankruptcyPrice = isPositionLong
        ? price.minus(unitMargin)
        : price.plus(unitMargin)

      const minTickPrice = new BigNumberInBase(
        new BigNumberInBase(1).shiftedBy(-market.priceDecimals)
      )

      const feeAdjustedBankruptcyPrice = isPositionLong
        ? bankruptcyPrice.dividedBy(
            new BigNumberInBase(1).minus(market.takerFeeRate)
          )
        : bankruptcyPrice.dividedBy(
            new BigNumberInBase(1).plus(market.takerFeeRate)
          )

      return feeAdjustedBankruptcyPrice.gte(0)
        ? feeAdjustedBankruptcyPrice
        : minTickPrice
    },

    closeAllPosition() {
      const { positions } = this

      const positionsToCancel = positions.map((position) => ({
        market: this.getMarket(position.marketId) as UiDerivativeMarket,
        price: this.getPrice(position),
        orderType:
          position.direction === TradeDirection.Long
            ? DerivativeOrderSide.Sell
            : DerivativeOrderSide.Buy,
        quantity: new BigNumberInBase(position.quantity)
      }))

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
