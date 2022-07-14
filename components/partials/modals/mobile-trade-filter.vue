<template>
  <VModal :is-open="isModalOpen" sm mobile-only @modal-closed="closeModal">
    <div slot="header" class="flex items-center justify-between">
      <div class="flex items-center gap-3 cursor-pointer" @click="handleBack">
        <IconArrow class="w-6 h-auto" />
        <span class="font-bold text-lg">{{ $t('common.filters') }}</span>
      </div>

      <span class="text-sm cursor-pointer" @click="handleClearAll">
        {{ $t('trade.clearAll') }}
      </span>
    </div>

    <div class="flex flex-col h-full flex-grow">
      <div class="flex-grow">
        <div class="bg-gray-900 mb-2">
          <FilterSelector
            :type="TradeSelectorType.Type"
            :value="type"
            @click="handleTypeClick"
          >
            <span slot="label" class="text-gray-200 capitalize">
              {{ $t('trade.type') }}
            </span>
          </FilterSelector>
        </div>

        <div class="bg-gray-900">
          <FilterSelector
            :type="TradeSelectorType.Side"
            :value="side"
            @click="handleSideClick"
          >
            <span slot="label" class="text-gray-200 capitalize">
              {{ $t('trade.side') }}
            </span>
          </FilterSelector>
        </div>
      </div>
      <div class="mt-6">
        <VButton
          type="button"
          md
          text
          class="border border-primary-500 w-full border-opacity-50 hover:border-opacity-100"
          @click.stop="handleBack"
        >
          Back
        </VButton>
      </div>
    </div>
  </VModal>
</template>

<script lang="ts">
import Vue from 'vue'
import FilterSelector from '~/components/partials/common/elements/filter-selector.vue'
import { Modal } from '~/types'
import { TradeSelectorType } from '~/types/enums'

export default Vue.extend({
  components: {
    FilterSelector
  },

  props: {
    type: {
      type: String,
      default: undefined
    },

    side: {
      type: String,
      default: undefined
    }
  },

  data() {
    return {
      TradeSelectorType
    }
  },

  computed: {
    isModalOpen(): boolean {
      return this.$accessor.modal.modals[Modal.MobileTradeFilter]
    }
  },

  methods: {
    closeModal() {
      this.$accessor.modal.closeModal(Modal.MobileTradeFilter)
    },

    handleBack() {
      this.closeModal()
    },

    handleClearAll() {
      this.$emit('type:update', undefined)
      this.$emit('side:update', undefined)
    },

    handleTypeClick(type: string | undefined) {
      this.$emit('type:update', type)
    },

    handleSideClick(side: string | undefined) {
      this.$emit('side:update', side)
    }
  }
})
</script>
