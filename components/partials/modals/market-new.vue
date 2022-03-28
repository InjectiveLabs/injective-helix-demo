<template>
  <v-modal :is-open="isModalOpen" has-blur-bg md @modal-closed="closeModal">
    <h3 slot="title">
      {{ $t('marketNew.title') }}
    </h3>

    <div class="relative">
      <p class="text-center text-sm text-gray-100" v-text="description"></p>

      <div class="mt-6 flex items-center justify-center">
        <v-button lg primary @click.stop="() => {}">
          <a
            :href="`https://hub.injective.network/bridge/?token=${token}`"
            target="_blank"
            class="flex items-center justify-center"
          >
            <span class="mr-2">{{ $t('marketNew.depositNow') }}</span>
            <v-icon-external-link class="w-3 h-3" />
          </a>
        </v-button>
      </div>
    </div>
  </v-modal>
</template>

<script lang="ts">
import { UiSpotMarketWithToken } from '@injectivelabs/ui-common'
import Vue from 'vue'
import { upcomingMarkets } from '~/app/data/market'
import { Modal } from '~/types'

export default Vue.extend({
  data() {
    const [upcomingMarket] = upcomingMarkets

    return {
      token: upcomingMarket.baseToken.symbol,
      denom: (upcomingMarket as UiSpotMarketWithToken).baseDenom,
      description: `The ${upcomingMarket.baseToken.symbol}/${upcomingMarket.quoteToken.symbol} spot market will launch soon. Meanwhile, deposit at least 1 $${upcomingMarket.baseToken.symbol} to get a chance to win an original Bored Ape Kennel Club NFT.`
    }
  },

  computed: {
    isModalOpen(): boolean {
      return this.$accessor.modal.modals[Modal.MarketNew]
    }
  },

  beforeDestroy() {
    this.$accessor.modal.closeModal(Modal.MarketNew)
  },

  methods: {
    closeModal() {
      this.$router.push({ name: 'index' })
    }
  }
})
</script>
