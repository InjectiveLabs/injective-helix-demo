<script setup lang="ts">
import { BigNumberInWei } from '@injectivelabs/utils'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { sharedToBalanceInTokenInBase } from '@shared/utils/formatter'
import { NuxtUiIcons } from '@shared/types'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { LiquidityRewardsPage } from '@/types'

const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const campaignStore = useCampaignStore()

const currentRound = computed(() =>
  Math.max(...campaignStore.round.map(({ roundId }) => roundId))
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
    .filter(({ roundId }) => roundId === currentRound.value)
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

const rewardsToClaim = computed(
  () =>
    campaignStore.campaignsWithUserRewards.filter(
      ({ userClaimed, isClaimable }) => !userClaimed && isClaimable
    ).length
)

const { valueToString: totalRewardsInUsdToString } =
  useSharedBigNumberFormatter(
    computed(() =>
      Object.entries(totalRewards.value)
        .reduce((sum, [denom, amount]) => {
          const token = tokenStore.tokenByDenomOrSymbol(denom)

          const amountInUsd = amount
            .toBase(token?.decimals || 18)
            .times(tokenStore.tokenUsdPrice(token))

          return sum.plus(amountInUsd)
        }, ZERO_IN_BASE)
        .minus(rewardsThisRoundInUsd.value)
    ),
    { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
  )

const { valueToString: rewardsThisRoundInUsdToString } =
  useSharedBigNumberFormatter(rewardsThisRoundInUsd, {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  })

const { valueToString: volumeThisRoundToString } = useSharedBigNumberFormatter(
  computed(() =>
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
  ),
  { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
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
        <p>{{ $t('campaign.title') }}</p>
      </NuxtLink>
    </div>

    <h3 class="text-3xl font-semibold my-4">
      {{ $t('campaign.dashboardTitle') }}
    </h3>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <div class="border rounded-md p-4">
        <p class="text-xs uppercase text-coolGray-500 mb-2">
          {{ $t('campaign.totalRewardsOfRound', { round: currentRound }) }}
        </p>
        <h3 class="text-xl font-semibold">
          {{ rewardsThisRoundInUsdToString }} USD
        </h3>
      </div>
      <div class="border rounded-md p-4">
        <p class="text-xs uppercase text-coolGray-500 mb-2">
          {{ $t('campaign.rewardsToClaim') }}
        </p>
        <h3 class="text-xl font-semibold">{{ rewardsToClaim }}</h3>
      </div>
      <div class="border rounded-md p-4">
        <p class="text-xs uppercase text-coolGray-500 mb-2">
          {{ $t('campaign.volumeThisRound') }}
        </p>
        <h3 class="text-xl font-semibold">{{ volumeThisRoundToString }} USD</h3>
      </div>
      <div class="border rounded-md p-4">
        <p class="text-xs uppercase text-coolGray-500 mb-2">
          {{ $t('campaign.totalRewardsAllTime') }}
        </p>
        <h3 class="text-xl font-semibold">
          {{ totalRewardsInUsdToString }} USD
        </h3>
      </div>
    </div>
  </div>
</template>
