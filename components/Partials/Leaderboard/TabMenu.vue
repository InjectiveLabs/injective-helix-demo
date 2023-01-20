<script lang="ts" setup>
import { format } from 'date-fns'

const leaderboardStore = useLeaderboardStore()
const { t } = useLang()

const props = defineProps({
  tab: {
    type: String,
    required: true
  },

  resolution: {
    type: String,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'update:resolution', state: string): void
  (e: 'update:tab', state: string): void
}>()

const resolutionOptions = [
  {
    display: t('leaderboard.resolutionOptions.daily'),
    value: '1d'
  },
  {
    display: t('leaderboard.resolutionOptions.weekly'),
    value: '7d'
  }
]

const resolutionValue = computed({
  get(): string {
    return props.resolution
  },
  set(value: string) {
    emit('update:resolution', value)
  }
})

const lastUpdatedAt = computed(() => {
  return leaderboardStore.lastUpdatedAt
})

const formattedLastUpdatedAt = computed(() => {
  const timestamp = new Date(0)

  timestamp.setUTCSeconds(lastUpdatedAt.value)

  return format(timestamp, 'yyyy-MM-dd HH:mm:ss')
})

function handleTabClick(value: string) {
  emit('update:tab', value)
}
</script>

<template>
  <AppTabMenu>
    <template #items>
      <AppTabMenuItem
        :value="'overall'"
        :active="tab === 'overall'"
        @click="handleTabClick"
      >
        {{ $t('leaderboard.tabs.overall') }}
      </AppTabMenuItem>

      <!-- Enable this once we support competitions -->

      <!-- <TabMenuItem
        :value="'volume'"
        :active="tab === 'volume'"
        @click="handleTabClick"
      >
        {{ $t('leaderboard.tabs.volume') }}
      </TabMenuItem>

      <TabMenuItem
        :value="'roi'"
        :active="tab === 'roi'"
        @click="handleTabClick"
      >
        {{ $t('leaderboard.tabs.roi') }}
      </TabMenuItem>

      <TabMenuItem
        :value="'pnl'"
        :active="tab === 'pnl'"
        @click="handleTabClick"
      >
        {{ $t('leaderboard.tabs.pnl') }}
      </TabMenuItem>

      <TabMenuItem
        :value="'summerTradingCompetition'"
        :active="tab === 'summerTradingCompetition'"
        @click="handleTabClick"
      >
        {{ $t('leaderboard.tabs.summerTradingCompetition') }}
      </TabMenuItem> -->
    </template>

    <template #actions>
      <span class="text-xs text-gray-400 mr-8">
        {{
          $t('leaderboard.lastUpdatedAt', {
            timestamp: formattedLastUpdatedAt
          })
        }}
      </span>

      <div class="h-10 flex items-center">
        <AppSelect v-model="resolutionValue" :options="resolutionOptions">
          <template #prefix>
            <span class="text-xs text-gray-500">
              {{ $t('leaderboard.resolution') }}
            </span>
          </template>

          <template #default="{ selected }">
            <span v-if="selected" class="text-xs text-blue-500">
              {{ selected.display }}
            </span>
          </template>

          <template #option="{ option }">
            <span class="text-xs text-white">
              {{ option.display }}
            </span>
          </template>
        </AppSelect>
      </div>
    </template>
  </AppTabMenu>
</template>
