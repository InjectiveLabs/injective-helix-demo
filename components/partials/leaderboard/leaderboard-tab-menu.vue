<template>
  <TabMenu>
    <template #items>
      <TabMenuItem
        :value="'overall'"
        :active="tab === 'overall'"
        @click="handleTabClick"
      >
        {{ $t('leaderboard.tabs.overall') }}
      </TabMenuItem>

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

      <Selector
        :options="resolutionOptions"
        :value="resolution"
        :label="$t('leaderboard.resolution')"
        @select="handleResolutionChange"
      />
    </template>
  </TabMenu>
</template>

<script lang="ts">
import Vue from 'vue'
import { format } from 'date-fns'
import TabMenu from '~/components/elements/tab-menu.vue'
import TabMenuItem from '~/components/elements/tab-menu-item.vue'
import Selector from '~/components/elements/selector.vue'

export default Vue.extend({
  components: {
    TabMenu,
    TabMenuItem,
    Selector
  },

  props: {
    tab: {
      type: String,
      required: true
    },

    resolution: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      resolutionOptions: [
        {
          label: 'Daily',
          value: '1d'
        },
        {
          label: 'Weekly',
          value: '7d'
        }
      ]
    }
  },

  computed: {
    lastUpdatedAt(): number {
      return this.$accessor.leaderboard.lastUpdatedAt
    },

    formattedLastUpdatedAt(): string {
      const { lastUpdatedAt } = this

      const timestamp = new Date(0)
      timestamp.setUTCSeconds(lastUpdatedAt)

      return format(timestamp, 'yyyy-MM-dd HH:mm:ss')
    }
  },

  methods: {
    handleTabClick(value: string) {
      this.$emit('update:tab', value)
    },

    handleResolutionChange(value: string) {
      this.$emit('update:resolution', value)
    }
  }
})
</script>
