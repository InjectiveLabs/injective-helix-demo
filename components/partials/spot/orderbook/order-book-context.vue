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
              {{ market.baseToken.symbol }}
            </span>
          </th>
          <th is="v-ui-table-th" class="w-1/3" right>
            <span>{{ $t('total') }}</span>
            <span class="font-bold text-white uppercase">
              {{ market.quoteToken.symbol }}
            </span>
          </th>
        </tr>
      </thead>
    </table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { UiSpotMarket } from '~/types'

export default Vue.extend({
  computed: {
    market(): UiSpotMarket | undefined {
      return this.$accessor.spot.market
    }
  }
})
</script>
