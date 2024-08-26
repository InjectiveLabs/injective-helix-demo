<script lang="ts" setup>
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import {
  GST_MINIMUM_GRIDS,
  GST_MAXIMUM_GRIDS,
  GST_DEFAULT_PRICE_TICK_SIZE
} from '@/app/utils/constants'
import { SpotGridTradingField } from '@/types'

const gridStrategyStore = useGridStrategyStore()
const formValues = useFormValues()

const tickSize = computed(() =>
  gridStrategyStore.spotMarket
    ? new BigNumberInWei(gridStrategyStore.spotMarket.minPriceTickSize)
        .toBase(
          gridStrategyStore.spotMarket.quoteToken.decimals -
            gridStrategyStore.spotMarket.baseToken.decimals
        )
        .toFixed()
    : GST_DEFAULT_PRICE_TICK_SIZE
)

const maximumGrids = computed(() => {
  const range = new BigNumberInBase(
    formValues.value[SpotGridTradingField.UpperPrice]
  ).minus(formValues.value[SpotGridTradingField.LowerPrice])

  const maximumGrids = range.dividedBy(Number(tickSize.value)).toFixed(0)

  if (Number(maximumGrids) < GST_MINIMUM_GRIDS) {
    return GST_MINIMUM_GRIDS
  }

  if (Number(maximumGrids) > GST_MAXIMUM_GRIDS) {
    return GST_MAXIMUM_GRIDS
  }

  return Number(maximumGrids)
})

const { value: gridsValue, errorMessage } = useStringField({
  name: SpotGridTradingField.Grids,
  rule: '',
  dynamicRule: computed(() => {
    const rules = ['requiredSgt']

    const gridRangeRule = `gridRangeSgt:@${SpotGridTradingField.LowerPrice},@${
      SpotGridTradingField.UpperPrice
    },${formValues.value[SpotGridTradingField.Grids] || GST_MINIMUM_GRIDS},${
      tickSize.value
    }`

    const betweenRule = `betweenSgt:${GST_MINIMUM_GRIDS},${maximumGrids.value}`

    rules.push(betweenRule, gridRangeRule)

    return rules.join('|')
  })
})
</script>
<template>
  <div class="pb-1">
    <p class="pb-3 font-bold text-sm tracking-wide flex items-center space-x-2">
      <span>{{ $t('sgt.numberOfGrids') }} </span>
      <AppTooltip :content="$t('sgt.nOfGridsTooltip')" />
    </p>

    <AppInputField
      v-model="gridsValue"
      :decimals="0"
      :max="Number(maximumGrids)"
      autofix
      :placeholder="`${GST_MINIMUM_GRIDS} - ${maximumGrids.toFixed(0)}`"
    />

    <p class="text-red-500 text-xs font-semibold pt-2">{{ errorMessage }}</p>
  </div>
</template>
