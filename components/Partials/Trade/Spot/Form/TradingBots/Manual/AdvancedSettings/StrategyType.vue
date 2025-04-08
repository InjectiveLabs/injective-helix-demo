<script setup lang="ts">
import { SpotGridStrategyType, SpotGridTradingField } from '@/types'

const { value: strategyTypeValue } = useStringField({
  name: SpotGridTradingField.StrategyType,
  initialValue: SpotGridStrategyType.Arithmetic,
  rule: ''
})

const strategyType = computed({
  get: () => strategyTypeValue.value === SpotGridStrategyType.Geometric,
  set: (isTrue: boolean) => {
    strategyTypeValue.value = isTrue
      ? SpotGridStrategyType.Geometric
      : SpotGridStrategyType.Arithmetic
  }
})
</script>

<template>
  <div class="flex items-center text-coolGray-450 font-medium">
    <AppCheckbox2 v-model="strategyType">
      {{ $t('sgt.geometric') }}
    </AppCheckbox2>
    <AppTooltip
      v-bind="{
        content: $t('sgt.gridModeTooltip')
      }"
    />
  </div>
</template>
