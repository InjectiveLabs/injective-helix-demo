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
    marketReward?: {
      amount: string
      symbol: string
    }
  }>(),
  {
    activeStrategy: undefined,
    marketReward: undefined
  }
)
</script>

<template>
  <div>
    <div>
      <div class="flex justify-between items-center gap-1">
        <p class="text-2xl font-semibold">
          <SharedAmountFormatter
            :max-trailing-zeros="3"
            :decimal-places="market.priceDecimals"
            :max-decimal-places="market.priceDecimals"
            :amount="lastTradedPrice.toFixed()"
          />
        </p>
        <span
          v-if="marketReward"
          :class="`from-blue-500 to-blue-200 bg-gradient-to-r bg-clip-text text-sm font-semibold text-transparent px-2 py-1 rounded-md`"
        >
          {{
            $t('liquidityBots.upToRewards', {
              amount: marketReward.amount,
              symbol: marketReward.symbol
            })
          }}
        </span>
      </div>
      <p class="text-sm text-coolGray-500">
        {{
          $t('liquidityBots.currentPriceQuotePerBase', {
            quote: market.quoteToken.symbol,
            base: market.baseToken.symbol
          })
        }}
      </p>
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
