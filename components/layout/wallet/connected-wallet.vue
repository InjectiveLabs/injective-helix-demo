<template>
  <li class="flex items-start">
    <div
      class="flex items-center mr-4 pt-2"
      :class="[lg ? 'w-12 h-12' : 'w-8 h-8']"
    >
      <slot></slot>
    </div>
    <div class="font-mono">
      <p
        :class="[lg ? 'text-base' : 'text-xs']"
        data-cy="wallet-connected-popper-wallet-address-text-content"
      >
        {{ formattedAddress }}
      </p>
      <div class="inline-block mt-2">
        <div
          class="flex items-center bg-aqua-600 bg-opacity-10 w-auto p-1 rounded"
        >
          <span class="rounded-full w-1 h-1 mr-1 bg-aqua-500"></span>
          <span class="text-aqua-500" :class="[lg ? 'text-sm' : 'text-2xs']">
            {{ $t('navigation.connected') }}
          </span>
        </div>
      </div>
    </div>
    <div class="ml-auto">
      <button
        v-clipboard="() => address"
        v-clipboard:success="() => $toast.success($t('connect.addressCopied'))"
        role="button"
        type="button"
        data-cy="wallet-connected-popper-wallet-address-copy-button"
      >
        <IconCopy class="w-5 h-5 text-gray-500 hover:text-aqua-500" />
      </button>
    </div>
  </li>
</template>

<script lang="ts">
import Vue from 'vue'
import { formatWalletAddress } from '@injectivelabs/utils'

export default Vue.extend({
  props: {
    lg: {
      type: Boolean,
      default: false
    }
  },

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
