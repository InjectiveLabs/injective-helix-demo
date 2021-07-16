<template>
  <header
    class="
      w-full
      border-b border-dark-border
      shadow-md
      flex
      bg-dark-700
      z-20
      relative
    "
  >
    <h1
      class="
        font-black
        text-xl
        uppercase
        flex
        items-center
        border-r
        px-2
        py-2
        pl-4
        lg:pr-6
        cursor-pointer
      "
      @click.stop="goHome"
    >
      <logo class="mr-2 lg:mr-4 w-6 h-6" />
      <span class="text-white hidden lg:block">
        {{ $t('injective') }} PRO
      </span>
    </h1>
    <div class="hidden lg:flex">
      <v-spot />
    </div>
    <div class="hidden lg:flex">
      <v-derivatives />
    </div>
    <mobile-menu />
    <div class="ml-auto flex">
      <wallet-connect />
    </div>
  </header>
</template>

<script lang="ts">
import Vue from 'vue'
import VSpot from './spot.vue'
import VDerivatives from './derivatives.vue'
import Logo from '~/components/layouts/logo.vue'
import MobileMenu from '~/components/layouts/mobile/menu.vue'
import WalletConnect from '~/components/wallets/index.vue'

export default Vue.extend({
  components: {
    Logo,
    VSpot,
    VDerivatives,
    MobileMenu,
    WalletConnect
  },

  computed: {
    //
  },

  methods: {
    goHome() {
      this.$router.push({ name: 'index' })
    }
  }
})
</script>
