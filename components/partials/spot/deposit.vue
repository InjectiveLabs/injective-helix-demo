<template>
  <modal :is-open="isModalOpen" @closed="closeModal">
    <div v-if="market" class="w-full md:w-3xl flex flex-col shadow">
      <div class="my-6 flex flex-wrap">
        <div class="w-full mb-6 px-4">
          <h3 class="text-center text-2xl uppercase">
            {{ $t('deposit_modal_title') }}
          </h3>
          <p class="text-sm text-center opacity-90 mt-4">
            {{ $t('deposit_modal_note') }}
          </p>
        </div>
        <div class="w-full mb-2 lg:w-1/2 px-4">
          <h3 class="text-center text-base uppercase">
            {{ $t('deposit_asset', { asset: market.baseToken.symbol }) }}
          </h3>
          <v-base :balance="baseTokenBalance" />
        </div>
        <div class="w-full lg:w-1/2 lg:border-l px-4">
          <h3 class="text-center text-base uppercase">
            {{ $t('deposit_asset', { asset: market.quoteToken.symbol }) }}
          </h3>
          <v-quote :balance="quoteTokenBalance" />
        </div>
      </div>
    </div>
  </modal>
</template>

<script lang="ts">
import Vue from 'vue'
import { BigNumberInWei } from '@injectivelabs/utils'
import VBase from './deposit/base.vue'
import VQuote from './deposit/quote.vue'
import ModalElement from '~/components/elements/modal.vue'
import { Modal } from '~/types/enums'
import { BankBalances, UiSpotMarket } from '~/types'
import { ZERO_IN_WEI } from '~/app/utils/constants'

export default Vue.extend({
  components: {
    modal: ModalElement,
    VBase,
    VQuote
  },

  computed: {
    market(): UiSpotMarket | undefined {
      return this.$accessor.spot.market
    },

    balances(): BankBalances {
      return this.$accessor.bank.balances
    },

    baseTokenBalance(): BigNumberInWei {
      const { balances, market } = this

      if (!market) {
        return ZERO_IN_WEI
      }

      if (!balances[market.baseDenom]) {
        return ZERO_IN_WEI
      }

      return new BigNumberInWei(balances[market.baseDenom] || 0)
    },

    quoteTokenBalance(): BigNumberInWei {
      const { balances, market } = this

      if (!market) {
        return ZERO_IN_WEI
      }

      if (!balances[market.quoteDenom]) {
        return ZERO_IN_WEI
      }

      return new BigNumberInWei(balances[market.quoteDenom] || 0)
    },

    isModalOpen(): boolean {
      return this.$accessor.modal.modals[Modal.Deposit]
    }
  },

  methods: {
    closeModal() {
      this.$accessor.modal.closeModal(Modal.Deposit)
    }
  }
})
</script>
