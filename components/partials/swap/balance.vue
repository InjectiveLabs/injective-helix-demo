<template>
  <div class="font-mono text-xs">
    <span class="text-gray-500">
      {{ $t('trade.balance', { balance: formattedBalance }) }}</span>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { UiSpotMarketWithToken } from '@injectivelabs/ui-common'
import { BigNumberInBase } from '@injectivelabs/utils'

export default Vue.extend({
  props: {
    balance: {
      required: false,
      default: undefined,
      type: Object as PropType<BigNumberInBase>
    },
    market: {
      required: true,
      type: Object as PropType<UiSpotMarketWithToken>
    }
  },
  computed: {
    formattedBalance(): string {
      const { balance, market } = this
      return balance.toFormat(market.quantityDecimals, BigNumberInBase.ROUND_DOWN)
    }
  }
})
</script>
