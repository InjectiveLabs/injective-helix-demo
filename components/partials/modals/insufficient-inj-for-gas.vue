<template>
  <!-- eslint-disable vue/no-v-html -->
  <VModal :is-open="isModalOpen" sm @modal-closed="closeModal">
    <h3 slot="title">
      {{ $t('insufficientGas.insufficientGas') }}
    </h3>

    <div class="relative">
      <i18n
        path="insufficientGas.insufficientGasNoteDescription"
        tag="p"
        class="text-left text-sm text-gray-100"
      >
        <template #faucetLink>
          <a
            target="_blank"
            class="text-primary-500 dark:text-primary-800"
            :href="faucetUrl"
            @click="closeModal"
          >
            {{ $t('insufficientGas.communityDrivenFaucet') }}
          </a>
        </template>

        <template #hubLink>
          <a
            target="_blank"
            class="text-primary-500 dark:text-primary-800"
            :href="hubUrl"
            @click="closeModal"
          >
            {{ $t('insufficientGas.injectiveHub') }}
          </a>
        </template>
      </i18n>

      <div class="mt-6 flex items-center justify-center">
        <a :href="hubUrl" target="_blank">
          <VButton
            type="button"
            md
            primary
            class="flex items-center whitespace-nowrap"
          >
            <span class="mr-2">{{ $t('insufficientGas.getFreeInj') }}</span>
            <IconExternalLink class="w-3 h-3" />
          </VButton>
        </a>
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
