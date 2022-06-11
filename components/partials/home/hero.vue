<template>
  <div
    :style="{ backgroundImage: `url('/svg/bg-darker.svg')` }"
    class="pt-16 pb-24 bg-cover"
  >
    <div class="container pb-12">
      <div class="flex w-full mx-auto xl:w-4/5 justify-between">
        <div class="max-w-xl lg:max-w-3xl">
          <h1
            class="font-bold text-4xl leading-10 2xl:text-5xl 2xl:leading-14 tracking-wide"
          >
            {{ $t('home.title') }}
          </h1>
          <p class="text-gray-500 mt-4 text-lg leading-6 tracking-wide">
            {{ $t('home.subtitle') }}
          </p>
          <VButton
            lg
            primary
            class="min-w-4xs mt-6"
            @click="handleGetStartedClick"
          >
            {{ $t('home.getStarted') }}
          </VButton>
        </div>
        <img src="/images/sphere.png" class="hidden sm:block w-48 h-48" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  computed: {
    isUserWalletConnected() {
      return this.$accessor.wallet.isUserWalletConnected
    }
  },

  methods: {
    handleGetStartedClick() {
      if (this.isUserWalletConnected) {
        this.$router.push({
          name: 'derivatives-derivative',
          params: { derivative: 'btc-usdt-perp' }
        })
      } else {
        this.$root.$emit('wallet-clicked')
      }
    }
  }
})
</script>
