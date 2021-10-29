<template>
  <v-card-table-wrap>
    <component :is="component" v-if="component"></component>
  </v-card-table-wrap>
</template>

<script lang="ts">
import Vue from 'vue'
import Fees from './fees/index.vue'

const components = {
  fees: 'v-fees'
}

export default Vue.extend({
  components: {
    'v-fees': Fees
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
