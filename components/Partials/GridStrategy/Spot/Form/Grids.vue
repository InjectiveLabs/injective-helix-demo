<script setup lang="ts">
import { GST_MINIMUM_GRIDS, GST_MAXIMUM_GRIDS } from '@/app/utils/constants'
import { SpotGridTradingField } from '@/types'

const { value: gridsValue, errorMessage } = useStringField({
  name: SpotGridTradingField.Grids,
  rule: `requiredSgt|betweenSgt:${GST_MINIMUM_GRIDS},${GST_MAXIMUM_GRIDS}`,
  dynamicRule: computed(() => ``)
})
</script>

<template>
  <div class="pb-1">
    <p class="pb-3 font-bold text-sm tracking-wide">
      2. {{ $t('sgt.numberOfGrids') }}
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
