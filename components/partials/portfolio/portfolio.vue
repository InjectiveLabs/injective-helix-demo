<template>
  <v-card-table-wrap :bg-lighter="component === components.summary">
    <template #filters>
      <v-button-filter v-model="component" :option="components.summary">
        <span>
          {{ $t('portfolio_summary') }}
        </span>
      </v-button-filter>
      <v-separator />
      <v-button-filter v-model="component" :option="components.holdings">
        <span>
          {{ $t('subaccount_holdings') }}
        </span>
      </v-button-filter>
    </template>
    <component :is="component" v-if="component"></component>
  </v-card-table-wrap>
</template>

<script lang="ts">
import Vue from 'vue'
import Summary from './summary/index.vue'
import Holdings from './holdings/index.vue'
const components = {
  holdings: 'v-holdings',
  summary: 'v-summary'
}

export default Vue.extend({
  components: {
    'v-holdings': Holdings,
    'v-summary': Summary
  },

  data() {
    return {
      components,
      component: components.summary
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    }
  },

  methods: {
    onSelect(component: string) {
      this.component = component
    }
  }
})
</script>
