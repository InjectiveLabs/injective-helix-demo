<template>
  <modal :is-open="isModalOpen" @closed="closeModal">
    <div v-if="market" class="w-full md:w-3xl flex flex-col shadow min-h-3xs">
      <HOCLoading :status="status">
        <div
          v-if="baseTokenWithBalance && quoteTokenWithBalance"
          class="my-6 flex flex-wrap"
        >
          <div class="w-full mb-6 px-4">
            <h3 class="text-center text-2xl uppercase">
              {{ $t('transfer_modal_title') }}
            </h3>
            <p class="text-sm text-center opacity-90 mt-4">
              {{ $t('transfer_modal_note') }}
            </p>
          </div>
          <div class="w-full mb-2 lg:w-1/2 px-4">
            <h3 class="text-center text-base uppercase">
              {{ $t('transfer_asset', { asset: market.baseToken.symbol }) }}
            </h3>
            <v-base :token="baseTokenWithBalance" />
          </div>
          <div class="w-full lg:w-1/2 lg:border-l px-4">
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
import VBase from './transfer/base.vue'
import VQuote from './transfer/quote.vue'
import ModalElement from '~/components/elements/modal.vue'
import { UiSpotMarket, Modal, TokenWithBalance } from '~/types'
import HOCLoading from '~/components/elements/with-loading.vue'

export default Vue.extend({
  components: {
    modal: ModalElement,
    HOCLoading,
    VBase,
    VQuote
  },

  data() {
    return {
      status: new Status(StatusType.Loading)
    }
  },

  computed: {
    market(): UiSpotMarket | undefined {
      return this.$accessor.spot.market
    },

    baseTokenWithBalance(): TokenWithBalance | undefined {
      return this.$accessor.token.baseTokenWithBalance
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
        .getTokenBalanceAndAllowanceForMarket()
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
