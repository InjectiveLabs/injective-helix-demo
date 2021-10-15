<template>
  <div class="h-full w-full flex flex-wrap py-4">
    <div class="container">
      <div class="w-full mx-auto xl:w-4/5">
        <v-cards class="mt-6" />
        <v-recent-news class="mt-16" />
        <v-panel :title="$t('markets')" class="mt-16">
          <v-markets />
        </v-panel>
        <v-stats class="mt-16" />
        <v-social class="mt-16" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VSocial from '~/components/partials/home/social.vue'
import VStats from '~/components/partials/home/stats.vue'
import VCards from '~/components/partials/home/cards.vue'
import VRecentNews from '~/components/partials/home/news.vue'
import VMarkets from '~/components/partials/common/markets/markets.vue'

export default Vue.extend({
  components: {
    VCards,
    VSocial,
    VMarkets,
    VRecentNews,
    VStats
  }
})
</script>
