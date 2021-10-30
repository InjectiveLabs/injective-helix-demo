<template>
  <v-card-table-wrap>
    <template #filters>
      <v-button-filter v-model="component" :option="components.rewards">
        <span> {{ $t('Rewards') }} </span>
      </v-button-filter>
      <v-separator />
      <v-button-filter v-model="component" :option="components.calculator">
        <span> {{ $t('calculator') }} </span>
      </v-button-filter>
    </template>

    <component :is="component" v-if="component"></component>
  </v-card-table-wrap>
</template>

<script lang="ts">
import Vue from 'vue'
import VRewards from './past/rewards/index.vue'
import VWithdrawals from './past/calculator.vue'

const components = {
  rewards: 'v-rewards',
  calculator: 'v-calculator'
}

export default Vue.extend({
  components: {
    'v-rewards': VRewards,
    'v-calculator': VWithdrawals
  },

  data() {
    return {
      components,
      component: components.rewards
    }
  },

  computed: {
    //
  },

  methods: {
    onSelect(component: string) {
      this.component = component
    }
  }
})
</script>
