<script setup lang="ts">
const campaignStore = useCampaignStore()

const DEFAULT_ROUND = Math.max(
  ...campaignStore.campaignsWithSc.map(({ round }) => round)
)

const round = useQueryRef('round', DEFAULT_ROUND.toString())

const filteredCampaigns = computed(() =>
  campaignStore.campaignsWithSc.filter((c) => c.round === Number(round.value))
)
</script>

<template>
  <div class="mx-auto max-w-7xl w-full px-4 space-y-8 py-10">
    <PartialsLiquidityHeader
      v-bind="{
        round: Number(round),
        campaignsWithScAndData: filteredCampaigns
      }"
    />
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
