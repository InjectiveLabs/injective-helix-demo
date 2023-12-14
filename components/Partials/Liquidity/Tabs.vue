<script setup lang="ts">
import { format } from 'date-fns'
import { CAMPAIGN_LP_ROUNDS } from '@/app/data/campaign'

const latestRound = Math.max(...CAMPAIGN_LP_ROUNDS.map((round) => round.round))

const latestRoundData = CAMPAIGN_LP_ROUNDS.find(
  (round) => round.round === latestRound
)!

const date = format(latestRoundData.startDate * 1000, 'MMM dd yyyy')
</script>

<template>
  <div class="border-b flex justify-between items-center">
    <div>
      <h2 class="text-sm p-2">{{ $t('campaign.allRewards') }}</h2>
    </div>

    <div>
      <p class="text-xs p-2">
        {{ $t('campaign.lastUpdatedAt', { date }) }}
      </p>
    </div>
  </div>
</template>
