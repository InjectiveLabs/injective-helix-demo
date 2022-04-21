<template>
  <div class="bg-gray-900 bg-opacity-80">
    <v-hero />
    <div class="h-full w-full flex flex-wrap pb-4 -mt-24">
      <div class="container">
        <div class="w-full mx-auto xl:w-4/5">
          <v-overview />
          <v-markets class="mt-16" />
        </div>
      </div>
    </div>
    <div class="relative">
      <div
        class="absolute inset-0 h-full w-full bg-gray-900 bg-opacity-30"
      ></div>
      <img class="w-screen" src="/svg/lighting.svg" />
    </div>
    <v-onboard />
    <v-footer-cta />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VHero from '~/components/partials/home/hero.vue'
import VOverview from '~/components/partials/home/overview.vue'
import VMarkets from '~/components/partials/home/markets/index.vue'
import VOnboard from '~/components/partials/home/onboard.vue'
import VFooterCta from '~/components/partials/home/footer-cta.vue'

export default Vue.extend({
  components: {
    VHero,
    VOverview,
    VMarkets,
    VOnboard,
    VFooterCta
  }
})
</script>
