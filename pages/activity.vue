<template>
  <div class="h-full w-full absolute pt-6 sm:pb-8">
    <div class="h-full">
      <div
        class="h-full w-full mx-auto px-6 3xl:px-0 3xl:w-11/12 4xl:w-10/12 flex flex-col"
      >
        <div class="overflow-x-auto hide-scrollbar min-h-[48px]">
          <div class="flex lg:grid grid-cols-4 gap-4">
            <VCardSelect
              v-model="component"
              data-cy="activity-open-positions-panel"
              :option="components.positions"
              :status="positionLoadingStatus"
            >
              <portal-target
                slot="icon"
                name="activity-card-position-count"
                data-cy="activity-open-positions-panel-count"
              />
              <span class="text-sm whitespace-nowrap">
                {{ $t('activity.positions') }}
              </span>
            </VCardSelect>
            <VCardSelect
              v-model="component"
              data-cy="activity-spot-orders-panel"
              :option="components.spot"
              :status="spotLoadingStatus"
            >
              <portal-target
                slot="icon"
                name="activity-card-spot-count"
                data-cy="activity-spot-orders-panel-count"
              />
              <span class="text-sm whitespace-nowrap">
                {{ $t('activity.spotOrders') }}
              </span>
            </VCardSelect>
            <VCardSelect
              v-model="component"
              data-cy="activity-derivatives-orders-panel"
              :option="components.derivatives"
              :status="derivativeLoadingStatus"
            >
              <portal-target
                slot="icon"
                name="activity-card-derivative-count"
                data-cy="activity-derivatives-orders-panel-count"
              />
              <span class="text-sm whitespace-nowrap">
                {{ $t('activity.derivativeOrders') }}
              </span>
            </VCardSelect>
            <VCardSelect
              v-if="false"
              v-model="component"
              :option="components.rewardHistory"
            >
              <span class="text-sm whitespace-nowrap">
                {{ $t('activity.rewardHistory') }}
              </span>
            </VCardSelect>
            <VCardSelect
              v-model="component"
              :option="components.funding"
              data-cy="activity-wallet-history-panel"
            >
              <IconWallet slot="icon" class="w-3 md:w-3.5 h-auto" />
              <span class="text-sm whitespace-nowrap">
                {{ $t('activity.walletHistory') }}
              </span>
            </VCardSelect>
          </div>
        </div>
        <HocLoading :status="status">
          <div
            class="mt-4 pt-4 pb-8 sm:pb-0 xs:mt-6 xs:pt-6 border-t flex-grow"
          >
            <v-positions v-show="component === components.positions" />
            <v-spot v-show="component === components.spot" />
            <v-derivatives v-show="component === components.derivatives" />
            <v-funding v-if="component === components.funding" />
          </div>
        </HocLoading>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import VPositions from '~/components/partials/activity/positions/index.vue'
import VSpot from '~/components/partials/activity/spot/index.vue'
import VDerivatives from '~/components/partials/activity/derivatives/index.vue'
import VFunding from '~/components/partials/activity/wallet-history/index.vue'
// import VRewardHistory from '~/components/partials/activity/reward-history/index.vue'

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
    VFunding
  },

  data() {
    return {
      components,
      component: components.positions,
      derivativeLoadingStatus: new Status(StatusType.Loading),
      positionLoadingStatus: new Status(StatusType.Loading),
      spotLoadingStatus: new Status(StatusType.Loading),
      status: new Status(StatusType.Loading)
    }
  },

  mounted() {
    this.$root.$on('derivative-tab-loaded', this.derivativeTabLoaded)
    this.$root.$on('position-tab-loaded', this.positionTabLoaded)
    this.$root.$on('spot-tab-loaded', this.spotTabLoaded)

    Promise.all([
      this.$accessor.account.init(),
      this.$accessor.activity.fetchSupportedTokens()
    ])
      .then(() => {
        //
      })
      .catch(this.$onRejected)
      .finally(() => {
        this.status.setIdle()
      })
  },

  beforeDestroy() {
    this.$root.$off('derivative-tab-loaded', this.derivativeTabLoaded)
    this.$root.$off('position-tab-loaded', this.positionTabLoaded)
    this.$root.$off('spot-tab-loaded', this.spotTabLoaded)

    this.$accessor.app.cancelAllStreams()
  },

  methods: {
    derivativeTabLoaded() {
      this.derivativeLoadingStatus.setIdle()
    },

    positionTabLoaded() {
      this.positionLoadingStatus.setIdle()
    },

    spotTabLoaded() {
      this.spotLoadingStatus.setIdle()
    }
  }
})
</script>
