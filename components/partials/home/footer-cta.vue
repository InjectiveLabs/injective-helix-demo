<template>
  <div
    :style="{ backgroundImage: `url('/svg/bg-dark.svg')` }"
    class="bg-cover py-14 bg-left-top"
  >
    <div class="w-full mx-auto max-w-xs sm:max-w-md md:max-w-full xl:w-4/5">
      <h1 class="text-4xl 4xl:text-5xl font-bold tracking-wide text-center">
        {{ $t('home.startTradingNote') }}
      </h1>

      <div class="text-center">
        <VButton lg primary class="w-60 mt-10" @click="handleGetStartedClick">
          {{ $t('home.getStarted') }}
        </VButton>
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
