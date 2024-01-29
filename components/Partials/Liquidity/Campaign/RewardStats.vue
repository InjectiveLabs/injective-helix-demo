<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import { getExplorerUrl, ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { Campaign } from '@injectivelabs/sdk-ts'
import {
  NETWORK,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  UI_DEFAULT_MAX_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { toBalanceInToken } from '@/app/utils/formatters'

const campaignStore = useCampaignStore()

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

const tokenStore = useTokenStore()
const walletStore = useWalletStore()

const ownerCampaignInfo = computed(() =>
  campaignStore.campaignUsers.find(
    (user) => user.accountAddress === walletStore.injectiveAddress
  )
)

const explorerLink = computed(() => {
  if (!ownerCampaignInfo.value) {
    return
  }

  return `${getExplorerUrl(NETWORK)}/account/${
    ownerCampaignInfo.value.accountAddress
  }`
})

const { valueToString: volumeInUsdToString } = useBigNumberFormatter(
  computed(() => {
    if (!ownerCampaignInfo.value) {
      return 0
    }

    return toBalanceInToken({
      value: ownerCampaignInfo.value.score,
      decimalPlaces: props.quoteDecimals
    })
  })
)

const estRewardsInPercentage = computed(() => {
  if (
    !ownerCampaignInfo.value ||
    new BigNumberInBase(props.totalScore).isZero()
  ) {
    return ZERO_IN_BASE
  }

  return new BigNumberInBase(ownerCampaignInfo.value.score).dividedBy(
    props.totalScore
  )
})

const rewards = computed(() => {
  if (!props.campaign.rewards) {
    return []
  }

  return props.campaign.rewards.map((reward) => {
    const token = tokenStore.tokens.find(({ denom }) => denom === reward.denom)

    const amount = new BigNumberInBase(
      estRewardsInPercentage.value
    ).multipliedBy(
      toBalanceInToken({
        value: reward.amount,
        decimalPlaces: token?.decimals || 18
      })
    )

    const amountInUsd = token
      ? new BigNumberInBase(amount).times(tokenStore.tokenUsdPrice(token))
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
  <div v-if="ownerCampaignInfo" class="bg-gray-850 rounded-md p-8">
    <template v-if="ownerCampaignInfo">
      <h2 class="font-semibold mb-4">{{ $t('campaign.rewardStats') }}</h2>

      <div class="flex">
        <div
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-4 flex-1"
        >
          <div>
            <p class="text-xs uppercase pb-1">{{ $t('campaign.address') }}</p>
            <NuxtLink :to="explorerLink" target="_blank" class="text-sm">
              <p class="text-blue-500 truncate">
                {{ ownerCampaignInfo.accountAddress }}
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
    </template>
  </div>
</template>
