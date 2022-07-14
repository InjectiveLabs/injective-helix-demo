<template>
  <div
    class="flex h-full w-full items-center justify-center text-center"
    data-cy="wallet-not-connected-modal-warning"
  >
    <div v-if="cta" class="text-center py-4">
      <p class="text-xs text-gray-300 w-full">
        {{ $t('connect.pleaseConnectToYourWallet') }}
      </p>
      <VButton
        md
        primary
        class="mt-2"
        data-cy="wallet-not-connected-warning-modal-connect-button"
        @click.stop="handleClickOnConnect"
      >
        {{ $t('connect.connect') }}
      </VButton>
    </div>
    <p v-else class="text-xs text-gray-400 py-4">
      {{ $t('connect.pleaseConnectToYourWalletCta') }}
    </p>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    cta: {
      required: false,
      type: Boolean,
      default: false
    }
  },

  methods: {
    handleClickOnConnect() {
      this.$root.$emit('wallet-clicked')
    }
  }
})
</script>
