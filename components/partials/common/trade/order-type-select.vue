<template>
  <div class="mt-4">
    <div class="bg-gray-900 rounded-2xl flex">
      <VButtonSelect
        :value="orderType"
        :option="SpotOrderSide.Buy"
        aqua
        class="w-1/2"
        data-cy="trading-page-switch-to-side-buy-button"
        @selected="handleOrderTypeChange"
      >
        {{
          $t('trade.buy_asset', {
            asset: market.baseToken.symbol
          })
        }}
      </VButtonSelect>
      <VButtonSelect
        :value="orderType"
        :option="SpotOrderSide.Sell"
        red
        class="w-1/2"
        data-cy="trading-page-switch-to-side-sell-button"
        @selected="handleOrderTypeChange"
      >
        {{
          $t('trade.sell_asset', {
            asset: market.baseToken.symbol
          })
        }}
      </VButtonSelect>
    </div>
  </div>
</template>
<script lang="ts">
import Vue, { PropType } from 'vue'
import { SpotOrderSide, UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'

export default Vue.extend({
  props: {
    orderType: {
      type: String,
      required: true
    },

    market: {
      type: Object as PropType<UiSpotMarketWithToken>,
      required: true
    }
  },

  data() {
    return {
      SpotOrderSide
    }
  },

  methods: {
    handleOrderTypeChange(orderType: SpotOrderSide) {
      this.$emit('update:order-type', orderType)
    }
  }
})
</script>
