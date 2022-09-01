<template>
  <div>
    <!-- Todo: remove on helix launch -->
    <EarlyAccess v-if="false" />

    <div class="bg-white">
      <Hero />
      <div class="h-full w-full flex flex-wrap pb-4">
        <div class="container">
          <div class="w-full mx-auto xl:w-4/5">
            <Announcements />
            <MarketsPanel class="mt-8 sm:mt-16" />
            <WhyTrade />
            <GettingStarted />
          </div>
        </div>
      </div>
      <FooterCta />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Hero from '~/components/partials/home/hero/index.vue'
import Announcements from '~/components/partials/home/announcements.vue'
import MarketsPanel from '~/components/partials/home/markets/markets-panel.vue'
import FooterCta from '~/components/partials/home/footer-cta.vue'
import WhyTrade from '~/components/partials/home/why-trade.vue'
import GettingStarted from '~/components/partials/home/getting-started.vue'
// Todo: remove on helix launch
import EarlyAccess from '~/components/partials/home/early-access.vue'
import { IS_MAINNET } from '~/app/utils/constants'

export default Vue.extend({
  components: {
    Hero,
    Announcements,
    MarketsPanel,
    FooterCta,
    WhyTrade,
    GettingStarted,
    EarlyAccess
  },
  data() {
    return {
      IS_MAINNET
    }
  }
})
</script>
