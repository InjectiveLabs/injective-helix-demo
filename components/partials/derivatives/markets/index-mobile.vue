<template>
  <div class="table-compact">
    <div class="table-responsive">
      <table class="table">
        <tbody>
          <tr
            is="v-derivative"
            v-for="(market, index) in markets"
            :key="`derivative-markets-${market.ticker}-${index}`"
            v-bind="{ market }"
            @selected="$emit('selected')"
          ></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Derivative from './derivative-mobile.vue'
import { UiDerivativeMarket } from '~/types'

export default Vue.extend({
  components: {
    'v-derivative': Derivative
  },

  computed: {
    markets(): UiDerivativeMarket[] {
      return this.$accessor.derivatives.markets
    }
  }
})
</script>
