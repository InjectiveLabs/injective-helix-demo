<template>
  <div>
    <div class="relative max-w-full">
      <component
        :is="`v-${tradingAccountComponent}`"
        v-bind="$attrs"
      ></component>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VBalances from './balances.vue'
import VPositions from '~/components/partials/common/account/positions.vue'

export default Vue.extend({
  components: {
    VBalances,
    VPositions
  },

  props: {
    tradingAccountComponent: {
      type: String,
      required: true
    },

    tradingAccountComponents: {
      type: Array,
      required: true
    }
  }
})
</script>
