<script setup lang="ts">
import { CampaignRound } from '@/types'

const props = defineProps({
  round: {
    type: Object as PropType<CampaignRound>,
    required: true
  }
})

const isActive = computed(
  () =>
    Number(props.round.startDate) * 1000 < Date.now() &&
    Number(props.round.endDate) * 1000 > Date.now()
)
</script>

<template>
  <div>
    <div class="border-b p-2 flex items-center space-x-4">
      <p>
        {{ $t('campaign.round', { round: round.round }) }}
      </p>
      <div v-if="isActive" class="flex items-center space-x-2">
        <div class="w-2 h-2 bg-green-500 rounded-full" />
        <div>{{ $t('campaign.ongoing') }}</div>
      </div>
    </div>

    <div class="overflow-y-auto">
      <table class="w-full min-w-3xl">
        <PartialsLiquidityDashboardRoundTableHeader v-bind="{ isActive }" />

        <tbody>
          <PartialsLiquidityDashboardRoundTableRow
            v-for="campaignWithSc in round.campaigns"
            :key="campaignWithSc.campaignId"
            v-bind="{ campaignWithSc }"
          />
        </tbody>
      </table>
    </div>
  </div>
</template>
