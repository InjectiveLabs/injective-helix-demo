<script setup lang="ts">
import { GridStrategyTransformed } from '@/types'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '~/app/utils/constants'

defineProps<{
  strategy: GridStrategyTransformed
}>()
</script>

<template>
  <UCard
    :ui="{
      background: 'dark:bg-brand-850',
      ring: 'dark:hover:ring-primary-500',
      body: {
        padding: 'px-2 sm:px-4 py-2 sm:py-4'
      }
    }"
  >
    <div class="flex">
      <UAvatar
        alt="Bot Avatar"
        size="lg"
        class="mt-1"
        :src="strategy.market.baseToken.logo"
      />
      <div class="flex flex-col items-start flex-1 pl-3">
        <p class="text-xl font-bold">{{ strategy.market.ticker }}</p>
        <p
          class="text-gray-300 bg-gray-600 p-1 mt-1 font-semibold rounded-md text-xs"
        >
          {{ $t(`tradingBots.botType.${strategy.botType}`) }}
        </p>
      </div>
      <div class="text-sm">
        <p class="text-gray-300">
          {{ strategy.durationFormatted }}
        </p>
      </div>
    </div>

    <div class="flex justify-between mt-8">
      <div class="text-left">
        <p class="text-gray-500 mb-1 text-xs">
          {{ $t('tradingBots.assetsInBot') }}
        </p>
        <p class="text-xl font-bold">
          <SharedAmountFormatter
            :amount="strategy.currentUsdValue.toFixed()"
            :decimal-places="UI_DEFAULT_MIN_DISPLAY_DECIMALS"
            :max-decimal-places="UI_DEFAULT_MIN_DISPLAY_DECIMALS"
          />
        </p>
      </div>

      <div class="text-right">
        <p class="text-gray-500 mb-1 text-xs">{{ $t('common.roi') }}</p>
        <p class="text-xl font-bold">
          <span
            :class="strategy.isPositivePnl ? 'text-green-500' : 'text-red-500'"
          >
            {{ strategy.isPositivePnl ? '+' : '' }}
            {{ strategy.percentagePnl }}%
          </span>
        </p>
      </div>
    </div>
  </UCard>
</template>
