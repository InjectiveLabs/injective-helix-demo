<script setup lang="ts">
import { TradingStrategy } from '@injectivelabs/sdk-ts'
import { Status, BigNumberInBase } from '@injectivelabs/utils'
import { LiquidityValues, UiMarketWithToken } from '@/types'

withDefaults(
  defineProps<{
    market: UiMarketWithToken
    liquidityValues: LiquidityValues
    status: Status
    activeStrategy?: TradingStrategy
    lastTradedPrice: BigNumberInBase
  }>(),
  {
    activeStrategy: undefined
  }
)
</script>

<template>
  <div>
    <p class="text-2xl font-semibold">
      <SharedUsdAmount :amount="lastTradedPrice.toString()" />
    </p>
    <p class="text-sm text-coolGray-500">
      {{
        $t('liquidityBots.currentPriceQuotePerBase', {
          quote: market.quoteToken.symbol,
          base: market.baseToken.symbol
        })
      }}
    </p>

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
