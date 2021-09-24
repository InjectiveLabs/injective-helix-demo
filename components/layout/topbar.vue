<template>
  <header
    class="relative z-1100 flex-shrink-0 flex h-16 bg-black shadow-top-bar-dark"
  >
    <button
      class="px-4 border-r border-gray-600 text-gray-200 md:hidden"
      @click.stop="handleClickOnSidebarToggle"
    >
      <span class="sr-only">{{ $t('open') }}</span>
      <v-icon-menu class="w-6 h-6" />
    </button>
    <div class="flex-1 px-2 md:px-8 flex justify-end md:justify-between">
      <div class="hidden md:flex items-center">
        <div
          class="flex items-center py-2 px-6 border-r cursor-pointer"
          @click="$router.push({ name: 'index' })"
        >
          <v-logo class="h-8 w-auto mr-4" alt="Injective" />
          <div class="text-white">
            <v-logo-text class="w-24" />
            <p class="text-xs uppercase flex mx-px">
              <span>p</span>
              <span class="mx-1">r</span>
              <span>o</span>
            </p>
          </div>
        </div>
        <v-nav class="ml-2" />
        <VLanguageSelector
          v-if="false"
          class="hidden lg:block my-auto"
        ></VLanguageSelector>
      </div>
      <v-user-wallet v-if="isUserWalletConnected" />
      <v-user-wallet-connect v-else />
    </div>
  </header>
</template>

<script lang="ts">
import Vue from 'vue'
import VUserWallet from './wallet/wallet.vue'
import VUserWalletConnect from './wallet/connect.vue'
import VLanguageSelector from './selectors/language-selector.vue'
import VNav from '~/components/layout/nav/index.vue'
import VLogo from '~/components/elements/logo.vue'
import VLogoText from '~/components/elements/logo-text.vue'

export default Vue.extend({
  components: {
    VLanguageSelector,
    VNav,
    VUserWallet,
    VLogo,
    VLogoText,
    VUserWalletConnect
  },

  computed: {
    isUserWalletConnected() {
      return this.$accessor.wallet.isUserWalletConnected
    }
  },

  methods: {
    handleClickOnSidebarToggle() {
      this.$emit('sidebar-opened')
    }
  }
})
</script>
