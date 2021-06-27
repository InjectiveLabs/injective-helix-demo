<template>
  <div v-if="market" class="table-compact border-b h-8">
    <table class="table border-t">
      <thead>
        <tr>
          <th is="v-ui-table-th" class="w-1/3" right>
            <span>{{ $t('price') }}</span>
            <span class="font-bold text-white uppercase">
              {{ market.quoteToken.symbol }}
            </span>
          </th>
          <th is="v-ui-table-th" class="w-1/3" right>
            <span>{{ $t('amount') }}</span>
            <span class="font-bold text-white uppercase">
              {{ market.baseTokenMeta.symbol }}
            </span>
          </th>
          <th is="v-ui-table-th" class="w-1/3" right>
            <span>{{ $t('sum') }}</span>
            <span class="font-bold text-white uppercase">
              {{ market.baseTokenMeta.symbol }}
            </span>
          </th>
        </tr>
      </thead>
    </table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { UiDerivativeMarket } from '~/types'

export default Vue.extend({
  computed: {
    market(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    }
  }
})
</script>
