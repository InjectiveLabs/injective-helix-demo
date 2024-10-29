<script setup lang="ts">
import { Campaign } from '@injectivelabs/sdk-ts'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { toBalanceInToken } from '@/app/utils/formatters'
import { LiquidityRewardsPage } from '@/types'

const props = withDefaults(
  defineProps<{
    campaign: Campaign
  }>(),
  {}
)

const spotStore = useSpotStore()
const tokenStore = useTokenStore()

const market = computed(() =>
  spotStore.markets.find(({ marketId }) => marketId === props.campaign.marketId)
)

const token = computed(() => {
  if (!market.value) {
    return
  }

  return tokenStore.tokenBySymbol(market.value.baseToken.symbol)
})

const marketVolumeInUsd = computed(() =>
  market.value
    ? new BigNumberInBase(
        toBalanceInToken({
          value: props.campaign.userScore || 0,
          decimalPlaces: market.value.quoteToken.decimals
        })
      ).times(tokenStore.tokenUsdPrice(market.value.quoteToken))
    : ZERO_IN_BASE
)

const estRewardsInPercentage = computed(() => {
  const userScore = props.campaign.userScore
  const totalScore = props.campaign.totalScore

  if (!userScore && !totalScore) {
    return ZERO_IN_BASE
  }

  return new BigNumberInBase(userScore).dividedBy(totalScore)
})

const rewards = computed(() => {
  return props.campaign.rewards.map((reward) => {
    const token = tokenStore.tokenByDenomOrSymbol(reward.denom)

    const amount = new BigNumberInWei(estRewardsInPercentage.value)
      .multipliedBy(reward.amount || 0)
      .toBase(token?.decimals || 0)

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

const totalAmountInUsd = computed(() =>
  rewards.value.reduce(
    (total, reward) => total.plus(reward.amountInUsd),
    ZERO_IN_BASE
  )
)

const { valueToString: totalAmountInUsdToString } = useSharedBigNumberFormatter(
  totalAmountInUsd,
  {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)

const { valueToString: marketVolumeInUsdToString } =
  useSharedBigNumberFormatter(marketVolumeInUsd, {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  })
</script>

<template>
  <tr v-if="market">
    <td class="text-left">
      <NuxtLink
        :to="{
          name: LiquidityRewardsPage.CampaignDetails,
          query: { campaign: campaign?.campaignId }
        }"
        class="flex items-center space-x-2 hover:bg-coolGray-800 rounded-md transition-colors duration-300 p-2"
      >
        <div v-if="token">
          <CommonTokenIcon v-bind="{ token }" />
        </div>
        <div>
          <p class="text-sm font-bold">{{ market.ticker }}</p>
          <p class="text-xs text-coolGray-500">
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
            campaign
          }"
        />
      </div>
    </td>
  </tr>
</template>

<style>
td {
  @apply px-2 py-2;
}
</style>
