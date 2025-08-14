<script setup lang="ts">
import { format, utcToZonedTime } from 'date-fns-tz'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { sharedToBalanceInTokenInBase } from '@shared/utils/formatter'
import { UI_DEFAULT_MAX_DECIMALS } from '@/app/utils/constants'

const spotStore = useSpotStore()
const campaignStore = useCampaignStore()
const sharedTokenStore = useSharedTokenStore()

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

const rewardsThisRound = computed(() =>
  campaignStore.campaignsWithUserRewards
    .filter(({ roundId }) => roundId === currentRoundId.value)
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

const totalRewardsInUsd = computed(() =>
  Object.entries(totalRewards.value)
    .reduce((sum, [denom, amount]) => {
      const token = sharedTokenStore.tokenByDenomOrSymbol(denom)

      const amountInUsd = sharedToBalanceInTokenInBase({
        value: amount.toFixed(),
        decimalPlaces: token?.decimals || UI_DEFAULT_MAX_DECIMALS
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

const volumeAllTime = computed(() =>
  campaignStore.campaignsWithUserRewards.reduce((sum, campaign) => {
    const market = spotStore.marketByIdOrSlug(campaign.marketId)

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
  <div class="lg:flex gap-4 justify-between mt-4">
    <div class="flex flex-col gap-1">
      <span class="text-coolGray-475 font-semibold text-sm">
        {{ $t('tradingBots.myLpRewards.rewardsAllTime') }}
      </span>
      <span class="text-xl font-semibold">
        <SharedAmountUsd
          v-bind="{
            amount: totalRewardsInUsd
          }"
        />
        USD
      </span>
    </div>

    <div class="flex flex-col gap-1">
      <span class="text-coolGray-475 font-semibold text-sm">
        {{ $t('tradingBots.myLpRewards.volumeAllTime') }}
      </span>
      <span class="text-xl font-semibold">
        <SharedAmountUsd
          v-bind="{
            hideDecimals: true,
            amount: volumeAllTime,
            roundingMode: BigNumberInBase.ROUND_UP
          }"
        />
        USD
      </span>
    </div>

    <div class="flex flex-col gap-1">
      <span class="text-coolGray-475 font-semibold text-sm">
        {{ $t('tradingBots.myLpRewards.volumeThisRound') }}
      </span>
      <span class="text-xl font-semibold">
        <SharedAmountUsd
          v-bind="{
            hideDecimals: true,
            amount: volumeThisRound,
            roundingMode: BigNumberInBase.ROUND_UP
          }"
        />
        USD
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
    <span class="text-white">
      <SharedAmountUsd
        v-bind="{
          amount: rewardsThisRoundInUsd
        }"
      />
      USD
    </span>
  </div>
</template>
