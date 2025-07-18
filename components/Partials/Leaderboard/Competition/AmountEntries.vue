<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  UI_ZERO_DECIMAL,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import {
  additionalEntriesMap,
  checkIsCampaignWithEntries,
  competitionVolumePerEntryMap
} from '@/app/data/campaign'
import { LeaderboardType } from '@/types'
import type { CampaignV2 } from '@injectivelabs/sdk-ts'

const props = withDefaults(
  defineProps<{
    pnl: number
    volume: number
    address: string
    campaign: CampaignV2
  }>(),
  {}
)

const isCampaignWithEntries = computed(() =>
  checkIsCampaignWithEntries(props.campaign?.name)
)

const amount = computed(() =>
  props.campaign.type === LeaderboardType.Pnl ? props.pnl : props.volume
)

const amountToBigNumber = computed(() => new BigNumberInBase(amount.value))

const additionalEntries = computed(
  () => additionalEntriesMap[props.campaign.name]?.[props.address] || 0
)

const additionalEntriesToBigNumber = computed(
  () => new BigNumberInBase(additionalEntries.value)
)

const entries = computed(() =>
  new BigNumberInBase(props.volume).dividedBy(
    competitionVolumePerEntryMap[props.campaign.name] || 1000
  )
)
</script>

<template>
  <div v-if="amountToBigNumber.gt(0)" class="text-[13px] md:text-sm mr-2">
    <SharedAmount
      v-bind="{
        useSubscript: true,
        shouldAbbreviate: false,
        amount: amount.toFixed(),
        decimals: UI_DEFAULT_MIN_DISPLAY_DECIMALS
      }"
    >
      <template #prefix>
        <span v-if="campaign.type === LeaderboardType.Pnl">
          {{ `${amountToBigNumber.gte(0) ? '+' : ''}` }}
        </span>
        <span v-else>$</span>
      </template>
    </SharedAmount>
  </div>
  <div v-else />

  <div v-if="isCampaignWithEntries" class="flex items-center mr-2 gap-1">
    <span class="text-[13px] md:text-sm">
      <SharedAmount
        v-bind="{
          amount: entries,
          useSubscript: true,
          shouldAbbreviate: false,
          decimals: UI_ZERO_DECIMAL
        }"
      />
    </span>
    <CommonHeaderTooltip
      is-not-styled
      classes="cursor-pointer"
      :is-disabled="additionalEntriesToBigNumber.isZero()"
      :tooltip="$t('leaderboard.competition.additionalEntriesTooltip')"
    >
      <span v-if="additionalEntriesToBigNumber.gt(0)" class="font-bold">
        <SharedAmount
          v-bind="{
            useSubscript: true,
            shouldAbbreviate: false,
            amount: additionalEntries
          }"
        >
          <template #prefix>+</template>
        </SharedAmount>
      </span>
    </CommonHeaderTooltip>
  </div>
</template>
