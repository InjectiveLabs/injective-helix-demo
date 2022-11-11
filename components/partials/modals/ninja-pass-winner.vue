<template>
  <VModal :is-open="isModalOpen" sm is-always-open @modal-closed="closeModal">
    <h3 slot="title" class="normal-case">Congratulations! 🎉</h3>

    <div class="flex flex-col">
      <span class="text-sm mb-4">You’ve won an exclusive Ninja Pass 🥷</span>
      <span class="text-sm">
        It will serve as your gateway into exclusive Injective events, products,
        giveaways and many more surprises.
      </span>
      <div class="grid grid-cols-2 gap-4 mt-6">
        <a
          :href="ninjaPassUrl"
          target="_blank"
          class="bg-blue-300 py-2 h-10 rounded border border-blue-300 flex items-center justify-center gap-2"
        >
          <span class="font-medium text-white">Verify now</span>
          <IconExternalLink class="w-4 h-4 text-white" />
        </a>

        <button
          class="bg-transparent py-2 h-10 rounded border border-white"
          @click="closeModal"
        >
          <span class="font-medium text-white">Later</span>
        </button>
      </div>
    </div>
  </VModal>
</template>

<script lang="ts">
import Vue from 'vue'
import { Modal } from '~/types'

export default Vue.extend({
  components: {},

  computed: {
    isModalOpen(): boolean {
      return this.$accessor.ninja.codes.length > 0
    },

    injAddress(): string {
      return this.$accessor.wallet.injectiveAddress
    },

    ninjaPassCode(): string {
      return this.$accessor.ninja.codes[0]
    },

    ninjaPassUrl(): string {
      const { ninjaPassCode, injAddress } = this

      return `https://ninjapass.injective.com/?code=${ninjaPassCode}&address=${injAddress}`
    }
  },

  methods: {
    closeModal() {
      this.$accessor.modal.closeModal(Modal.NinjaPassWinner)
    }
  }
})
</script>
