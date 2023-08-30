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
  <div>
    <div class="flex justify-between items-center">
      <p class="text-xs font-semibold text-gray-200 mb-2">
        {{ $t('sgt.grids') }}
      </p>
      <p class="text-xs font-semibold text-gray-500 mb-2">
        {{ GST_MINIMUM_GRIDS }}-{{ GST_MAXIMUM_GRIDS }}
      </p>
    </div>

    <AppInputNumeric
      v-model="gridsValue"
      :max-decimals="0"
      class="text-right"
    />

    <p class="text-red-500 text-xs font-semibold pt-2">{{ errorMessage }}</p>
  </div>
</template>
