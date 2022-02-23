<template>
  <div class="bg-gray-900 bg-opacity-80">
    <v-hero />
    <div class="h-full w-full flex flex-wrap pb-4 -mt-16">
      <div class="container">
        <div class="w-full mx-auto xl:w-4/5">
          <v-overview />
          <v-markets class="mt-16" />
        </div>
      </div>
    </div>
    <div class="relative">
      <div
        class="absolute inset-0 h-full w-full bg-gray-900 bg-opacity-70"
      ></div>
      <img class="w-screen" src="/svg/lighting.svg" />
    </div>
    <v-onboard />

    <div
      :style="{ backgroundImage: `url('/svg/bg-dark.svg')` }"
      class="bg-cover py-14 bg-left-top"
    >
      <div class="w-full mx-auto max-w-xs sm:max-w-md md:max-w-full xl:w-4/5">
        <h1 class="text-4xl 4xl:text-5xl font-bold tracking-wide text-center">
          {{ $t('home.startTradingNote') }}
        </h1>

        <div class="text-center">
          <v-button lg primary class="w-60 mt-10">
            {{ $t('home.getStarted') }}
          </v-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VHero from '~/components/partials/home/hero.vue'
import VOverview from '~/components/partials/home/overview.vue'
import VMarkets from '~/components/partials/common/markets/markets.vue'
import VOnboard from '~/components/partials/home/onboard.vue'

export default Vue.extend({
  components: {
    VHero,
    VOverview,
    VMarkets,
    VOnboard
  }
})
</script>
