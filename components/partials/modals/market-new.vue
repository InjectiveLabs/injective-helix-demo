<template>
  <v-modal
    :is-open="isModalOpen"
    is-always-open
    has-blur-bg
    md
    @modal-closed="closeModal"
  >
    <h3 slot="title">
      {{ $t('marketNew.title') }}
    </h3>

    <div class="relative">
      <p
        class="text-center text-sm text-gray-100"
        v-text="$t('marketNew.description', { asset: token, description })"
      ></p>

      <div class="mt-6 flex items-center justify-center">
        <v-button lg primary @click.stop="handleConfirm">
          {{ $t('marketNew.depositNow') }}
        </v-button>
      </div>
    </div>
  </v-modal>
</template>

<script lang="ts">
import Vue from 'vue'
import { upcomingMarkets } from '~/app/data/market'
import { BridgeType, Modal } from '~/types'

export default Vue.extend({
  data() {
    const [upcomingMarket] = upcomingMarkets

    return {
      token: upcomingMarket.baseToken.symbol,
      denom: upcomingMarket.baseDenom,
      description: `The spot market for $${upcomingMarket.baseToken.symbol}/${upcomingMarket.quoteToken.symbol} will launch soon! Meanwhile, deposit at least 1 $${upcomingMarket.baseToken.symbol} to get a chance to win an original Bored Ape Kennel Club NFT.`
    }
  },

  computed: {
    isModalOpen(): boolean {
      return this.$accessor.modal.modals[Modal.MarketNew]
    }
  },

  methods: {
    closeModal() {
      this.$accessor.modal.closeModal(Modal.MarketNew)
    },

    handleConfirm() {
      this.$router.push({
        name: 'portfolio',
        query: {
          token: this.token,
          denom: this.denom,
          bridgeType: BridgeType.Deposit
        }
      })
    },

    handleCancel() {
      //
    }
  }
})
</script>
