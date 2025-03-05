<script setup lang="ts">
import { calculateOptimalInvestment } from '@/app/utils/sgt-optimization'

const props = withDefaults(
  defineProps<{
    baseQuantity: number
    quoteQuantity: number
    currentPrice: number
    lowerPriceLevel: number
    upperPriceLevel: number
  }>(),
  {}
)

const percentage = computed(() => {
  const {
    baseQuantity,
    quoteQuantity,
    currentPrice,
    lowerPriceLevel,
    upperPriceLevel
  } = props

  if (baseQuantity === 0 && quoteQuantity === 0) {
    return 0
  }

  if (lowerPriceLevel >= currentPrice || upperPriceLevel <= currentPrice) {
    return 0
  }

  const result = calculateOptimalInvestment({
    baseQuantity,
    quoteQuantity,
    currentPrice,
    lowerPriceLevel,
    upperPriceLevel
  })

  return ((1 - result.ratioDifference) * 100).toFixed(2)
})

const isShown = computed(() => {
  if (
    (props.baseQuantity === 0 && props.quoteQuantity === 0) ||
    props.lowerPriceLevel === 0 ||
    props.upperPriceLevel === 0
  ) {
    return false
  }

  return true
})
</script>

<template>
  <PartialsTradeSpotFormTradingBotsCommonOptimizationIndicator
    v-if="isShown"
    :percentage="Number(percentage)"
  />
</template>
