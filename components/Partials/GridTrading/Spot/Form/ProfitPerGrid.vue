<script setup lang="ts">
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { SpotGridTradingForm } from '@/types'

const gridStore = useGridStore()
const formValues = useFormValues<SpotGridTradingForm>()

const profitPerGrid = computed(() => {
  if (
    !formValues.value.lowerPrice ||
    !formValues.value.upperPrice ||
    !formValues.value.grids ||
    Number(formValues.value.grids) === 0
  ) {
    return ZERO_IN_BASE
  }

  return new BigNumberInBase(
    Number(formValues.value.upperPrice) - Number(formValues.value.lowerPrice)
  ).dividedBy(formValues.value.grids)
})

const { valueToString: profitPerGridToString } = useBigNumberFormatter(
  profitPerGrid,
  { decimalPlaces: 2 }
)
</script>

<template>
  <div class="flex justify-between items-center border-b py-4 text-gray-500">
    <p>{{ $t('sgt.profitPerGrid') }}</p>
    <p>{{ profitPerGridToString }} {{ gridStore.market?.quoteToken.symbol }}</p>
  </div>
</template>
