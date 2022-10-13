<template>
  <TableHeader
    class="grid-cols-10 3md:grid-cols-12 border-b border-helixGray-500"
  >
    <span class="col-span-2">
      <span class="text-gray-200 text-xs">
        {{ $t('leaderboard.rank') }}
      </span>
    </span>

    <span class="col-span-2">
      <span class="text-gray-200 text-xs">
        {{ $t('leaderboard.address') }}
      </span>
    </span>

    <span class="text-right col-span-3 text-gray-200 text-xs">
      {{ $t('leaderboard.volume') }}
    </span>

    <span class="hidden sm:block col-span-1" />

    <span class="text-right col-span-2 text-gray-200 text-xs">
      {{ $t('leaderboard.volumePercentage') }}
    </span>

    <span class="hidden 3md:block text-left col-span-2" />
  </TableHeader>
</template>

<script lang="ts">
import Vue from 'vue'
import TableHeader from '~/components/elements/table-header.vue'

export default Vue.extend({
  components: {
    TableHeader
  }
})
</script>
