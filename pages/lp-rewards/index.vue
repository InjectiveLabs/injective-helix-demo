<script setup lang="ts">
import { CAMPAIGN_LP_ROUNDS } from '@/app/data/guild'
import { DEFAULT_LP_ROUND } from '@/app/utils/constants'

const round = useQueryRef('round', DEFAULT_LP_ROUND)

const filteredCampaigns = computed(
  () =>
    CAMPAIGN_LP_ROUNDS.find((c) => c.round === Number(round.value))!.campaigns
)
</script>

<template>
  <div class="mx-auto max-w-7xl w-full px-4 space-y-8 py-10">
    <PartialsLiquidityHeader v-bind="{ round: Number(round) }" />
    <PartialsLiquidityTabs class="mt-10 mb-4" />

    <div class="overflow-y-auto">
      <table class="w-full min-w-2xl">
        <PartialsLiquidityTableHeader />

        <tbody v-if="filteredCampaigns" class="divide-y">
          <PartialsLiquidityTableRow
            v-for="campaign in filteredCampaigns"
            :key="campaign.campaignId"
            v-bind="{ campaignWithSc: campaign }"
          />
        </tbody>
      </table>
    </div>
  </div>
</template>
