<script setup lang="ts">
import { SpotGridTradingField } from '@/types'

const { value: gridsValue } = useStringField({
  name: SpotGridTradingField.Grids,
  dynamicRule: computed(() => ``)
})
</script>

<template>
  <div>
    <div class="flex justify-between items-center">
      <p class="text-xs font-semibold text-gray-200 mb-2">Grids</p>
      <p class="text-xs font-semibold text-gray-500 mb-2">2-100</p>
    </div>

    <AppInputNumeric v-model="gridsValue" class="text-right" />
  </div>
</template>
