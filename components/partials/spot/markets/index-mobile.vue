<template>
  <div class="table-compact">
    <div class="table-responsive">
      <table class="table">
        <tbody>
          <tr
            is="v-spot"
            v-for="(market, index) in markets"
            :key="`spot-markets-${market.ticker}-${index}`"
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
import Spot from './spot-mobile.vue'
import { UiSpotMarket } from '~/types'

export default Vue.extend({
  components: {
    'v-spot': Spot
  },

  computed: {
    markets(): UiSpotMarket[] {
      return this.$accessor.spot.markets
    }
  }
})
</script>
