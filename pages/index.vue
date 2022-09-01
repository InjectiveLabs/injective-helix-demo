<template>
  <div>
    <HelixAppRedirection v-if="HELIX_APP_REDIRECTION" />
    <div v-else class="bg-gray-900 bg-opacity-80">
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
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import HelixAppRedirection from '~/components/partials/home/helix-app-redirection.vue'
import Hero from '~/components/partials/home/hero.vue'
import Overview from '~/components/partials/home/overview.vue'
import Markets from '~/components/partials/home/markets/index.vue'
import Onboard from '~/components/partials/home/onboard.vue'
import FooterCta from '~/components/partials/home/footer-cta.vue'
import { HELIX_APP_REDIRECTION } from '~/app/utils/constants'

export default Vue.extend({
  components: {
    VHero: Hero,
    VOverview: Overview,
    HelixAppRedirection,
    Markets,
    Onboard,
    FooterCta
  },

  data() {
    return {
      HELIX_APP_REDIRECTION
    }
  }
})
</script>
