<script setup lang="ts">
import { Modal } from '@/types'

const appStore = useAppStore()
const modalStore = useModalStore()
const campaignStore = useCampaignStore()

const roundDetails = computed(() => {
  if (campaignStore.latestRoundCampaigns.length === 0) {
    return undefined
  }

  const [latestRound] = campaignStore.latestRoundCampaigns

  return {
    roundId: latestRound.roundId,
    endDate: Number(latestRound.endDate),
    lastUpdated: Number(latestRound.lastUpdated)
  }
})

onMounted(() => {
  if (!appStore.userState.modalsViewed.includes(Modal.LpRewards)) {
    modalStore.openModal(Modal.LpRewards)

    appStore.setUserState({
      ...appStore.userState,
      modalsViewed: [...appStore.userState.modalsViewed, Modal.LpRewards]
    })
  }
})
</script>

<template>
  <div class="mx-auto max-w-7xl w-full px-4 space-y-8 py-10">
    <PartialsLiquidityHeader
      v-if="roundDetails"
      v-bind="{
        round: roundDetails.roundId,
        roundCampaigns: campaignStore.latestRoundCampaigns,
        endDate: roundDetails.endDate,
        lastUpdated: roundDetails.lastUpdated
      }"
    />
    <PartialsLiquidityTabs class="mt-10 mb-4" />

    <div class="overflow-y-auto">
      <table class="w-full min-w-2xl">
        <PartialsLiquidityTableHeader />

        <tbody v-if="campaignStore.latestRoundCampaigns" class="divide-y">
          <PartialsLiquidityTableRow
            v-for="campaign in campaignStore.latestRoundCampaigns"
            :key="campaign.campaignId"
            v-bind="{ campaign }"
          />
        </tbody>
      </table>
    </div>

    <ModalsLpRewards
      v-if="roundDetails"
      v-bind="{ round: Number(roundDetails.roundId) }"
    />
  </div>
</template>
