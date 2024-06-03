<script lang="ts" setup>
import { Campaign } from '@injectivelabs/sdk-ts'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { getExplorerUrl } from '@shared/utils/network'
import { sharedToBalanceInTokenInBase } from '@shared/utils/formatter'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import {
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  UI_DEFAULT_MAX_DISPLAY_DECIMALS
} from '@/app/utils/constants'

const props = defineProps({
  totalScore: {
    type: String,
    required: true
  },

  quoteDecimals: {
    type: Number,
    required: true
  },

  campaign: {
    type: Object as PropType<Campaign>,
    required: true
  }
})

const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const walletStore = useWalletStore()
const campaignStore = useCampaignStore()

const campaignWithReward = computed(() =>
  campaignStore.campaignsWithUserRewards.find(
    ({ campaignId }) => props.campaign.campaignId === campaignId
  )
)

const market = computed(() =>
  spotStore.markets.find(({ marketId }) => marketId === props.campaign.marketId)
)

const explorerLink = computed(() => {
  if (!walletStore.address) {
    return
  }

  return `${getExplorerUrl()}/account/${walletStore.address}`
})

const { valueToString: volumeInUsdToString } = useSharedBigNumberFormatter(
  computed(() => {
    if (!campaignWithReward.value || !market.value) {
      return 0
    }

    return new BigNumberInWei(campaignWithReward.value.userScore)
      .toBase(props.quoteDecimals)
      .times(tokenStore.tokenUsdPrice(market.value.quoteToken))
  })
)

const estRewardsInPercentage = computed(() => {
  if (
    !campaignWithReward.value ||
    new BigNumberInBase(props.totalScore).isZero()
  ) {
    return ZERO_IN_BASE
  }

  return new BigNumberInBase(campaignWithReward.value.userScore).dividedBy(
    props.totalScore
  )
})

const rewards = computed(() => {
  if (!props.campaign.rewards) {
    return []
  }

  return props.campaign.rewards.map((reward) => {
    const token = tokenStore.tokenByDenomOrSymbol(reward.denom)

    const amount = sharedToBalanceInTokenInBase({
      value: reward.amount,
      decimalPlaces: token?.decimals || 18
    }).multipliedBy(estRewardsInPercentage.value)

    const amountInUsd = token
      ? amount.times(tokenStore.tokenUsdPrice(token))
      : ZERO_IN_BASE

    return {
      amount,
      symbol: token?.symbol || '',
      amountInUsd
    }
  })
})

const rewardsFormatted = computed(() =>
  rewards.value.map((reward) => ({
    amount: reward.amount.toFormat(
      reward.amount.isLessThan(0.1)
        ? UI_DEFAULT_MAX_DISPLAY_DECIMALS
        : UI_DEFAULT_MIN_DISPLAY_DECIMALS
    ),
    symbol: reward.symbol
  }))
)
</script>

<template>
  <div v-if="campaignWithReward" class="bg-gray-850 rounded-md p-8">
    <h2 class="font-semibold mb-4">{{ $t('campaign.rewardStats') }}</h2>

    <div class="flex">
      <div
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-4 flex-1"
      >
        <div>
          <p class="text-xs uppercase pb-1">{{ $t('campaign.address') }}</p>
          <NuxtLink :to="explorerLink" target="_blank" class="text-sm">
            <p class="text-blue-500 truncate">
              {{ walletStore.address }}
            </p>
          </NuxtLink>
        </div>

        <div>
          <p class="text-xs uppercase pb-1">{{ $t('campaign.volume') }}</p>
          <p class="text-sm">{{ volumeInUsdToString }} USD</p>
        </div>

        <div>
          <div class="text-xs uppercase pb-1 flex items-center space-x-2">
            <p>{{ $t('campaign.rewards') }}</p>
          </div>
          <div class="flex items-center justify-between gap-2">
            <div class="text-sm">
              <p v-for="{ amount, symbol } in rewardsFormatted" :key="symbol">
                {{ amount }} {{ symbol }}
              </p>
            </div>
          </div>
        </div>

        <div>
          <PartialsLiquidityCommonClaimButton
            v-bind="{
              campaign: props.campaign
            }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
