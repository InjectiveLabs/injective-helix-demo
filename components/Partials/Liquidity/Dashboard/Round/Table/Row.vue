<script setup lang="ts">
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { CampaignWithSc, LiquidityRewardsPage } from '@/types'

import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { CAMPAIGN_LP_ROUNDS } from '@/app/data/campaign'

const props = defineProps({
  campaignWithSc: {
    type: Object as PropType<CampaignWithSc>,
    required: true
  }
})

const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const campaignStore = useCampaignStore()

const market = computed(() =>
  spotStore.markets.find(({ slug }) => slug === props.campaignWithSc.marketSlug)
)

const token = computed(() =>
  tokenStore.tokens.find(
    ({ symbol }) => market.value?.baseToken.symbol === symbol
  )
)

const campaignUserInfo = computed(() =>
  campaignStore.ownerRewards.find(
    (r) => r.campaignId === props.campaignWithSc.campaignId
  )
)
const campaign = computed(() =>
  campaignStore.campaignsWithSc.find(
    (c) => c.campaignId === props.campaignWithSc.campaignId
  )
)

const marketVolumeInUsd = computed(() =>
  market.value
    ? new BigNumberInWei(campaignUserInfo.value?.score || 0)
        .toBase(market.value.quoteToken.decimals)
        .times(tokenStore.tokenUsdPrice(market.value.quoteToken))
    : ZERO_IN_BASE
)

const estRewardsInPercentage = computed(() => {
  if (
    !campaignUserInfo.value ||
    !campaign.value ||
    new BigNumberInBase(campaign.value?.totalScore).isZero()
  ) {
    return ZERO_IN_BASE
  }

  return new BigNumberInBase(campaignUserInfo.value.score).dividedBy(
    campaign.value?.totalScore
  )
})

const rewards = computed(() => {
  return props.campaignWithSc.rewards.map((reward) => {
    const token = tokenStore.tokens.find(
      ({ symbol }) => symbol === reward.symbol
    )

    const amount = new BigNumberInBase(
      estRewardsInPercentage.value
    ).multipliedBy(reward.amount || 0)

    const amountInUsd = token
      ? new BigNumberInBase(amount).times(tokenStore.tokenUsdPrice(token))
      : ZERO_IN_BASE

    return {
      amount,
      symbol: reward.symbol,
      amountInUsd
    }
  })
})

const totalAmountInUsd = computed(() =>
  rewards.value.reduce(
    (total, reward) => total.plus(reward.amountInUsd),
    ZERO_IN_BASE
  )
)

const round = computed(
  () =>
    CAMPAIGN_LP_ROUNDS.find((r) =>
      r.campaigns.find((c) => c.campaignId === props.campaignWithSc.campaignId)
    )!
)

const isClaimable = computed(() => Date.now() > round.value.endDate * 1000)

const { valueToString: totalAmountInUsdToString } = useBigNumberFormatter(
  totalAmountInUsd,
  {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)

const { valueToString: marketVolumeInUsdToString } = useBigNumberFormatter(
  marketVolumeInUsd,
  {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)

const isRound7 = computed(() => round.value.round === 7)
</script>

<template>
  <tr v-if="market">
    <td class="text-left">
      <NuxtLink
        :to="{
          name: LiquidityRewardsPage.CampaignDetails,
          query: { campaign: campaign?.campaignId }
        }"
        class="flex items-center space-x-2 hover:bg-gray-800 rounded-md transition-colors duration-300 p-2"
      >
        <div v-if="token">
          <CommonTokenIcon v-bind="{ token }" />
        </div>
        <div>
          <p class="text-sm font-bold">{{ market.ticker }}</p>
          <p class="text-xs text-gray-500">
            {{ market.baseToken.name }}
          </p>
        </div>
      </NuxtLink>
    </td>

    <td class="w-1/4">
      <div class="tracking-wider">{{ marketVolumeInUsdToString }} USD</div>
    </td>

    <td class="text-left w-72">
      <div>
        <p class="font-semibold">{{ totalAmountInUsdToString }} USD</p>
        <div class="flex items-center space-x-2">
          <PartialsLiquidityCommonTokenAmount
            v-for="({ amount, symbol }, i) in rewards"
            :key="`${symbol}-${symbol}`"
            v-bind="{ amount: amount.toFixed(), symbol, index: i }"
          />
        </div>
      </div>
    </td>

    <td class="w-40">
      <div class="space-y-2">
        <PartialsLiquidityCommonClaimButton
          v-bind="{
            scAddress: campaignWithSc.scAddress,
            isClaimable: isRound7 ? false : isClaimable,
            campaignId: campaignWithSc.campaignId
          }"
        />

        <p v-if="isRound7" class="text-xs text-gray-500">
          (Available to claim in less than 24hrs)
        </p>
      </div>
    </td>
  </tr>
</template>

<style>
td {
  @apply px-2 py-2;
}
</style>
