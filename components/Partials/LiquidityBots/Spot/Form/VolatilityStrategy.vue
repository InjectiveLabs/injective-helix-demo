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
    img: '/svg/liquidity_passive.svg'
  },
  {
    label: t('liquidityBots.moderate'),
    value: VolatilityStrategyType.Moderate,
    img: '/svg/liquidity_moderate.svg'
  },
  {
    label: t('liquidityBots.aggressive'),
    value: VolatilityStrategyType.Aggressive,
    img: '/svg/liquidity_aggressive.svg'
  }
]
</script>

<template>
  <div>
    <p class="text-sm font-semibold">
      {{ $t('liquidityBots.volatilityStrategy') }}
    </p>

    <div class="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
      <AppButtonSelect
        v-for="option in options"
        :key="option.value"
        v-model="selectedStrategy"
        :value="option.value"
        class="border p-2 sm:p-4 rounded-2xl max-sm:[&:nth-child(3)]:col-span-2"
        active-classes="border-primary"
      >
        <img :src="option.img" alt="" class="size-8 sm:size-10 mx-auto" />
        <p class="text-xs sm:text-sm font-semibold">{{ option.label }}</p>
      </AppButtonSelect>
    </div>
  </div>
</template>
