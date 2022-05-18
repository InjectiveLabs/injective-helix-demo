<template>
  <!-- eslint-disable vue/no-v-html -->
  <v-modal :is-open="isModalOpen" sm mobile-only @modal-closed="closeModal">
    <div slot="header">aaa</div>

    <div class="flex flex-col h-full">
      <div class="flex-grow">Content goes here!</div>
      <div class="mt-6">
        <v-button
          type="button"
          md
          text
          class="whitespace-nowrap border border-primary-500 w-full"
          @click.stop="handleBack"
        >
          Back
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
      return this.$accessor.modal.modals[Modal.MobileSpotTradeFilter]
    }
  },

  methods: {
    closeModal() {
      this.$accessor.modal.closeModal(Modal.MobileSpotTradeFilter)
    },

    handleBack() {
      this.closeModal()
    }
  }
})
</script>
