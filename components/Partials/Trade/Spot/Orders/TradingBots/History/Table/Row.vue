<script setup lang="ts">
import { TradingStrategy } from '@injectivelabs/sdk-ts'

defineProps({
  strategy: {
    type: Object as PropType<TradingStrategy>,
    required: true
  }
})
</script>

<template>
  <CommonHeadlessSpotGridStrategy v-bind="{ strategy }">
    <template
      #default="{
        investment,
        lowerBound,
        percentagePnl,
        pnl,
        upperBound,
        market,
        duration,
        createdAt
      }"
    >
      <div class="flex p-2 text-xs">
        <div class="flex-1 flex items-center p-2 truncate min-w-0">
          {{ createdAt }}
        </div>

        <div class="flex-1 flex items-center p-2 truncate min-w-0 space-x-2">
          <CommonTokenIcon v-bind="{ token: market.baseToken }" />
          <p class="font-semibold">{{ market.ticker }}</p>
        </div>

        <div class="flex-1 flex items-center p-2 truncate min-w-0">
          <p class="space-x-1 font-mono">
            <span>{{ lowerBound.toFormat() }}</span>
            <span>{{ market.quoteToken.symbol }}</span>
          </p>
        </div>

        <div class="flex-1 flex items-center p-2 truncate min-w-0">
          <p class="space-x-1 font-mono">
            <span>{{ upperBound.toFormat() }}</span>
            <span>{{ market.quoteToken.symbol }}</span>
          </p>
        </div>

        <div class="flex-1 flex items-center p-2 truncate min-w-0">
          <p class="space-x-1 font-mono">
            <span>{{ investment.toFormat(2) }}</span>
            <span>{{ market.quoteToken.symbol }}</span>
          </p>
        </div>

        <div class="flex-1 flex items-center p-2 truncate min-w-0">
          <div
            class="font-mono"
            :class="[pnl.gte(0) ? 'text-green-500' : 'text-red-500']"
          >
            <p class="text-sm">
              {{ pnl.toFormat(2) }} {{ market.quoteToken.symbol }}
            </p>
            <p>{{ percentagePnl }} %</p>
          </div>
        </div>

        <div class="flex-1 flex items-center p-2 truncate min-w-0">
          <p>{{ duration }}</p>
        </div>

        <div class="flex-1 flex items-center p-2 truncate min-w-0">
          <p>Details</p>
        </div>

        <div class="flex-1 flex p-2 truncate min-w-0 items-center">
          <p class="capitalize">
            <span v-if="strategy.stopReason">{{ strategy.stopReason }}</span>
            <span v-else>&mdash;</span>
          </p>
        </div>
      </div>
    </template>
  </CommonHeadlessSpotGridStrategy>
</template>
