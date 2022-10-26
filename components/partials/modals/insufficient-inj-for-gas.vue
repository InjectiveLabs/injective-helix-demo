<template>
  <!-- eslint-disable vue/no-v-html -->
  <VModal :is-open="isModalOpen" sm @modal-closed="closeModal">
    <h3 slot="title">
      {{ $t('insufficientGas.insufficientGas') }}
    </h3>

    <InsufficientGasInner :hide-title="true" @close="closeModal" />
  </VModal>
</template>

<script lang="ts">
import Vue from 'vue'
import { Modal } from '~/types'
import InsufficientGasInner from '~/components/partials/common/elements/insufficient-gas-inner.vue'

export default Vue.extend({
  components: {
    InsufficientGasInner
  },

  computed: {
    isModalOpen(): boolean {
      return this.$accessor.modal.modals[Modal.InsufficientInjForGas]
    },

    faucetUrl(): string {
      return 'https://inj.supply/'
    },

    hubUrl(): string {
      return 'https://hub.injective.network/bridge'
    }
  },

  methods: {
    closeModal() {
      this.$accessor.modal.closeModal(Modal.InsufficientInjForGas)
    }
  }
})
</script>
