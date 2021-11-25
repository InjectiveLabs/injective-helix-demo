<template>
  <div>
    <h3 class="text-xl font-bold text-gray-200">
      {{ $t('dmm.resource.title') }}
    </h3>

    <div class="mt-4">
      <div class="grid grid-cols-4 md:grid-cols-12 gap-4 lg:gap-6 mt-6">
        <v-card class="col-span-4 lg:p-4">
          <div class="flex">
            <div>
              <p class="text-lg text-gray-200 font-bold">
                {{ $t('dmm.resource.rewardFactors') }}
              </p>
              <p class="text-sm text-gray-500 my-4">
                {{ $t('dmm.resource.rewardsFactorsDescription') }}
              </p>
              <v-button primary text @click="showMarketRewardModal">
                <span class="text-sm font-normal">
                  {{ $t('dmm.resource.learnMore') }}
                </span>
              </v-button>
            </div>
            <div>
              <LogoMini class="h-6 w-6" />
            </div>
          </div>
        </v-card>
      </div>
    </div>

    <VMarketMakerModal />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VMarketMakerModal from './market-reward-modal.vue'
import LogoMini from '~/components/elements/logo-mini.vue'
import { Modal } from '~/types'

export default Vue.extend({
  components: {
    LogoMini,
    VMarketMakerModal
  },

  methods: {
    showMarketRewardModal() {
      this.$accessor.modal.openModal(Modal.MarketRewardFactors)
    }
  }
})
</script>
