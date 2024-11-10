<script setup lang="ts">
import { TradingStrategy } from '@injectivelabs/sdk-ts'
import { BusEvents } from '@/types'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '~/app/utils/constants'

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
        removeStatus,
        percentagePnl,
        removeStrategy,
        investment,
        lowerBound,
        upperBound
      }"
    >
      <div class="flex p-2 text-xs">
        <div class="flex-1 flex items-center p-2 truncate min-w-0">
          {{ createdAt }}
        </div>

        <PartialsCommonMarketRedirection
          v-bind="{ market, isTradingBotTab: true }"
          class="flex-1 flex items-center p-2 truncate min-w-0 space-x-2"
        >
          <CommonTokenIcon v-bind="{ token: market.baseToken }" />
          <p class="font-semibold">{{ market.ticker }}</p>
        </PartialsCommonMarketRedirection>

        <div class="flex-1 flex items-center p-2 truncate min-w-0 justify-end">
          <p class="space-x-1 flex font-mono">
            <AppAmount v-bind="{ amount: lowerBound.toFixed() }" />
            <span>{{ market.quoteToken.symbol }}</span>
          </p>
        </div>

        <div class="flex-1 flex items-center p-2 truncate min-w-0 justify-end">
          <p class="space-x-1 flex font-mono">
            <span>
              <AppAmount v-bind="{ amount: upperBound.toFixed() }" />
            </span>
            <span>{{ market.quoteToken.symbol }}</span>
          </p>
        </div>

        <div class="flex-1 flex items-center p-2 truncate min-w-0 justify-end">
          <p class="space-x-1 flex font-mono">
            <span>
              <AppAmount
                v-bind="{
                  amount: investment.toFixed(),
                  decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
                }"
              />
            </span>
            <span>USD</span>
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
                  amount: pnl.toFixed(),
                  decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
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

        <div class="flex-1 flex items-center p-2 truncate min-w-0 justify-end">
          <AppButton size="sm" @click="onOpenTradingBotDetails">
            {{ $t('common.details') }}
          </AppButton>
        </div>

        <div class="flex-1 flex items-center p-2 truncate min-w-0 justify-end">
          <PartialsCommonCancelButton
            v-bind="{ status: removeStatus }"
            @click="removeStrategy"
          />
        </div>
      </div>
    </template>
  </CommonHeadlessSpotGridStrategy>
</template>
