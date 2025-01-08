<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  MainPage,
  GridStrategyTransformed,
  DerivativeGridStrategyTransformed
} from '@/types'

const props = withDefaults(
  defineProps<{
    strategy: GridStrategyTransformed | DerivativeGridStrategyTransformed
  }>(),
  {}
)

const gridStrategyStore = useGridStrategyStore()

const totalUsers = computed(
  () =>
    gridStrategyStore.stats?.markets?.find(
      (m: any) => m.marketId === props.strategy.marketId
    )?.activeTradingStrategies || 0
)
const isPositivePnl = computed(() =>
  new BigNumberInBase(props.strategy.percentagePnl).gt(0)
)
</script>

<template>
  <UCard
    :ui="{
      base: 'h-full flex flex-col',
      background: 'dark:bg-brand-875',
      ring: 'dark:hover:ring-primary-500',
      body: {
        base: 'flex-1',
        padding: 'px-2 sm:px-4 py-2 sm:py-4'
      }
    }"
  >
    <div class="flex flex-1">
      <UAvatar
        :src="strategy.market.baseToken.logo"
        :alt="strategy.market.baseToken.symbol"
        size="lg"
        class="mt-1"
      />
      <div class="flex flex-col items-start flex-1 pl-3">
        <p class="text-xl font-bold">{{ props.strategy.market.ticker }}</p>
        <p
          class="text-gray-300 bg-gray-600 p-1 font-semibold rounded-md text-xs"
        >
          {{ $t(`tradingBots.${props.strategy.botType}`) }}
        </p>
      </div>

      <div>
        <div class="text-sm flex items-center gap-1">
          <UIcon class="size-6" :name="NuxtUiIcons.User" />
          <div class="text-gray-300 leading-none">{{ totalUsers }}</div>
        </div>
      </div>
    </div>

    <div class="mt-4">
      <p class="text-gray-500 mb-1 text-xs">{{ $t('sgt.pnl') }}</p>
      <p
        :class="[isPositivePnl ? 'text-green-500' : 'text-red-500']"
        class="text-2xl font-semibold"
      >
        <span v-if="isPositivePnl"> + </span>
        {{ strategy.percentagePnl }}
        %
      </p>
    </div>

    <div class="flex justify-between mt-4">
      <div class="text-left">
        <p class="text-gray-500 mb-1 text-xs">{{ $t('common.runtime') }}</p>
        <p class="text-sm">{{ props.strategy.durationFormatted }}</p>
      </div>

      <div class="text-right">
        <p class="text-gray-500 mb-1 text-xs">
          {{ $t('tradingBots.priceRange') }}
        </p>
        <p class="text-sm">
          {{ strategy.lowerBound }} - {{ strategy.upperBound }}
          {{ strategy.market.quoteToken.symbol }}
        </p>
      </div>
    </div>

    <div
      v-if="strategy.trailingLower && strategy.trailingUpper"
      class="flex justify-between mt-4"
    >
      <div class="text-left"></div>

      <div class="text-right">
        <p class="text-gray-500 mb-1 text-xs">
          {{ $t('tradingBots.trailingPriceRange') }}
        </p>
        <p class="text-sm">
          {{ strategy.trailingLower }} - {{ strategy.trailingUpper }}
          {{ strategy.market.quoteToken.symbol }}
        </p>
      </div>
    </div>

    <template #footer>
      <UButton
        block
        :to="{
          name: MainPage.TradingBotsLiquidityBotsSpot,
          query: { market: strategy.market.slug }
        }"
      >
        {{ $t('common.create') }}
      </UButton>
    </template>
  </UCard>
</template>
