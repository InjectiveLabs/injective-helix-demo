<script setup lang="ts">
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { MainPage } from '~/types'

const gridStrategyStore = useGridStrategyStore()
</script>

<template>
  <div class="flex flex-col items-center text-center max-w-2xl mx-auto">
    <h1 class="font-bold text-6xl">
      <span>{{ $t('tradingBots.title') }}</span>
    </h1>
    <p class="text-xl mt-4">
      {{ $t('tradingBots.description') }}
    </p>

    <div v-if="gridStrategyStore.stats">
      <div class="flex justify-between mt-4">
        <div class="text-center p-4">
          <h2 class="text-sm font-semibold text-zinc-600">
            {{ $t('tradingBots.activeBots') }}
          </h2>
          <p class="text-2xl font-bold">
            <AppAmount
              :amount="gridStrategyStore.stats.activeTradingStrategies"
            />
          </p>
        </div>
        <div class="text-center p-4">
          <h2 class="text-sm font-semibold text-zinc-600">
            {{ $t('tradingBots.totalBotsCreated') }}
          </h2>
          <p class="text-2xl font-bold">
            <AppAmount
              :amount="gridStrategyStore.stats.totalTradingStrategiesCreated"
            />
          </p>
        </div>
        <div class="text-center p-4">
          <h2 class="text-sm font-semibold text-zinc-600">
            {{ $t('tradingBots.totalTvl') }}
          </h2>
          <p class="text-2xl font-bold">
            <AppAmount
              :max-decimal-places="UI_DEFAULT_MIN_DISPLAY_DECIMALS"
              :amount="gridStrategyStore.stats.totalTvl"
              :decimal-places="UI_DEFAULT_MIN_DISPLAY_DECIMALS"
            />
          </p>
        </div>
      </div>
    </div>

    <div class="flex gap-4 mt-4">
      <AppButton
        :to="{ name: MainPage.TradingBotsLiquidityBotsSpot }"
        size="lg"
      >
        {{ $t('tradingBots.createYourStrategy') }}
      </AppButton>
      <AppButton variant="primary-outline" class="border-white" size="lg">
        {{ $t('common.learnMore') }}
      </AppButton>
    </div>
  </div>
</template>
