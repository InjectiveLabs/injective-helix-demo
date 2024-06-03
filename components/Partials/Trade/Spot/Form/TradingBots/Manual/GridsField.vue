<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import { sharedToBalanceInToken } from '@shared/utils/formatter'
import {
  GST_MINIMUM_GRIDS,
  GST_MAXIMUM_GRIDS,
  GST_DEFAULT_PRICE_TICK_SIZE
} from '@/app/utils/constants'
import {
  SpotMarketKey,
  SpotGridTradingForm,
  SpotGridTradingField
} from '@/types'

defineProps({
  isDisabled: Boolean
})

const spotMarket = inject(SpotMarketKey)

const spotGridFormValues = useFormValues<SpotGridTradingForm>()

const tickSize = computed(() =>
  spotMarket?.value
    ? sharedToBalanceInToken({
        value: spotMarket.value.minPriceTickSize,
        decimalPlaces:
          spotMarket.value.quoteToken.decimals -
          spotMarket.value.baseToken.decimals
      })
    : GST_DEFAULT_PRICE_TICK_SIZE
)

const maximumGrids = computed(() => {
  if (
    !spotGridFormValues.value[SpotGridTradingField.LowerPrice] ||
    !spotGridFormValues.value[SpotGridTradingField.UpperPrice]
  ) {
    return GST_MAXIMUM_GRIDS
  }

  const range = new BigNumberInBase(
    spotGridFormValues.value[SpotGridTradingField.UpperPrice] || 0
  ).minus(spotGridFormValues.value[SpotGridTradingField.LowerPrice] || 0)

  const maximumGrids = range.dividedBy(Number(tickSize.value) * 10).toFixed(0)

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
    },${
      spotGridFormValues.value[SpotGridTradingField.Grids] || GST_MINIMUM_GRIDS
    },${tickSize.value}`

    const betweenRule = `betweenSgt:${GST_MINIMUM_GRIDS},${maximumGrids.value}`

    rules.push(betweenRule, gridRangeRule)

    return rules.join('|')
  })
})
</script>

<template>
  <div class="mb-4">
    <div class="space-y-2">
      <div class="field-label flex items-center space-x-2">
        <span>2 .{{ $t('sgt.numberOfGrids') }}</span>
        <AppTooltip :content="$t('sgt.nOfGridsTooltip')" />
      </div>
      <AppInputField
        v-model="gridsValue"
        autofix
        :decimals="0"
        :disabled="isDisabled"
        :min="GST_MINIMUM_GRIDS"
        :max="GST_MAXIMUM_GRIDS"
        :placeholder="`${GST_MINIMUM_GRIDS}-${maximumGrids}`"
      />
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
  </div>
</template>
