<script setup lang="ts">
import { Modal } from '@/types'

const appStore = useAppStore()
const modalStore = useModalStore()
const campaignStore = useCampaignStore()

const ACTIVE_CAMPAIGN_ROUNDS = campaignStore.campaignsWithSc
  .filter(
    ({ startDate, endDate }) =>
      startDate * 1000 < Date.now() && endDate * 1000 > Date.now()
  )
  .map(({ round }) => round)

const DEFAULT_ROUND =
  ACTIVE_CAMPAIGN_ROUNDS.length > 0 ? Math.max(...ACTIVE_CAMPAIGN_ROUNDS) : 3

const round = useQueryRef('round', DEFAULT_ROUND.toString())

const filteredCampaigns = computed(() =>
  campaignStore.campaignsWithSc.filter((c) => c.round === Number(round.value))
)

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

    <ModalsLpRewards v-bind="{ round: Number(round) }" />
  </div>
</template>
