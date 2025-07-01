<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { LiquidityRewardsPage } from '@/types'

const campaignStore = useCampaignStore()

const status = reactive(new Status(StatusType.Idle))
const { $onError } = useNuxtApp()

const activeRound = computed(() =>
  Math.max(...campaignStore.round.map(({ roundId }) => roundId))
)

const currentRoundCampaigns = computed(() =>
  campaignStore.campaignsWithUserRewards.filter(
    ({ roundId }) => roundId === activeRound.value
  )
)

onWalletConnected(() => {
  status.setLoading()

  Promise.all([campaignStore.fetchRound()])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
})
</script>

<template>
  <UCard :ui="{ background: 'dark:bg-brand-875' }">
    <div class="flex items-center justify-between">
      <h3 class="text-xl font-bold">
        {{ $t('tradingBots.myLpRewards.title') }}
      </h3>

      <NuxtLink
        class="text-blue-500 text-xs hover:text-blue-600 font-semibold"
        :to="{ name: LiquidityRewardsPage.Dashboard }"
      >
        {{ $t('tradingBots.myLpRewards.viewAll') }}
      </NuxtLink>
    </div>

    <template v-if="status.isLoading()">
      <USkeleton class="h-20 w-full" />
      <USkeleton class="h-52 w-full mt-4" />
    </template>

    <PartialsTradingBotsHomepageMyLpRewardsStats />
    <PartialsLiquidityDashboardRound
      class="mt-4"
      v-bind="{
        round: Number(activeRound),
        campaigns: currentRoundCampaigns,
        activeRound
      }"
    />
  </UCard>
</template>
