<script lang="ts" setup>
import { toBalanceInToken } from '@/app/utils/formatters'
import { GUILD_MAX_CAP, GUILD_BASE_TOKEN_SYMBOL } from '@/app/utils/constants'

const campaignStore = useCampaignStore()
const { baseToken, quoteToken } = useGuild()

defineProps({
  isCampaignStarted: Boolean
})

const { valueToString: tvlScoreToString } = useSharedBigNumberFormatter(
  computed(() =>
    toBalanceInToken({
      value: campaignStore.guild?.totalTvl || 0,
      decimalPlaces: baseToken.value?.decimals || 18
    })
  )
)

const { valueToString: volumeScoreToString } = useSharedBigNumberFormatter(
  computed(() =>
    toBalanceInToken({
      value: campaignStore.guild?.volumeScore || 0,
      decimalPlaces: quoteToken.value?.decimals || 6
    })
  )
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
          <SharedIcon name="user-filled" class="h-5 w-5 min-w-5" />
          <span>
            {{ campaignStore.totalGuildMember }} / {{ GUILD_MAX_CAP }}
          </span>
        </div>
      </div>

      <div>
        <p class="text-gray-475 text-sm">
          {{ $t('guild.leaderboard.table.tvlRank') }}
        </p>
        <div class="flex items-center gap-2 mt-3">
          <span v-if="!isCampaignStarted"> &mdash; </span>
          <template v-else>
            <SharedIcon
              v-if="campaignStore.guild.rankByTvl === 1"
              name="trophy-filled"
              class="h-5 w-5 min-w-5"
            />
            <span>#{{ campaignStore.guild.rankByTvl }}</span>
          </template>
        </div>
      </div>

      <div>
        <p class="text-gray-475 text-sm">
          {{ $t('guild.leaderboard.table.volumeRank') }}
        </p>
        <div class="flex items-center gap-2 mt-3">
          <span v-if="!isCampaignStarted"> &mdash; </span>
          <template v-else>
            <SharedIcon
              v-if="campaignStore.guild.rankByVolume === 1"
              name="trophy-filled"
              class="h-5 w-5 min-w-5"
            />
            <span>#{{ campaignStore.guild.rankByVolume }}</span>
          </template>
        </div>
      </div>

      <div>
        <p class="text-gray-475 text-sm">
          {{ $t('guild.leaderboard.table.totalTIABalance') }}
        </p>
        <p class="mt-3">
          <span v-if="!isCampaignStarted"> &mdash; </span>
          <span v-else>
            {{ tvlScoreToString }}
            {{ baseToken?.symbol || GUILD_BASE_TOKEN_SYMBOL }}
          </span>
        </p>
      </div>

      <div>
        <p class="text-gray-475 text-sm">
          {{ $t('guild.leaderboard.table.totalTradingVolume') }}
        </p>
        <p class="mt-3">
          <span v-if="!isCampaignStarted"> &mdash; </span>
          <span v-else>{{ volumeScoreToString }} USD</span>
        </p>
      </div>
    </div>

    <div />
  </div>
</template>
