<template>
  <div class="flex-1">
    <div class="flex items-center justify-between">
      <div class="flex items-center justify-center">
        <v-button
          text-sm
          class="font-normal"
          @click.stop="onSelect(components.openPositions)"
        >
          <span>{{ $t('open_positions') }}</span>
        </v-button>
      </div>
    </div>

    <div class="bg-gray-900 px-4 py-2 rounded-lg mt-2 w-full">
      <component :is="component" v-if="component"></component>
    </div>
  </div>
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
