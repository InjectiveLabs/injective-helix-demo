<script setup lang="ts">
import { getTradingBotLinkFromStrategy } from '@/app/utils/helpers'
import type {
  GridStrategyTransformed,
  DerivativeGridStrategyTransformed
} from '@/types'

const props = defineProps<{
  strategy: GridStrategyTransformed | DerivativeGridStrategyTransformed
}>()

const to = computed(() => getTradingBotLinkFromStrategy(props.strategy))
</script>

<template>
  <NuxtLink :to="to">
    <UCard
      :ui="{
        base: 'h-full',
        background: 'dark:bg-brand-875',
        ring: 'dark:hover:ring-primary-500',
        body: {
          base: 'flex flex-col h-full',
          padding: 'px-2 sm:px-4 py-2 sm:py-4'
        }
      }"
    >
      <div class="flex flex-col h-full">
        <div class="flex flex-1">
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
              <SharedAmountUsd
                v-bind="{
                  amount: strategy.currentUsdValue
                }"
              />
              <span> USD</span>
            </p>
          </div>

          <div class="text-right">
            <p class="text-gray-500 mb-1 text-xs">{{ $t('common.pnl') }}</p>
            <p class="text-xl font-bold">
              <span
                :class="
                  strategy.isPositivePnl ? 'text-green-500' : 'text-red-500'
                "
              >
                {{ strategy.isPositivePnl ? '+' : '' }}
                {{ strategy.percentagePnl }}%
              </span>
            </p>
          </div>
        </div>
      </div>
    </UCard>
  </NuxtLink>
</template>
