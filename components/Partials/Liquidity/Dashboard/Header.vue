<script setup lang="ts">
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { CampaignWithSc, LiquidityRewardsPage } from '@/types'
import { CAMPAIGN_LP_ROUNDS } from '@/app/data/campaign'
import {
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  USDT_DECIMALS
} from '@/app/utils/constants'

const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const campaignStore = useCampaignStore()

const finishedCampaigns = CAMPAIGN_LP_ROUNDS.reduce((campaigns, round) => {
  if (
    round.startDate < Date.now() / 1000 &&
    round.endDate > Date.now() / 1000
  ) {
    return campaigns
  }

  return [...campaigns, ...round.campaigns]
}, [] as CampaignWithSc[])

const currentRound = computed(() =>
  Math.max(...CAMPAIGN_LP_ROUNDS.map(({ round }) => round))
)

const totalRewards = computed(() =>
  campaignStore.ownerRewards.map((reward) => {
    const userScore = reward.score
    const campaign = campaignStore.campaignsInfo.find(
      ({ campaignId }) => campaignId === reward.campaignId
    )
    const rewardInPercentage = new BigNumberInBase(userScore)
      .dividedBy(campaign?.totalScore || 1)
      .times(100)

    const campaignWithSc = CAMPAIGN_LP_ROUNDS.reduce<CampaignWithSc[]>(
      (campaigns, round) => [...campaigns, ...round.campaigns],
      []
    ).find(({ campaignId }) => campaignId === reward.campaignId)

    const totalRewards = campaignWithSc!.rewards.reduce(
      (sum, reward) => {
        const token = tokenStore.tokens.find(
          ({ symbol }) => symbol === reward.symbol
        )

        const amount = rewardInPercentage
          .dividedBy(100)
          .multipliedBy(reward.amount || 0)

        const amountInUsd = token
          ? new BigNumberInBase(amount).times(tokenStore.tokenUsdPrice(token))
          : ZERO_IN_BASE

        return [...sum, { amount, amountInUsd }]
      },
      [] as {
        amount: BigNumberInBase
        amountInUsd: BigNumberInBase
      }[]
    )

    return {
      userScore,
      campaign,
      totalRewards
    }
  })
)

const totalRewardsInUsd = computed(() =>
  totalRewards.value
    .filter((reward) =>
      finishedCampaigns.find(
        (campaign) => campaign.campaignId === reward.campaign?.campaignId
      )
    )
    .reduce((sum, reward) => {
      const totalRewardPerCampaignIsUsd = reward.totalRewards.reduce(
        (sum, rew) => sum.plus(rew.amountInUsd),
        ZERO_IN_BASE
      )

      return sum.plus(totalRewardPerCampaignIsUsd)
    }, ZERO_IN_BASE)
)

const rewardsToClaim = computed(
  () => campaignStore.ownerRewards.length - campaignStore.claimedRewards.length
)

const round = computed(() =>
  CAMPAIGN_LP_ROUNDS.find(
    ({ endDate, startDate }) =>
      Number(startDate) * 1000 < Date.now() &&
      Date.now() < Number(endDate) * 1000
  )
)

const rewardsThisRound = computed(() => {
  return totalRewards.value.filter((reward) =>
    round.value!.campaigns.find(
      (c) => c.campaignId === reward.campaign?.campaignId
    )
  )
})

const rewardsThisRoundInUsd = computed(() =>
  rewardsThisRound.value.reduce((sum, reward) => {
    const totalRewardPerCampaignIsUsd = reward.totalRewards.reduce(
      (sum, rew) => sum.plus(rew.amountInUsd),
      ZERO_IN_BASE
    )

    return sum.plus(totalRewardPerCampaignIsUsd)
  }, ZERO_IN_BASE)
)

const volumeThisRound = computed(() => {
  if (!round.value) {
    return ZERO_IN_BASE
  }

  const rewards = campaignStore.ownerRewards.filter(
    ({ campaignId }) =>
      round.value?.campaigns.find((c) => c.campaignId === campaignId)
  )

  const volumeThisRoundInUsd = rewards.reduce((sum, reward) => {
    const market = spotStore.markets.find(
      ({ marketId }) => marketId === reward.marketId
    )

    if (!market) {
      return sum
    }

    const volumeInUsd = new BigNumberInWei(reward.score)
      .toBase(market.quoteToken.decimals || USDT_DECIMALS)
      .times(tokenStore.tokenUsdPrice(market.quoteToken))

    return sum.plus(volumeInUsd)
  }, ZERO_IN_BASE)

  return volumeThisRoundInUsd
})

const { valueToString: totalRewardsInUsdToString } = useBigNumberFormatter(
  totalRewardsInUsd,
  { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
)

const { valueToString: rewardsThisRoundInUsdToString } = useBigNumberFormatter(
  rewardsThisRoundInUsd,
  { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
)

const { valueToString: volumeThisRoundToString } = useBigNumberFormatter(
  volumeThisRound,
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
        <BaseIcon name="arrow" />
        <p>{{ $t('campaign.title') }}</p>
      </NuxtLink>
    </div>

    <h3 class="text-3xl font-semibold my-4">
      {{ $t('campaign.dashboardTitle') }}
    </h3>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <div class="border rounded-md p-4">
        <p class="text-xs uppercase text-gray-500 mb-2">
          {{ $t('campaign.totalRewardsOfRound', { round: currentRound }) }}
        </p>
        <h3 class="text-xl font-semibold">
          {{ rewardsThisRoundInUsdToString }} USD
        </h3>
      </div>
      <div class="border rounded-md p-4">
        <p class="text-xs uppercase text-gray-500 mb-2">
          {{ $t('campaign.rewardsToClaim') }}
        </p>
        <h3 class="text-xl font-semibold">{{ rewardsToClaim }}</h3>
      </div>
      <div class="border rounded-md p-4">
        <p class="text-xs uppercase text-gray-500 mb-2">
          {{ $t('campaign.volumeThisRound') }}
        </p>
        <h3 class="text-xl font-semibold">{{ volumeThisRoundToString }} USD</h3>
      </div>
      <div class="border rounded-md p-4">
        <p class="text-xs uppercase text-gray-500 mb-2">
          {{ $t('campaign.totalRewardsAllTime') }}
        </p>
        <h3 class="text-xl font-semibold">
          {{ totalRewardsInUsdToString }} USD
        </h3>
      </div>
    </div>
  </div>
</template>
