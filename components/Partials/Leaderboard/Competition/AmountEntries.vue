<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import { additionalEntriesMap } from '@/app/data/campaign'
import {
  UI_ZERO_DECIMAL,
  LEADERBOARD_VOLUME_PER_ENTRY,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { LeaderboardType } from '@/types'

const campaignStore = useCampaignStore()

const props = withDefaults(
  defineProps<{ pnl?: number; address: string; volume?: number }>(),
  {
    pnl: 0,
    volume: 0
  }
)

const { valueToString: amountToFormat, valueToBigNumber: amountToBigNumber } =
  useSharedBigNumberFormatter(
    computed(() =>
      campaignStore.activeCampaignType === LeaderboardType.Pnl
        ? props.pnl
        : props.volume
    ),
    {
      decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
    }
  )

const {
  valueToString: additionalEntriesToString,
  valueToBigNumber: additionalEntriesToBigNumber
} = useSharedBigNumberFormatter(
  computed(() => additionalEntriesMap[props.address] || 0),
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
    <span v-if="campaignStore.activeCampaignType === LeaderboardType.Pnl">
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
