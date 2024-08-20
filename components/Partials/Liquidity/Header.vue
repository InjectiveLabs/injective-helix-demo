<script setup lang="ts">
import { Campaign } from '@injectivelabs/sdk-ts'
import { format, utcToZonedTime } from 'date-fns-tz'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { toBalanceInToken } from '@/app/utils/formatters'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { LiquidityRewardsPage } from '@/types'

const props = defineProps({
  endDate: {
    type: Number,
    required: true
  },

  lastUpdated: {
    type: Number,
    required: true
  },

  round: {
    type: Number,
    required: true
  },

  roundCampaigns: {
    type: Array as PropType<Campaign[]>,
    required: true
  }
})

const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const sharedWalletStore = useSharedWalletStore()

const totalRewardsThisRound = computed(() =>
  props.roundCampaigns.reduce((sum, campaign) => {
    const rewardsPerCampaign = campaign.rewards.reduce((sum, reward) => {
      const token = tokenStore.tokenByDenomOrSymbol(reward.denom)!

      const rewardInBase = toBalanceInToken({
        value: reward.amount,
        decimalPlaces: token.decimals
      })

      const rewardInUsd = new BigNumberInBase(rewardInBase).times(
        tokenStore.tokenUsdPrice(token)
      )

      return sum.plus(rewardInUsd)
    }, ZERO_IN_BASE)

    return sum.plus(rewardsPerCampaign)
  }, ZERO_IN_BASE)
)

const totalVolume = computed(() =>
  props.roundCampaigns
    .reduce((totalScore, campaign) => {
      const market = spotStore.markets.find(
        ({ marketId }) => marketId === campaign.marketId
      )!

      const campaignVolumeInUsd = new BigNumberInWei(campaign.totalScore)
        .toBase(market.quoteToken?.decimals || 18)
        .times(tokenStore.tokenUsdPrice(market.quoteToken))
      return totalScore.plus(campaignVolumeInUsd)
    }, ZERO_IN_BASE)
    .toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
)

const endDate = computed(() => {
  const utcDate = utcToZonedTime(Number(props.endDate || 0), 'UTC')

  return format(utcDate, 'MMM dd - HH:mm', { timeZone: 'UTC' })
})

const { valueToString: totalRewardsThisRoundToString } =
  useSharedBigNumberFormatter(totalRewardsThisRound, {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  })
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
          v-if="sharedWalletStore.isUserConnected"
          :to="{ name: LiquidityRewardsPage.Dashboard }"
        >
          <AppButton> {{ $t('campaign.myRewards') }}</AppButton>
        </NuxtLink>

        <NuxtLink
          to="https://helixapp.zendesk.com/hc/en-us/articles/8258846181647-Share-30-000-TIA-in-TIA-Spot-Trading-Challenge-"
          target="_blank"
        >
          <AppButton>{{ $t('campaign.campaignRules') }}</AppButton>
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
