<template>
  <div>
    <TableHeader
      class="grid-cols-6 md:grid-cols-12 border-b border-helixGray-500"
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
    </TableHeader>

    <HocLoading :status="status">
      <TableBody :show-empty="entries.length === 0">
        <LeaderboardRow
          v-for="(entry, index) in entries"
          :key="`leaderboard-row-${index}`"
          :rank="index + 1"
          :address="entry.accountID"
          :perc="entry.perc"
          :volume="entry.volume"
        />

        <EmptyList
          slot="empty"
          classes="bg- min-h-3xs"
          data-cy="markets-no-data-table"
          :message="$t('leaderboard.emptyHeader')"
        >
          <span class="mt-2 text-xs text-gray-500">{{
            $t('leaderboard.emptyDescription')
          }}</span>
        </EmptyList>
      </TableBody>
    </HocLoading>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { UiLeaderboardEntry } from '@injectivelabs/sdk-ui-ts'
import { Status } from '@injectivelabs/utils'
import TableBody from '~/components/elements/table-body.vue'
import TableHeader from '~/components/elements/table-header.vue'
import LeaderboardRow from '~/components/partials/leaderboard/leaderboard-row.vue'

export default Vue.extend({
  components: {
    TableBody,
    TableHeader,
    LeaderboardRow
  },

  props: {
    status: {
      type: Object as PropType<Status>,
      required: true
    }
  },

  data() {
    return {
      sortBy: 'rank'
    }
  },

  computed: {
    entries(): UiLeaderboardEntry[] {
      return this.$accessor.leaderboard.entries.slice(0, 6)
    }
  }
})
</script>
