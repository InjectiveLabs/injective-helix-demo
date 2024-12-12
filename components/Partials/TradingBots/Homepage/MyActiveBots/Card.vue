<script setup lang="ts">
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import {
  TradePage,
  TradeSubPage,
  TradingInterface,
  GridStrategyTransformed,
  BotType,
  MainPage
} from '@/types'

defineProps<{
  strategy: GridStrategyTransformed
}>()
</script>

<template>
  <NuxtLink
    :to="
      strategy.market.isVerified
        ? {
            name:
              strategy.botType === BotType.SpotGrid
                ? TradeSubPage.Spot
                : MainPage.TradingBotsLiquidityBotsSpot,
            params: {
              slug:
                strategy.botType === BotType.SpotGrid
                  ? strategy.market.slug
                  : undefined
            },
            query: {
              interface:
                strategy.botType === BotType.SpotGrid
                  ? TradingInterface.TradingBots
                  : undefined,
              market:
                strategy.botType === BotType.LiquidityGrid
                  ? strategy.market.slug
                  : undefined
            }
          }
        : {
            name: TradePage.Spot,
            query: {
              marketId: strategy.market.marketId,
              interface: TradingInterface.TradingBots
            }
          }
    "
  >
    <UCard
      :ui="{
        background: 'dark:bg-brand-875',
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
            <AppAmount
              :amount="strategy.currentUsdValue.toFixed()"
              :decimal-places="UI_DEFAULT_MIN_DISPLAY_DECIMALS"
              :max-decimal-places="UI_DEFAULT_MIN_DISPLAY_DECIMALS"
            />
            <span> USD</span>
          </p>
        </div>

        <div class="text-right">
          <p class="text-gray-500 mb-1 text-xs">{{ $t('sgt.pnl') }}</p>
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
    </UCard>
  </NuxtLink>
</template>
