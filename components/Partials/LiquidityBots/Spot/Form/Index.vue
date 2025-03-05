<script setup lang="ts">
import { BigNumberInBase, Status } from '@injectivelabs/utils'
import {
  LiquidityValues,
  LiquidityBotForm,
  UiMarketWithToken,
  LiquidityBotField
} from '@/types'

const props = withDefaults(
  defineProps<{
    market: UiMarketWithToken
    liquidityValues: LiquidityValues
    status: Status
    lastTradedPrice: BigNumberInBase
  }>(),
  {}
)
const formValues = useFormValues<LiquidityBotForm>()

const optimizationValues = computed(() => ({
  baseQuantity: Number(formValues.value[LiquidityBotField.BaseAmount] || 0),
  quoteQuantity: Number(formValues.value[LiquidityBotField.QuoteAmount] || 0),
  currentPrice: props.lastTradedPrice.toNumber(),
  lowerPriceLevel: props.liquidityValues.lowerBound.toNumber(),
  upperPriceLevel: props.liquidityValues.upperBound.toNumber()
}))
</script>

<template>
  <div>
    <PartialsLiquidityBotsSpotFormVolatilityStrategy />
    <PartialsLiquidityBotsSpotFormDeposit v-bind="{ market }" class="mt-4" />

    <PartialsTradeSpotFormTradingBotsCommonOptimization
      v-bind="optimizationValues"
    />

    <PartialsLiquidityBotsSpotFormDetails
      v-bind="{ market, liquidityValues, status, lastTradedPrice }"
      class="mt-4"
    />
    <PartialsLiquidityBotsSpotFormCreateBot
      v-bind="{ market, liquidityValues }"
      class="mt-4"
    />
  </div>
</template>
