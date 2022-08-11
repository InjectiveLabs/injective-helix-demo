<template>
  <div class="container">
    <div class="w-full mx-auto xl:w-4/5">
      <div
        class="rounded-[20px] p-20 bg-gray-100 bg-cover grid grid-cols-12 gap-12"
        style="background-image: url('/svg/helix-hero-bg.svg')"
      >
        <div class="col-span-6">
          <div class="flex items-center justify-start mb-8">
            <Logo class="w-auto h-6" alt="Helix" />
            <LogoText class="block ml-2 h-6 text-gray-900" />
          </div>
          <h1 class="text-gray-900 font-bold text-6xl mb-8">
            {{ $t('home.title') }}
          </h1>
          <p class="text-gray-900 mt-4 text-xl mb-8">
            {{ $t('home.subtitle') }}
          </p>
          <div class="grid grid-cols-12 gap-4">
            <div class="col-span-6 flex items-center justify-start">
              <IconLightningFill class="text-gray-900 w-6 h-6 mr-3" />
              <span class="text-gray-900 text-lg">Fast</span>
            </div>

            <div class="col-span-6 flex items-center justify-start">
              <IconBoundingBoxCircles class="text-gray-900 w-6 h-6 mr-3" />
              <span class="text-gray-900 text-lg">Decentralized</span>
            </div>

            <div class="col-span-6 flex items-center justify-start">
              <IconGas class="text-gray-900 w-6 h-6 mr-3" />
              <span class="text-gray-900 text-lg">Gasless</span>
            </div>

            <div class="col-span-6 flex items-center justify-start">
              <IconShieldLockFill class="text-gray-900 w-6 h-6 mr-3" />
              <span class="text-gray-900 text-lg">Secure</span>
            </div>
          </div>
          <VButton
            lg
            gray
            class="min-w-4xs mt-16 rounded"
            @click="handleGetStartedClick"
          >
            {{ $t('home.startTradingNow') }}
          </VButton>
        </div>
        <div class="col-span-6">
          <div class="bg-white rounded-lg pt-6 shadow-helix w-full">
            <div class="grid grid-cols-12 gap-12 px-4">
              <span
                class="col-span-4 uppercase text-helixGray-500 whitespace-nowrap text-xs"
              >
                Market
              </span>
              <span
                class="col-span-3 uppercase text-helixGray-500 whitespace-nowrap text-xs text-right"
              >
                Last price
              </span>
              <span
                class="col-span-2 uppercase text-helixGray-500 whitespace-nowrap text-xs"
              >
                Change (24H)
              </span>
              <div class="col-span-3" />
            </div>
            <HeroMarketRow />
            <HeroMarketRow />
            <HeroMarketRow />
            <HeroMarketRow />
            <HeroMarketRow />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { UiDerivativeMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import Logo from '~/components/elements/logo.vue'
import LogoText from '~/components/elements/logo-text.vue'
import HeroMarketRow from '~/components/partials/home/hero-market-row.vue'

export default Vue.extend({
  components: {
    Logo,
    LogoText,
    HeroMarketRow
  },

  computed: {
    isUserWalletConnected() {
      return this.$accessor.wallet.isUserWalletConnected
    },

    markets(): UiDerivativeMarketWithToken[] {
      return this.$accessor.derivatives.markets
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
