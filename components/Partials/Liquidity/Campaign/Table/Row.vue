<script lang="ts" setup>
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { getExplorerUrl } from '@shared/utils/network'
import { BigNumberInBase } from '@injectivelabs/utils'
import { sharedToBalanceInTokenInBase } from '@shared/utils/formatter'
import {
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  UI_DEFAULT_MAX_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import type { UiSpotMarket } from '@/types'
import type { Campaign, CampaignUser } from '@injectivelabs/sdk-ts'

const props = withDefaults(
  defineProps<{
    campaign: Campaign
    totalScore: string
    market: UiSpotMarket
    campaignUser: CampaignUser
  }>(),
  {}
)

const sharedTokenStore = useSharedTokenStore()

const explorerLink = `${getExplorerUrl()}/account/${
  props.campaignUser.accountAddress
}`

const volumeInUsd = computed(() =>
  sharedToBalanceInTokenInBase({
    value: props.campaignUser.score,
    decimalPlaces: props.market.quoteToken.decimals
  }).times(sharedTokenStore.tokenUsdPrice(props.market.quoteToken))
)

const estRewardsInPercentage = computed(() => {
  if (new BigNumberInBase(props.totalScore).isZero()) {
    return 0
  }

  return new BigNumberInBase(props.campaignUser.score).dividedBy(
    props.totalScore
  )
})

const rewards = computed(() => {
  return props.campaign.rewards.map((reward) => {
    const token = sharedTokenStore.tokenByDenomOrSymbol(reward.denom)

    const amount = sharedToBalanceInTokenInBase({
      value: reward.amount || 0,
      decimalPlaces: token?.decimals
    }).multipliedBy(estRewardsInPercentage.value)

    const amountInUsd = token
      ? amount.times(sharedTokenStore.tokenUsdPrice(token))
      : ZERO_IN_BASE

    return {
      amount,
      amountInUsd,
      symbol: token?.symbol || ''
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
  <tr class="border-b last:border-none hover:bg-coolGray-800 text-sm">
    <td>
      <div class="p-3">
        <NuxtLink :to="explorerLink" target="_blank">
          <p class="text-blue-500 truncate">
            {{ campaignUser.accountAddress }}
          </p>
        </NuxtLink>
      </div>
    </td>
    <td class="text-right">
      <div class="p-3">
        <SharedAmountUsd
          v-bind="{
            hideDecimals: true,
            amount: volumeInUsd,
            shouldAbbreviate: false,
            roundingMode: BigNumberInBase.ROUND_UP
          }"
        />
        USD
      </div>
    </td>
    <td class="text-right">
      <div class="p-3">
        <p>
          <span
            v-for="({ amount, symbol }, index) in rewardsFormatted"
            :key="symbol"
          >
            {{ index > 0 ? ',' : '' }} {{ amount }} {{ symbol }}
          </span>
        </p>
      </div>
    </td>
  </tr>
</template>
