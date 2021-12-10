<template>
  <v-modal :is-open="isModalOpen" sm @modal-closed="closeModal">
    <h3 slot="title">
      {{ $t('white_list_title') }}
    </h3>

    <div class="relative -mt-6">
      <i18n path="white_list_body" tag="p">
        <template #link>
          <a
            href="https://injective.exchange/"
            class="cursor-pointer text-primary-500"
          >
            https://injective.exchange/
          </a>
        </template>
      </i18n>
    </div>
  </v-modal>
</template>

<script lang="ts">
import Vue from 'vue'
import { Modal } from '~/types'

export default Vue.extend({
  computed: {
    isModalOpen(): boolean {
      return this.$accessor.modal.modals[Modal.WhiteListOnly]
    }
  },

  methods: {
    closeModal() {
      this.$accessor.modal.closeModal(Modal.WhiteListOnly)
    }
  }
})
</script>
