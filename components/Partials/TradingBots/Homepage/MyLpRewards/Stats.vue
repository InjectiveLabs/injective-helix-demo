<script setup lang="ts">
import { BigNumberInWei } from '@injectivelabs/utils'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { sharedToBalanceInTokenInBase } from '@shared/utils/formatter'

import { utcToZonedTime, format } from 'date-fns-tz'

const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const campaignStore = useCampaignStore()

const currentRoundId = computed(() =>
  Math.max(...campaignStore.round.map(({ roundId }) => roundId))
)

const currentRound = computed(() =>
  campaignStore.round.find(({ roundId }) => roundId === currentRoundId.value)
)

const totalRewards = computed(() =>
  campaignStore.campaignsWithUserRewards.reduce(
    (rewards, campaign) => {
      campaign.rewards.forEach((reward) => {
        const userRewardPercentage =
          Number(campaign.userScore) / Number(campaign.totalScore)

        const userRewardAmount = new BigNumberInWei(reward.amount).times(
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
    {} as Record<string, BigNumberInWei>
  )
)

const rewardsThisRound = computed(() =>
  campaignStore.campaignsWithUserRewards
    .filter(({ roundId }) => roundId === currentRoundId.value)
    .reduce(
      (rewards, campaign) => {
        campaign.rewards.forEach((reward) => {
          const userRewardPercentage =
            Number(campaign.userScore) / Number(campaign.totalScore)

          const userRewardAmount = new BigNumberInWei(reward.amount).times(
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
      {} as Record<string, BigNumberInWei>
    )
)

const rewardsThisRoundInUsd = computed(() =>
  Object.entries(rewardsThisRound.value).reduce((sum, [denom, amount]) => {
    const token = tokenStore.tokenByDenomOrSymbol(denom)

    const amountInUsd = amount
      .toBase(token?.decimals || 18)
      .times(tokenStore.tokenUsdPrice(token))

    return sum.plus(amountInUsd)
  }, ZERO_IN_BASE)
)

const totalRewardsInUsd = computed(() =>
  Object.entries(totalRewards.value)
    .reduce((sum, [denom, amount]) => {
      const token = tokenStore.tokenByDenomOrSymbol(denom)

      const amountInUsd = amount
        .toBase(token?.decimals || 18)
        .times(tokenStore.tokenUsdPrice(token))

      return sum.plus(amountInUsd)
    }, ZERO_IN_BASE)
    .minus(rewardsThisRoundInUsd.value)
)

const volumeThisRound = computed(() =>
  campaignStore.latestRoundCampaigns.reduce((sum, campaign) => {
    const market = spotStore.markets.find(
      (market) => market.marketId === campaign.marketId
    )

    if (!market) {
      return sum
    }

    const userVolume = sharedToBalanceInTokenInBase({
      value: campaign.userScore || 0,
      decimalPlaces: market.quoteToken.decimals
    })

    const userVolumeInUsd = userVolume.times(
      tokenStore.tokenUsdPrice(market.quoteToken)
    )

    return sum.plus(userVolumeInUsd)
  }, ZERO_IN_BASE)
)

const volumeAllTime = computed(() =>
  campaignStore.campaignsWithUserRewards.reduce((sum, campaign) => {
    const market = spotStore.markets.find(
      (market) => market.marketId === campaign.marketId
    )

    if (!market) {
      return sum
    }

    const userVolume = sharedToBalanceInTokenInBase({
      value: campaign.userScore || 0,
      decimalPlaces: market.quoteToken.decimals
    })

    return sum.plus(userVolume)
  }, ZERO_IN_BASE)
)

const endDate = computed(() => {
  const utcDate = utcToZonedTime(
    Number(currentRound.value?.endDate || 0),
    'UTC'
  )

  return format(utcDate, 'MMM dd - HH:mm', { timeZone: 'UTC' })
})
</script>

<template>
  <div class="grid grid-cols-1 gap-4 lg:grid-cols-4 mt-4">
    <div class="flex flex-col gap-1">
      <span class="text-coolGray-475 font-semibold text-sm">
        {{ $t('tradingBots.myLpRewards.rewardsAllTime') }}
      </span>
      <span class="text-xl font-semibold">
        ${{ totalRewardsInUsd.toFixed(2) }}
      </span>
    </div>

    <div class="flex flex-col gap-1">
      <span class="text-coolGray-475 font-semibold text-sm">
        {{ $t('tradingBots.myLpRewards.volumeAllTime') }}
      </span>
      <span class="text-xl font-semibold">
        {{ volumeAllTime.toFixed(2) }} USD
      </span>
    </div>

    <div class="flex flex-col gap-1">
      <span class="text-coolGray-475 font-semibold text-sm">
        {{ $t('tradingBots.myLpRewards.volumeThisRound') }}
      </span>
      <span class="text-xl font-semibold">
        {{ volumeThisRound.toFixed(2) }} USD
      </span>
    </div>

    <div class="flex flex-col gap-1">
      <span class="text-coolGray-475 font-semibold text-sm">
        {{ $t('tradingBots.myLpRewards.roundEndTime', { round: 19 }) }}
      </span>
      <span class="text-xl font-semibold">{{ endDate }} UTC</span>
    </div>
  </div>

  <div
    class="mt-4 md:-mb-12 flex items-center md:justify-end text-coolGray-475 font-semibold text-sm space-x-2"
  >
    <span>{{ $t('tradingBots.myLpRewards.totalEstRewards') }}</span>
    <span class="text-white"> {{ rewardsThisRoundInUsd.toFixed(2) }} USD </span>
  </div>
</template>
