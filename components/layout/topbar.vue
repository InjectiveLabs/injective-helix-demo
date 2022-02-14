<template>
  <header
    class="relative z-1100 flex-shrink-0 flex h-12 bg-black shadow-top-bar-dark"
  >
    <button
      class="px-4 border-r border-gray-600 text-gray-200 xl:hidden"
      @click.stop="handleClickOnSidebarToggle"
    >
      <span class="sr-only">{{ $t('open') }}</span>
      <v-icon-menu class="w-6 h-6" />
    </button>
    <div class="flex-1 px-2 xl:px-8 flex justify-end xl:justify-between">
      <div class="hidden xl:flex items-center">
        <div
          class="flex items-center py-2 pr-2 xl:pr-8 border-r cursor-pointer"
          @click="$router.push({ name: 'index' })"
        >
          <v-logo class="h-6 w-auto mr-2" alt="Injective" />
          <div class="text-white flex items-end">
            <v-logo-text class="w-24 mr-2" />
            <p class="text-xs uppercase flex">
              <span>p</span>
              <span class="mx-1">r</span>
              <span>o</span>
            </p>
          </div>
        </div>
        <v-nav class="ml-2" />
      </div>
      <div class="flex py-2">
        <v-nav-item :to="{ name: 'funding' }">
          {{ $t('navigation.funding') }}
        </v-nav-item>
        <v-user-wallet
          v-if="isUserWalletConnected && isUserConnectedProcessCompleted"
        />
        <v-user-wallet-connect
          v-else
          @wallet-connected="handleConnectedWallet"
        />
      </div>
    </div>
  </header>
</template>

<script lang="ts">
import Vue from 'vue'
import VUserWallet from './wallet/wallet.vue'
import VUserWalletConnect from './wallet/connect.vue'
import VNavItem from './nav/item.vue'
import VNav from '~/components/layout/nav/index.vue'
import VLogo from '~/components/elements/logo.vue'
import VLogoText from '~/components/elements/logo-text.vue'

export default Vue.extend({
  components: {
    VNav,
    VNavItem,
    VUserWallet,
    VLogo,
    VLogoText,
    VUserWalletConnect
  },

  data() {
    return {
      isUserConnectedProcessCompleted: false
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    }
  },

  watch: {
    isUserWalletConnected(newIsUserWalletConnected) {
      if (!newIsUserWalletConnected) {
        this.isUserConnectedProcessCompleted = false
      }
    }
  },

  mounted() {
    if (this.isUserWalletConnected) {
      this.isUserConnectedProcessCompleted = true
    }
  },

  methods: {
    handleClickOnSidebarToggle() {
      this.$emit('sidebar-opened')
    },

    handleConnectedWallet() {
      this.isUserConnectedProcessCompleted = true
    }
  }
})
</script>
