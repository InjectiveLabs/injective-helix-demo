<template>
  <div class="h-full w-full flex flex-wrap py-4">
    <div class="w-full mx-auto">
      <div class="relative">
        <component :is="`v-${component}`"></component>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VTradingRewards from './trading-rewards.vue'

const components = {
  tradingRewards: 'trading-rewards'
}

export default Vue.extend({
  components: {
    VTradingRewards
  },

  data() {
    return {
      components,
      component: components.tradingRewards
    }
  }
})
</script>
