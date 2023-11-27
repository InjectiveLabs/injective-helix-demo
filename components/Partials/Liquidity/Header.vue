<script setup lang="ts">
import { ZERO_IN_BASE, ZERO_IN_WEI } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { format, utcToZonedTime } from 'date-fns-tz'
import { CAMPAIGN_LP_ROUNDS } from '@/app/data/guild'
import {
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  USDT_TOKEN_DECIMALS
} from '@/app/utils/constants'
import { LiquidityRewardsPage } from '@/types'

const props = defineProps({
  round: {
    type: Number,
    required: true
  }
})

const tokenStore = useTokenStore()
const campaignStore = useCampaignStore()

const round = computed(() =>
  CAMPAIGN_LP_ROUNDS.find(({ round }) => round === props.round)
)

const totalRewardsThisRound = computed(() => {
  if (!round.value) {
    return ZERO_IN_BASE
  }

  return round.value.campaigns.reduce((sum, campaign) => {
    const rewardsPerCampaign = campaign.rewards.reduce((sum, reward) => {
      const token = tokenStore.tokens.find((t) => t.symbol === reward.symbol)!

      const rewardInUsd = new BigNumberInBase(reward.amount).times(
        tokenStore.tokenUsdPriceMap[token.coinGeckoId]
      )

      return sum.plus(rewardInUsd)
    }, ZERO_IN_BASE)

    return sum.plus(rewardsPerCampaign)
  }, ZERO_IN_BASE)
})

const campaignsForRound = computed(() => {
  return campaignStore.campaigns.filter(
    (campaign) =>
      round.value?.campaigns.find(
        (campaignWithSc) => campaignWithSc.campaignId === campaign.campaignId
      )
  )
})

const totalVolume = computed(() =>
  campaignsForRound.value
    .reduce((totalScore, campaign) => {
      return totalScore.plus(campaign.totalScore)
    }, ZERO_IN_WEI)
    .toBase(USDT_TOKEN_DECIMALS)
    .toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
)

const endDate = computed(() => {
  const utcDate = utcToZonedTime(Number(round.value!.endDate) * 1000, 'UTC')

  return format(utcDate, 'MMM dd - hh a', { timeZone: 'UTC' })
})

const { valueToString: totalRewardsThisRoundToString } = useBigNumberFormatter(
  totalRewardsThisRound,
  { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
)
</script>

<template>
  <div class="grid grid-cols-[1fr_auto] gap-4">
    <div class="space-y-4">
      <div class="flex items-center space-x-4">
        <h1 class="text-3xl font-bold">{{ $t('campaign.title') }}</h1>
        <div class="flex items-center space-x-2">
          <div class="w-2 h-2 rounded-full bg-green-500" />
          <p>{{ $t('campaign.round', { round: props.round }) }}</p>
        </div>
      </div>
      <div>
        <p>{{ $t('campaign.description') }}</p>
      </div>
      <div class="space-x-2 flex">
        <NuxtLink
          :to="{ name: LiquidityRewardsPage.Dashboard }"
          class="block leading-5 py-2 px-5 font-semibold whitespace-nowrap text-white bg-blue-500 border-blue-500 hover:bg-blue-600 border rounded-lg"
        >
          {{ $t('campaign.dashboard') }}
        </NuxtLink>

        <NuxtLink
          to="https://helixapp.zendesk.com/hc/en-us/articles/8258846181647-Share-30-000-TIA-in-TIA-Spot-Trading-Challenge-"
          target="_blank"
          class="block leading-5 py-2 px-5 font-semibold whitespace-nowrap text-white border-white hover:text-gray-300 border rounded-lg"
        >
          {{ $t('campaign.campaignRules') }}
        </NuxtLink>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <h3 class="text-sm font-semibold text-gray-400">
            {{ $t('campaign.totalRewardsThisRound') }}
          </h3>
          <p class="text-xl font-semibold">
            {{ totalRewardsThisRoundToString }} USD
          </p>
        </div>
        <div>
          <h3 class="text-sm font-semibold text-gray-400">
            {{ $t('campaign.totalVolume') }}
          </h3>
          <p class="text-xl font-semibold">{{ totalVolume }} USD</p>
        </div>
        <div>
          <h3 class="text-sm font-semibold text-gray-400">
            {{ $t('campaign.endTimeForRound', { round: props.round }) }}
          </h3>
          <p class="text-xl font-semibold">{{ endDate }}</p>
        </div>
      </div>
    </div>

    <div class="hidden md:block">
      <img src="/svg/leaderboard_graphic.svg" />
    </div>
  </div>
</template>
