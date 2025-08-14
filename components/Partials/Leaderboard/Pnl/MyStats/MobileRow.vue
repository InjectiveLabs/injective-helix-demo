<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'
import { getExplorerUrl } from '@shared/utils/network'
import { BigNumberInBase } from '@injectivelabs/utils'
import { sharedEllipsisFormatText } from '@shared/utils/formatter'
import {
  DEFAULT_TRUNCATE_LENGTH,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import type { LeaderboardRow } from '@injectivelabs/sdk-ts'

const props = withDefaults(
  defineProps<{
    leader?: LeaderboardRow
  }>(),
  {
    leader: () => ({
      pnl: 0,
      rank: 0,
      volume: 0,
      account: ''
    })
  }
)

const formattedAddress = computed(() =>
  sharedEllipsisFormatText(props.leader.account, DEFAULT_TRUNCATE_LENGTH)
)

const pnlToBigNumber = computed(() => new BigNumberInBase(props.leader.pnl))
</script>

<template>
  <div class="grid grid-cols-[38px_1fr] ml-4 gap-7">
    <div class="h-full-flex items-start gap-y-1">
      <div class="text-[11px] leading-3 mb-1">
        {{ $t('leaderboard.header.rank') }}
      </div>
      <div class="text-sm font-semibold leading-4">
        {{ leader.rank }}
      </div>
    </div>

    <div class="h-full-flex items-start gap-y-1">
      <div class="font-medium text-[11px] leading-3">
        {{ $t('leaderboard.header.address') }}
      </div>

      <NuxtLink
        target="_blank"
        class="flex items-center gap-2"
        :to="`${getExplorerUrl()}/account/${leader.account}`"
      >
        <div class="font-medium text-sm leading-5">{{ formattedAddress }}</div>
        <UIcon class="size-4" :name="NuxtUiIcons.ExternalLink2" />
      </NuxtLink>

      <div class="flex justify-between mt-3">
        <div class="flex flex-col items-start gap-y-1">
          <div class="text-[11px] leading-3">
            {{ $t('leaderboard.header.tradingPnl') }}
          </div>
          <div class="font-medium text-sm">
            <SharedAmount
              v-bind="{
                amount: leader.pnl,
                useSubscript: true,
                shouldAbbreviate: false,
                decimals: UI_DEFAULT_MIN_DISPLAY_DECIMALS
              }"
            >
              <template #prefix>
                {{ `${pnlToBigNumber.gte(0) ? '+' : ''}` }}
              </template>
            </SharedAmount>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
