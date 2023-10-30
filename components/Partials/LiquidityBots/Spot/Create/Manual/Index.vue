<script setup lang="ts">
import { SpotGridTradingField, SpotGridTradingForm } from '@/types'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from 'app/utils/constants'

const gridStrategyStore = useGridStrategyStore()
const liquidityFormValues = useFormValues<SpotGridTradingForm>()
const setFormValues = useSetFormValues()
const setUpperPriceField = useSetFieldValue(SpotGridTradingField.UpperPrice)
const setLowerPriceField = useSetFieldValue(SpotGridTradingField.LowerPrice)

const min = ref('10')
const max = ref('0')

const { lastTradedPrice } = useSpotLastPrice(
  computed(() => gridStrategyStore.spotMarket!)
)

const upperPriceValue = computed({
  get: () => liquidityFormValues.value[SpotGridTradingField.UpperPrice] || '',
  set: (value) => {
    setUpperPriceField(Number(value).toFixed(UI_DEFAULT_MIN_DISPLAY_DECIMALS))
  }
})

const lowerPriceValue = computed({
  get: () => liquidityFormValues.value[SpotGridTradingField.LowerPrice] || '',
  set: (value) => {
    setLowerPriceField(Number(value).toFixed(UI_DEFAULT_MIN_DISPLAY_DECIMALS))
  }
})

onMounted(() => {
  setFormValues(
    {
      [SpotGridTradingField.LowerPrice]: lastTradedPrice.value
        .minus(lastTradedPrice.value.times(0.06))
        .toFixed(2),
      [SpotGridTradingField.UpperPrice]: lastTradedPrice.value
        .plus(lastTradedPrice.value.times(0.06))
        .toFixed(2)
    },
    false
  )

  min.value = lastTradedPrice.value
    .minus(lastTradedPrice.value.times(0.2))
    .toFixed(2)
  max.value = lastTradedPrice.value
    .plus(lastTradedPrice.value.times(0.2))
    .toFixed(2)
})

function zoomIn() {
  animate(min, (Number(min.value) + Number(min.value) * 0.05).toString())
  animate(max, (Number(max.value) - Number(max.value) * 0.05).toString())
}
function zoomOut() {
  animate(min, (Number(min.value) - Number(min.value) * 0.05).toString())
  animate(max, (Number(max.value) + Number(max.value) * 0.05).toString())
}

const animate = (refValue: Ref, targetValue: string, duration = 200) => {
  const startTime = performance.now()
  const startValue = +refValue.value

  const update = (currentTime: any) => {
    const progress = (currentTime - startTime) / duration

    if (progress < 1) {
      refValue.value = (
        startValue +
        (+targetValue - startValue) * progress
      ).toString()

      requestAnimationFrame(update)
    } else {
      refValue.value = targetValue
    }
  }

  requestAnimationFrame(update)
}
</script>

<template>
  <div>
    <PartialsLiquidityBotsSpotCreateManualGrids />
    <PartialsLiquidityBotsSpotCreateManualUpperLowerBounds
      v-bind="{ market: gridStrategyStore.spotMarket! }"
    />

    <PartialsLiquidityBotsSpotCreateManualRangeInput
      v-model:lower="lowerPriceValue"
      v-model:max="max"
      v-model:min="min"
      v-model:upper="upperPriceValue"
      v-bind="{ currentPrice: lastTradedPrice.toFixed() }"
    />

    <div class="space-x-2 py-2 flex justify-end">
      <button class="border p-2 rounded-md" @click="zoomIn">
        <BaseIcon name="plus" is-xs />
      </button>
      <button class="border px-2 rounded-md" @click="zoomOut">
        <BaseIcon name="minus" is-xs />
      </button>
    </div>

    <PartialsLiquidityBotsSpotCreateCommonInvestmentType
      class="my-4"
      v-bind="{ market: gridStrategyStore.spotMarket! }"
    />
    <PartialsLiquidityBotsSpotCreateCommonInvestmentAmount
      v-bind="{ market: gridStrategyStore.spotMarket! }"
      class="mb-4"
    />

    <PartialsLiquidityBotsSpotCreateCommonCreateStrategy
      v-bind="{ market: gridStrategyStore.spotMarket! }"
    />
  </div>
</template>
