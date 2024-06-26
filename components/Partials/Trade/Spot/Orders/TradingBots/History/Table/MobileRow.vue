<script setup lang="ts">
import { TradingStrategy } from '@injectivelabs/sdk-ts'
import { BusEvents } from '@/types'

const props = defineProps({
  strategy: {
    type: Object as PropType<TradingStrategy>,
    required: true
  }
})

function onOpenTradingBotDetails() {
  useEventBus(BusEvents.OpenTradingBotDetails).emit(props.strategy)
}
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
      <div class="p-2 text-xs divide-y border-b border-brand-700">
        <div class="justify-between flex items-center px-2 py-4">
          <PartialsCommonMarketRedirection
            v-bind="{ market, isTradingBotTab: true }"
            class="flex items-center space-x-2 truncate min-w-0"
          >
            <CommonTokenIcon v-bind="{ token: market.baseToken }" />
            <p class="font-semibold">{{ market.ticker }}</p>
          </PartialsCommonMarketRedirection>
        </div>

        <div
          class="justify-between flex items-center px-2 py-4 truncate min-w-0"
        >
          <p>{{ $t('sgt.createdAt') }}</p>
          <p>{{ createdAt }}</p>
        </div>

        <div
          class="justify-between flex items-center px-2 py-4 truncate min-w-0"
        >
          <p>{{ $t('sgt.lowerBound') }}</p>

          <p class="space-x-1 font-mono">
            <span>{{ lowerBound.toFormat() }}</span>
            <span>{{ market.quoteToken.symbol }}</span>
          </p>
        </div>

        <div
          class="justify-between flex items-center px-2 py-4 truncate min-w-0"
        >
          <p>{{ $t('sgt.upperBound') }}</p>

          <p class="space-x-1 font-mono">
            <span>{{ upperBound.toFormat() }}</span>
            <span>{{ market.quoteToken.symbol }}</span>
          </p>
        </div>

        <div
          class="justify-between flex items-center px-2 py-4 truncate min-w-0"
        >
          <p>{{ $t('sgt.totalAmount') }}</p>

          <p class="space-x-1 font-mono">
            <span>{{ investment.toFormat(2) }}</span>
            <span>{{ market.quoteToken.symbol }}</span>
          </p>
        </div>

        <div class="justify-between flex items-center p-2 truncate min-w-0">
          <p>{{ $t('sgt.totalProfit') }}</p>

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

        <div
          class="justify-between flex items-center px-2 py-4 truncate min-w-0"
        >
          <p>{{ $t('sgt.duration') }}</p>
          <p>{{ duration }}</p>
        </div>

        <div
          class="flex items-center px-2 pt-2 truncate min-w-0 justify-center"
        >
          <AppButton class="w-full" @click="onOpenTradingBotDetails">
            {{ $t('common.details') }}
          </AppButton>
        </div>

        <div class="flex items-center p-2 truncate min-w-0 justify-between">
          <p>{{ $t('sgt.stopReason') }}</p>
          <p class="capitalize">
            <span v-if="strategy.stopReason">{{ strategy.stopReason }}</span>
            <span v-else>&mdash;</span>
          </p>
        </div>
      </div>
    </template>
  </CommonHeadlessSpotGridStrategy>
</template>
