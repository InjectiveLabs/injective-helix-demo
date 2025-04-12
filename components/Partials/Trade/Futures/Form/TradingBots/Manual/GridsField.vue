<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  DerivativeGridTradingField,
  DerivativeGridTradingForm,
  MarketKey,
  UiDerivativeMarket
} from '@/types'
import {
  GST_DEFAULT_PRICE_TICK_SIZE,
  GST_MINIMUM_GRIDS
} from '@/app/utils/constants'

// TODO: remove this and add the default GST_MAXIMUM_GRID from @/app/utils/constants when SC updates to 150 grids
const GST_MAXIMUM_GRIDS = 100

const derivativeMarket = inject(MarketKey) as Ref<UiDerivativeMarket>

const derivativeGridFormValues = useFormValues<DerivativeGridTradingForm>()

const tickSize = computed(() =>
  derivativeMarket?.value
    ? sharedToBalanceInToken({
        value: derivativeMarket.value.minPriceTickSize,
        decimalPlaces: derivativeMarket.value.quoteToken.decimals
      })
    : GST_DEFAULT_PRICE_TICK_SIZE
)

const maximumGrids = computed(() => {
  if (
    !derivativeGridFormValues.value[DerivativeGridTradingField.LowerPrice] ||
    !derivativeGridFormValues.value[DerivativeGridTradingField.UpperPrice]
  ) {
    return GST_MAXIMUM_GRIDS
  }

  const range = new BigNumberInBase(
    derivativeGridFormValues.value[DerivativeGridTradingField.UpperPrice] || 0
  ).minus(
    derivativeGridFormValues.value[DerivativeGridTradingField.LowerPrice] || 0
  )

  const maximumGrids = range
    .dividedBy(Number(tickSize.value))
    .plus(1)
    .toFixed(0)

  if (Number(maximumGrids) < GST_MINIMUM_GRIDS) {
    return GST_MINIMUM_GRIDS
  }

  if (Number(maximumGrids) > GST_MAXIMUM_GRIDS) {
    return GST_MAXIMUM_GRIDS
  }

  return Number(maximumGrids)
})

const { value: gridsValue, errorMessage } = useStringField({
  name: DerivativeGridTradingField.Grids,
  rule: '',
  dynamicRule: computed(() => {
    const rules = ['requiredSgt']

    const gridRangeRule = `gridRangeSgt:@${
      DerivativeGridTradingField.LowerPrice
    },@${DerivativeGridTradingField.UpperPrice},${
      derivativeGridFormValues.value[DerivativeGridTradingField.Grids] ||
      GST_MINIMUM_GRIDS
    },${tickSize.value}`

    const betweenRule = `betweenSgt:${GST_MINIMUM_GRIDS},${maximumGrids.value}`

    rules.push(gridRangeRule, betweenRule)

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
        :min="GST_MINIMUM_GRIDS"
        :max="GST_MAXIMUM_GRIDS"
        :placeholder="`${GST_MINIMUM_GRIDS}-${maximumGrids}`"
      />
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
  </div>
</template>
