<script setup lang="ts">
import { Campaign } from '@injectivelabs/sdk-ts'
import { LiquidityRewardsPage } from '@/types'

const router = useRouter()
const walletStore = useWalletStore()
const campaignStore = useCampaignStore()

const campaignsByRound = computed(() => {
  const campaignsMap = campaignStore.campaignsWithUserRewards.reduce(
    (campaigns, campaign) => {
      const round = campaign.roundId

      if (!campaigns[round]) {
        campaigns[round] = []
      }
      campaigns[round].push(campaign)
      return campaigns
    },
    {} as Record<number, Campaign[]>
  )

  return [...Object.entries(campaignsMap)].reverse()
})

const activeRound = computed(() =>
  Math.max(...campaignStore.round.map(({ roundId }) => roundId))
)

watch(
  () => walletStore.isUserWalletConnected,
  (isConnected) => {
    if (!isConnected) {
      router.replace({ name: LiquidityRewardsPage.Home })
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="max-w-7xl mx-auto w-full py-6 px-2">
    <PartialsLiquidityDashboardHeader />

    <h3 class="text-lg font-semibold my-6">
      {{
        $t('campaign.myRewardsCount', {
          rewards: campaignStore.campaignsWithUserRewards.length
        })
      }}
    </h3>

    <div class="space-y-4">
      <PartialsLiquidityDashboardRound
        v-for="[round, campaigns] in campaignsByRound"
        v-bind="{ round: Number(round), campaigns, activeRound }"
        :key="round"
      />
    </div>
  </div>
</template>
