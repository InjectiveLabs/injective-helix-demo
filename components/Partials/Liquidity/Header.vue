<script setup lang="ts">
import { format, utcToZonedTime } from 'date-fns-tz'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { UI_DEFAULT_MAX_DECIMALS } from '@/app/utils/constants'
import { LiquidityRewardsPage } from '@/types'
import type { Campaign } from '@injectivelabs/sdk-ts'

const props = withDefaults(
  defineProps<{
    round: number
    endDate: number
    lastUpdated: number
    roundCampaigns: Campaign[]
  }>(),
  {}
)

const spotStore = useSpotStore()
const sharedTokenStore = useSharedTokenStore()
const sharedWalletStore = useSharedWalletStore()

const totalRewardsThisRound = computed(() =>
  props.roundCampaigns.reduce((sum, campaign) => {
    const rewardsPerCampaign = campaign.rewards.reduce((sum, reward) => {
      const token = sharedTokenStore.tokenByDenomOrSymbol(reward.denom)!

      const rewardInBase = sharedToBalanceInTokenInBase({
        value: reward.amount,
        decimalPlaces: token.decimals
      })

      const rewardInUsd = rewardInBase.times(
        sharedTokenStore.tokenUsdPrice(token)
      )

      return sum.plus(rewardInUsd)
    }, ZERO_IN_BASE)

    return sum.plus(rewardsPerCampaign)
  }, ZERO_IN_BASE)
)

const totalVolume = computed(() =>
  props.roundCampaigns.reduce((totalScore, campaign) => {
    const market = spotStore.marketByIdOrSlug(campaign.marketId)

    if (!market) {
      return totalScore
    }

    const campaignVolumeInBase = sharedToBalanceInTokenInBase({
      value: campaign.totalScore,
      decimalPlaces: market.quoteToken?.decimals || UI_DEFAULT_MAX_DECIMALS
    })

    const campaignVolumeInUsd = campaignVolumeInBase.times(
      sharedTokenStore.tokenUsdPrice(market.quoteToken)
    )

    return totalScore.plus(campaignVolumeInUsd)
  }, ZERO_IN_BASE)
)

const endDate = computed(() => {
  const utcDate = utcToZonedTime(Number(props.endDate || 0), 'UTC')

  return format(utcDate, 'MMM dd - HH:mm', { timeZone: 'UTC' })
})
</script>

<template>
  <div class="grid grid-cols-[1fr_auto] gap-4">
    <div class="space-y-4">
      <div class="flex items-center space-x-4">
        <h1 class="text-3xl font-bold">{{ $t('lpRewards.title') }}</h1>
        <div class="flex items-center space-x-2">
          <div class="w-2 h-2 rounded-full bg-green-500" />
          <p>{{ $t('lpRewards.round', { round: props.round }) }}</p>
        </div>
      </div>

      <div>
        <p class="text-coolGray-300">{{ $t('lpRewards.description') }}</p>
      </div>

      <div class="space-x-2 flex pb-6">
        <NuxtLink
          v-if="sharedWalletStore.isUserConnected"
          :to="{ name: LiquidityRewardsPage.Dashboard }"
        >
          <AppButton> {{ $t('lpRewards.myRewards') }}</AppButton>
        </NuxtLink>

        <NuxtLink
          to="https://helixapp.zendesk.com/hc/en-us/articles/8258846181647-Share-30-000-TIA-in-TIA-Spot-Trading-Challenge-"
          target="_blank"
        >
          <AppButton>{{ $t('lpRewards.campaignRules') }}</AppButton>
        </NuxtLink>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <h3 class="text-sm font-semibold text-coolGray-400">
            {{ $t('lpRewards.totalRewardsThisRound') }}
          </h3>
          <p class="text-xl font-semibold">
            <SharedAmountUsd
              v-bind="{
                shouldAbbreviate: false,
                amount: totalRewardsThisRound.toFixed()
              }"
            />
            <span class="ml-1">USD</span>
          </p>
        </div>
        <div>
          <h3 class="text-sm font-semibold text-coolGray-400">
            {{ $t('lpRewards.totalVolume') }}
          </h3>
          <p class="text-xl font-semibold">
            <SharedAmountUsd
              v-bind="{
                hideDecimals: true,
                shouldAbbreviate: false,
                amount: totalVolume.toFixed(),
                roundingMode: BigNumberInBase.ROUND_UP
              }"
            />
            <span class="ml-1">USD</span>
          </p>
        </div>
        <div>
          <h3 class="text-sm font-semibold text-coolGray-400">
            {{ $t('lpRewards.endTimeForRound', { round: props.round }) }}
          </h3>
          <p class="text-xl font-semibold">{{ endDate }} UTC</p>
        </div>
      </div>
    </div>
  </div>
</template>
