<template>
  <div class="h-full w-full flex flex-wrap py-4">
    <div class="w-full">
      <div class="container">
        <div class="text-center w-full lg:w-2/3 mx-auto pt-10 lg:pt-16">
          <h1 class="font-black text-white text-3xl uppercase tracking-wide">
            <img
              src="logo.svg"
              alt="Injective Protocol"
              class="h-40 mx-auto w-auto"
            />
          </h1>
          <h3
            class="text-primary-500 uppercase tracking-wider font-black mt-12"
          >
            {{ $t('welcome_to_ip') }}
          </h3>
          <h4 class="text-gray-300 text-lg mt-2">
            {{ $t('welcome_to_ip_sub') }}
          </h4>
        </div>
      </div>
    </div>
    <div class="container">
      <div class="mt-12 w-full mx-auto lg:w-3/4">
        <v-panel :title="$t('spot_markets')">
          <div class="table-compact table-select px-4 pb-4">
            <v-spot />
          </div>
        </v-panel>
        <v-panel :title="$t('derivatives')" class="mt-6">
          <div class="table-compact table-select px-4 pb-4 mt-6">
            <v-derivatives />
          </div>
        </v-panel>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VSpot from '~/components/partials/spot/markets/index.vue'
import VDerivatives from '~/components/partials/derivatives/markets/index.vue'

export default Vue.extend({
  components: {
    VSpot,
    VDerivatives
  }
})
</script>
