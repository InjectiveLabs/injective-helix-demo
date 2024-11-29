<script lang="ts" setup>
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { getExplorerUrl } from '@shared/utils/network'
import { Campaign, CampaignUser } from '@injectivelabs/sdk-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import {
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  UI_DEFAULT_MAX_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { UiSpotMarket } from '@/types'

const props = withDefaults(
  defineProps<{
    market: UiSpotMarket
    campaign: Campaign
    totalScore: string
    campaignUser: CampaignUser
  }>(),
  {}
)

const tokenStore = useTokenStore()

const explorerLink = `${getExplorerUrl()}/account/${
  props.campaignUser.accountAddress
}`

const { valueToString: volumeInUsdToString } = useSharedBigNumberFormatter(
  computed(() =>
    new BigNumberInWei(props.campaignUser.score)
      .toBase(props.market.quoteToken.decimals)
      .times(tokenStore.tokenUsdPrice(props.market.quoteToken))
  )
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
    const token = tokenStore.tokenByDenomOrSymbol(reward.denom)

    const amount = new BigNumberInWei(reward.amount || 0)
      .toBase(token?.decimals || 18)
      .multipliedBy(estRewardsInPercentage.value)

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
      <div class="p-3">{{ volumeInUsdToString }} USD</div>
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
