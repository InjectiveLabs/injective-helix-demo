<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'

const props = withDefaults(
  defineProps<{
    percentage: number
    hasEnoughFundsToRebalance?: boolean
  }>(),
  {
    hasEnoughFundsToRebalance: false
  }
)

const emit = defineEmits<{
  'optimize-balance': []
}>()

const offByPercentage = computed(() => (100 - props.percentage).toFixed(2))

function getPercentageColor(percentage: number) {
  if (percentage <= 80) {
    return '#EAB308'
  }

  return '#00C16A'
}

function getBadgeColor(percentage: number) {
  if (percentage <= 80) {
    return 'blue'
  }

  return 'green'
}

function onOptimizeBalance() {
  emit('optimize-balance')
}
</script>

<template>
  <div class="py-4">
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <p class="text-sm font-semibold">
          {{ $t('sgt.optimization.balanceStability') }}
        </p>
        <AppTooltip :text="$t('sgt.optimization.balancedTooltip')" />
      </div>

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
      <div
        v-if="percentage <= 80"
        class="text-[#EAB308] flex items-start gap-2"
      >
        <UIcon :name="NuxtUiIcons.WarningOutline" class="mt-px size-4" />
        <div>
          <p class="text-xs">
            {{ $t('sgt.optimization.balanceNeedsAdjusting') }}
          </p>
          <p class="text-xs text-gray-400">
            {{
              $t('sgt.optimization.yourBalanceIsOffBy', {
                percentage: offByPercentage
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

    <div v-if="percentage <= 80 && hasEnoughFundsToRebalance" class="mt-3">
      <UButton size="xs" block variant="outline" @click="onOptimizeBalance">
        {{ $t('sgt.optimization.optimizeBalance') }}
      </UButton>
    </div>
  </div>
</template>
