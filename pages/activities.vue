<template>
  <div class="h-full w-full flex flex-wrap py-4">
    <div class="container">
      <div class="w-full mx-auto 3xl:w-10/12 4xl:w-4/5">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <v-card-select
            v-model="component"
            :option="components.spot"
            class="col-span-1"
          >
            <span class="text-sm">
              {{ $t('activities.spotOrders') }}
            </span>
          </v-card-select>
          <v-card-select
            v-model="component"
            :option="components.derivatives"
            class="col-span-1"
          >
            <span class="text-sm">
              {{ $t('activities.derivativeOrders') }}
            </span>
          </v-card-select>
          <v-card-select
            v-model="component"
            :option="components.rewardHistory"
            class="col-span-1"
          >
            <span class="text-sm">
              {{ $t('activities.rewardHistory') }}
            </span>
          </v-card-select>
          <v-card-select
            v-model="component"
            :option="components.fundingHistory"
            class="col-span-1"
          >
            <span class="text-sm">
              {{ $t('activities.fundingHistory') }}
            </span>
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
import VFundingHistory from '~/components/partials/activities/funding-history/index.vue'
import VRewardHistory from '~/components/partials/activities/reward-history/index.vue'

const components = {
  spot: 'spot',
  derivatives: 'derivatives',
  rewardHistory: 'reward-history',
  fundingHistory: 'funding-history'
}

export default Vue.extend({
  components: {
    VSpot,
    VDerivatives,
    VFundingHistory,
    VRewardHistory
  },

  data() {
    return {
      components,
      component: components.spot
    }
  }
})
</script>
