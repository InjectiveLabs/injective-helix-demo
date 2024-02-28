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
  <CommonHeadlessMarketSummary v-bind="{ market }">
    <template
      #default="{
        lastTradedPriceToFormat,
        change,
        changeToFormat,
        percentageChangeStatus
      }"
    >
      <div class="flex flex-col items-end justify-center px-4 font-mono">
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
    </template>
  </CommonHeadlessMarketSummary>
</template>
