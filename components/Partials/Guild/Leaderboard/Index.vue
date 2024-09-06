<script lang="ts" setup>
const campaignStore = useCampaignStore()

const props = withDefaults(defineProps<{ isVolume?: boolean; now: number }>(), {
  isVolume: false
})

const showInactive = ref(false)

const guilds = computed(() =>
  props.isVolume ? campaignStore.guildsByVolume : campaignStore.guildsByTVL
)

const filteredGuilds = computed(() =>
  showInactive.value
    ? guilds.value
    : guilds.value.filter((guild) => guild.isActive)
)

const sortedGuilds = computed(() => {
  if (isCampaignStarted.value) {
    return filteredGuilds.value
  }

  return filteredGuilds.value.sort((g1, g2) => {
    if (g1.isActive === g2.isActive) {
      return g1.name.localeCompare(g2.name)
    }

    return Number(g2.isActive) - Number(g1.isActive)
  })
})

const isCampaignStarted = computed(() => {
  if (!campaignStore.guildCampaignSummary) {
    return false
  }

  return campaignStore.guildCampaignSummary.startTime < props.now
})
</script>

<template>
  <div class="overflow-x-auto">
    <div class="border-b flex justify-between items-center flex-wrap">
      <button class="border-b-2 border-blue-500 text-blue-500 -mb-[1px] p-2">
        <span v-if="isVolume">
          {{ $t('guild.leaderboard.tab.rankByVolume') }}
        </span>
        <span v-else>{{ $t('guild.leaderboard.tab.rankByTVL') }}</span>
      </button>

      <AppCheckbox v-model="showInactive" sm>
        {{ $t('guild.showInactive') }}
      </AppCheckbox>
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
            <th class="p-4 text-right whitespace-nowrap">
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
            v-for="(guild, index) in sortedGuilds"
            :key="guild.guildId"
            v-bind="{
              guild,
              isVolume,
              rank: index + 1,
              isCampaignStarted,
              summary: campaignStore.guildCampaignSummary,
              isMyGuild: campaignStore.userGuildInfo?.guildId === guild.guildId
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
