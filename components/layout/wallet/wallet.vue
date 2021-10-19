<template>
  <div class="ml-4 flex items-center md:ml-6">
    <div class="flex items-center border-r border-gray-700 pr-4 md:pr-8">
      <span class="mr-4 md:mr-6 font-mono text-sm text-gray-200">
        {{ formattedAddress }}
      </span>
      <button
        role="button"
        class="hidden md:block mr-4"
        type="button"
        @click="handleClickOnRevealButton"
      >
        <v-icon-show class="w-5 h-5 text-gray-500 hover:text-primary-500" />
      </button>
      <button
        v-clipboard="() => injectiveAddress"
        v-clipboard:success="() => $toast.success($t('address_copied'))"
        role="button"
        type="button"
      >
        <v-icon-copy class="w-5 h-5 text-gray-500 hover:text-primary-500" />
      </button>
    </div>
    <div
      class="pl-4 md:pl-8 relative flex items-center text-gray-200 hover:text-primary-500"
    >
      <v-icon-exit class="block md:hidden cursor-pointer w-6 h-6" />
      <span
        class="cursor-pointer text-xs font-semibold hidden md:inline-block"
        @click="handleClickOnLogout"
      >
        {{ $t('logout') }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { formatWalletAddress } from '@injectivelabs/utils'

export default Vue.extend({
  data() {
    return {
      shouldShowFullAddress: false
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    injectiveAddress(): string {
      return this.$accessor.wallet.injectiveAddress
    },

    formattedAddress(): string {
      const { shouldShowFullAddress, injectiveAddress } = this

      return shouldShowFullAddress
        ? injectiveAddress
        : formatWalletAddress(injectiveAddress)
    }
  },

  methods: {
    handleClickOnRevealButton() {
      this.shouldShowFullAddress = !this.shouldShowFullAddress
    },

    handleClickOnLogout() {
      this.$accessor.wallet.logout()
    }
  }
})
</script>
