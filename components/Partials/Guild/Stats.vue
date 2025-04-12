<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'
import { sharedToBalanceInToken } from '@shared/utils/formatter'
import { GUILD_MAX_CAP, GUILD_BASE_TOKEN_SYMBOL } from '@/app/utils/constants'

const campaignStore = useCampaignStore()
const { baseToken, quoteToken } = useGuild()

withDefaults(defineProps<{ isCampaignStarted?: boolean }>(), {
  isCampaignStarted: false
})

const { valueToString: tvlScoreToString } = useSharedBigNumberFormatter(
  computed(() =>
    sharedToBalanceInToken({
      value: campaignStore.guild?.totalTvl || 0,
      decimalPlaces: baseToken.value?.decimals || 18
    })
  )
)

const { valueToString: volumeScoreToString } = useSharedBigNumberFormatter(
  computed(() =>
    sharedToBalanceInToken({
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
      class="flex items-center flex-wrap gap-12 bg-coolGray-850 rounded-lg p-8 mt-8 text-2xl font-semibold"
    >
      <div>
        <p class="text-coolGray-475 text-sm">
          {{ $t('guild.leaderboard.table.members') }}
        </p>
        <div class="flex items-center gap-2 mt-3">
          <UIcon :name="NuxtUiIcons.User" class="h-8 w-8 min-w-8" />
          <span>
            {{ campaignStore.totalGuildMember }} / {{ GUILD_MAX_CAP }}
          </span>
        </div>
      </div>

      <div>
        <p class="text-coolGray-475 text-sm">
          {{ $t('guild.leaderboard.table.tvlRank') }}
        </p>
        <div class="flex items-center gap-2 mt-3">
          <span v-if="!isCampaignStarted"> &mdash; </span>
          <template v-else>
            <UIcon
              v-if="campaignStore.guild.rankByTvl === 1"
              :name="NuxtUiIcons.Trophy"
              class="h-5 w-5 min-w-5"
            />
            <span>#{{ campaignStore.guild.rankByTvl }}</span>
          </template>
        </div>
      </div>

      <div>
        <p class="text-coolGray-475 text-sm">
          {{ $t('guild.leaderboard.table.volumeRank') }}
        </p>
        <div class="flex items-center gap-2 mt-3">
          <span v-if="!isCampaignStarted"> &mdash; </span>
          <template v-else>
            <UIcon
              v-if="campaignStore.guild.rankByVolume === 1"
              :name="NuxtUiIcons.Trophy"
              class="h-5 w-5 min-w-5"
            />
            <span>#{{ campaignStore.guild.rankByVolume }}</span>
          </template>
        </div>
      </div>

      <div>
        <p class="text-coolGray-475 text-sm">
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
        <p class="text-coolGray-475 text-sm">
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
