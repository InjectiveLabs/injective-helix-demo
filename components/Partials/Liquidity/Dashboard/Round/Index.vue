<script setup lang="ts">
import { Campaign } from '@injectivelabs/sdk-ts'

const props = withDefaults(
  defineProps<{
    round: Number
    campaigns: Campaign[]
    activeRound: Number
  }>(),
  {}
)

const isActive = computed(() => props.activeRound === props.round)
</script>

<template>
  <div>
    <div class="border-b p-2 flex items-center space-x-4">
      <p>
        {{ $t('campaign.round', { round }) }}
      </p>
      <div v-if="isActive" class="flex items-center space-x-2">
        <div class="w-2 h-2 bg-green-500 rounded-full" />
        <div>{{ $t('campaign.ongoing') }}</div>
      </div>
    </div>

    <div class="overflow-y-auto divide-y">
      <PartialsLiquidityDashboardRoundTable
        :is-active="isActive"
        :campaigns="campaigns"
      />
    </div>
  </div>
</template>
