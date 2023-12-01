<script setup lang="ts">
import { Campaign } from '@injectivelabs/sdk-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import {
  CampaignWithScAndData,
  LiquidityRewardsPage,
  UiMarketWithToken
} from '@/types'
import { LP_CAMPAIGNS } from '@/app/data/campaign'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'

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

const tokenStore = useTokenStore()
const walletStore = useWalletStore()

const campaignWithScAndData = computed(() => {
  const campaignWithSc = LP_CAMPAIGNS.find(
    (c) => c.campaignId === props.campaign.campaignId
  )!

  return { ...campaignWithSc, ...props.campaign } as CampaignWithScAndData
})

const rewardsWithToken = computed(() => {
  return campaignWithScAndData.value.rewards.map((reward) => ({
    value: new BigNumberInBase(reward.amount).toFormat(
      UI_DEFAULT_MIN_DISPLAY_DECIMALS
    ),
    token: tokenStore.tokens.find(({ symbol }) => symbol === reward.symbol)
  }))
})

const { valueToString: totalRewardsInUsdToString } = useBigNumberFormatter(
  computed(() => {
    return campaignWithScAndData.value.rewards.reduce((total, reward) => {
      const token = tokenStore.tokens.find(
        ({ symbol }) => symbol === reward.symbol
      )

      if (!token) {
        return total
      }

      const rewardInUsd = new BigNumberInBase(reward.amount).times(
        tokenStore.tokenUsdPriceMap[token.coinGeckoId]
      )

      return total.plus(rewardInUsd)
    }, ZERO_IN_BASE)
  }),
  { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
)

const { valueToString: volumeInUsdToString } = useBigNumberFormatter(
  computed(() =>
    new BigNumberInWei(props.campaign.totalScore)
      .toBase(props.market.quoteToken.decimals)
      .times(tokenStore.tokenUsdPriceMap[props.market.quoteToken.coinGeckoId])
  ),
  {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)
</script>

<template>
  <div>
    <div class="flex space-x-4">
      <NuxtLink
        :to="{ name: LiquidityRewardsPage.Home }"
        class="flex items-center space-x-2"
      >
        <BaseIcon name="arrow" />
        <p>{{ $t('campaign.title') }}</p>
      </NuxtLink>
    </div>

    <div class="flex items-center my-4">
      <div>
        <CommonTokenIcon is-xl v-bind="{ token: market.baseToken }" />
      </div>

      <div class="mx-2">
        <h3 class="text-xl sm:text-3xl font-bold">{{ market.ticker }}</h3>
        <p class="text-gray-500">{{ market.baseToken.name }}</p>
      </div>

      <div class="flex items-center ml-auto">
        <NuxtLink
          v-if="walletStore.isUserWalletConnected"
          :to="{ name: LiquidityRewardsPage.Dashboard }"
          class="block leading-5 py-2 px-5 font-semibold whitespace-nowrap text-white bg-blue-500 border-blue-500 hover:bg-blue-600 border rounded-lg"
        >
          {{ $t('campaign.myRewards') }}
        </NuxtLink>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          {{ $t('campaign.volume') }}
        </p>
        <h3 class="text-xl font-semibold">{{ volumeInUsdToString }} USD</h3>
      </div>
    </div>
  </div>
</template>
