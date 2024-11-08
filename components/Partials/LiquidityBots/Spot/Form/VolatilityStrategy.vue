<script setup lang="ts">
import { LiquidityBotField, VolatilityStrategyType } from '@/types/enums'

const { t } = useLang()

const { value: selectedStrategy } = useStringField({
  name: LiquidityBotField.Volatility,
  initialValue: VolatilityStrategyType.Passive
})

const options = [
  {
    label: t('liquidityBots.passive'),
    value: VolatilityStrategyType.Passive,
    icon: 'ant-design:bar-chart-outlined'
  },
  {
    label: t('liquidityBots.moderate'),
    value: VolatilityStrategyType.Moderate,
    icon: 'mingcute:chart-bar-line'
  },
  {
    label: t('liquidityBots.aggressive'),
    value: VolatilityStrategyType.Aggressive,
    icon: 'vaadin:line-bar-chart'
  }
]
</script>

<template>
  <div>
    <p class="text-sm font-semibold">
      {{ $t('liquidityBots.volatilityStrategy') }}
    </p>

    <div class="mt-4 grid grid-cols-3 gap-4">
      <AppButtonSelect
        v-for="option in options"
        :key="option.value"
        v-model="selectedStrategy"
        :value="option.value"
        class="border p-4 rounded-2xl"
        active-classes="border-primary"
      >
        <UIcon :name="option.icon" class="size-10" />
        <p class="text-sm font-semibold">{{ option.label }}</p>
      </AppButtonSelect>
    </div>
  </div>
</template>
