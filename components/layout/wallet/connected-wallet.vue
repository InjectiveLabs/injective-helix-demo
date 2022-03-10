<template>
  <li class="flex items-center">
    <div
      class="flex items-center rounded-full bg-gray-800 mr-4"
      :class="[lg ? 'w-12 h-12' : 'w-8 h-8']"
    >
      <slot></slot>
    </div>
    <div class="font-mono text-sm">
      <p :class="[lg ? 'text-base mb-2' : 'text-xs']">
        {{ formattedAddress }}
      </p>
      <div class="inline-block">
        <div
          class="flex items-center bg-primary-500-faded w-auto px-1 rounded-sm"
        >
          <span class="rounded-full w-1 h-1 mr-1 bg-primary-500"></span>
          <span class="text-primary-500" :class="[lg ? 'text-sm' : 'text-2xs']">
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
