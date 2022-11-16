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
          {{ $t('ninjaPass.title') }}
        </span>
        <span class="text-sm">
          {{ $t('ninjaPass.description') }}
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

    codes(): { address: string; code: string }[] {
      return this.$accessor.ninjapass.codes
    },

    isModalOpen(): boolean {
      return this.$accessor.modal.modals[Modal.NinjaPassWinner]
    },

    hasCodes(): boolean {
      const { codes } = this

      return codes.length > 0
    },

    ninjaPassCode(): { address: string; code: string } | undefined {
      const { codes } = this

      if (codes.length === 0) {
        return
      }

      const [code] = codes

      return code
    },

    ninjaPassUrl(): string | undefined {
      const { ninjaPassCode, injAddress } = this

      if (!ninjaPassCode) {
        return
      }

      const baseUrl = APP_NINJA_PASS_API_ENDPOINT

      return `${baseUrl}/?code=${ninjaPassCode?.code}&address=${injAddress}`
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
