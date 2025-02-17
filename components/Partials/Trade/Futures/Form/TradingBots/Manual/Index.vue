<script setup lang="ts">
const error = ref(false)
</script>

<template>
  <div class="pt-4">
    <PartialsTradeFuturesFormTradingBotsManualPriceRangeFields />
    <PartialsTradeFuturesFormTradingBotsManualGridsField />
    <PartialsTradeFuturesFormTradingBotsCommonInvestmentField />
    <PartialsTradeFuturesFormTradingBotsCommonLeverage />
    <PartialsTradeFuturesFormTradingBotsManualErrors v-model:error="error" />
    <PartialsTradeFuturesFormTradingBotsCommonCreateStrategy
      v-bind="{ error }"
    />
  </div>
</template>
