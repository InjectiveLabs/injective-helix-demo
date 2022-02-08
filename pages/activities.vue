<template>
  <div class="h-full w-full flex flex-wrap py-4">
    <div class="container">
      <div class="w-full mx-auto 3xl:w-10/12 4xl:w-4/5">
        <div class="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-12 gap-4">
          <v-card-select
            v-model="component"
            :option="components.spot"
            class="col-span-3"
          >
            {{ $t('activities.spotOrders') }}
          </v-card-select>
          <v-card-select
            v-model="component"
            :option="components.derivatives"
            class="col-span-3"
          >
            {{ $t('activities.derivativeOrders') }}
          </v-card-select>
          <v-card-select
            v-model="component"
            :option="components.earnHistory"
            class="col-span-3"
          >
            {{ $t('activities.earnHistory') }}
          </v-card-select>
          <v-card-select
            v-model="component"
            :option="components.transactionHistory"
            class="col-span-3"
          >
            {{ $t('activities.transactionHistory') }}
          </v-card-select>
        </div>
        <div class="mt-6 pt-6 border-t">
          <component :is="`v-${component}`"></component>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VSpot from '~/components/partials/activities/spot/index.vue'
import VDerivatives from '~/components/partials/activities/derivatives/index.vue'

const components = {
  spot: 'spot',
  derivatives: 'derivatives',
  earnHistory: 'earn-history',
  transactionHistory: 'transaction-history'
}

export default Vue.extend({
  components: {
    VSpot,
    VDerivatives
  },

  data() {
    return {
      components,
      component: components.spot
    }
  }
})
</script>
