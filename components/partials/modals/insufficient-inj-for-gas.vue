<template>
  <!-- eslint-disable vue/no-v-html -->
  <v-modal :is-open="isModalOpen" sm @modal-closed="closeModal">
    <h3 slot="title">
      {{ $t('insufficientGas.insufficientGas') }}
    </h3>

    <div class="relative">
      <p
        class="text-left text-sm text-gray-100"
        v-text="$t('insufficientGas.insufficientGasNote')"
      ></p>
      <p
        class="text-left text-sm text-gray-100 mt-4"
        v-html="$t('insufficientGas.insufficientGasNote2', { hubUrl: hubUrl })"
      ></p>

      <div class="mt-6 flex items-center justify-center">
        <v-button
          type="button"
          md
          primary
          class="whitespace-nowrap"
          @click.stop="() => {}"
        >
          <a :href="hubUrl" target="_blank" class="flex items-center">
            <span class="mr-2">Injective Hub</span>
            <v-icon-external-link class="w-3 h-3" />
          </a>
        </v-button>
      </div>
    </div>
  </v-modal>
</template>

<script lang="ts">
import Vue from 'vue'
import { Modal } from '~/types'

export default Vue.extend({
  computed: {
    isModalOpen(): boolean {
      return this.$accessor.modal.modals[Modal.InsufficientInjForGas]
    },

    hubUrl(): string {
      return 'https://hub.injective.network/bridge'
    }
  },

  methods: {
    closeModal() {
      this.$accessor.modal.closeModal(Modal.InsufficientInjForGas)
    },

    handleConfirm() {
      this.closeModal()
      this.$emit('confirmed')
    },

    handleCancel() {
      this.closeModal()
    }
  }
})
</script>
