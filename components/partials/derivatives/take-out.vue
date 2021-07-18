<template>
  <modal :is-open="isModalOpen" @closed="closeModal">
    <div v-if="market" class="w-full md:w-3xl flex flex-col shadow">
      <div class="my-6 flex flex-wrap">
        <div class="w-full mb-6 px-4">
          <h3 class="text-center text-2xl uppercase">
            {{ $t('take_out_modal_title') }}
          </h3>
          <p class="text-sm text-center opacity-90 mt-4">
            {{ $t('take_out_modal_note') }}
          </p>
        </div>
        <div class="w-full px-4">
          <h3 class="text-center text-base uppercase">
            {{ $t('take_out_asset', { asset: market.quoteToken.symbol }) }}
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
import VQuote from './take-out/quote.vue'
import ModalElement from '~/components/elements/modal.vue'
import { Modal } from '~/types/enums'
import { BankBalances, UiDerivativeMarket } from '~/types'
import { ZERO_IN_WEI } from '~/app/utils/constants'

export default Vue.extend({
  components: {
    modal: ModalElement,
    VQuote
  },

  computed: {
    market(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    },

    balances(): BankBalances {
      return this.$accessor.bank.balances
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
      return this.$accessor.modal.modals[Modal.TakeOut]
    }
  },

  methods: {
    closeModal() {
      this.$accessor.modal.closeModal(Modal.TakeOut)
    }
  }
})
</script>
