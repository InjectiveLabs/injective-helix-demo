<template>
  <v-panel :title="$t('trade.marketsInformation')">
    <div class="flex items-center">
      <v-button-filter
        v-if="false"
        v-model="component"
        :option="components.quoteDenoms"
      >
        <span>
          {{ $t('trade.quote_denoms') }}
        </span>
      </v-button-filter>
      <v-separator v-if="false" />
      <v-button-filter v-model="component" :option="components.boostedMarkets">
        <span>
          {{ $t('trade.boosted_markets') }}
        </span>
      </v-button-filter>
      <v-separator />
      <v-button-filter
        v-model="component"
        :option="components.disqualifiedMarkets"
      >
        <span>
          {{ $t('trade.disqualified_markets') }}
        </span>
      </v-button-filter>
    </div>
    <div class="mt-4">
      <component :is="component" v-if="component"></component>
    </div>
  </v-panel>
</template>

<script lang="ts">
import Vue from 'vue'
import VBoostedMarkets from './markets-info/boosted.vue'
import VDisqualifiedMarkets from './markets-info/disqualified.vue'
import VQuoteDenoms from './markets-info/quote-denoms.vue'
import VItem from '~/components/partials/common/stats/item.vue'

const components = {
  quoteDenoms: 'v-quote-denoms',
  boostedMarkets: 'v-boosted-markets',
  disqualifiedMarkets: 'v-disqualified-markets'
}

export default Vue.extend({
  components: {
    VItem,
    VQuoteDenoms,
    VBoostedMarkets,
    VDisqualifiedMarkets
  },

  data() {
    return {
      components,
      component: components.boostedMarkets
    }
  }
})
</script>
