<template>
  <div class="h-full w-full flex flex-wrap py-4">
    <div class="container">
      <div class="text-center w-full lg:w-2/3 mx-auto">
        <h1 class="font-black text-white text-3xl uppercase tracking-wide">
          <img
            src="/images/home-main.svg?v5"
            alt="Injective Exchange"
            class="h-48 mx-auto w-auto"
          />
        </h1>
        <h3 class="text-primary-500 uppercase tracking-wider font-black">
          {{ $t('welcome_to_ip') }}
        </h3>
        <h4 class="text-gray-300 text-lg mt-2">
          {{ $t('welcome_to_ip_sub') }}
        </h4>
      </div>

      <div class="mt-12 w-full mx-auto lg:w-3/4">
        <v-cards />
        <v-portfolio class="mt-12" />
        <v-panel :title="$t('derivatives')" class="mt-12">
          <v-derivatives />
        </v-panel>
        <v-panel :title="$t('spot_markets')" class="mt-12">
          <v-spot />
        </v-panel>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VCards from '~/components/partials/home/cards.vue'
import VPortfolio from '~/components/partials/common/portfolio/index.vue'
import VSpot from '~/components/partials/common/markets/spot.vue'
import VDerivatives from '~/components/partials/common/markets/derivatives.vue'

export default Vue.extend({
  components: {
    VSpot,
    VCards,
    VPortfolio,
    VDerivatives
  }
})
</script>
