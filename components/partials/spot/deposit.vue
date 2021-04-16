<template>
  <modal :is-open="isModalOpen" @closed="closeModal">
    <div class="w-full md:w-3xl flex flex-col shadow">
      <div class="my-6 flex flex-wrap">
        <div class="w-full lg:w-1/2 px-4">
          <h3 class="text-center text-2xl uppercase">
            {{ $t('wallet.deposit') }}
          </h3>
          <p class="text-sm text-center opacity-90 mt-4">
            {{ $t('wallet.deposit_note') }}
          </p>
          <deposit />
        </div>
        <div class="w-full lg:w-1/2 lg:border-l px-4">
          <h3 class="text-center text-2xl uppercase">
            {{ $t('wallet.withdraw') }}
          </h3>
          <p class="text-sm text-center opacity-90 mt-4">
            {{ $t('wallet.withdraw_note') }}
          </p>
          <withdraw />
        </div>
      </div>
    </div>
  </modal>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import deposit from './deposit/deposit.vue'
import withdraw from './deposit/withdraw.vue'
import TokenLock from '~/components/elements/token-lock.vue'
import ModalElement from '~/components/elements/modal.vue'
import { UiSpotMarket, Modal } from '~/types'

// TODO: Unlock from Testnet/Mainnet, transfer through peggy and get balance

export default Vue.extend({
  components: {
    modal: ModalElement,
    deposit,
    withdraw,
    'v-token-lock': TokenLock
  },

  props: {
    market: {
      required: true,
      type: Object as PropType<UiSpotMarket>
    }
  },

  computed: {
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
