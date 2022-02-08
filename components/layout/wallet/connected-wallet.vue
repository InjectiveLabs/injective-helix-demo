<template>
  <li class="flex items-center">
    <div class="w-8 h-8 flex items-center rounded-full bg-gray-800 mr-4">
      <slot></slot>
    </div>
    <div class="font-mono text-sm">
      <span class="text-gray-400 text-xs">{{ formattedAddress }}</span>
      <span
        class="flex items-center bg-primary-500-faded w-auto px-1 rounded-md"
      >
        <span class="rounded-full w-1 h-1 mr-2 bg-primary-500"></span>
        <span class="text-primary-500 text-2xs">{{
          $t('navigation.connected')
        }}</span>
      </span>
    </div>
    <div class="ml-auto">
      <button
        v-clipboard="() => address"
        v-clipboard:success="() => $toast.success($t('address_copied'))"
        role="button"
        type="button"
      >
        <v-icon-copy class="w-5 h-5 text-gray-500 hover:text-primary-500" />
      </button>
    </div>
  </li>
</template>

<script lang="ts">
import Vue from 'vue'
import { formatWalletAddress } from '@injectivelabs/utils'

export default Vue.extend({
  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    address(): string {
      return this.$accessor.wallet.address
    },

    formattedAddress(): string {
      const { address } = this

      return formatWalletAddress(address)
    }
  }
})
</script>
