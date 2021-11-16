<template>
  <div class="ml-4 flex items-center md:ml-6">
    <div class="flex items-center border-r border-gray-700 pr-4 md:pr-8">
      <span
        class="mr-4 md:mr-6 font-mono text-sm text-primary-500 cursor-pointer"
        @click="handleClickOnAddress"
      >
        {{ formattedAddress }}
      </span>
      <button
        v-tooltip="{
          content: isInjectiveAddress
            ? $t('switch_to_ethereum_address')
            : $t('switch_to_injective_address')
        }"
        role="button"
        class="hidden md:block mr-4"
        type="button"
        @click.stop="handleClickOnSwitchIcon"
      >
        <v-icon-injective
          v-if="isInjectiveAddress"
          class="w-5 h-5 text-gray-500 hover:text-primary-500"
        />
        <v-icon-ethereum
          v-else
          class="w-6 h-6 text-gray-500 hover:text-primary-500"
        />
      </button>
      <button
        role="button"
        class="hidden md:block mr-4"
        type="button"
        @click.stop="handleClickOnRevealButton"
      >
        <v-icon-show class="w-5 h-5 text-gray-500 hover:text-primary-500" />
      </button>
      <button
        v-clipboard="() => currentAddress"
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
import VIconEthereum from '~/components/icons/icon-ethereum.vue'
import VIconInjective from '~/components/icons/icon-injective.vue'

export default Vue.extend({
  components: {
    VIconEthereum,
    VIconInjective
  },

  data() {
    return {
      shouldShowFullAddress: false,
      isInjectiveAddress: true
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    address(): string {
      return this.$accessor.wallet.address
    },

    injectiveAddress(): string {
      return this.$accessor.wallet.injectiveAddress
    },

    currentAddress(): string {
      const { address, injectiveAddress, isInjectiveAddress } = this

      return isInjectiveAddress ? injectiveAddress : address
    },

    formattedAddress(): string {
      const { shouldShowFullAddress, currentAddress } = this

      return shouldShowFullAddress
        ? currentAddress
        : formatWalletAddress(currentAddress)
    }
  },

  methods: {
    handleClickOnRevealButton() {
      this.shouldShowFullAddress = !this.shouldShowFullAddress
    },

    handleClickOnSwitchIcon() {
      this.isInjectiveAddress = !this.isInjectiveAddress
    },

    handleClickOnAddress() {
      this.$router.push({ name: 'wallet' })
    },

    handleClickOnLogout() {
      this.$accessor.wallet.logout()
    }
  }
})
</script>
