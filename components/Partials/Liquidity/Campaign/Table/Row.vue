<script lang="ts" setup>
import { Campaign, CampaignUser } from '@injectivelabs/sdk-ts'
import { getExplorerUrl } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { toBalanceInToken } from '@/app/utils/formatters'
import {
  NETWORK,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  UI_DEFAULT_MAX_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { LP_EPOCHS } from '@/app/data/guild'

const props = defineProps({
  campaignUser: {
    type: Object as PropType<CampaignUser>,
    required: true
  },

  campaign: {
    type: Object as PropType<Campaign>,
    required: true
  },

  totalScore: {
    type: String,
    required: true
  },

  quoteDecimals: {
    type: Number,
    required: true
  }
})

const explorerLink = `${getExplorerUrl(NETWORK)}/account/${
  props.campaignUser.accountAddress
}`

const { valueToString: volumeInUsdToString } = useBigNumberFormatter(
  computed(() =>
    toBalanceInToken({
      value: props.campaignUser.score,
      decimalPlaces: props.quoteDecimals
    })
  )
)

const lpEpoch = computed(() =>
  LP_EPOCHS.find(({ campaignId }) => campaignId === props.campaign.campaignId)
)

const estRewardsInPercentage = computed(() => {
  if (new BigNumberInBase(props.totalScore).isZero()) {
    return 0
  }

  return new BigNumberInBase(props.campaignUser.score)
    .dividedBy(props.totalScore)
    .times(100)
})

const estRewardsInINJ = computed(() =>
  new BigNumberInBase(estRewardsInPercentage.value)
    .dividedBy(100)
    .multipliedBy(lpEpoch.value?.baseRewards || 0)
)

const { valueToString: estRewardsInINJToString } = useBigNumberFormatter(
  estRewardsInINJ,
  {
    decimalPlaces: estRewardsInINJ.value.gt(0.1)
      ? UI_DEFAULT_MIN_DISPLAY_DECIMALS
      : UI_DEFAULT_MAX_DISPLAY_DECIMALS
  }
)

const estRewardsInTIA = computed(() =>
  new BigNumberInBase(estRewardsInPercentage.value)
    .dividedBy(100)
    .multipliedBy(lpEpoch.value?.quoteRewards || 0)
)

const { valueToString: estRewardsInTIAToString } = useBigNumberFormatter(
  estRewardsInTIA,
  {
    decimalPlaces: estRewardsInTIA.value.gte(0.1)
      ? UI_DEFAULT_MIN_DISPLAY_DECIMALS
      : UI_DEFAULT_MAX_DISPLAY_DECIMALS
  }
)
</script>

<template>
  <tr class="border-b last:border-none hover:bg-gray-800 text-sm">
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
          {{ estRewardsInINJToString }} INJ, {{ estRewardsInTIAToString }} TIA
        </p>
      </div>
    </td>
  </tr>
</template>
