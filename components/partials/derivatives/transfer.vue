<template>
  <modal :is-open="isModalOpen" @closed="closeModal">
    <div v-if="market" class="w-full md:w-xl flex flex-col shadow min-h-3xs">
      <HOCLoading :status="status">
        <div v-if="quoteTokenWithBalance" class="my-6 flex flex-wrap">
          <div class="w-full mb-6 px-4">
            <h3 class="text-center text-2xl uppercase">
              {{ $t('transfer_modal_title') }}
            </h3>
            <p class="text-sm text-center opacity-90 mt-4">
              {{ $t('transfer_modal_note') }}
            </p>
          </div>
          <div class="w-full px-4">
            <h3 class="text-center text-base uppercase">
              {{ $t('transfer_asset', { asset: market.quoteToken.symbol }) }}
            </h3>
            <v-quote :token="quoteTokenWithBalance" />
          </div>
        </div>
      </HOCLoading>
    </div>
  </modal>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import VQuote from './transfer/quote.vue'
import ModalElement from '~/components/elements/modal.vue'
import { UiDerivativeMarket, Modal, TokenWithBalance } from '~/types'
import HOCLoading from '~/components/elements/with-loading.vue'

export default Vue.extend({
  components: {
    modal: ModalElement,
    HOCLoading,
    VQuote
  },

  data() {
    return {
      status: new Status(StatusType.Loading)
    }
  },

  computed: {
    market(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    },

    quoteTokenWithBalance(): TokenWithBalance | undefined {
      return this.$accessor.token.quoteTokenWithBalance
    },

    isModalOpen(): boolean {
      return this.$accessor.modal.modals[Modal.Transfer]
    }
  },

  mounted() {
    this.getTokenBalanceAndAllowanceForMarket()
  },

  methods: {
    getTokenBalanceAndAllowanceForMarket() {
      this.$accessor.token
        .getTokenBalanceAndAllowanceForDerivativeMarket()
        .then(() => {
          //
        })
        .catch(this.$onRejected)
        .finally(() => {
          this.status.setIdle()
        })
    },

    closeModal() {
      this.$accessor.modal.closeModal(Modal.Transfer)
    }
  }
})
</script>
