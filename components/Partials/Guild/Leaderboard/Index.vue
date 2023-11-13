<script lang="ts" setup>
import { format } from 'date-fns'

const campaignStore = useCampaignStore()

const props = defineProps({
  isVolume: Boolean
})

const DATE_FORMAT = 'yyyy-MM-dd hh:mm:ss'

const date = ref(Date.now())

const guilds = computed(() =>
  props.isVolume ? campaignStore.guildsByVolume : campaignStore.guildsByTVL
)

const lastUpdated = computed(() => {
  if (!campaignStore.guildCampaignSummary) {
    return
  }

  return format(campaignStore.guildCampaignSummary.updatedAt, DATE_FORMAT)
})

const isCampaignStarted = computed(() => {
  if (!campaignStore.guildCampaignSummary) {
    return false
  }

  return campaignStore.guildCampaignSummary.startTime < date.value
})

useIntervalFn(() => (date.value = Date.now()), 1000)
</script>

<template>
  <div>
    <div class="border-b flex justify-between items-end">
      <button class="border-b-2 border-blue-500 text-blue-500 -mb-[1px] p-2">
        <span v-if="isVolume">
          {{ $t('guild.leaderboard.tab.rankByVolume') }}
        </span>
        <span v-else>{{ $t('guild.leaderboard.tab.rankByTVL') }}</span>
      </button>

      <p v-if="isVolume && lastUpdated" class="text-gray-300 p-2 text-xs">
        {{ $t('guild.leaderboard.lastUpdated', { date: lastUpdated }) }}
      </p>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b uppercase text-xs text-gray-500">
            <th class="p-4 text-left">
              {{ $t('guild.leaderboard.table.rank') }}
            </th>
            <th class="p-4 text-left">
              {{ $t('guild.leaderboard.table.guild') }}
            </th>
            <th class="p-4 text-left">
              {{ $t('guild.leaderboard.table.status') }}
            </th>
            <th class="p-4 text-right">
              <span v-if="isVolume">
                {{ $t('guild.leaderboard.table.tradingVolume') }}
              </span>
              <span v-else>{{ $t('guild.leaderboard.table.balance') }}</span>
            </th>
            <th class="min-w-[40px]" />
          </tr>
        </thead>
        <tbody>
          <PartialsGuildLeaderboardRow
            v-for="(guild, index) in guilds"
            :key="guild.guildId"
            v-bind="{
              guild,
              isVolume,
              rank: index + 1,
              isCampaignStarted,
              summary: campaignStore.guildCampaignSummary
            }"
          />

          <tr v-if="guilds.length === 0" class="text-center border-b">
            <td colspan="5">
              <div class="p-3">{{ $t('guild.noData') }}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
