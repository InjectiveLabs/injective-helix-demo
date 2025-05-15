<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'
import { getExplorerUrl } from '@shared/utils/network'
import { sharedEllipsisFormatText } from '@shared/utils/formatter'
import {
  DEFAULT_TRUNCATE_LENGTH,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { LeaderBoardCyTags } from '@/types'
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

const { valueToString: pnlToFormat, valueToBigNumber: pnlToBigNumber } =
  useSharedBigNumberFormatter(
    computed(() => props.leader.pnl),
    {
      decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
    }
  )
</script>

<template>
  <div class="pnl-table">
    <div>
      <span v-if="leader.rank > 3" class="font-semibold ml-1">
        {{ leader.rank }}
      </span>
      <div
        v-else
        class="-ml-0.5 md:-ml-2 min-w-6 h-6 w-6 md:min-w-10 md:w-10 md:h-10"
      >
        <img
          :src="`/images/leaderboard/rank-${leader.rank}.svg`"
          :data-cy="dataCyTag(LeaderBoardCyTags.rankLogo)"
        />
      </div>
    </div>

    <div>
      <a
        target="_blank"
        :href="`${getExplorerUrl()}/account/${leader.account}/`"
        class="font-light font-mono flex items-center gap-2 hover:text-white/70 transition-colors"
      >
        <span class="lg:hidden text-xs lowercase">
          {{ formattedAddress }}
        </span>
        <span
          class="hidden lg:block"
          :class="[leader.rank > 3 ? 'text-sm' : 'text-sm xl:text-base']"
          :data-cy="dataCyTag(LeaderBoardCyTags.rankAddress)"
        >
          {{ leader.account }}
        </span>

        <UIcon
          :class="[leader.rank > 3 ? 'size-4' : 'size-4 xl:size-[18px]']"
          :name="NuxtUiIcons.ExternalLink2"
        />
      </a>
    </div>

    <div>
      <span
        class="text-[13px] md:text-sm mr-4"
        :data-cy="dataCyTag(LeaderBoardCyTags.rankPnl)"
      >
        {{ `${pnlToBigNumber.gte(0) ? '+' : ''}${pnlToFormat}` }}
      </span>
    </div>
  </div>
</template>
