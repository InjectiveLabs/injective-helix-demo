<script setup lang="ts">
import type { TradingStrategy } from '@injectivelabs/sdk-ts'
import type { LiquidityValues, UiMarketWithToken } from '@/types'
import type { Status, BigNumberInBase } from '@injectivelabs/utils'

withDefaults(
  defineProps<{
    status: Status
    market: UiMarketWithToken
    liquidityValues: LiquidityValues
    activeStrategy?: TradingStrategy
    lastTradedPrice: BigNumberInBase
    marketReward?: {
      amount: string
      symbol: string
    }
  }>(),
  {
    marketReward: undefined,
    activeStrategy: undefined
  }
)
</script>

<template>
  <div>
    <div>
      <div class="flex justify-between items-center gap-1">
        <p class="text-2xl font-semibold flex gap-1.5 items-center">
          <SharedAmount
            v-bind="{
              useSubscript: true,
              shouldAbbreviate: false,
              amount: lastTradedPrice.toFixed(),
              decimalPlaces: market.priceDecimals
            }"
          />
          <span>{{ market.quoteToken.symbol }}</span>
        </p>
        <span
          v-if="marketReward"
          :class="`from-blue-500 to-blue-200 bg-gradient-to-r bg-clip-text text-sm font-semibold text-transparent px-2 py-1 rounded-md`"
        >
          {{
            $t('tradingBots.liquidityBots.upToRewards', {
              amount: marketReward.amount,
              symbol: marketReward.symbol
            })
          }}
        </span>
      </div>
    </div>

    <USkeleton v-if="status.isLoading()" class="h-[500px] mt-4" />

    <PartialsLiquidityBotsSpotChartGridChart
      v-else
      v-bind="{
        market,
        liquidityValues,
        status,
        activeStrategy,
        lastTradedPrice
      }"
    />
  </div>
</template>
