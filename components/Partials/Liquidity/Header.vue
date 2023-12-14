<script setup lang="ts">
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { format, utcToZonedTime } from 'date-fns-tz'
import { CAMPAIGN_LP_ROUNDS } from '@/app/data/campaign'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { CampaignWithScAndData, LiquidityRewardsPage } from '@/types'

const props = defineProps({
  round: {
    type: Number,
    required: true
  },

  campaignsWithScAndData: {
    type: Object as PropType<CampaignWithScAndData[]>,
    required: true
  }
})

const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const walletStore = useWalletStore()

const round = computed(() =>
  CAMPAIGN_LP_ROUNDS.find(({ round }) => round === props.round)
)

const totalRewardsThisRound = computed(() => {
  return props.campaignsWithScAndData.reduce((sum, campaign) => {
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

const totalVolume = computed(() =>
  props.campaignsWithScAndData
    .reduce((totalScore, campaign) => {
      const market = spotStore.markets.find(
        ({ slug }) => slug === campaign.marketSlug
      )!

      const campaignVolumeInUsd = new BigNumberInWei(campaign.totalScore)
        .toBase(market.quoteToken.decimals)
        .times(tokenStore.tokenUsdPriceMap[market.quoteToken.coinGeckoId])
      return totalScore.plus(campaignVolumeInUsd)
    }, ZERO_IN_BASE)
    .toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
)

const endDate = computed(() => {
  const utcDate = utcToZonedTime(
    Number(round.value?.endDate || 0) * 1000,
    'UTC'
  )

  return format(utcDate, 'MMM dd - HH:mm', { timeZone: 'UTC' })
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
        <p class="text-gray-300">{{ $t('campaign.description') }}</p>
      </div>

      <div class="space-x-2 flex pb-6">
        <NuxtLink
          v-if="walletStore.isUserWalletConnected"
          :to="{ name: LiquidityRewardsPage.Dashboard }"
          class="block leading-5 py-2 px-5 font-semibold whitespace-nowrap text-white bg-blue-500 border-blue-500 hover:bg-blue-600 border rounded-lg"
        >
          {{ $t('campaign.myRewards') }}
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
          <p class="text-xl font-semibold">{{ endDate }} UTC</p>
        </div>
      </div>
    </div>
  </div>
</template>
