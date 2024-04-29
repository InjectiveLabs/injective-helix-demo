<script setup lang="ts">
import { Change, UiMarketWithToken } from '@/types'

defineProps({
  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})
</script>

<template>
  <CommonHeadlessMarketSummary v-bind="{ market, isCurrentMarket: true }">
    <template
      #default="{
        highToFormat,
        lowToFormat,
        lastTradedPriceToFormat,
        change,
        changeToFormat,
        percentageChangeStatus,
        volumeToFormat
      }"
    >
      <div class="flex">
        <div class="flex flex-col items-end justify-start px-4 py-2 font-mono">
          <div
            class="flex items-center"
            :class="{
              'text-green-500': percentageChangeStatus === Change.Increase,
              'text-red-500 ': percentageChangeStatus === Change.Decrease
            }"
          >
            <BaseIcon
              v-if="
                [Change.Increase, Change.Decrease].includes(
                  percentageChangeStatus
                )
              "
              name="arrow"
              class="w-3 h-3 mr-1"
              :class="{
                ' rotate-90': percentageChangeStatus === Change.Increase,
                ' -rotate-90': percentageChangeStatus === Change.Decrease
              }"
            />

            <div class="leading-none">
              {{ lastTradedPriceToFormat }}
            </div>
          </div>

          <div>
            <div v-if="!change.isNaN()" class="mt-1 text-xs">
              <span
                class="leading-none"
                :class="{
                  'text-green-500': percentageChangeStatus === Change.Increase,
                  'text-white': percentageChangeStatus === Change.NoChange,
                  'text-red-500': percentageChangeStatus === Change.Decrease
                }"
              >
                {{ changeToFormat }}%
              </span>
            </div>
          </div>
        </div>

        <div class="p-2 text-xs">
          <p class="text-gray-400">24h Total Volume</p>
          <p class="font-mono font-semibold">{{ volumeToFormat }}</p>
        </div>

        <div class="p-2 text-xs">
          <p class="text-gray-400">24h High</p>
          <p class="font-mono font-semibold">{{ highToFormat }}</p>
        </div>

        <div class="p-2 text-xs">
          <p class="text-gray-400">24h Low</p>
          <p class="font-mono font-semibold">{{ lowToFormat }}</p>
        </div>
      </div>
    </template>
  </CommonHeadlessMarketSummary>
</template>
