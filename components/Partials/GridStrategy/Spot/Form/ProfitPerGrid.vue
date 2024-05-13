<script lang="ts" setup>
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { SpotGridTradingField, SpotGridTradingForm } from '@/types'

const gridStrategyStore = useGridStrategyStore()
const formValues = useFormValues<SpotGridTradingForm>()

const profitPerGrid = computed(() => {
  if (
    !formValues.value[SpotGridTradingField.LowerPrice] ||
    !formValues.value[SpotGridTradingField.UpperPrice] ||
    !formValues.value[SpotGridTradingField.Grids] ||
    !gridStrategyStore.spotMarket ||
    Number(formValues.value[SpotGridTradingField.Grids]) === 0
  ) {
    return ZERO_IN_BASE
  }

  const priceDifference = new BigNumberInBase(
    formValues.value[SpotGridTradingField.UpperPrice]
  )
    .minus(formValues.value[SpotGridTradingField.LowerPrice])
    .dividedBy(formValues.value[SpotGridTradingField.Grids])

  return priceDifference
    .dividedBy(formValues.value[SpotGridTradingField.LowerPrice])
    .times(100)
})

const { valueToString: profitPerGridToString } = useSharedBigNumberFormatter(
  profitPerGrid,
  { decimalPlaces: 2 }
)
</script>

<template>
  <div class="flex justify-between items-center border-b pb-2 text-gray-500">
    <div class="flex items-center space-x-2 text-xs">
      <p>{{ $t('sgt.profitGrid') }}</p>
      <AppTooltip :content="$t('sgt.gridIntervalTooltip')" />
    </div>

    <p>{{ profitPerGridToString }} %</p>
  </div>
</template>
