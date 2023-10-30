<script setup lang="ts">
import { GST_DEFAULT_AUTO_GRIDS } from 'app/utils/constants'
import { SpotGridTradingField } from 'types'

const exchangeStore = useExchangeStore()
const gridStrategyStore = useGridStrategyStore()
const { lastTradedPrice: spotLastTradedPrice } = useSpotLastPrice(
  computed(() => gridStrategyStore.spotMarket!)
)

const setFormValues = useSetFormValues()

const upperPrice = computed(() => {
  const marketHistory = exchangeStore.marketsHistory.find(
    (market) => market.marketId === gridStrategyStore.spotMarket!.marketId
  )

  if (!marketHistory) {
    return ''
  }

  const max = Math.max(...marketHistory.highPrice)
  const maxPlusPadding = max + max * 0.05

  const minUpperBound = spotLastTradedPrice.value.plus(
    spotLastTradedPrice.value.times(0.06)
  )

  return minUpperBound.gt(max)
    ? minUpperBound.toFixed(2)
    : maxPlusPadding.toFixed(2)
})

const lowerPrice = computed(() => {
  const marketHistory = exchangeStore.marketsHistory.find(
    (market) => market.marketId === gridStrategyStore.spotMarket!.marketId
  )

  if (!marketHistory) {
    return ''
  }

  const min = Math.min(...marketHistory.lowPrice)

  const maxLowerBound = spotLastTradedPrice.value.minus(
    spotLastTradedPrice.value.times(0.06)
  )

  return maxLowerBound.lt(min) ? maxLowerBound.toFixed(2) : min.toFixed(2)
})

const grids = ref(GST_DEFAULT_AUTO_GRIDS)

function setValuesFromAuto() {
  setFormValues(
    {
      [SpotGridTradingField.UpperPrice]: upperPrice.value,
      [SpotGridTradingField.LowerPrice]: lowerPrice.value,
      [SpotGridTradingField.Grids]: grids.value
    },
    false
  )
}
</script>

<template>
  <div>
    <PartialsLiquidityBotsSpotCreateAutoParameters
      v-bind="{
        market: gridStrategyStore.spotMarket!,
        upperPrice,
        lowerPrice,
        grids: grids.toFixed()
      }"
      class="mb-4"
    />

    <PartialsLiquidityBotsSpotCreateCommonInvestmentAmount
      v-bind="{ market: gridStrategyStore.spotMarket! }"
      class="mb-4"
      is-auto
    />
    <PartialsLiquidityBotsSpotCreateCommonCreateStrategy
      v-bind="{ market: gridStrategyStore.spotMarket! }"
      @strategy:create="setValuesFromAuto"
    />
  </div>
</template>
