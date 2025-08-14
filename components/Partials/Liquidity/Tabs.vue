<script setup lang="ts">
import { format } from 'date-fns'

const campaignStore = useCampaignStore()

const lastUpdated = computed(() =>
  format(
    campaignStore.latestRoundCampaigns?.[0].lastUpdated || 0,
    'MMM dd yyyy'
  )
)
</script>

<template>
  <div class="border-b flex justify-between items-center">
    <div>
      <h2 class="text-sm p-2">{{ $t('lpRewards.allRewards') }}</h2>
    </div>

    <div>
      <p class="text-xs p-2">
        {{ $t('lpRewards.lastUpdated', { date: lastUpdated }) }}
      </p>
    </div>
  </div>
</template>
