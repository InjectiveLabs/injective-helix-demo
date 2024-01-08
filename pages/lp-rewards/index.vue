<script setup lang="ts">
import { Modal } from '@/types'

const appStore = useAppStore()
const modalStore = useModalStore()
const campaignStore = useCampaignStore()

const round = useQueryRef('round', '')

const roundId = computed(() => campaignStore.round[0].roundId)
// const endDate = computed(() => campaignStore.round[0].endDate)
// const StartDate = computed(() => campaignStore.round[0].startDate)

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
      v-if="roundId"
      v-bind="{
        round: roundId,
        roundCampaigns: campaignStore.round
      }"
    />
    <PartialsLiquidityTabs class="mt-10 mb-4" />

    <div class="overflow-y-auto">
      <table class="w-full min-w-2xl">
        <PartialsLiquidityTableHeader />

        <tbody v-if="campaignStore.round" class="divide-y">
          <PartialsLiquidityTableRow
            v-for="campaign in campaignStore.round"
            :key="campaign.campaignId"
            v-bind="{ campaign }"
          />
        </tbody>
      </table>
    </div>

    <ModalsLpRewards v-bind="{ round: Number(round) }" />
  </div>
</template>
