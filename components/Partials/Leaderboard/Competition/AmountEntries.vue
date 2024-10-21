<script lang="ts" setup>
import { CampaignV2 } from '@injectivelabs/sdk-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { additionalEntriesMap } from '@/app/data/campaign'
import {
  UI_ZERO_DECIMAL,
  LEADERBOARD_VOLUME_PER_ENTRY,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { LeaderboardType } from '@/types'

const props = withDefaults(
  defineProps<{
    pnl: number
    volume: number
    address: string
    campaign: CampaignV2
  }>(),
  {}
)

const { valueToString: amountToFormat, valueToBigNumber: amountToBigNumber } =
  useSharedBigNumberFormatter(
    computed(() =>
      props.campaign.type === LeaderboardType.Pnl ? props.pnl : props.volume
    ),
    {
      decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
    }
  )

const {
  valueToString: additionalEntriesToString,
  valueToBigNumber: additionalEntriesToBigNumber
} = useSharedBigNumberFormatter(
  computed(
    () => additionalEntriesMap[props.campaign.name]?.[props.address] || 0
  ),
  {
    shouldTruncate: true
  }
)

const { valueToString: entriesToString } = useSharedBigNumberFormatter(
  computed(() =>
    new BigNumberInBase(props.volume).dividedBy(LEADERBOARD_VOLUME_PER_ENTRY)
  ),
  {
    shouldTruncate: true,
    decimalPlaces: UI_ZERO_DECIMAL,
    roundingMode: BigNumberInBase.ROUND_DOWN
  }
)
</script>

<template>
  <div v-if="amountToBigNumber.gt(0)" class="text-[13px] md:text-sm mr-2">
    <span v-if="campaign.type === LeaderboardType.Pnl">
      {{ `${amountToBigNumber.gte(0) ? '+' : ''}` }}
    </span>
    <span v-else>$</span>
    <span>
      {{ amountToFormat }}
    </span>
  </div>
  <div v-else />

  <div class="flex items-center mr-2 gap-1">
    <span class="text-[13px] md:text-sm">
      {{ entriesToString }}
    </span>
    <CommonHeaderTooltip
      is-not-styled
      classes="cursor-pointer"
      :is-disabled="additionalEntriesToBigNumber.isZero()"
      :tooltip="$t('leaderboard.competition.additionalEntriesTooltip')"
    >
      <span v-if="additionalEntriesToBigNumber.gt(0)" class="font-bold">
        +{{ additionalEntriesToString }}
      </span>
    </CommonHeaderTooltip>
  </div>
</template>
