<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { CAMPAIGN_LP_ROUNDS } from '@/app/data/campaign'
import { CampaignRound, LiquidityRewardsPage } from '@/types'

const router = useRouter()
const walletStore = useWalletStore()
const campaignStore = useCampaignStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

onMounted(() => {
  status.setLoading()

  Promise.all([campaignStore.fetchCampaignRewardsForUser()])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
})

const roundsWithCampaignRewards = computed(() =>
  [
    ...CAMPAIGN_LP_ROUNDS.reduce<CampaignRound[]>((rounds, nextRound) => {
      const roundFiltered = {
        ...nextRound,
        campaigns: nextRound.campaigns.filter((c) =>
          campaignStore.ownerRewards.some((r) => {
            return r && r.campaignId === c.campaignId
          })
        )
      }

      return [...rounds, roundFiltered]
    }, []).filter((r) => r.campaigns.length > 0)
  ].reverse()
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
    <AppHocLoading v-bind="{ status }">
      <PartialsLiquidityDashboardHeader />

      <h3 class="text-lg font-semibold my-6">
        {{
          $t('campaign.myRewardsCount', {
            rewards: campaignStore.ownerRewards.length
          })
        }}
      </h3>

      <div class="space-y-4">
        <PartialsLiquidityDashboardRound
          v-for="round in roundsWithCampaignRewards"
          v-bind="{ round }"
          :key="round.round"
        />
      </div>
    </AppHocLoading>
  </div>
</template>
