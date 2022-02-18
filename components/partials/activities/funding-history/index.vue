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
import VFundingPayments from './funding-payments.vue'

const components = {
  fundingPayments: 'funding-payments'
}

export default Vue.extend({
  components: {
    VFundingPayments
  },

  data() {
    return {
      components,
      component: components.fundingPayments
    }
  }
})
</script>
