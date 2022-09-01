<template>
  <div
    :style="{ backgroundImage: `url('/svg/cta-area.svg')` }"
    class="bg-cover py-14 bg-left-top h-[189px] md:h-[790px] flex items-center"
  >
    <div
      class="w-full mx-auto max-w-xs sm:max-w-md md:max-w-full xl:w-4/5 flex flex-col md:block items-center"
    >
      <h1
        class="text-2xl md:text-4xl 4xl:text-5xl font-bold tracking-wide text-center"
      >
        {{ $t('home.startTradingNote') }}
      </h1>

      <div class="text-center">
        <VButton
          lg
          primary
          class="w-[133px] md:w-[160px] mt-2 md:mt-10 rounded"
          @click="handleGetStartedClick"
        >
          {{ $t('home.tradeNow') }}
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
