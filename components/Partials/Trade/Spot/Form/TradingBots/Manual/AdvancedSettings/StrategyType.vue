<script setup lang="ts">
import { StrategyType } from '@injectivelabs/sdk-ts'
import { SpotGridTradingField } from '@/types'

const { value: strategyTypeValue } = useStringField({
  name: SpotGridTradingField.StrategyType,
  initialValue: StrategyType.Arithmetic,
  rule: ''
})

const strategyType = computed({
  get: () => strategyTypeValue.value === StrategyType.Geometric,
  set: (isTrue: boolean) => {
    strategyTypeValue.value = isTrue
      ? StrategyType.Geometric
      : StrategyType.Arithmetic
  }
})
</script>

<template>
  <div class="flex items-center">
    <AppCheckbox2 v-model="strategyType">Geometric</AppCheckbox2>
    <AppTooltip
      v-bind="{
        content: $t('sgt.gridModeTooltip')
      }"
    />
  </div>
</template>
