<template>
  <div>
    <div class="relative max-w-full">
      <Positions
        v-if="component === components.positions"
        class="relative"
        v-bind="{ hideBalance }"
      />
      <Balances
        v-if="component === components.balances"
        class="relative"
        v-bind="{
          subaccountBalanceWithTokenMarginAndPnlTotalBalanceInUsd,
          hideBalance
        }"
      />
    </div>

    <VModalAddMargin />
    <portal to="portfolio-balance-sub-tabs">
      <div class="mt-3 flex items-center gap-6">
        <TabSelectorItem
          v-model="component"
          :option="components.balances"
          data-cy="trading-account-balances-table-link"
        >
          <span>{{ $t('portfolio.bankBalances') }}</span>
        </TabSelectorItem>
        <div class="w-px h-4 bg-gray-500" />
        <TabSelectorItem
          v-model="component"
          :option="components.positions"
          data-cy="trading-account-positions-table-link"
        >
          <span>{{ $t('portfolio.positions') }}</span>
        </TabSelectorItem>
      </div>
    </portal>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Balances from './balances.vue'
import Positions from './positions.vue'
import VModalAddMargin from '~/components/partials/modals/add-margin/index.vue'
import TabSelectorItem from '~/components/partials/portfolio/tab-selector-item.vue'
import { SubaccountBalanceWithTokenMarginAndPnlTotalBalanceInUsd } from '~/types'

const components = {
  balances: 'balances',
  positions: 'positions'
}

export default Vue.extend({
  components: {
    Balances,
    Positions,
    VModalAddMargin,
    TabSelectorItem
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
