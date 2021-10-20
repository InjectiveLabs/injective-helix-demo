<template>
  <v-modal :is-open="isModalOpen" @modal-closed="closeModal">
    <h3 slot="title">
      {{ $t('Confirm order execution') }}
    </h3>

    <div class="relative">
      <p>
        {{
          $t('high_execution_price_deviation_warning_note', {
            percentage: DEFAULT_PRICE_WARNING_DEVIATION
          })
        }}
      </p>
      <div class="mt-6 flex items-center justify-center">
        <v-button lg class="mr-4" primary @click.stop="handleConfirm">
          {{ $t('confirm') }}
        </v-button>
        <v-button lg class="mr-4" red @click.stop="handleCancel">
          {{ $t('cancel') }}
        </v-button>
        <v-button text-xs @click.stop="handleCancelAndSavePreference">
          {{ $t('cancel_and_save_preference') }}
        </v-button>
      </div>
    </div>
  </v-modal>
</template>

<script lang="ts">
import Vue from 'vue'
import { DEFAULT_PRICE_WARNING_DEVIATION } from '~/app/utils/constants'
import { Modal } from '~/types'

export default Vue.extend({
  data() {
    return {
      DEFAULT_PRICE_WARNING_DEVIATION
    }
  },

  computed: {
    isModalOpen(): boolean {
      return this.$accessor.modal.modals[Modal.OrderConfirm]
    }
  },

  methods: {
    closeModal() {
      this.$accessor.modal.closeModal(Modal.OrderConfirm)
    },

    handleConfirm() {
      this.$emit('confirmed')
      this.closeModal()
    },

    handleCancel() {
      this.closeModal()
    },

    handleCancelAndSavePreference() {
      this.$emit('disabled')
      this.closeModal()
    }
  }
})
</script>
