<template>
  <div>
    <VModal
      :is-open="isModalOpen"
      sm
      hide-close-button
      @modal-closed="closeModal"
    >
      <h3 slot="title" class="normal-case">
        {{ $t('ninjaPass.congratulations') }}
      </h3>

      <div class="flex flex-col">
        <span class="text-sm mb-4">
          {{ $t('ninjaPass.description') }}
        </span>
        <span class="text-sm">
          {{ $t('ninjaPass.congratulations') }}
        </span>
        <div class="grid grid-cols-1 gap-4 mt-6 sm:grid-cols-2">
          <a
            :href="ninjaPassUrl"
            target="_blank"
            class="bg-blue-300 py-2 h-10 rounded border border-blue-300 flex items-center justify-center gap-2"
          >
            <span class="font-medium text-white">
              {{ $t('ninjaPass.verifyNow') }}
            </span>
            <IconExternalLink class="w-4 h-4 text-white" />
          </a>

          <button
            class="bg-transparent py-2 h-10 rounded border border-white"
            @click="closeModal"
          >
            <span class="font-medium text-white">
              {{ $t('ninjaPass.later') }}
            </span>
          </button>
        </div>
      </div>
    </VModal>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { APP_NINJA_PASS_API_ENDPOINT } from '~/app/utils/constants'
import { Modal } from '~/types'

export default Vue.extend({
  computed: {
    injAddress(): string {
      return this.$accessor.wallet.injectiveAddress
    },

    isModalOpen(): boolean {
      return this.$accessor.modal.modals[Modal.NinjaPassWinner]
    },

    hasCodes(): boolean {
      if (!this.$accessor.ninjapass.codes) {
        return false
      }

      return this.$accessor.ninjapass.codes.length > 0
    },

    ninjaPassCode(): string | undefined {
      if (!this.$accessor.ninjapass.codes) {
        return undefined
      }

      return this.$accessor.ninjapass.codes[0]
    },

    ninjaPassUrl(): string {
      const { ninjaPassCode, injAddress } = this

      const baseUrl = APP_NINJA_PASS_API_ENDPOINT

      if (!ninjaPassCode) {
        return baseUrl
      }

      return `${baseUrl}/?code=${ninjaPassCode}&address=${injAddress}`
    }
  },

  watch: {
    hasCodes: {
      handler(hasCodes: boolean) {
        if (hasCodes) {
          this.$accessor.modal.openModal({ type: Modal.NinjaPassWinner })
          this.$confetti.activate()
        }
      }
    }
  },

  methods: {
    closeModal() {
      this.$accessor.modal.closeModal(Modal.NinjaPassWinner)
    }
  }
})
</script>
