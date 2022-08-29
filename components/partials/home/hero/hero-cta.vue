<template>
  <div
    class="col-span-12 lg:col-span-5 3xl:col-span-5 4xl:col-span-6 flex flex-col sm:block"
  >
    <div class="flex items-center justify-start mb-8">
      <Logo class="w-auto h-6" alt="Helix" />
      <LogoText class="block ml-2 h-6 text-gray-900" />
    </div>
    <h1 class="text-gray-900 font-bold text-5xl 3xl:text-6xl mb-8">
      {{ $t('home.title') }}
    </h1>
    <p class="text-gray-900 mt-4 text-base 3xl:text-xl mb-8">
      {{ $t('home.subtitle') }}
    </p>
    <div class="grid grid-cols-12 gap-4 text-base 3xl:text-xl">
      <div class="col-span-6 flex items-center justify-start">
        <IconLightningFill class="text-gray-900 w-6 h-6 mr-3" />
        <span class="text-gray-900 text-lg">
          {{ $t('home.fast') }}
        </span>
      </div>

      <div class="col-span-6 flex items-center justify-start">
        <IconBoundingBoxCircles class="text-gray-900 w-6 h-6 mr-3" />
        <span class="text-gray-900 text-lg">
          {{ $t('home.decentralized') }}
        </span>
      </div>

      <div class="col-span-6 flex items-center justify-start">
        <IconGas class="text-gray-900 w-6 h-6 mr-3" />
        <span class="text-gray-900 text-lg">
          {{ $t('home.gasless') }}
        </span>
      </div>

      <div class="col-span-6 flex items-center justify-start">
        <IconShieldLockFill class="text-gray-900 w-6 h-6 mr-3" />
        <span class="text-gray-900 text-lg">
          {{ $t('home.secure') }}
        </span>
      </div>
    </div>
    <VButton
      lg
      gray
      class="min-w-4xs mt-8 rounded"
      @click="handleGetStartedClick"
    >
      {{ $t('home.startTradingNow') }}
    </VButton>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import Logo from '~/components/elements/logo.vue'
import LogoText from '~/components/elements/logo-text.vue'

export default Vue.extend({
  components: {
    Logo,
    LogoText
  },

  computed: {
    isUserWalletConnected() {
      return this.$accessor.wallet.isUserWalletConnected
    }
  },

  methods: {
    handleGetStartedClick() {
      if (this.isUserWalletConnected) {
        this.$router.push({
          name: 'perpetuals-perpetual',
          params: { perpetual: 'btc-usdt-perp' }
        })
      } else {
        this.$root.$emit('wallet-clicked')
      }
    }
  }
})
</script>
