<template>
  <VModal
    :is-open="isModalOpen"
    data-cy="price-deviation-modal"
    @modal-closed="closeModal"
  >
    <h3 slot="title">
      {{ $t('trade.confirmOrderExecution') }}
    </h3>

    <div class="relative">
      <p>
        {{
          $t('trade.high_execution_price_deviation_warning_note', {
            percentage: DEFAULT_PRICE_WARNING_DEVIATION
          })
        }}
      </p>
      <div class="mt-6 flex items-center justify-center">
        <VButton
          lg
          class="mr-4"
          primary
          data-cy="price-deviation-modal-confirm-button"
          @click.stop="handleConfirm"
        >
          {{ $t('common.confirm') }}
        </VButton>
        <VButton lg class="mr-4" red @click.stop="handleCancel">
          {{ $t('common.cancel') }}
        </VButton>
      </div>
    </div>
  </VModal>
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
    }
  }
})
</script>
