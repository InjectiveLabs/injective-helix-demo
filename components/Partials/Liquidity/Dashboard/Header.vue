<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { sharedToBalanceInTokenInBase } from '@shared/utils/formatter'
import { LiquidityRewardsPage } from '@/types'

const spotStore = useSpotStore()
const campaignStore = useCampaignStore()
const sharedTokenStore = useSharedTokenStore()

const currentRound = computed(() =>
  Math.max(...campaignStore.round.map(({ roundId }) => roundId))
)

const totalRewards = computed(() =>
  campaignStore.campaignsWithUserRewards.reduce(
    (rewards, campaign) => {
      campaign.rewards.forEach((reward) => {
        const userRewardPercentage =
          Number(campaign.userScore) / Number(campaign.totalScore)

        const userRewardAmount = new BigNumberInBase(reward.amount).times(
          userRewardPercentage
        )

        console.log(userRewardAmount.toFixed())

        if (rewards[reward.denom]) {
          rewards[reward.denom] = rewards[reward.denom].plus(userRewardAmount)
        } else {
          rewards[reward.denom] = userRewardAmount
        }
      })

      return rewards
    },
    {} as Record<string, BigNumberInBase>
  )
)

const rewardsThisRound = computed(() =>
  campaignStore.campaignsWithUserRewards
    .filter(({ roundId }) => roundId === currentRound.value)
    .reduce(
      (rewards, campaign) => {
        campaign.rewards.forEach((reward) => {
          const userRewardPercentage =
            Number(campaign.userScore) / Number(campaign.totalScore)

          const userRewardAmount = new BigNumberInBase(reward.amount).times(
            userRewardPercentage
          )

          if (rewards[reward.denom]) {
            rewards[reward.denom] = rewards[reward.denom].plus(userRewardAmount)
          } else {
            rewards[reward.denom] = userRewardAmount
          }
        })

        return rewards
      },
      {} as Record<string, BigNumberInBase>
    )
)

const rewardsThisRoundInUsd = computed(() =>
  Object.entries(rewardsThisRound.value).reduce((sum, [denom, amount]) => {
    const token = sharedTokenStore.tokenByDenomOrSymbol(denom)

    const amountInUsd = sharedToBalanceInTokenInBase({
      value: amount.toFixed(),
      decimalPlaces: token?.decimals
    }).times(sharedTokenStore.tokenUsdPrice(token))

    return sum.plus(amountInUsd)
  }, ZERO_IN_BASE)
)

const rewardsToClaim = computed(
  () =>
    campaignStore.campaignsWithUserRewards.filter(
      ({ userClaimed, isClaimable }) => !userClaimed && isClaimable
    ).length
)

const totalRewardsInUsd = computed(() =>
  Object.entries(totalRewards.value)
    .reduce((sum, [denom, amount]) => {
      const token = sharedTokenStore.tokenByDenomOrSymbol(denom)

      const amountInUsd = sharedToBalanceInTokenInBase({
        value: amount.toFixed(),
        decimalPlaces: token?.decimals
      }).times(sharedTokenStore.tokenUsdPrice(token))

      return sum.plus(amountInUsd)
    }, ZERO_IN_BASE)
    .minus(rewardsThisRoundInUsd.value)
)

const volumeThisRound = computed(() =>
  campaignStore.latestRoundCampaigns.reduce((sum, campaign) => {
    const market = spotStore.marketByIdOrSlug(campaign.marketId)

    if (!market) {
      return sum
    }

    const userVolume = sharedToBalanceInTokenInBase({
      value: campaign.userScore || 0,
      decimalPlaces: market.quoteToken.decimals
    })

    const userVolumeInUsd = userVolume.times(
      sharedTokenStore.tokenUsdPrice(market.quoteToken)
    )

    return sum.plus(userVolumeInUsd)
  }, ZERO_IN_BASE)
)
</script>

<template>
  <div>
    <div>
      <NuxtLink
        :to="{ name: LiquidityRewardsPage.Home }"
        class="flex items-center space-x-2"
      >
        <UIcon :name="NuxtUiIcons.ArrowLeft" class="w-6 h-6 min-w-6" />
        <p>{{ $t('lpRewards.title') }}</p>
      </NuxtLink>
    </div>

    <h3 class="text-3xl font-semibold my-4">
      {{ $t('lpRewards.dashboardTitle') }}
    </h3>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <div class="border rounded-md p-4">
        <p class="text-xs uppercase text-coolGray-500 mb-2">
          {{ $t('lpRewards.totalRewardsOfRound', { round: currentRound }) }}
        </p>
        <h3 class="text-xl font-semibold">
          <SharedAmountUsd
            v-bind="{
              shouldAbbreviate: false,
              amount: rewardsThisRoundInUsd.toFixed()
            }"
          />
          <span class="ml-1">USD</span>
        </h3>
      </div>
      <div class="border rounded-md p-4">
        <p class="text-xs uppercase text-coolGray-500 mb-2">
          {{ $t('lpRewards.rewardsToClaim') }}
        </p>
        <h3 class="text-xl font-semibold">{{ rewardsToClaim }}</h3>
      </div>
      <div class="border rounded-md p-4">
        <p class="text-xs uppercase text-coolGray-500 mb-2">
          {{ $t('lpRewards.volumeThisRound') }}
        </p>
        <h3 class="text-xl font-semibold">
          <SharedAmountUsd
            v-bind="{
              hideDecimals: true,
              shouldAbbreviate: false,
              amount: volumeThisRound.toFixed(),
              roundingMode: BigNumberInBase.ROUND_UP
            }"
          />
          <span class="ml-1">USD</span>
        </h3>
      </div>
      <div class="border rounded-md p-4">
        <p class="text-xs uppercase text-coolGray-500 mb-2">
          {{ $t('lpRewards.totalRewardsAllTime') }}
        </p>
        <h3 class="text-xl font-semibold">
          <SharedAmountUsd
            v-bind="{
              shouldAbbreviate: false,
              amount: totalRewardsInUsd.toFixed()
            }"
          />
          <span class="ml-1">USD</span>
        </h3>
      </div>
    </div>
  </div>
</template>
