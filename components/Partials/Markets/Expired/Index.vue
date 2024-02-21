<script lang="ts" setup>
import { UiDerivativeMarketWithToken } from '@injectivelabs/sdk-ui-ts'

defineProps({
  markets: {
    type: Array as PropType<UiDerivativeMarketWithToken[]>,
    required: true
  }
})
</script>

<template>
  <div>
    <CommonTableBody :is-empty="markets.length === 0">
      <PartialsMarketsExpiredRow
        v-for="(market, index) in markets"
        :key="`market-expired-row-${index}`"
        :market="market"
      />
    </CommonTableBody>
  </div>
</template>
