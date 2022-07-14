<template>
  <!-- eslint-disable vue/no-v-html -->
  <VModal :is-open="isModalOpen" @modal-closed="closeModal">
    <h3 slot="title">
      {{ $t('Acknowledge Terms') }}
    </h3>

    <div class="relative">
      <p
        class="text-left text-sm text-gray-100 pt-6"
        v-html="$t('disclaimer_note')"
      ></p>
      <ul class="p-4 bg-gray-900 mt-6 text-xs text-gray-300 rounded-lg">
        <li class="font-bold text-gray-200">
          {{ $t('acknowledge_title') }}
        </li>
        <li class="mt-2">
          {{ $t('acknowledge_1') }}
        </li>
        <li class="mt-2">
          {{ $t('acknowledge_2') }}
        </li>
        <li class="mt-2">
          {{ $t('acknowledge_3') }}
        </li>
        <li class="mt-2">
          {{ $t('acknowledge_4') }}
        </li>
        <li class="mt-2">
          {{ $t('acknowledge_5') }}
        </li>
      </ul>
      <div class="mt-6 flex items-center justify-center">
        <VButton lg class="mr-4" primary @click.stop="handleConfirm">
          {{ $t('common.confirm') }}
        </VButton>
        <VButton lg class="mr-4" text-red @click.stop="handleCancel">
          {{ $t('common.cancel') }}
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
      return this.$accessor.modal.modals[Modal.Terms]
    }
  },

  methods: {
    closeModal() {
      this.$accessor.modal.closeModal(Modal.Terms)
    },

    handleConfirm() {
      this.$root.$emit('terms-confirmed')
      this.closeModal()
    },

    handleCancel() {
      this.closeModal()
    }
  }
})
</script>
