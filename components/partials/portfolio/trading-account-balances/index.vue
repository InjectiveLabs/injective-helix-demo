<template>
  <div>
    <div class="relative max-w-full">
      <v-positions
        v-if="component === components.positions"
        class="relative"
        v-bind="{ hideBalance }"
      />
      <v-balances
        v-if="component === components.balances"
        class="relative"
        v-bind="{
          subaccountBalanceWithTokenMarginAndPnlTotalBalanceInUsd,
          hideBalance
        }"
      />
    </div>

    <v-modal-add-margin />
    <portal to="portfolio-balance-sub-tabs">
      <div class="mt-3 flex items-center gap-6">
        <v-tab-selector-item v-model="component" :option="components.balances" data-cy="trading-account-balances-table-link">
          <span>{{ $t('portfolio.bankBalances') }}</span>
        </v-tab-selector-item>
        <div class="w-px h-4 bg-gray-500" />
        <v-tab-selector-item v-model="component" :option="components.positions" data-cy="trading-account-positions-table-link">
          <span>{{ $t('portfolio.positions') }}</span>
        </v-tab-selector-item>
      </div>
    </portal>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import VBalances from './balances.vue'
import VPositions from './positions.vue'
import VModalAddMargin from '~/components/partials/modals/add-margin/index.vue'
import VTabSelectorItem from '~/components/partials/portfolio/tab-selector-item.vue'
import { SubaccountBalanceWithTokenMarginAndPnlTotalBalanceInUsd } from '~/types'

const components = {
  balances: 'balances',
  positions: 'positions'
}

export default Vue.extend({
  components: {
    VBalances,
    VPositions,
    VModalAddMargin,
    VTabSelectorItem
  },

  props: {
    hideBalance: {
      type: Boolean,
      default: false
    },

    subaccountBalanceWithTokenMarginAndPnlTotalBalanceInUsd: {
      required: true,
      type: Array as PropType<
        SubaccountBalanceWithTokenMarginAndPnlTotalBalanceInUsd[]
      >
    }
  },

  data() {
    return {
      components,
      component: components.balances
    }
  }
})
</script>
