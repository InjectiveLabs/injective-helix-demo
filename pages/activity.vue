<template>
  <div class="h-full w-full absolute pt-6 pb-8">
    <div class="h-full">
      <div
        class="h-full w-full mx-auto px-6 3xl:px-0 3xl:w-11/12 4xl:w-10/12 flex flex-col"
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <v-card-select
            v-model="component"
            :option="components.positions"
            class="col-span-1"
          >
            <span class="text-sm">
              {{ $t('activity.positions') }}
            </span>
          </v-card-select>
          <v-card-select
            v-model="component"
            :option="components.spot"
            class="col-span-1"
          >
            <span class="text-sm">
              {{ $t('activity.spotOrders') }}
            </span>
          </v-card-select>
          <v-card-select
            v-model="component"
            :option="components.derivatives"
            class="col-span-1"
          >
            <span class="text-sm">
              {{ $t('activity.derivativeOrders') }}
            </span>
          </v-card-select>
          <v-card-select
            v-if="false"
            v-model="component"
            :option="components.rewardHistory"
            class="col-span-1"
          >
            <span class="text-sm">
              {{ $t('activity.rewardHistory') }}
            </span>
          </v-card-select>
          <v-card-select
            v-model="component"
            :option="components.funding"
            class="col-span-1"
          >
            <span class="text-sm">
              {{ $t('activity.walletHistory') }}
            </span>
          </v-card-select>
        </div>
        <div class="mt-6 pt-6 border-t grow">
          <component :is="`v-${component}`"></component>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VPositions from '~/components/partials/activity/positions/index.vue'
import VSpot from '~/components/partials/activity/spot/index.vue'
import VDerivatives from '~/components/partials/activity/derivatives/index.vue'
import VFunding from '~/components/partials/activity/wallet-history/index.vue'
import VRewardHistory from '~/components/partials/activity/reward-history/index.vue'

const components = {
  positions: 'positions',
  spot: 'spot',
  derivatives: 'derivatives',
  rewardHistory: 'reward-history',
  funding: 'funding'
}

export default Vue.extend({
  components: {
    VPositions,
    VSpot,
    VDerivatives,
    VFunding,
    VRewardHistory
  },

  data() {
    return {
      components,
      component: components.positions
    }
  }
})
</script>
