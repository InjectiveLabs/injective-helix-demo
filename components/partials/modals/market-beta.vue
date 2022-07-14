<template>
  <VModal :is-open="isModalOpen" is-always-open sm @modal-closed="closeModal">
    <h3 slot="title">
      {{ $t('marketBeta.title') }}
    </h3>

    <div class="relative">
      <p
        class="text-center text-sm text-gray-100"
        v-text="$t('marketBeta.description')"
      ></p>

      <div class="mt-6 flex items-center justify-center">
        <VButton lg primary @click.stop="handleConfirm">
          {{ $t('marketBeta.I Understand') }}
        </VButton>
      </div>
    </div>
  </VModal>
</template>

<script lang="ts">
import Vue from 'vue'
import { Modal } from '~/types'

export default Vue.extend({
  computed: {
    isModalOpen(): boolean {
      return this.$accessor.modal.modals[Modal.MarketBeta]
    }
  },

  methods: {
    closeModal() {
      this.$accessor.modal.closeModal(Modal.MarketBeta)
    },

    handleConfirm() {
      this.closeModal()
      this.$emit('confirmed')
    },

    handleCancel() {
      //
    }
  }
})
</script>
