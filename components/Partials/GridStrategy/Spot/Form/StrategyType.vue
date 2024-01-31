<script setup lang="ts">
import { StrategyType } from '@injectivelabs/sdk-ts'
import { SpotGridTradingField } from '@/types'

const strategyTypes = [StrategyType.Arithmetic, StrategyType.Geometric]

const { value: strategyTypeValue } = useStringField({
  name: SpotGridTradingField.StrategyType,
  initialValue: StrategyType.Arithmetic
})
</script>

<template>
  <div class="flex items-center justify-between border-y py-2">
    <div class="flex items-center space-x-2 font-bold text-sm text-gray-300">
      <p>{{ $t('sgt.gridMode') }}</p>
      <AppTooltip :content="$t('sgt.gridModeTooltip')" />
    </div>

    <div class="flex items-center space-x-2">
      <AppSelectButton
        v-for="type in strategyTypes"
        :key="type"
        v-model="strategyTypeValue"
        :value="type"
      >
        <template #default="{ isActive }">
          <span
            class="font-semibold text-sm"
            :class="{
              'text-blue-500': isActive,
              'text-gray-500': !isActive
            }"
          >
            {{ $t(`sgt.${type}`) }}
          </span>
        </template>
      </AppSelectButton>
    </div>
  </div>
</template>
