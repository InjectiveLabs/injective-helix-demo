<script lang="ts" setup>
import { Status } from '@injectivelabs/utils'

defineProps({
  status: {
    type: Object as PropType<Status>,
    required: true
  }
})

const entries = computed(() => useLeaderboardStore().entries.slice(0, 6))
</script>

<template>
  <div>
    <CommonTableHeader
      class="grid-cols-6 md:grid-cols-12 border-b border-gray-700"
      :classes="'grid'"
    >
      <span class="col-span-1 md:col-span-2">
        <span class="text-gray-200 text-xs">
          {{ $t('leaderboard.rank') }}
        </span>
      </span>

      <span class="col-span-3 md:col-span-2">
        <span class="text-gray-200 text-xs">
          {{ $t('leaderboard.address') }}
        </span>
      </span>

      <span class="text-right col-span-2 md:col-span-3 text-gray-200 text-xs">
        {{ $t('leaderboard.volume') }}
      </span>

      <span class="hidden md:block col-span-1" />

      <span class="hidden md:block text-right col-span-2 text-gray-200 text-xs">
        {{ $t('leaderboard.volumePercentage') }}
      </span>

      <span class="hidden md:block text-left col-span-2" />
    </CommonTableHeader>

    <AppHocLoading :status="status">
      <CommonTableBody :is-empty="entries.length === 0">
        <PartialsLeaderboardRow
          v-for="(entry, index) in entries"
          :key="`leaderboard-row-${index}`"
          :rank="index + 1"
          :address="entry.accountID"
          :percentage="entry.perc"
          :volume="entry.volume"
        />

        <template #empty>
          <CommonEmptyList
            class="min-h-3xs bg-gray-900"
            data-cy="markets-no-data-table"
            :message="$t('leaderboard.emptyHeader')"
          >
            <span class="mt-2 text-xs text-gray-500">
              {{ $t('leaderboard.emptyDescription') }}
            </span>
          </CommonEmptyList>
        </template>
      </CommonTableBody>
    </AppHocLoading>
  </div>
</template>
