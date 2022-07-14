<template>
  <div class="bg-gray-900 bg-opacity-80">
    <VHero />
    <div class="h-full w-full flex flex-wrap pb-4 -mt-24">
      <div class="container">
        <div class="w-full mx-auto xl:w-4/5">
          <VOverview />
          <Markets class="mt-16" />
        </div>
      </div>
    </div>
    <div class="relative">
      <div
        class="absolute inset-0 h-full w-full bg-gray-900 bg-opacity-30"
      ></div>
      <img class="w-screen" src="/svg/lighting.svg" />
    </div>
    <Onboard />
    <FooterCta />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Hero from '~/components/partials/home/hero.vue'
import Overview from '~/components/partials/home/overview.vue'
import Markets from '~/components/partials/home/markets/index.vue'
import Onboard from '~/components/partials/home/onboard.vue'
import FooterCta from '~/components/partials/home/footer-cta.vue'

export default Vue.extend({
  components: {
    VHero: Hero,
    VOverview: Overview,
    Markets,
    Onboard,
    FooterCta
  }
})
</script>
