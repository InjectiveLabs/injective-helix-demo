<script setup lang="ts">
import { GST_MINIMUM_GRIDS, GST_MAXIMUM_GRIDS } from '@/app/utils/constants'
import { SpotGridTradingField } from '@/types'

const { value: gridsValue, errorMessage } = useField(
  SpotGridTradingField.Grids,
  computed(
    () => `requiredSgt|betweenSgt:${GST_MINIMUM_GRIDS},${GST_MAXIMUM_GRIDS}`
  )
)
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
