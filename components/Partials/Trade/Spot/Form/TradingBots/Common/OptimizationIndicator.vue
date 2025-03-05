<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'

withDefaults(
  defineProps<{
    percentage: number
  }>(),
  {
    percentage: 50
  }
)

function getPercentageColor(percentage: number) {
  if (percentage < 50) {
    return '#0082FA'
  }

  return '#00C16A'
}

function getBadgeColor(percentage: number) {
  if (percentage < 50) {
    return 'blue'
  }

  if (percentage >= 50 && percentage < 90) {
    return 'yellow'
  }

  return 'green'
}
</script>

<template>
  <div class="py-4">
    <div class="flex items-center justify-between gap-2">
      <p class="text-sm font-semibold">
        {{ $t('sgt.optimization.balanceStability') }}
      </p>

      <UBadge :color="getBadgeColor(percentage)" variant="soft">
        {{ percentage }}%
      </UBadge>
    </div>

    <div class="h-px bg-gray-800 rounded-full mt-3">
      <div
        :style="{
          width: `${percentage}%`,
          backgroundColor: getPercentageColor(percentage)
        }"
        class="h-px transition-all duration-300"
      ></div>
    </div>

    <div class="mt-3">
      <div v-if="percentage < 50" class="text-[#0082FA] flex items-start gap-2">
        <UIcon :name="NuxtUiIcons.WarningOutline" class="mt-px size-4" />
        <div>
          <p class="text-xs">
            {{ $t('sgt.optimization.balanceNeedsAdjusting') }}
          </p>
          <p class="text-xs text-gray-400">
            {{
              $t('sgt.optimization.yourBalanceIsOffBy', {
                percentage: 100 - percentage
              })
            }}
          </p>
        </div>
      </div>

      <div v-else class="text-[#00C16A] flex items-start gap-2">
        <UIcon :name="NuxtUiIcons.CheckmarkOutline" class="mt-px size-4" />
        <div>
          <p class="text-xs">
            {{ $t('sgt.optimization.balanceOptimized') }}
          </p>
          <p class="text-xs text-gray-400">
            {{ $t('sgt.optimization.yourBalanceIsOptimal') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
