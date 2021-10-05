<template>
  <div class="h-full w-full flex flex-wrap py-4">
    <div class="container">
      <div class="w-full mx-auto lg:w-3/4">
        <div v-if="false" class="text-center w-full mt-12">
          <div class="flex items-center justify-center">
            <v-logo class="h-12 w-auto mr-2" alt="Injective" />
            <v-logo-text class="h-12 w-auto" />
          </div>
          <h3 class="text-primary-500 uppercase tracking-widest font-bold mt-6">
            {{ $t('welcome_to_ip') }}
          </h3>
        </div>
        <v-cards class="mt-6" />
        <v-panel :title="$t('markets')" class="mt-12">
          <v-markets />
        </v-panel>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VCards from '~/components/partials/home/cards.vue'
import VMarkets from '~/components/partials/common/markets/markets.vue'
import VLogo from '~/components/elements/logo.vue'
import VLogoText from '~/components/elements/logo-text.vue'

export default Vue.extend({
  components: {
    VCards,
    VMarkets,
    VLogoText,
    VLogo
  }
})
</script>
