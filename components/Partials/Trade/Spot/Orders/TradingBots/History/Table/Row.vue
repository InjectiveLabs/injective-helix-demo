<script setup lang="ts">
import { TradingStrategy } from '@injectivelabs/sdk-ts'
import { BusEvents } from '@/types'

const props = withDefaults(
  defineProps<{
    strategy: TradingStrategy
  }>(),
  {}
)

function onOpenTradingBotDetails() {
  useEventBus(BusEvents.OpenTradingBotDetails).emit(props.strategy)
}
</script>

<template>
  <CommonHeadlessSpotGridStrategy v-bind="{ strategy }">
    <template
      #default="{
        pnl,
        market,
        duration,
        createdAt,
        pnlToFixed,
        percentagePnl,
        investmentToFixed,
        lowerBoundToFixed,
        upperBoundToFixed
      }"
    >
      <div class="flex p-2 text-xs">
        <div class="flex-1 flex items-center p-2 truncate min-w-0">
          {{ createdAt }}
        </div>

        <PartialsCommonMarketRedirection
          v-bind="{ market, isTradingBotTab: true }"
          class="flex-1 flex items-center p-2 truncate min-w-0 space-x-2 justify-start"
        >
          <CommonTokenIcon v-bind="{ token: market.baseToken }" />
          <p class="font-semibold">{{ market.ticker }}</p>
        </PartialsCommonMarketRedirection>

        <div class="flex-1 flex items-center p-2 truncate min-w-0 justify-end">
          <p class="space-x-1 font-mono">
            <span>
              <AppAmount
                v-bind="{
                  amount: lowerBoundToFixed
                }"
            /></span>
            <span>{{ market.quoteToken.symbol }}</span>
          </p>
        </div>

        <div class="flex-1 flex items-center justify-end p-2 truncate min-w-0">
          <p class="space-x-1 font-mono">
            <span>
              <AppAmount
                v-bind="{
                  amount: upperBoundToFixed
                }"
            /></span>
            <span>{{ market.quoteToken.symbol }}</span>
          </p>
        </div>

        <div class="flex-1 flex items-center p-2 truncate min-w-0 justify-end">
          <p class="space-x-1 font-mono">
            <span>
              <AppAmount
                v-bind="{
                  amount: investmentToFixed
                }"
            /></span>
            <span>{{ market.quoteToken.symbol }}</span>
          </p>
        </div>

        <div class="flex-1 flex items-center p-2 truncate min-w-0 justify-end">
          <div
            class="font-mono text-right"
            :class="[pnl.gte(0) ? 'text-green-500' : 'text-red-500']"
          >
            <p class="text-sm">
              <AppAmount
                v-bind="{
                  amount: pnlToFixed
                }"
              />
              <span class="ml-1">
                {{ market.quoteToken.symbol }}
              </span>
            </p>
            <p>{{ percentagePnl }} %</p>
          </div>
        </div>

        <div class="flex-1 flex items-center p-2 truncate min-w-0 justify-end">
          <p>{{ duration }}</p>
        </div>

        <div class="flex-1 flex items-center justify-end p-2 truncate min-w-0">
          <AppButton size="sm" @click="onOpenTradingBotDetails">
            {{ $t('common.details') }}
          </AppButton>
        </div>

        <div class="flex-1 flex p-2 truncate min-w-0 items-center justify-end">
          <p class="capitalize">
            <span v-if="strategy.stopReason">{{ strategy.stopReason }}</span>
            <span v-else>&mdash;</span>
          </p>
        </div>
      </div>
    </template>
  </CommonHeadlessSpotGridStrategy>
</template>
