<template>
  <div class="h-full w-full flex flex-wrap py-14">
    <div class="container xl:max-w-6xl">
      <div class="flex justify-between mb-10">
        <div class="flex flex-col">
          <span class="text-3xl font-bold mb-2">
            {{ $t('leaderboard.title') }}
          </span>
          <span class="text-lg">
            {{ $t('leaderboard.description') }}
          </span>
        </div>
        <div class="">
          <img class="w-full" src="svg/leaderboard.svg" alt="leaderboard" />
        </div>
      </div>

      <LeaderboardTabMenu
        :tab="tab"
        :resolution="resolution"
        @update:tab="handleTabChange"
        @update:resolution="handleResolutionChange"
      />

      <LeaderboardTable :status="status" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import LeaderboardTabMenu from '~/components/partials/leaderboard/leaderboard-tab-menu.vue'
import LeaderboardTable from '~/components/partials/leaderboard/leaderboard-table.vue'

export default Vue.extend({
  components: {
    LeaderboardTabMenu,
    LeaderboardTable
  },

  middleware: ['leaderboard'],

  data() {
    return {
      status: new Status(StatusType.Loading),
      tab: 'overall',
      resolution: '1d'
    }
  },

  mounted() {
    Promise.all([this.$accessor.leaderboard.init()])
      .then(() => {
        //
      })
      .catch(this.$onRejected)
      .finally(() => {
        this.status.setIdle()
      })
  },

  methods: {
    fetchLeaderboard(): Promise<void> {
      const { resolution } = this

      this.status.setLoading()

      return this.$accessor.leaderboard
        .fetchLeaderboard(resolution)
        .then(() => {
          //
        })
        .catch(this.$onRejected)
        .finally(() => {
          this.status.setIdle()
        })
    },

    handleTabChange(tab: string) {
      this.tab = tab
    },

    handleResolutionChange(resolution: string) {
      this.resolution = resolution

      this.fetchLeaderboard()
    }
  }
})
</script>
