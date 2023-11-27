<script setup lang="ts">
import { Campaign } from '@injectivelabs/sdk-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import {
  CampaignWithSc,
  LiquidityRewardsPage,
  UiMarketWithToken
} from '@/types'
import { CAMPAIGN_LP_ROUNDS } from '~/app/data/guild'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '~/app/utils/constants'

const props = defineProps({
  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  },

  campaign: {
    type: Object as PropType<Campaign>,
    required: true
  }
})

const spotStore = useSpotStore()
const tokenStore = useTokenStore()

const campaignWithSc = computed(() => {
  const campaigns = CAMPAIGN_LP_ROUNDS.reduce<CampaignWithSc[]>(
    (campaigns, round) => {
      return [...campaigns, ...round.campaigns]
    },
    []
  )

  return campaigns.find(
    ({ campaignId }) => campaignId === props.campaign.campaignId
  )
})

const rewardsWithToken = computed(() => {
  if (!campaignWithSc.value) {
    return []
  }

  return campaignWithSc.value.rewards.map((r) => ({
    value: new BigNumberInBase(r.amount).toFormat(2),
    token: tokenStore.tokens.find((t) => t.symbol === r.symbol)
  }))
})

const totalRewardsInUsd = computed(() => {
  if (!campaignWithSc.value) {
    return ZERO_IN_BASE
  }

  return campaignWithSc.value.rewards.reduce((total, reward) => {
    const token = tokenStore.tokens.find((t) => t.symbol === reward.symbol)
    if (!token) {
      return total
    }

    const rewardInUsd = new BigNumberInBase(reward.amount).times(
      tokenStore.tokenUsdPriceMap[token.coinGeckoId]
    )

    return total.plus(rewardInUsd)
  }, ZERO_IN_BASE)
})

const marketSummary = computed(() =>
  spotStore.marketsSummary.find(
    (summary) => summary.marketId === props.market.marketId
  )
)

const marketVolume = computed(
  () => new BigNumberInBase(marketSummary.value?.volume || 0)
)

const { valueToString: totalRewardsInUsdToString } = useBigNumberFormatter(
  totalRewardsInUsd,
  { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
)

const { valueToString: marketVolumeToString } = useBigNumberFormatter(
  marketVolume,
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

    <div class="flex items-center space-x-2 my-4">
      <div>
        <CommonTokenIcon is-xl v-bind="{ token: market.baseToken }" />
      </div>

      <div>
        <h3 class="text-xl sm:text-3xl font-bold">{{ market.ticker }}</h3>
        <p class="text-gray-500">{{ market.baseToken.name }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <div class="border rounded-md p-4">
        <p class="text-xs uppercase text-gray-500 mb-2">
          {{ $t('campaign.rewardsRound') }}
        </p>
        <h3 class="text-xl font-semibold">
          {{ totalRewardsInUsdToString }} USD
        </h3>
        <div class="flex items-center space-x-2">
          <div
            v-for="(reward, i) in rewardsWithToken"
            :key="`${reward.token}-${reward.value}`"
            class="flex items-center space-x-2"
          >
            <p v-if="i > 0">+</p>
            <CommonTokenIcon
              v-if="reward.token"
              is-sm
              v-bind="{ token: reward.token }"
            />
            <p class="text-xs">
              {{ reward.value }} {{ reward?.token?.symbol }}
            </p>
          </div>
        </div>
      </div>
      <div class="border rounded-md p-4">
        <p class="text-xs uppercase text-gray-500 mb-2">
          {{ $t('campaign.rewardYield') }}
        </p>
        <h3 class="text-xl font-semibold">- USD</h3>
      </div>
      <div class="border rounded-md p-4">
        <p class="text-xs uppercase text-gray-500 mb-2">
          {{ $t('campaign.liquidity') }}
        </p>
        <h3 class="text-xl font-semibold">- USD</h3>
      </div>
      <div class="border rounded-md p-4">
        <p class="text-xs uppercase text-gray-500 mb-2">
          {{ $t('campaign.volume') }}
        </p>
        <h3 class="text-xl font-semibold">{{ marketVolumeToString }} USD</h3>
      </div>
    </div>
  </div>
</template>
