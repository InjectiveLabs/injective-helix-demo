<template>
  <div class="h-full w-full flex flex-wrap py-4">
    <div class="container">
      <div class="w-full mx-auto lg:w-3/4">
        <div class="text-center w-full mt-12">
          <div class="flex items-center justify-center">
            <v-logo class="h-12 w-auto mr-2" alt="Injective" />
            <v-logo-text class="h-12 w-auto" />
          </div>
          <h3 class="text-primary-500 uppercase tracking-widest font-bold mt-6">
            {{ $t('welcome_to_ip') }}
          </h3>
        </div>
        <v-cards class="mt-12" />
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
import VSpot from '~/components/partials/common/markets/spot.vue'
import VDerivatives from '~/components/partials/common/markets/derivatives.vue'
import VLogo from '~/components/elements/logo.vue'
import VLogoText from '~/components/elements/logo-text.vue'

export default Vue.extend({
  components: {
    VSpot,
    VCards,
    VDerivatives,
    VLogoText,
    VLogo
  }
})
</script>
