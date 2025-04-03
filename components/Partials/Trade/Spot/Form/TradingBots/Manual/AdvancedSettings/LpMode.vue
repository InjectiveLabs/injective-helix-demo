<script setup lang="ts">
import { SpotGridTradingField } from '@/types'

const { value: isLpModeValue } = useBooleanField({
  name: SpotGridTradingField.IsLpMode,
  initialValue: false,
  rule: ''
})
</script>

<template>
  <div class="flex items-center text-coolGray-450 font-medium">
    <AppCheckbox2 v-model="isLpModeValue">
      {{ $t('sgt.enableLpMode') }}
    </AppCheckbox2>

    <div class="-ml-2">
      <AppTooltip
        v-bind="{
          content: $t('sgt.lpModeTooltip')
        }"
      />
    </div>
  </div>
</template>
