<script setup lang="ts">
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { format, utcToZonedTime } from 'date-fns-tz'
import { CAMPAIGN_LP_ROUNDS } from '@/app/data/guild'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '~/app/utils/constants'

const props = defineProps({
  round: {
    type: Number,
    required: true
  }
})

const tokenStore = useTokenStore()

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
        <PartialsLiquidityRoundSelector />
      </div>
      <div>
        <p>{{ $t('campaign.description') }}</p>
      </div>
      <div>
        <NuxtLink
          :to="'#'"
          target="_blank"
          class="inline-block leading-5 py-2 px-5 font-semibold whitespace-nowrap text-white bg-blue-500 rounded-lg mt-4"
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
            {{ $t('campaign.totalLiquidity') }}
          </h3>
          <p class="text-xl font-semibold">123,123 USD</p>
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
