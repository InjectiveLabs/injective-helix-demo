<script lang="ts" setup>
import { Token } from '@injectivelabs/token-metadata'
import { toBalanceInToken } from '@/app/utils/formatters'

const campaignStore = useCampaignStore()

const props = defineProps({
  token: {
    type: Object as PropType<Token>,
    default: undefined
  }
})

const { valueToString: tvlScoreToString } = useBigNumberFormatter(
  computed(() =>
    toBalanceInToken({
      value: campaignStore.guild?.totalTvl || 0,
      decimalPlaces: props.token?.decimals || 18
    })
  )
)

const { valueToString: volumeScoreToString } = useBigNumberFormatter(
  computed(() => campaignStore.guild?.volumeScore || 0)
)
</script>

<template>
  <div class="flex">
    <div
      v-if="campaignStore.guild"
      class="flex items-center flex-wrap gap-12 bg-gray-850 rounded-lg p-8 mt-8 text-2xl font-semibold"
    >
      <div>
        <p class="text-gray-475 text-sm">
          {{ $t('guild.leaderboard.table.members') }}
        </p>
        <div class="flex items-center gap-2 mt-3">
          <BaseIcon name="user-filled" class="h-5 w-5 min-w-5" />
          <span>{{ campaignStore.totalGuildMember }}</span>
        </div>
      </div>

      <div>
        <p class="text-gray-475 text-sm">
          {{ $t('guild.leaderboard.table.tvlRank') }}
        </p>
        <div class="flex items-center gap-2 mt-3">
          <BaseIcon name="trophy-filled" class="h-5 w-5 min-w-5" />
          <span>#{{ campaignStore.guild.rankByTvl }}</span>
        </div>
      </div>

      <div>
        <p class="text-gray-475 text-sm">
          {{ $t('guild.leaderboard.table.volumeRank') }}
        </p>
        <div class="flex items-center gap-2 mt-3">
          <BaseIcon name="trophy-filled" class="h-5 w-5 min-w-5" />
          <span>#{{ campaignStore.guild.rankByVolume }}</span>
        </div>
      </div>

      <div>
        <p class="text-gray-475 text-sm">
          {{ $t('guild.leaderboard.table.totalTIABalance') }}
        </p>
        <p class="mt-3">{{ tvlScoreToString }} {{ token?.symbol }}</p>
      </div>

      <div>
        <p class="text-gray-475 text-sm">
          {{ $t('guild.leaderboard.table.totalTradingVolume') }}
        </p>
        <p class="mt-3">{{ volumeScoreToString }} USD</p>
      </div>
    </div>

    <div />
  </div>
</template>
