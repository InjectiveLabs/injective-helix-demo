<script lang="ts" setup>
import { UiDerivativeMarket } from '@/types'

defineProps({
  markets: {
    type: Array as PropType<UiDerivativeMarket[]>,
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
