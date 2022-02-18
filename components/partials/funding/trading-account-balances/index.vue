<template>
  <div>
    <portal to="balances-tabs-filter">
      <div class="w-full mx-auto mb-2 -mt-3">
        <div class="flex flex-wrap items-center justify-center">
          <v-button-select
            v-model="component"
            :option="components.balances"
            text
          >
            {{ $t('activities.funds') }}
          </v-button-select>
          <div class="mx-2 w-px h-4 bg-gray-500"></div>
          <v-button-select
            v-model="component"
            :option="components.positions"
            text
          >
            {{ $t('activities.positions') }}
          </v-button-select>
        </div>
      </div>
    </portal>

    <div class="relative max-w-full">
      <component :is="`v-${component}`" v-bind="$attrs"></component>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VBalances from './balances.vue'
import VPositions from '~/components/partials/common/account/positions.vue'

const components = {
  balances: 'balances',
  positions: 'positions'
}

export default Vue.extend({
  components: {
    VBalances,
    VPositions
  },

  data() {
    return {
      components,
      component: components.balances
    }
  }
})
</script>
