<template>
  <v-card-table-wrap>
    <template #filters>
      <v-button-filter v-model="component" :option="components.openPositions">
        <span>
          {{ $t('open_positions') }}
        </span>
      </v-button-filter>
    </template>
    <component :is="component" v-if="component"></component>
  </v-card-table-wrap>
</template>

<script lang="ts">
import Vue from 'vue'
import OpenPositions from './positions/index.vue'

const components = {
  openPositions: 'v-open-positions'
}

export default Vue.extend({
  components: {
    'v-open-positions': OpenPositions
  },

  data() {
    return {
      components,
      component: components.openPositions
    }
  },

  methods: {
    onSelect(component: string) {
      this.component = component
    }
  }
})
</script>
