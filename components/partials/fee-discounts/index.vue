<template>
  <VCardTableWrap>
    <component :is="component" v-if="component"></component>
  </VCardTableWrap>
</template>

<script lang="ts">
import Vue from 'vue'
import Fees from './fees/index.vue'

const components = {
  fees: 'Fees'
}

export default Vue.extend({
  components: {
    Fees
  },

  data() {
    return {
      components,
      component: components.fees
    }
  },

  methods: {
    onSelect(component: string) {
      this.component = component
    }
  }
})
</script>
