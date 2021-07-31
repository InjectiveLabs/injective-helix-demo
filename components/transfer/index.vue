<template>
  <modal :is-open="isModalOpen" @closed="closeModal">
    <div class="w-full md:w-xl flex flex-col shadow">
      <div class="my-6 flex flex-wrap">
        <div class="w-full mb-6 px-4">
          <h3 class="text-center text-2xl uppercase">
            {{ $t('transfer_on_chain_title') }}
          </h3>
          <p class="text-sm text-center opacity-90 mt-4">
            {{ $t('transfer_on_chain_note') }}
          </p>
        </div>
        <div class="w-full px-4">
          <v-form :balances="balances" />
        </div>
      </div>
    </div>
  </modal>
</template>

<script lang="ts">
import Vue from 'vue'
import Form from './form.vue'
import ModalElement from '~/components/elements/modal.vue'
import { Modal } from '~/types/enums'
import { BankBalanceWithTokenMetaData } from '~/types'

export default Vue.extend({
  components: {
    modal: ModalElement,
    'v-form': Form
  },

  computed: {
    balances(): BankBalanceWithTokenMetaData[] {
      return this.$accessor.bank.balancesWithTokenMetaData
    },

    isModalOpen(): boolean {
      return this.$accessor.modal.modals[Modal.TransferOnChain]
    }
  },

  methods: {
    closeModal() {
      this.$accessor.modal.closeModal(Modal.TransferOnChain)
    }
  }
})
</script>
