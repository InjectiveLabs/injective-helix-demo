<script lang="ts" setup>
import { BigNumberInWei } from '@injectivelabs/utils'
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

const { value: gridsValue, errorMessage } = useStringField({
  name: SpotGridTradingField.Grids,
  rule: '',
  dynamicRule: computed(() => {
    const rules = ['requiredSgt']

    const betweenRule = `betweenSgt:${GST_MINIMUM_GRIDS},${GST_MAXIMUM_GRIDS}`

    const rangeRule = `rangeSgt:@${SpotGridTradingField.LowerPrice},@${
      SpotGridTradingField.UpperPrice
    },${formValues.value[SpotGridTradingField.Grids] || 10},${tickSize.value}`

    rules.push(betweenRule, rangeRule)

    return rules.join('|')
  })
})
</script>

<template>
  <div class="pb-1">
    <p class="pb-3 font-bold text-sm tracking-wide flex items-center space-x-2">
      <span> 2. {{ $t('sgt.numberOfGrids') }} </span>
      <AppTooltip :content="$t('sgt.nOfGridsTooltip')" />
    </p>

    <AppInputNumeric
      v-model="gridsValue"
      :max-decimals="0"
      :placeholder="`${GST_MINIMUM_GRIDS} - ${GST_MAXIMUM_GRIDS}`"
      class="text-right"
    />

    <p class="text-red-500 text-xs font-semibold pt-2">{{ errorMessage }}</p>
  </div>
</template>
