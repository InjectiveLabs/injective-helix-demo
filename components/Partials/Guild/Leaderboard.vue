<script lang="ts" setup>
import { format } from 'date-fns'

const campaignStore = useCampaignStore()

const DATE_FORMAT = 'yyyy-MM-dd hh:mm:ss'

const lastUpdated = computed(() => {
  if (!campaignStore.guildCampaignSummary) {
    return
  }

  return format(campaignStore.guildCampaignSummary.updatedAt, DATE_FORMAT)
})
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold">{{ $t('guild.leaderboard.title') }}</h2>

    <div class="border-b flex justify-between items-end mt-6">
      <button class="border-b-2 border-blue-500 text-blue-500 -mb-[1px] p-2">
        {{ $t('guild.leaderboard.tab.overall') }}
      </button>

      <p v-if="lastUpdated" class="text-gray-300 p-2 text-xs">
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
              {{ $t('guild.leaderboard.table.averageTvl') }}
            </th>

            <th class="p-4 text-right">
              {{ $t('guild.leaderboard.table.tradingVolume') }}
            </th>

            <th class="min-w-[40px]" />
          </tr>
        </thead>
        <tbody>
          <PartialsGuildRow
            v-for="guild in campaignStore.guilds"
            :key="guild.guildId"
            v-bind="{
              guild
            }"
          />
        </tbody>
      </table>
    </div>
  </div>
</template>
