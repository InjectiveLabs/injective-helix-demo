<template>
  <VPanel :title="$t('trade.marketsInformation')">
    <div class="flex items-center">
      <VButtonFilter
        v-if="false"
        v-model="component"
        :option="components.quoteDenoms"
      >
        <span>
          {{ $t('trade.quote_denoms') }}
        </span>
      </VButtonFilter>
      <VSeparator v-if="false" />
      <VButtonFilter v-model="component" :option="components.boostedMarkets">
        <span>
          {{ $t('trade.boosted_markets') }}
        </span>
      </VButtonFilter>
      <VSeparator />
      <VButtonFilter
        v-model="component"
        :option="components.disqualifiedMarkets"
      >
        <span>
          {{ $t('trade.disqualified_markets') }}
        </span>
      </VButtonFilter>
    </div>
    <div class="mt-4">
      <component :is="component" v-if="component"></component>
    </div>
  </VPanel>
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
