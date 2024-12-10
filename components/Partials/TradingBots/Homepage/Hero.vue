<script setup lang="ts">
import { MainPage } from '@/types'

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
            <span class="-mr-0.25">$</span>
            <AppAmount
              :decimal-places="0"
              :amount="gridStrategyStore.stats.totalTvl"
            />
          </p>
        </div>
      </div>
    </div>

    <div class="flex gap-4 mt-4">
      <NuxtLink :to="{ name: MainPage.TradingBotsLiquidityBotsSpot }">
        <AppButton size="lg">
          {{ $t('tradingBots.createYourStrategy') }}
        </AppButton>
      </NuxtLink>

      <NuxtLink
        to="https://helixapp.zendesk.com/hc/en-us/articles/8057052788623-Helix-Trading-Bot-Launch"
        target="_blank"
      >
        <AppButton variant="primary-outline" class="border-white" size="lg">
          {{ $t('common.learnMore') }}
        </AppButton>
      </NuxtLink>
    </div>
  </div>
</template>
